#define ABS(x) ((x)<0?(-(x)):(x))
#define MAX(a, b) ((a)>(b)?(a):(b))

real_t sde_scene(real_t x, real_t y, real_t z)
{
	/*
		a surface of genus 2
	*/

	// rescale to fit 1x1x1 box
	x *= 4; y *= 4; z *= 4;

	// dynamic Lipshitz constant
	real_t r = MAX(MAX(ABS(x), ABS(y)), ABS(z));
	real_t L = 10.0 + 50.0*r;

	return (2*y*(y*y-3*x*x)*(1.0-z*z) + (x*x + y*y)*(x*x + y*y) - (9*z*z - 1.0)*(1.0-z*z))/(4*L);
}