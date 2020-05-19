#include <math.h>

#define ABS(x) ((x)<0?(-(x)):(x))
#define MAX(a, b) ((a)>(b)?(a):(b))
#define MIN(a, b) ((a)<(b)?(a):(b))

real_t sdb_sphere(real_t x, real_t y, real_t z, real_t r)
{
	return sqrt(x*x + y*y + z*z) - r;
}

real_t sdb_cuboid(real_t x, real_t y, real_t z, real_t a, real_t b, real_t c)
{
	real_t d[3] = {
		ABS(x) - a/2.0,
		ABS(y) - b/2.0,
		ABS(z) - c/2.0
	};
	return sqrt(MAX(d[0], 0.0)*MAX(d[0], 0.0) + MAX(d[1], 0.0)*MAX(d[1], 0.0) + MAX(d[2], 0.0)*MAX(d[2], 0.0)) +
		MIN(MAX(d[0], MAX(d[1], d[2])), 0.0);
}

real_t sdb_cone(real_t x, real_t y, real_t z, real_t r, real_t h)
{
	real_t nr = -h/sqrt(r*r + h*h);
	real_t nz = -r/sqrt(r*r + h*h);
	real_t off = -nr*r;

	r = sqrt(x*x + y*y);

	return MAX(MAX(-r, -z), -nr*r - nz*z - off);
}


real_t sdb_cylinder(real_t x, real_t y, real_t z, real_t r, real_t h)
{
	return MAX(sqrt(x*x + y*y)-r, MAX(z-h/2.0, -z-h/2.0));
}

real_t sdb_torus(real_t x, real_t y, real_t z, real_t R, real_t r)
{
	real_t t = R - sqrt(x*x + y*y);
	return sqrt(t*t + z*z) - r;
}

real_t sdb_octahedron(real_t x, real_t y, real_t z, real_t s)
{
	x = ABS(x);
	y = ABS(y);
	z = ABS(z);
	return (x + y + z - s)*0.57735027;
}

real_t sdb_capsule(real_t x, real_t y, real_t z, real_t xa, real_t ya, real_t za, real_t xb, real_t yb, real_t zb, real_t r)
{
	real_t pa[] = {x - xa, y - ya, z - za};
	real_t ba[] = {xb - xa, yb - ya, zb - za};
	real_t h = (pa[0]*ba[0] + pa[1]*ba[1] + pa[2]*ba[2])/(ba[0]*ba[0] + ba[1]*ba[1] + ba[2]*ba[2]);
	h = MAX(0.0, MIN(1.0, h));
	real_t d[] = {pa[0] - h*ba[0], pa[1] - h*ba[1], pa[2] - h*ba[2]};
	return sqrt(d[0]*d[0] + d[1]*d[1] + d[2]*d[2]) - r;
}

real_t sde_scene(real_t x, real_t y, real_t z)
{
	int i = 1;
	const real_t radius = 0.3;
	real_t a = 0.0;

	real_t d1 = sdb_sphere(x, y, z, 0.1);

	a = (i-1)*2.0*3.14156/(7-1); ++i;
	real_t d2 = sdb_cuboid(x-radius*sin(a), y-radius*cos(a), z, 0.15, 0.15, 0.15);
	a = (i-1)*2.0*3.14156/(7-1); ++i;
	real_t d3 = sdb_cone(x-radius*sin(a), y-radius*cos(a), z, 0.1, 0.2);
	a = (i-1)*2.0*3.14156/(7-1); ++i;
	real_t d4 = sdb_cylinder(x-radius*sin(a), y-radius*cos(a), z, 0.1, 0.2);
	a = (i-1)*2.0*3.14156/(7-1); ++i;
	real_t d5 = sdb_torus(x-radius*sin(a), y-radius*cos(a), z, 0.08, 0.04);
	a = (i-1)*2.0*3.14156/(7-1); ++i;
	real_t d6 = sdb_octahedron(x-radius*sin(a), y-radius*cos(a), z, 0.15);
	a = (i-1)*2.0*3.14156/(7-1); ++i;
	real_t d7 = sdb_capsule(x-radius*sin(a), y-radius*cos(a), z, 0, 0, -0.075, 0, 0, +0.075, 0.075);

	// union of all primitives
	return MIN(MIN(MIN(MIN(MIN(MIN(d1, d2), d3), d4), d5), d6), d7);
}