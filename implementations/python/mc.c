/*
	
*/

// <https://github.com/nenadmarkus/gridhopping/blob/master/implementations/c/gridhopping.c>
// we use the function `polygonize_cell` from the below file
#include "../c/gridhopping.c"

// I/O operations
#include <stdio.h>

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

int run(char* filename, real_t cells[], real_t vals[], int ncells)
{
	int i;

	OUTPUT = fopen(filename, "wb");

	// write dummy header first
	unsigned char header[80] = {0, 0, 0, 0};
	fwrite(header, 1, 80, OUTPUT);
	fwrite(&NTRIANGS, 4, 1, OUTPUT);

	for (i=0; i<ncells; ++i)
		polygonize_cell(&cells[8*3*i], &vals[8*i], 0.0, emit_triangle);

	// write #triangles to file
	fseek(OUTPUT, 80, SEEK_SET);
	fwrite(&NTRIANGS, 4, 1, OUTPUT);
	fclose(OUTPUT);

	printf("* generated %d triangles\n", NTRIANGS);
}
