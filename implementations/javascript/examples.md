The [LambdaCAD](https://nenadmarkus.com/lambda) tool comes with a relatively large pool of built-in funcitonality for generating and combining primitives, and basic operations on shapes, such as scaling and rotation.
The following examples demonstrate some of these capabilities.

## Basic operations

An ellipse can be obtained be elongating (stretching) a sphere:

```
return scale(sphere(0.3), 1, 0.5, 1);
```

A caped cone can be obtained by intersecting a cone and a half-space:

```
const c = cone(0.2, 0.4);
const p = plane([0, 0, 0.2], [0, 0, 0.2]);
return intersection(p, c);
```

You can also combine several capsules (3D lines) with a union operation to obtain a custom shape:

```
// a line-based tetrahedron
const t = 0.02; // line thickness
const c = 0.4;  // coordinate helper
const l1 = capsule([+c, +c, +c], [+c, -c, -c], t);
const l2 = capsule([+c, +c, +c], [-c, +c, -c], t);
const l3 = capsule([+c, +c, +c], [-c, -c, +c], t);
const l4 = capsule([-c, -c, +c], [-c, +c, -c], t);
const l5 = capsule([-c, -c, +c], [+c, -c, -c], t);
const l6 = capsule([+c, -c, -c], [-c, +c, -c], t);
return union(l1, l2, l3, l4, l5, l6);
```

```
const a=0.45, t=0.025;
const p = [
	[-a, -a, -a], [+a, -a, -a], [+a, +a, -a], [-a, +a, -a],
	[-a, -a, +a], [+a, -a, +a], [+a, +a, +a], [-a, +a, +a]
];
const lines = [
	capsule(p[0], p[1], t), capsule(p[1], p[2], t), capsule(p[2], p[3], t), capsule(p[3], p[0], t),
	capsule(p[4], p[5], t), capsule(p[5], p[6], t), capsule(p[6], p[7], t), capsule(p[7], p[4], t),
	capsule(p[0], p[4], t), capsule(p[2], p[6], t), capsule(p[3], p[7], t), capsule(p[1], p[5], t)
];
const skeleton = union(lines);
return skeleton;
```

To carve the interior of a shape, use the `shell` operation (we also subtract a half-space to see the interior):

```
a = shell(torus(0.3, 0.05), 0.01);
b = shell(shell(sphere(0.15), 0.02), 0.01);
p = plane([0, 0, 0], [1, 0, -1]);
r = difference(union(a, b), p);
return r;
```

This is a [Steinmetz tricylinder](https://en.wikipedia.org/wiki/Steinmetz_solid):

```
const r=0.25, h=1.0;
const c1 = cylinder(r, h);
const c2 = rotate(c1, [1, 0, 0], 3.14156/2.0);
const c3 = rotate(c1, [0, 1, 0], 3.14156/2.0);
return intersection(c1, c2, c3);
```

And here is a [sphericon](https://en.wikipedia.org/wiki/Sphericon):

```
const a=0.5, pi = 3.14156;
const bicone = union(cone(a, a), rotate(cone(a, a), [1, 0, 0], pi));
const slice = intersection(bicone, plane([0, 0, 0], [1, 0, 0]));
return union(slice, rotate(rotate(slice, [0, 1, 0], pi), [1, 0, 0], pi/2.0));
```

## Writing custom signed distance bounds

While we can make interesting shapes by combining the basic operations and primitives from the previous section, sometimes it is more desirable to write a custom distance bound.
The reason could be speed as it can be faster to evaluate a custom bound than a combined one.
The other reason is that some shapes are difficult to obtain by combining simpler shapes.

Under the hood, [LambdaCAD](https://nenadmarkus.com/lambda) requires a function `f` that takes a 3D position of a point as an argument and computes a distance bound to its associated shape.
The basic primitives and operations do just that in a functional way.
However, you can explicitly write the distance bounds yourself.
Some examples follow.

A kind of a cone with a parabolic mantle:

```
return function (x, y, z) {
	const r0 = 0.5;
	const h0 = 0.5;
	const r = Math.sqrt(x*x + y*y);
	const d = h0*(r-r0)*(r-r0)/(r0*r0) - z;

	return Math.max(Math.max(-z, -d/(4*h0/r0)), r-r0);
};
```

A kind of a cone with a parabolic mantle:

```
return function (x, y, z) {
	const r = Math.sqrt(x*x + y*y);
	const hyp = (r*r/0.05 - z*z/0.05 - 1.0)/20; // a rotated hyperbola
	const cyl = Math.max(Math.max(r - 0.3, -(-z + 0.2)), -(+z + 0.2)); // a cylinder

	return Math.max(cyl, hyp);
};
```

A revolved [vesica](https://en.wikipedia.org/wiki/Vesica_piscis):

```
function vesica3d(r, d) {
	const b = Math.sqrt(r*r - d*d);
	return function (x, y, z) {
		x = Math.sqrt(x*x + z*z);
		y = Math.abs(y);
		if ((y-b)*d > x*b)
			return Math.sqrt(x*x + (y-b)*(y-b));
		else
			return Math.sqrt((x+d)*(x+d) + y*y) - r;
	};
}

return vesica3d(0.6, 0.4);
```

A [solid of constant width](https://en.wikipedia.org/wiki/Surface_of_constant_width) obtained by revolving a [Reuleaux triangle](https://en.wikipedia.org/wiki/Reuleaux_triangle) around an axis of symmetry:

```
return function (x, y, z) {
	z = z + 0.25;
	const c = 0.4; // coordinate helper
	const r = Math.sqrt(x*x + y*y);
	const s1 = Math.sqrt((r-c)*(r-c) + z*z) - 2*c;
	const s2 = Math.sqrt((r+c)*(r+c) + z*z) - 2*c;
	const s3 = Math.sqrt(r*r + (z-Math.sqrt(3)*c)*(z-Math.sqrt(3)*c)) - 2*c;

	return Math.max(s1, Math.max(s2, s3));
};
```

A [Möbius strip](https://en.wikipedia.org/wiki/M%C3%B6bius_strip):

```
function rot2d(x, y, a)
{
	const newx = Math.cos(a)*x + Math.sin(a)*y;
	const newy = -Math.sin(a)*x + Math.cos(a)*y;

	return [newx, newy];
}
return function (x, y, z)
{
	const a = Math.atan2(z, x);
	[x, z] = rot2d(x, z, a);
	x = x - 0.45;
	[x, y] = rot2d(x, y, 0.5*a);

	return (Math.abs(x) + Math.abs(y) - 0.05)/2;
};
```

A surface of [genus 2](https://en.wikipedia.org/wiki/Implicit_surface):

```
return function (x, y, z)
{
	x=x*4; y=y*4; z=z*4; // rescale to fit 1x1x1 box
	const r = Math.max(Math.abs(x), Math.abs(y), Math.abs(z));
	const L = 10 + r*50; // a dynamic Lipschitz constant

	return (2*y*(y*y-3*x*x)*(1.0-z*z) + (x*x + y*y)*(x*x + y*y) - (9*z*z - 1.0)*(1.0-z*z))/L/4;
};
```

A surface obtained by rotating a [teardrop curve](https://math.stackexchange.com/questions/1447021/function-to-describe-teardrop-shape/1678533):

```
return function (x, y, z) {
	x=3*x; y=3*y; z=3*z; // rescale to fit 1x1x1 box
	const r = Math.sqrt(x*x + y*y);
	const L = 1.0 + 75*Math.abs(r);

	return ( 4*r*r - (1-z)*(1-z)*(1-z)*(1+z) )/L;
}
```

A [gyroid](https://en.wikipedia.org/wiki/Gyroid).

```
return function (x, y, z) {
	x = x*10; y=y*10; z=z*10; // rescale to fit box
	const L=2;

	return (Math.sin(x)*Math.cos(y) + Math.sin(y)*Math.cos(z) + Math.sin(z)*Math.cos(x))/L/10;
}
```

A heart, see [this video](https://www.youtube.com/watch?v=aNR4n0i2ZlM) for explanation:

```
return function (x, y, z) {
	const r = 0.4;
	y = y - 3.5;
	z = z*(2 - y/15);
	y = 4 + 1.2*y + Math.abs(x)*Math.sqrt((20 - Math.abs(x))/15)
	const L = 3;
	return (Math.sqrt(x*x + y*y + z*z) - r)/L;
};
```

The [Sierpinski tetrahedron (Tetrix)](http://mathworld.wolfram.com/Tetrix.html).

```
return function (x, y, z) {
	let n = 0;
	const scale=2.0;

	while (n < 9)
	{
		let tmp;
		if(x + y < 0) {tmp=x; x=-y; y=-tmp;}
		if(x + z < 0) {tmp=x; x=-z; z=-tmp;}
		if(y + z < 0) {tmp=y; y=-z; z=-tmp;}
		x = scale*x - 0.4*(scale-1.0);
		y = scale*y - 0.4*(scale-1.0);
		z = scale*z - 0.4*(scale-1.0);
		n++;
	}

	return Math.sqrt(x*x + y*y + z*z)*Math.pow(scale, -n) - 0.0075;
};
```

Some kind of a knot. See [here](http://blog.hvidtfeldts.net/index.php/2012/01/knots-and-polyhedra) and [here](http://www.fractalforums.com/new-theories-and-research/not-fractal-but-funny-trefoil-knot-routine) for details:

```
return function (x, y, z) {
	const scale = 6;
	x *= scale;
	y *= scale;
	z *= scale;

	const r = Math.sqrt(x*x + y*y + z*z);
	const phi = Math.atan2(y, x);
	const r1 = Math.sin(1.5 * phi) + 1.5;
	const z1 = Math.cos(1.5 * phi);
	const r2 = Math.sin(1.5 * phi + 3.14156) + 1.5;
	const z2 = Math.cos(1.5 * phi + 3.14156);

	const x1=r1*Math.cos(phi), y1=r1*Math.sin(phi);
	const x2=r2*Math.cos(phi), y2=r2*Math.sin(phi);

	return (Math.min(
		Math.sqrt((x-x1)*(x-x1)+(y-y1)*(y-y1)+(z-z1)*(z-z1)),
		Math.sqrt((x-x2)*(x-x2)+(y-y2)*(y-y2)+(z-z2)*(z-z2))) - 0.3)/3.0/scale;
};
```

Another knot:

```
// params
const objrad = 0.4;
const tuberad = 0.1;
const grouprad = 0.3;

function twist(x, y, z) {
	const ra = z*-2/3;
	const raz = z*-4/3;
	const u = x - grouprad*Math.cos(ra) + objrad;
	const v = y - grouprad*Math.sin(raz) + objrad;
	return Math.sqrt(u*u + v*v) - tuberad;
}

function knot(x, y, z) {
	y = y - 0.5; // translate to origin
	const r = Math.sqrt(x*x + z*z);
	const a = Math.atan2(z, x);
	let d = 1e6;
	for (let i=0; i<3; ++i)
		d = Math.min(twist(r-objrad, y, a + 2*3.14156*i), d);

	// modulation is necessary to ensure that the estimator does not overestimate distances
	// too small value breaks marching cubes, too big and raymarching passes through the surface without detecting it
	const m = Math.min(0.5, 2.375*r + 0.025)

	return m*d;
}

// the cylinder (capsule) in the middle of the structure masks the singularity happening there
// this area is difficult to handle with marching cubes because the structure there is too thin
return union(knot, capsule([0, -0.1, 0], [0, +0.3, 0], 0.035));
```

A [Menger sponge](https://en.wikipedia.org/wiki/Menger_sponge) (takes around 10 seconds to generate):

```
function mod(a, b) {
	if (a<0) a=-a;
	return a%b;
}

function column(x, y) {
	x = Math.abs(x)-0.5;
	y = Math.abs(y)-0.5;
	return Math.sqrt(Math.max(x, 0)*Math.max(x, 0) + Math.max(y, 0)*Math.max(y, 0)) + Math.min(Math.max(x, y), 0);
}

function lattice(x, y, z) {
	const c = 3.0;

	x = x - c/2.0;
	y = y - c/2.0;
	z = z - c/2.0;

	// domain repetition
	x = mod(x, c) - c/2.0;
	y = mod(y, c) - c/2.0;
	z = mod(z, c) - c/2.0;

	return Math.min(column(x, y), Math.min(column(x, z), column(y, z)));
};

let sponge = cuboid(1, 1, 1);
for (let i=1; i<4; ++i)
	sponge = difference(sponge, scale(lattice, Math.pow(3, -i), Math.pow(3, -i), Math.pow(3, -i)));
	
return scale(sponge, 0.75, 0.75, 0.75);
```

## Extruding 2D shapes

Interesting 3D objects can be obtained by extruding (adding a 3rd dimension) 2D shapes.
You can check [https://www.iquilezles.org/www/articles/distfunctions2d/distfunctions2d.htm](https://www.iquilezles.org/www/articles/distfunctions2d/distfunctions2d.htm) for more 2D signed distance bounds.
Some examples follow.

```
function circle(r) {
	return function (x, y) {
		return Math.sqrt(x*x + y*y) - r;
	};
}

return extrusion(circle(0.25), 0.5);
```

```
function line2d(p1, p2, r) {
	const [xa, ya] = p1;
	const [xb, yb] = p2;
	return function (x, y) {
		const pa = [x - xa, y - ya];
		const ba = [xb - xa, yb - ya];
		let h = (pa[0]*ba[0] + pa[1]*ba[1])/(ba[0]*ba[0] + ba[1]*ba[1]);
		h = Math.max(0.0, Math.min(1.0, h));
		const d = [pa[0] - h*ba[0], pa[1] - h*ba[1]];
		return Math.sqrt(d[0]*d[0] + d[1]*d[1]) - r;
	};
}

const l = line2d(
	[-0.45, -0.45],
	[0.45, 0.45],
	0.01
);

return extrusion(l, 0.5);
```

```
// https://en.wikipedia.org/wiki/Lemniscate_of_Gerono
function lemn(x, y) {
	x*=3; y*=3;
	return (x*x*x*x - x*x + y*y)/3;
}

return extrusion(lemn, 0.5);
```

```
// an equilateral triangle
function triangle(x, y)
{
	const s = 3;
	[x, y] = [Math.abs(s*x) - 1.0, s*y + 1.0/Math.sqrt(3)];
	if(x + Math.sqrt(3)*y > 0)
		[x, y] = [
			(x - Math.sqrt(3)*y)/2.0,
			(-Math.sqrt(3)*x - y)/2.0
		]
	x -= Math.max(-2.0, Math.min(0.0, x))

	if (y > 0)
		return -Math.sqrt(x*x + y*y)/s;
	else
		return +Math.sqrt(x*x + y*y)/s;
}

return extrusion(triangle, 0.5);
```

```
// https://www.gamedev.net/blogs/entry/2250902-logarithmic-spiral-distance-field/
function logspi(a, b, R)
{
	return function (x, y) {
		const pi = 3.14156;
		const r = Math.sqrt(x*x + y*y);
		const t = Math.atan2(y, x) + pi;

		const n = (Math.log(r/a)/b - t)/(2*pi);
		const n1 = Math.floor(n);
		const n2 = Math.ceil(n);

		const r1 = a*Math.exp(b*(t + 2*pi*n1));
		const r2 = a*Math.exp(b*(t + 2*pi*n2));

		return Math.abs(Math.min(r2-r, r-r1)) - R;
	}
}

return extrusion(logspi(0.1, 0.1, 0.01), 0.1);
```
