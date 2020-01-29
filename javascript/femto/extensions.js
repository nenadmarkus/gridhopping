/*
	normal computation
*/

function get_normal_at(sde_func, x, y, z, eps)
{
	//
	const nx = sde_func(x+eps, y, z) - sde_func(x-eps, y, z);
	const ny = sde_func(x, y+eps, z) - sde_func(x, y-eps, z);
	const nz = sde_func(x, y, z+eps) - sde_func(x, y, z-eps);
	//
	const d = 1e-6 + Math.sqrt(nx*nx + ny*ny + nz*nz);
	return [nx/d, ny/d, nz/d];
}

/*
	primitives and basic operations
*/

primitives3d = {
	cuboid: function (a, b, c) {
		return function (x, y, z) {
			const d = [
				Math.abs(x) - a/2.0,
				Math.abs(y) - b/2.0,
				Math.abs(z) - c/2.0
			];
			return Math.sqrt(Math.max(d[0], 0.0)*Math.max(d[0], 0.0) + Math.max(d[1], 0.0)*Math.max(d[1], 0.0) + Math.max(d[2], 0.0)*Math.max(d[2], 0.0)) +
				Math.min(Math.max(d[0], Math.max(d[1], d[2])), 0.0);
		};
	},
	sphere: function (r) {
		return function (x, y, z) {
			return Math.sqrt(x*x + y*y + z*z) - r;
		};
	},
	capsule: function (p1, p2, r) {
		const [xa, ya, za] = p1;
		const [xb, yb, zb] = p2;
		return function (x, y, z) {
			const pa = [x - xa, y - ya, z - za];
			const ba = [xb - xa, yb - ya, zb - za];
			let h = (pa[0]*ba[0] + pa[1]*ba[1] + pa[2]*ba[2])/(ba[0]*ba[0] + ba[1]*ba[1] + ba[2]*ba[2]);
			h = Math.max(0.0, Math.min(1.0, h));
			const d = [pa[0] - h*ba[0], pa[1] - h*ba[1], pa[2] - h*ba[2]];
			return Math.sqrt(d[0]*d[0] + d[1]*d[1] + d[2]*d[2]) - r;
		};
	},
	torus: function (R, r) {
		return function (x, y, z) {
			const t = R - Math.sqrt(x*x + y*y)
			return Math.sqrt(t*t + z*z) - r;
		};
	},
	cylinder: function (r, h) {
		return function (x, y, z) {
			const d1 = Math.sqrt(x*x + y*y) - r; // unbounded cylinder
			const d2 = -z + h/2.0; // first plane defining a half space
			const d3 = +z + h/2.0; // second plane defining a half space
			// subtract the half spaces from the unbounded cylinder
			return Math.max(Math.max(d1, -d2), -d3);
		};
	},
	plane: function (p, n) {
		const norm = Math.sqrt(n[0]*n[0] + n[1]*n[1] + n[2]*n[2]);
		const [a, b, c] = [n[0]/(1e-6 + norm), n[1]/(1e-6 + norm), n[2]/(1e-6 + norm)];
		const d = -a*p[0] - b*p[1] - c*p[2];
		return function (x, y, z) {
			return a*x + b*y + c*z + d;
		};
	},
	cone: function (r, h) {
		const [nr, nz] = [-h/Math.sqrt(r*r + h*h), -r/Math.sqrt(r*r + h*h)];
		const off = -nr*r;
		return function (x, y, z) {
			// revolution around y
			const r = Math.sqrt(x*x + y*y);
			// a triangle in the xy plane: intersection of three half-spaces
			const d1 = r;
			const d2 = z;
			const d3 = nr*r + nz*z + off;
			return Math.max(Math.max(-d1, -d2), -d3);
		};
	},
	octahedron: function (s) {
		return function (x, y, z) {
			x = Math.abs(x);
			y = Math.abs(y);
			z = Math.abs(z);
			return (x + y + z - s)*0.57735027;
		}
	},
	metaballs: function (T, R, xyz) {
		return function (x, y, z) {
			let sum=0, L=0.0, d=1000000.0;
			for (let i=0; i<xyz.length; ++i)
			{
				const r = Math.sqrt( (x-xyz[i][0])*(x-xyz[i][0]) + (y-xyz[i][1])*(y-xyz[i][1]) + (z-xyz[i][2])*(z-xyz[i][2]) );
				if (r<R)
				{
					sum += xyz[i][3]*(2*r*r*r/(R*R*R) - 3*r*r/(R*R) + 1);
					L += 3/(2*R);
				}
				else
					d = Math.min(r-R, d);
			}
			if (L>0.0)
				return (T - sum)/L;
			else
				return d;
		};
	}
}

// https://iquilezles.org/www/articles/distfunctions2d/distfunctions2d.htm
primitives2d = {
	circle: function (r) {
		return function (x, y) {
			return Math.sqrt(x*x + y*y) - r;
		};
	},
	line: function (p1, p2, r) {
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
	},
	polygon: function (verts) {
		return function (x, y) {
			let d = (x-verts[0][0])*(x-verts[0][0]) + (y-verts[0][1])*(y-verts[0][1]);
			let sign = 1.0;
			for (let i=0, j=verts.length-1; i<verts.length; j=i, ++i)
			{
				const e = [verts[j][0]-verts[i][0], verts[j][1]-verts[i][1]];
				const w = [x-verts[i][0], y-verts[i][1]];
				const f = Math.max(0.0, Math.min(1.0,
					(w[0]*e[0] + w[1]*e[1])/(e[0]*e[0] + e[1]*e[1])
				));
				const b = [w[0] - e[1]*f, w[1] - e[1]*f];
				d = Math.min(d, b[0]*b[0] + b[1]*b[1]);
				// flip sign? <- winding number from <http://geomalgorithms.com/a03-_inclusion.html>
				const flags = [
					y >= verts[i][1],
					y <  verts[j][1],
					e[0]*w[1] > e[1]*w[0]
				]
				if (
					(flags[0] && flags[1] && flags[2])
						||
					(!flags[0] && !flags[1] && !flags[2])
				)
					sign *=-1;
			}
			return sign*Math.sqrt(d)/10;
		}
	}
}

ops = {
	union: function () {
		const sde_funcs = [];
		if (arguments.length == 1)
			for (let i=0; i<arguments[0].length; ++i)
				sde_funcs.push(arguments[0][i]);
		else
			for (let i=0; i<arguments.length; ++i)
				sde_funcs.push(arguments[i]);
		return function (x, y, z) {
			let d = Math.min(sde_funcs[0](x, y, z), sde_funcs[1](x, y, z))
			for (let j=2; j<sde_funcs.length; ++j)
				d = Math.min(d, sde_funcs[j](x, y, z));
			return d;
		};
	},
	intersection: function () {
		const sde_funcs = [];
		if (arguments.length == 1)
			for (let i=0; i<arguments[0].length; ++i)
				sde_funcs.push(arguments[0][i]);
		else
			for (let i=0; i<arguments.length; ++i)
				sde_funcs.push(arguments[i]);
		return function (x, y, z) {
			let d = Math.max(sde_funcs[0](x, y, z), sde_funcs[1](x, y, z))
			for (let j=2; j<sde_funcs.length; ++j)
				d = Math.max(d, sde_funcs[j](x, y, z));
			return d;
		};
	},
	difference: function (sde_func1, sde_func2) {
		return function (x, y, z) {
			return Math.max(sde_func1(x, y, z), -sde_func2(x, y, z));
		};
	},
	scale: function(sde_func, sx, sy, sz) {
		const s = Math.min(sx, Math.min(sy, sz));
		return function (x, y, z) {
			return s*sde_func(x/sx, y/sy, z/sz);
		};
	},
	translate: function (sde_func, tx, ty, tz) {
		return function (x, y, z) {
			return sde_func(x-tx, y-ty, z-tz);
		};
	},
	rotate: function (sde_func, axis, angle) {
		const nx = axis[0]/(1e-6 + Math.sqrt(axis[0]*axis[0] + axis[1]*axis[1] + axis[2]*axis[2]));
		const ny = axis[1]/(1e-6 + Math.sqrt(axis[0]*axis[0] + axis[1]*axis[1] + axis[2]*axis[2]));
		const nz = axis[2]/(1e-6 + Math.sqrt(axis[0]*axis[0] + axis[1]*axis[1] + axis[2]*axis[2]));
		// https://www.migenius.com/articles/3d-transformations-part1-matrices
		// https://en.wikipedia.org/wiki/Rotation_matrix#Rotation_matrix_from_axis_and_angle
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);
		const R = [
			[cos + nx*nx*(1.0 - cos), nx*ny*(1.0 - cos) - nz*sin, nx*nz*(1.0 - cos) + ny*sin],
			[ny*nx*(1.0 - cos) + nz*sin, cos + ny*ny*(1.0 - cos), ny*nz*(1.0 - cos) - nx*sin],
			[nz*nx*(1.0 - cos) - ny*sin, nz*ny*(1.0 - cos) + nx*sin, cos + nz*nz*(1.0 - cos)]
		];
		return function (x, y, z) {
			const new_x = R[0][0]*x + R[0][1]*y + R[0][2]*z;
			const new_y = R[1][0]*x + R[1][1]*y + R[1][2]*z;
			const new_z = R[2][0]*x + R[2][1]*y + R[2][2]*z;
			return sde_func(new_x, new_y, new_z);
		};
	},
	blend: function (sde_func1, sde_func2, a) {
		a = Math.max(0.0, Math.min(1.0, a));
		return function (x, y, z) {
			return a*sde_func1(x, y, z) + (1.0 - a)*sde_func2(x, y, z);
		};
	},
	shell: function (sde_func, t) {
		return function (x, y, z) {
			return Math.abs(sde_func(x, y, z)) - t;
		};
	},
	extrusion: function (sde_func_2d, h) {
		return function (x, y, z) {
			const d = sde_func_2d(x, y);
			const u = Math.abs(z) - h/2.0;
			return Math.min(Math.max(d, u), 0.0) + Math.sqrt(Math.max(d, 0.0)*Math.max(d, 0.0) + Math.max(u, 0.0)*Math.max(u, 0.0));
		}
	},
	round: function (sde_func, r) {
		return function (x, y, z) {
			return sde_func(x, y, z) - r;
		};
	},
	smooth: function (sdb, eps) {
		return function (x, y, z) {
			return (
				sdb(x-eps, y, z) + sdb(x+eps, y, z) +
				sdb(x, y-eps, z) + sdb(x, y+eps, z) +
				sdb(x, y, z-eps) + sdb(x, y, z+eps)
			)/6.0;
		};
	}
}