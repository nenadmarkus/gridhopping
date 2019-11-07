#include <stdlib.h>
#include <stdio.h>

#include "gridmarching.c"

real_t sde_scene(real_t x, real_t y, real_t z);

FILE* OUTPUT = 0;
int NTRIANGS = 0;

void emit_triangle(real_t v1[], real_t v2[], real_t v3[])
{
	if (OUTPUT != 0)
	{
		float vec[3] = {0.0f, 0.0f, 0.0f};
		fwrite(vec, 4, 3, OUTPUT); // normal
		vec[0] = v1[0]; vec[1] = v1[1]; vec[2] = v1[2];
		fwrite(vec, 4, 3, OUTPUT); // first vertex
		vec[0] = v2[0]; vec[1] = v2[1]; vec[2] = v2[2];
		fwrite(vec, 4, 3, OUTPUT); // second vertex
		vec[0] = v3[0]; vec[1] = v3[1]; vec[2] = v3[2];
		fwrite(vec, 4, 3, OUTPUT); // third vertex
		unsigned short abc = 0;
		fwrite(&abc, 2, 1, OUTPUT); // attribute byte count
	}

	++NTRIANGS;
}

int run(int resolution, char* opath)
{
	if (opath!=0)
	{
		OUTPUT = fopen(opath, "wb");
		if (!OUTPUT)
		{
			printf("* failed to open file '%s'", opath);
			return 0;
		}
		unsigned char header[80] = {0, 0, 0, 0};
		fwrite(header, 1, 80, OUTPUT); // header
		fwrite(&NTRIANGS, 4, 1, OUTPUT);
	}

	polygonize_grid(sde_scene, 1.0f, resolution, emit_triangle);

	if (opath!=0)
	{
		fseek(OUTPUT, 80, SEEK_SET);
		fwrite(&NTRIANGS, 4, 1, OUTPUT);
		fclose(OUTPUT);
	}

	return NTRIANGS;
}

int main(int argc, char* argv[])
{
	if (argc<2 || argc>3)
	{
		printf("* args: <resolution> [output]\n");
		return 0;
	}

	int resolution = 64;
	sscanf(argv[1], "%d", &resolution);

	char* opath = 0;
	if (argc == 3)
		opath = argv[2];

	run(resolution, opath);

	if (argc != 3)
		printf("* the model has %d triangles\n", NTRIANGS);

	return 0;
}