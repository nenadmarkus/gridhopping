#include <math.h>
#define MIN(a, b) ((a)<(b)?(a):(b))

real_t sde_scene(real_t x, real_t y, real_t z)
{
	//
	real_t scale = 6;

	x *= scale;
	y *= scale;
	z *= scale;

	//
	real_t phi = atan2(y, x);
	real_t r1 = sinf(1.5 * phi) + 1.5;
	real_t z1 = cosf(1.5 * phi);
	real_t r2 = sinf(1.5 * phi + 3.14156) + 1.5;
	real_t z2 = cosf(1.5 * phi + 3.14156);
	//
	real_t x1=r1*cosf(phi), y1=r1*sinf(phi);
	real_t x2=r2*cosf(phi), y2=r2*sinf(phi);
	//
	real_t r = sqrtf(x*x + y*y + z*z);
	real_t f = (1 + r)/1.25;
	return f*(MIN(sqrtf((x-x1)*(x-x1)+(y-y1)*(y-y1)+(z-z1)*(z-z1)), sqrtf((x-x2)*(x-x2)+(y-y2)*(y-y2)+(z-z2)*(z-z2))) - 0.3)/4.0/scale;
}

#ifdef SURF_CRAWL
// not used for gridhopping
int get_nseeds()
{
	return 1;
}
real_t* get_seed_ptr()
{
	static real_t SEEDS[] = {-0.4572753906250000, -0.0173339843750000, -0.0383300781250000};
	return &SEEDS[0];
}
#endif