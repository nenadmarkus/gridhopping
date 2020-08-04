#include <math.h>

real_t sde_sierpinski_tetrahedron(real_t x, real_t y, real_t z)
{
	int n = 0;
	const int scale = 2.0;

	while( n < 9 )
	{
		real_t tmp;
		if(x + y < 0) {tmp=x; x=-y; y=-tmp;}
		if(x + z < 0) {tmp=x; x=-z; z=-tmp;}
		if(y + z < 0) {tmp=y; y=-z; z=-tmp;}
		x = scale*x - 0.4*(scale-1.0);
		y = scale*y - 0.4*(scale-1.0);
		z = scale*z - 0.4*(scale-1.0);
		++n;
	}

	return sqrtf(x*x + y*y + z*z)*powf(scale, -n) - 0.0075f;
}

real_t sde_scene(real_t x, real_t y, real_t z)
{
	return sde_sierpinski_tetrahedron(x, y, z);
}

#ifdef SURF_CRAWL
// not used for gridhopping
int get_nseeds()
{
	return 1;
}
real_t* get_seed_ptr()
{
	static real_t SEEDS[] = {-0.4030761718750000, -0.0378417968750000, 0.0466308593750000};
	return &SEEDS[0];
}
#endif