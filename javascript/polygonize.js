function interpolate_vertex(borderval, vert1, val1, vert2, val2)
{
	if (Math.abs(borderval-val1)<0.00001 || Math.abs(val1-val2)<0.00001)
		return vert1;

	if (Math.abs(borderval-val2) < 0.00001)
		return vert2;

	const a = (borderval - val1) / (val2 - val1);

	return [
		vert1[0] + a*(vert2[0] - vert1[0]),
		vert1[1] + a*(vert2[1] - vert1[1]),
		vert1[2] + a*(vert2[2] - vert1[2])
	];
}

/*
	Marching cubes
*/

function polygonize_cell_mc(cellverts, sde_func, borderval, emit_triang)
{
	/*
		marching cubes, taken from <http://paulbourke.net/geometry/polygonise/>
	*/

	const cellvals = [
		sde_func(cellverts[0][0], cellverts[0][1], cellverts[0][2]),
		sde_func(cellverts[1][0], cellverts[1][1], cellverts[1][2]),
		sde_func(cellverts[2][0], cellverts[2][1], cellverts[2][2]),
		sde_func(cellverts[3][0], cellverts[3][1], cellverts[3][2]),
		sde_func(cellverts[4][0], cellverts[4][1], cellverts[4][2]),
		sde_func(cellverts[5][0], cellverts[5][1], cellverts[5][2]),
		sde_func(cellverts[6][0], cellverts[6][1], cellverts[6][2]),
		sde_func(cellverts[7][0], cellverts[7][1], cellverts[7][2])
	];

	const edgeTable = [
		0x0  , 0x109, 0x203, 0x30a, 0x406, 0x50f, 0x605, 0x70c,
		0x80c, 0x905, 0xa0f, 0xb06, 0xc0a, 0xd03, 0xe09, 0xf00,
		0x190, 0x99 , 0x393, 0x29a, 0x596, 0x49f, 0x795, 0x69c,
		0x99c, 0x895, 0xb9f, 0xa96, 0xd9a, 0xc93, 0xf99, 0xe90,
		0x230, 0x339, 0x33 , 0x13a, 0x636, 0x73f, 0x435, 0x53c,
		0xa3c, 0xb35, 0x83f, 0x936, 0xe3a, 0xf33, 0xc39, 0xd30,
		0x3a0, 0x2a9, 0x1a3, 0xaa , 0x7a6, 0x6af, 0x5a5, 0x4ac,
		0xbac, 0xaa5, 0x9af, 0x8a6, 0xfaa, 0xea3, 0xda9, 0xca0,
		0x460, 0x569, 0x663, 0x76a, 0x66 , 0x16f, 0x265, 0x36c,
		0xc6c, 0xd65, 0xe6f, 0xf66, 0x86a, 0x963, 0xa69, 0xb60,
		0x5f0, 0x4f9, 0x7f3, 0x6fa, 0x1f6, 0xff , 0x3f5, 0x2fc,
		0xdfc, 0xcf5, 0xfff, 0xef6, 0x9fa, 0x8f3, 0xbf9, 0xaf0,
		0x650, 0x759, 0x453, 0x55a, 0x256, 0x35f, 0x55 , 0x15c,
		0xe5c, 0xf55, 0xc5f, 0xd56, 0xa5a, 0xb53, 0x859, 0x950,
		0x7c0, 0x6c9, 0x5c3, 0x4ca, 0x3c6, 0x2cf, 0x1c5, 0xcc ,
		0xfcc, 0xec5, 0xdcf, 0xcc6, 0xbca, 0xac3, 0x9c9, 0x8c0,
		0x8c0, 0x9c9, 0xac3, 0xbca, 0xcc6, 0xdcf, 0xec5, 0xfcc,
		0xcc , 0x1c5, 0x2cf, 0x3c6, 0x4ca, 0x5c3, 0x6c9, 0x7c0,
		0x950, 0x859, 0xb53, 0xa5a, 0xd56, 0xc5f, 0xf55, 0xe5c,
		0x15c, 0x55 , 0x35f, 0x256, 0x55a, 0x453, 0x759, 0x650,
		0xaf0, 0xbf9, 0x8f3, 0x9fa, 0xef6, 0xfff, 0xcf5, 0xdfc,
		0x2fc, 0x3f5, 0xff , 0x1f6, 0x6fa, 0x7f3, 0x4f9, 0x5f0,
		0xb60, 0xa69, 0x963, 0x86a, 0xf66, 0xe6f, 0xd65, 0xc6c,
		0x36c, 0x265, 0x16f, 0x66 , 0x76a, 0x663, 0x569, 0x460,
		0xca0, 0xda9, 0xea3, 0xfaa, 0x8a6, 0x9af, 0xaa5, 0xbac,
		0x4ac, 0x5a5, 0x6af, 0x7a6, 0xaa , 0x1a3, 0x2a9, 0x3a0,
		0xd30, 0xc39, 0xf33, 0xe3a, 0x936, 0x83f, 0xb35, 0xa3c,
		0x53c, 0x435, 0x73f, 0x636, 0x13a, 0x33 , 0x339, 0x230,
		0xe90, 0xf99, 0xc93, 0xd9a, 0xa96, 0xb9f, 0x895, 0x99c,
		0x69c, 0x795, 0x49f, 0x596, 0x29a, 0x393, 0x99 , 0x190,
		0xf00, 0xe09, 0xd03, 0xc0a, 0xb06, 0xa0f, 0x905, 0x80c,
		0x70c, 0x605, 0x50f, 0x406, 0x30a, 0x203, 0x109, 0x0
	];

	const triTable = [
		[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[0, 1, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[1, 8, 3, 9, 8, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[0, 8, 3, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[9, 2, 10, 0, 2, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[2, 8, 3, 2, 10, 8, 10, 9, 8, -1, -1, -1, -1, -1, -1, -1],
		[3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[0, 11, 2, 8, 11, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[1, 9, 0, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[1, 11, 2, 1, 9, 11, 9, 8, 11, -1, -1, -1, -1, -1, -1, -1],
		[3, 10, 1, 11, 10, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[0, 10, 1, 0, 8, 10, 8, 11, 10, -1, -1, -1, -1, -1, -1, -1],
		[3, 9, 0, 3, 11, 9, 11, 10, 9, -1, -1, -1, -1, -1, -1, -1],
		[9, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[4, 3, 0, 7, 3, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[0, 1, 9, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[4, 1, 9, 4, 7, 1, 7, 3, 1, -1, -1, -1, -1, -1, -1, -1],
		[1, 2, 10, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[3, 4, 7, 3, 0, 4, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1],
		[9, 2, 10, 9, 0, 2, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1],
		[2, 10, 9, 2, 9, 7, 2, 7, 3, 7, 9, 4, -1, -1, -1, -1],
		[8, 4, 7, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[11, 4, 7, 11, 2, 4, 2, 0, 4, -1, -1, -1, -1, -1, -1, -1],
		[9, 0, 1, 8, 4, 7, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1],
		[4, 7, 11, 9, 4, 11, 9, 11, 2, 9, 2, 1, -1, -1, -1, -1],
		[3, 10, 1, 3, 11, 10, 7, 8, 4, -1, -1, -1, -1, -1, -1, -1],
		[1, 11, 10, 1, 4, 11, 1, 0, 4, 7, 11, 4, -1, -1, -1, -1],
		[4, 7, 8, 9, 0, 11, 9, 11, 10, 11, 0, 3, -1, -1, -1, -1],
		[4, 7, 11, 4, 11, 9, 9, 11, 10, -1, -1, -1, -1, -1, -1, -1],
		[9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[9, 5, 4, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[0, 5, 4, 1, 5, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[8, 5, 4, 8, 3, 5, 3, 1, 5, -1, -1, -1, -1, -1, -1, -1],
		[1, 2, 10, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[3, 0, 8, 1, 2, 10, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1],
		[5, 2, 10, 5, 4, 2, 4, 0, 2, -1, -1, -1, -1, -1, -1, -1],
		[2, 10, 5, 3, 2, 5, 3, 5, 4, 3, 4, 8, -1, -1, -1, -1],
		[9, 5, 4, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[0, 11, 2, 0, 8, 11, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1],
		[0, 5, 4, 0, 1, 5, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1],
		[2, 1, 5, 2, 5, 8, 2, 8, 11, 4, 8, 5, -1, -1, -1, -1],
		[10, 3, 11, 10, 1, 3, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1],
		[4, 9, 5, 0, 8, 1, 8, 10, 1, 8, 11, 10, -1, -1, -1, -1],
		[5, 4, 0, 5, 0, 11, 5, 11, 10, 11, 0, 3, -1, -1, -1, -1],
		[5, 4, 8, 5, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1],
		[9, 7, 8, 5, 7, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[9, 3, 0, 9, 5, 3, 5, 7, 3, -1, -1, -1, -1, -1, -1, -1],
		[0, 7, 8, 0, 1, 7, 1, 5, 7, -1, -1, -1, -1, -1, -1, -1],
		[1, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[9, 7, 8, 9, 5, 7, 10, 1, 2, -1, -1, -1, -1, -1, -1, -1],
		[10, 1, 2, 9, 5, 0, 5, 3, 0, 5, 7, 3, -1, -1, -1, -1],
		[8, 0, 2, 8, 2, 5, 8, 5, 7, 10, 5, 2, -1, -1, -1, -1],
		[2, 10, 5, 2, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1],
		[7, 9, 5, 7, 8, 9, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1],
		[9, 5, 7, 9, 7, 2, 9, 2, 0, 2, 7, 11, -1, -1, -1, -1],
		[2, 3, 11, 0, 1, 8, 1, 7, 8, 1, 5, 7, -1, -1, -1, -1],
		[11, 2, 1, 11, 1, 7, 7, 1, 5, -1, -1, -1, -1, -1, -1, -1],
		[9, 5, 8, 8, 5, 7, 10, 1, 3, 10, 3, 11, -1, -1, -1, -1],
		[5, 7, 0, 5, 0, 9, 7, 11, 0, 1, 0, 10, 11, 10, 0, -1],
		[11, 10, 0, 11, 0, 3, 10, 5, 0, 8, 0, 7, 5, 7, 0, -1],
		[11, 10, 5, 7, 11, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[0, 8, 3, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[9, 0, 1, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[1, 8, 3, 1, 9, 8, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1],
		[1, 6, 5, 2, 6, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[1, 6, 5, 1, 2, 6, 3, 0, 8, -1, -1, -1, -1, -1, -1, -1],
		[9, 6, 5, 9, 0, 6, 0, 2, 6, -1, -1, -1, -1, -1, -1, -1],
		[5, 9, 8, 5, 8, 2, 5, 2, 6, 3, 2, 8, -1, -1, -1, -1],
		[2, 3, 11, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[11, 0, 8, 11, 2, 0, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1],
		[0, 1, 9, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1],
		[5, 10, 6, 1, 9, 2, 9, 11, 2, 9, 8, 11, -1, -1, -1, -1],
		[6, 3, 11, 6, 5, 3, 5, 1, 3, -1, -1, -1, -1, -1, -1, -1],
		[0, 8, 11, 0, 11, 5, 0, 5, 1, 5, 11, 6, -1, -1, -1, -1],
		[3, 11, 6, 0, 3, 6, 0, 6, 5, 0, 5, 9, -1, -1, -1, -1],
		[6, 5, 9, 6, 9, 11, 11, 9, 8, -1, -1, -1, -1, -1, -1, -1],
		[5, 10, 6, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[4, 3, 0, 4, 7, 3, 6, 5, 10, -1, -1, -1, -1, -1, -1, -1],
		[1, 9, 0, 5, 10, 6, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1],
		[10, 6, 5, 1, 9, 7, 1, 7, 3, 7, 9, 4, -1, -1, -1, -1],
		[6, 1, 2, 6, 5, 1, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1],
		[1, 2, 5, 5, 2, 6, 3, 0, 4, 3, 4, 7, -1, -1, -1, -1],
		[8, 4, 7, 9, 0, 5, 0, 6, 5, 0, 2, 6, -1, -1, -1, -1],
		[7, 3, 9, 7, 9, 4, 3, 2, 9, 5, 9, 6, 2, 6, 9, -1],
		[3, 11, 2, 7, 8, 4, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1],
		[5, 10, 6, 4, 7, 2, 4, 2, 0, 2, 7, 11, -1, -1, -1, -1],
		[0, 1, 9, 4, 7, 8, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1],
		[9, 2, 1, 9, 11, 2, 9, 4, 11, 7, 11, 4, 5, 10, 6, -1],
		[8, 4, 7, 3, 11, 5, 3, 5, 1, 5, 11, 6, -1, -1, -1, -1],
		[5, 1, 11, 5, 11, 6, 1, 0, 11, 7, 11, 4, 0, 4, 11, -1],
		[0, 5, 9, 0, 6, 5, 0, 3, 6, 11, 6, 3, 8, 4, 7, -1],
		[6, 5, 9, 6, 9, 11, 4, 7, 9, 7, 11, 9, -1, -1, -1, -1],
		[10, 4, 9, 6, 4, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[4, 10, 6, 4, 9, 10, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1],
		[10, 0, 1, 10, 6, 0, 6, 4, 0, -1, -1, -1, -1, -1, -1, -1],
		[8, 3, 1, 8, 1, 6, 8, 6, 4, 6, 1, 10, -1, -1, -1, -1],
		[1, 4, 9, 1, 2, 4, 2, 6, 4, -1, -1, -1, -1, -1, -1, -1],
		[3, 0, 8, 1, 2, 9, 2, 4, 9, 2, 6, 4, -1, -1, -1, -1],
		[0, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[8, 3, 2, 8, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1],
		[10, 4, 9, 10, 6, 4, 11, 2, 3, -1, -1, -1, -1, -1, -1, -1],
		[0, 8, 2, 2, 8, 11, 4, 9, 10, 4, 10, 6, -1, -1, -1, -1],
		[3, 11, 2, 0, 1, 6, 0, 6, 4, 6, 1, 10, -1, -1, -1, -1],
		[6, 4, 1, 6, 1, 10, 4, 8, 1, 2, 1, 11, 8, 11, 1, -1],
		[9, 6, 4, 9, 3, 6, 9, 1, 3, 11, 6, 3, -1, -1, -1, -1],
		[8, 11, 1, 8, 1, 0, 11, 6, 1, 9, 1, 4, 6, 4, 1, -1],
		[3, 11, 6, 3, 6, 0, 0, 6, 4, -1, -1, -1, -1, -1, -1, -1],
		[6, 4, 8, 11, 6, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[7, 10, 6, 7, 8, 10, 8, 9, 10, -1, -1, -1, -1, -1, -1, -1],
		[0, 7, 3, 0, 10, 7, 0, 9, 10, 6, 7, 10, -1, -1, -1, -1],
		[10, 6, 7, 1, 10, 7, 1, 7, 8, 1, 8, 0, -1, -1, -1, -1],
		[10, 6, 7, 10, 7, 1, 1, 7, 3, -1, -1, -1, -1, -1, -1, -1],
		[1, 2, 6, 1, 6, 8, 1, 8, 9, 8, 6, 7, -1, -1, -1, -1],
		[2, 6, 9, 2, 9, 1, 6, 7, 9, 0, 9, 3, 7, 3, 9, -1],
		[7, 8, 0, 7, 0, 6, 6, 0, 2, -1, -1, -1, -1, -1, -1, -1],
		[7, 3, 2, 6, 7, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[2, 3, 11, 10, 6, 8, 10, 8, 9, 8, 6, 7, -1, -1, -1, -1],
		[2, 0, 7, 2, 7, 11, 0, 9, 7, 6, 7, 10, 9, 10, 7, -1],
		[1, 8, 0, 1, 7, 8, 1, 10, 7, 6, 7, 10, 2, 3, 11, -1],
		[11, 2, 1, 11, 1, 7, 10, 6, 1, 6, 7, 1, -1, -1, -1, -1],
		[8, 9, 6, 8, 6, 7, 9, 1, 6, 11, 6, 3, 1, 3, 6, -1],
		[0, 9, 1, 11, 6, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[7, 8, 0, 7, 0, 6, 3, 11, 0, 11, 6, 0, -1, -1, -1, -1],
		[7, 11, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[3, 0, 8, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[0, 1, 9, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[8, 1, 9, 8, 3, 1, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1],
		[10, 1, 2, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[1, 2, 10, 3, 0, 8, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1],
		[2, 9, 0, 2, 10, 9, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1],
		[6, 11, 7, 2, 10, 3, 10, 8, 3, 10, 9, 8, -1, -1, -1, -1],
		[7, 2, 3, 6, 2, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[7, 0, 8, 7, 6, 0, 6, 2, 0, -1, -1, -1, -1, -1, -1, -1],
		[2, 7, 6, 2, 3, 7, 0, 1, 9, -1, -1, -1, -1, -1, -1, -1],
		[1, 6, 2, 1, 8, 6, 1, 9, 8, 8, 7, 6, -1, -1, -1, -1],
		[10, 7, 6, 10, 1, 7, 1, 3, 7, -1, -1, -1, -1, -1, -1, -1],
		[10, 7, 6, 1, 7, 10, 1, 8, 7, 1, 0, 8, -1, -1, -1, -1],
		[0, 3, 7, 0, 7, 10, 0, 10, 9, 6, 10, 7, -1, -1, -1, -1],
		[7, 6, 10, 7, 10, 8, 8, 10, 9, -1, -1, -1, -1, -1, -1, -1],
		[6, 8, 4, 11, 8, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[3, 6, 11, 3, 0, 6, 0, 4, 6, -1, -1, -1, -1, -1, -1, -1],
		[8, 6, 11, 8, 4, 6, 9, 0, 1, -1, -1, -1, -1, -1, -1, -1],
		[9, 4, 6, 9, 6, 3, 9, 3, 1, 11, 3, 6, -1, -1, -1, -1],
		[6, 8, 4, 6, 11, 8, 2, 10, 1, -1, -1, -1, -1, -1, -1, -1],
		[1, 2, 10, 3, 0, 11, 0, 6, 11, 0, 4, 6, -1, -1, -1, -1],
		[4, 11, 8, 4, 6, 11, 0, 2, 9, 2, 10, 9, -1, -1, -1, -1],
		[10, 9, 3, 10, 3, 2, 9, 4, 3, 11, 3, 6, 4, 6, 3, -1],
		[8, 2, 3, 8, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1],
		[0, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[1, 9, 0, 2, 3, 4, 2, 4, 6, 4, 3, 8, -1, -1, -1, -1],
		[1, 9, 4, 1, 4, 2, 2, 4, 6, -1, -1, -1, -1, -1, -1, -1],
		[8, 1, 3, 8, 6, 1, 8, 4, 6, 6, 10, 1, -1, -1, -1, -1],
		[10, 1, 0, 10, 0, 6, 6, 0, 4, -1, -1, -1, -1, -1, -1, -1],
		[4, 6, 3, 4, 3, 8, 6, 10, 3, 0, 3, 9, 10, 9, 3, -1],
		[10, 9, 4, 6, 10, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[4, 9, 5, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[0, 8, 3, 4, 9, 5, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1],
		[5, 0, 1, 5, 4, 0, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1],
		[11, 7, 6, 8, 3, 4, 3, 5, 4, 3, 1, 5, -1, -1, -1, -1],
		[9, 5, 4, 10, 1, 2, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1],
		[6, 11, 7, 1, 2, 10, 0, 8, 3, 4, 9, 5, -1, -1, -1, -1],
		[7, 6, 11, 5, 4, 10, 4, 2, 10, 4, 0, 2, -1, -1, -1, -1],
		[3, 4, 8, 3, 5, 4, 3, 2, 5, 10, 5, 2, 11, 7, 6, -1],
		[7, 2, 3, 7, 6, 2, 5, 4, 9, -1, -1, -1, -1, -1, -1, -1],
		[9, 5, 4, 0, 8, 6, 0, 6, 2, 6, 8, 7, -1, -1, -1, -1],
		[3, 6, 2, 3, 7, 6, 1, 5, 0, 5, 4, 0, -1, -1, -1, -1],
		[6, 2, 8, 6, 8, 7, 2, 1, 8, 4, 8, 5, 1, 5, 8, -1],
		[9, 5, 4, 10, 1, 6, 1, 7, 6, 1, 3, 7, -1, -1, -1, -1],
		[1, 6, 10, 1, 7, 6, 1, 0, 7, 8, 7, 0, 9, 5, 4, -1],
		[4, 0, 10, 4, 10, 5, 0, 3, 10, 6, 10, 7, 3, 7, 10, -1],
		[7, 6, 10, 7, 10, 8, 5, 4, 10, 4, 8, 10, -1, -1, -1, -1],
		[6, 9, 5, 6, 11, 9, 11, 8, 9, -1, -1, -1, -1, -1, -1, -1],
		[3, 6, 11, 0, 6, 3, 0, 5, 6, 0, 9, 5, -1, -1, -1, -1],
		[0, 11, 8, 0, 5, 11, 0, 1, 5, 5, 6, 11, -1, -1, -1, -1],
		[6, 11, 3, 6, 3, 5, 5, 3, 1, -1, -1, -1, -1, -1, -1, -1],
		[1, 2, 10, 9, 5, 11, 9, 11, 8, 11, 5, 6, -1, -1, -1, -1],
		[0, 11, 3, 0, 6, 11, 0, 9, 6, 5, 6, 9, 1, 2, 10, -1],
		[11, 8, 5, 11, 5, 6, 8, 0, 5, 10, 5, 2, 0, 2, 5, -1],
		[6, 11, 3, 6, 3, 5, 2, 10, 3, 10, 5, 3, -1, -1, -1, -1],
		[5, 8, 9, 5, 2, 8, 5, 6, 2, 3, 8, 2, -1, -1, -1, -1],
		[9, 5, 6, 9, 6, 0, 0, 6, 2, -1, -1, -1, -1, -1, -1, -1],
		[1, 5, 8, 1, 8, 0, 5, 6, 8, 3, 8, 2, 6, 2, 8, -1],
		[1, 5, 6, 2, 1, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[1, 3, 6, 1, 6, 10, 3, 8, 6, 5, 6, 9, 8, 9, 6, -1],
		[10, 1, 0, 10, 0, 6, 9, 5, 0, 5, 6, 0, -1, -1, -1, -1],
		[0, 3, 8, 5, 6, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[10, 5, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[11, 5, 10, 7, 5, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[11, 5, 10, 11, 7, 5, 8, 3, 0, -1, -1, -1, -1, -1, -1, -1],
		[5, 11, 7, 5, 10, 11, 1, 9, 0, -1, -1, -1, -1, -1, -1, -1],
		[10, 7, 5, 10, 11, 7, 9, 8, 1, 8, 3, 1, -1, -1, -1, -1],
		[11, 1, 2, 11, 7, 1, 7, 5, 1, -1, -1, -1, -1, -1, -1, -1],
		[0, 8, 3, 1, 2, 7, 1, 7, 5, 7, 2, 11, -1, -1, -1, -1],
		[9, 7, 5, 9, 2, 7, 9, 0, 2, 2, 11, 7, -1, -1, -1, -1],
		[7, 5, 2, 7, 2, 11, 5, 9, 2, 3, 2, 8, 9, 8, 2, -1],
		[2, 5, 10, 2, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1],
		[8, 2, 0, 8, 5, 2, 8, 7, 5, 10, 2, 5, -1, -1, -1, -1],
		[9, 0, 1, 5, 10, 3, 5, 3, 7, 3, 10, 2, -1, -1, -1, -1],
		[9, 8, 2, 9, 2, 1, 8, 7, 2, 10, 2, 5, 7, 5, 2, -1],
		[1, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[0, 8, 7, 0, 7, 1, 1, 7, 5, -1, -1, -1, -1, -1, -1, -1],
		[9, 0, 3, 9, 3, 5, 5, 3, 7, -1, -1, -1, -1, -1, -1, -1],
		[9, 8, 7, 5, 9, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[5, 8, 4, 5, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1],
		[5, 0, 4, 5, 11, 0, 5, 10, 11, 11, 3, 0, -1, -1, -1, -1],
		[0, 1, 9, 8, 4, 10, 8, 10, 11, 10, 4, 5, -1, -1, -1, -1],
		[10, 11, 4, 10, 4, 5, 11, 3, 4, 9, 4, 1, 3, 1, 4, -1],
		[2, 5, 1, 2, 8, 5, 2, 11, 8, 4, 5, 8, -1, -1, -1, -1],
		[0, 4, 11, 0, 11, 3, 4, 5, 11, 2, 11, 1, 5, 1, 11, -1],
		[0, 2, 5, 0, 5, 9, 2, 11, 5, 4, 5, 8, 11, 8, 5, -1],
		[9, 4, 5, 2, 11, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[2, 5, 10, 3, 5, 2, 3, 4, 5, 3, 8, 4, -1, -1, -1, -1],
		[5, 10, 2, 5, 2, 4, 4, 2, 0, -1, -1, -1, -1, -1, -1, -1],
		[3, 10, 2, 3, 5, 10, 3, 8, 5, 4, 5, 8, 0, 1, 9, -1],
		[5, 10, 2, 5, 2, 4, 1, 9, 2, 9, 4, 2, -1, -1, -1, -1],
		[8, 4, 5, 8, 5, 3, 3, 5, 1, -1, -1, -1, -1, -1, -1, -1],
		[0, 4, 5, 1, 0, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[8, 4, 5, 8, 5, 3, 9, 0, 5, 0, 3, 5, -1, -1, -1, -1],
		[9, 4, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[4, 11, 7, 4, 9, 11, 9, 10, 11, -1, -1, -1, -1, -1, -1, -1],
		[0, 8, 3, 4, 9, 7, 9, 11, 7, 9, 10, 11, -1, -1, -1, -1],
		[1, 10, 11, 1, 11, 4, 1, 4, 0, 7, 4, 11, -1, -1, -1, -1],
		[3, 1, 4, 3, 4, 8, 1, 10, 4, 7, 4, 11, 10, 11, 4, -1],
		[4, 11, 7, 9, 11, 4, 9, 2, 11, 9, 1, 2, -1, -1, -1, -1],
		[9, 7, 4, 9, 11, 7, 9, 1, 11, 2, 11, 1, 0, 8, 3, -1],
		[11, 7, 4, 11, 4, 2, 2, 4, 0, -1, -1, -1, -1, -1, -1, -1],
		[11, 7, 4, 11, 4, 2, 8, 3, 4, 3, 2, 4, -1, -1, -1, -1],
		[2, 9, 10, 2, 7, 9, 2, 3, 7, 7, 4, 9, -1, -1, -1, -1],
		[9, 10, 7, 9, 7, 4, 10, 2, 7, 8, 7, 0, 2, 0, 7, -1],
		[3, 7, 10, 3, 10, 2, 7, 4, 10, 1, 10, 0, 4, 0, 10, -1],
		[1, 10, 2, 8, 7, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[4, 9, 1, 4, 1, 7, 7, 1, 3, -1, -1, -1, -1, -1, -1, -1],
		[4, 9, 1, 4, 1, 7, 0, 8, 1, 8, 7, 1, -1, -1, -1, -1],
		[4, 0, 3, 7, 4, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[4, 8, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[9, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[3, 0, 9, 3, 9, 11, 11, 9, 10, -1, -1, -1, -1, -1, -1, -1],
		[0, 1, 10, 0, 10, 8, 8, 10, 11, -1, -1, -1, -1, -1, -1, -1],
		[3, 1, 10, 11, 3, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[1, 2, 11, 1, 11, 9, 9, 11, 8, -1, -1, -1, -1, -1, -1, -1],
		[3, 0, 9, 3, 9, 11, 1, 2, 9, 2, 11, 9, -1, -1, -1, -1],
		[0, 2, 11, 8, 0, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[3, 2, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[2, 3, 8, 2, 8, 10, 10, 8, 9, -1, -1, -1, -1, -1, -1, -1],
		[9, 10, 2, 0, 9, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[2, 3, 8, 2, 8, 10, 0, 1, 8, 1, 10, 8, -1, -1, -1, -1],
		[1, 10, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[1, 3, 8, 9, 1, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[0, 9, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[0, 3, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]
	];

	/*
		Determine the index into the edge table which
		tells us which vertices are inside of the surface
	*/
	let cubeindex = 0;
	if (cellvals[0] < borderval) cubeindex |= 1;
	if (cellvals[1] < borderval) cubeindex |= 2;
	if (cellvals[2] < borderval) cubeindex |= 4;
	if (cellvals[3] < borderval) cubeindex |= 8;
	if (cellvals[4] < borderval) cubeindex |= 16;
	if (cellvals[5] < borderval) cubeindex |= 32;
	if (cellvals[6] < borderval) cubeindex |= 64;
	if (cellvals[7] < borderval) cubeindex |= 128;

	/* Cube is entirely in/out of the surface */
	if (edgeTable[cubeindex] == 0)
		return [];

	/* Find the vertices where the surface intersects the cube */
	let vertlist = [[], [], [], [], [], [], [], [], [], [], [], []];

	if (edgeTable[cubeindex] & 1)
		vertlist[0] = interpolate_vertex(borderval, cellverts[0], cellvals[0], cellverts[1], cellvals[1]);
	if (edgeTable[cubeindex] & 2)
		vertlist[1] = interpolate_vertex(borderval, cellverts[1], cellvals[1], cellverts[2], cellvals[2]);
	if (edgeTable[cubeindex] & 4)
		vertlist[2] = interpolate_vertex(borderval, cellverts[2], cellvals[2], cellverts[3], cellvals[3]);
	if (edgeTable[cubeindex] & 8)
		vertlist[3] = interpolate_vertex(borderval, cellverts[3], cellvals[3], cellverts[0], cellvals[0]);
	if (edgeTable[cubeindex] & 16)
		vertlist[4] = interpolate_vertex(borderval, cellverts[4], cellvals[4], cellverts[5], cellvals[5]);
	if (edgeTable[cubeindex] & 32)
		vertlist[5] = interpolate_vertex(borderval, cellverts[5], cellvals[5], cellverts[6], cellvals[6]);
	if (edgeTable[cubeindex] & 64)
		vertlist[6] = interpolate_vertex(borderval, cellverts[6], cellvals[6], cellverts[7], cellvals[7]);
	if (edgeTable[cubeindex] & 128)
		vertlist[7] = interpolate_vertex(borderval, cellverts[7], cellvals[7], cellverts[4], cellvals[4]);
	if (edgeTable[cubeindex] & 256)
		vertlist[8] = interpolate_vertex(borderval, cellverts[0], cellvals[0], cellverts[4], cellvals[4]);
	if (edgeTable[cubeindex] & 512)
		vertlist[9] = interpolate_vertex(borderval, cellverts[1], cellvals[1], cellverts[5], cellvals[5]);
	if (edgeTable[cubeindex] & 1024)
		vertlist[10] = interpolate_vertex(borderval, cellverts[2], cellvals[2], cellverts[6], cellvals[6]);
	if (edgeTable[cubeindex] & 2048)
		vertlist[11] = interpolate_vertex(borderval, cellverts[3], cellvals[3], cellverts[7], cellvals[7]);

	/* Create triangles */
	let ntriangs = 0;

	for (let i=0; triTable[cubeindex][i]!=-1; i+=3)
	{
		emit_triang(
			vertlist[triTable[cubeindex][i+0]],
			vertlist[triTable[cubeindex][i+1]],
			vertlist[triTable[cubeindex][i+2]]
		);

		++ntriangs;
	}

   return ntriangs;
}

/*
	Marching tetrahedra
*/

function polygonize_tet(verts, vals, borderval, emit_triang)
{
	// inspired by https://github.com/Calvin-L/MarchingTetrahedrons

	/*

     Tetrahedron layout:

           0
           *
          /|
         / |
      3 *-----* 1
         \ | /
          \|/
           *
           2

	*/

	let index = 0|0;
	for (let i=0; i<4; ++i)
		if (vals[i] < borderval)
			index |= (1 << i);

	switch(index)
	{
		case 0x0:
			// all vertices inside
			return 0;
		case 0x1:
			// only vertex 0 is inside
			emit_triang(
				interpolate_vertex(borderval, verts[0], vals[0], verts[1], vals[1]),
				interpolate_vertex(borderval, verts[0], vals[0], verts[3], vals[3]),
				interpolate_vertex(borderval, verts[0], vals[0], verts[2], vals[2])
			);
			return 1;
		case 0x2:
			// only vertex 1 is inside
			emit_triang(
				interpolate_vertex(borderval, verts[1], vals[1], verts[0], vals[0]),
				interpolate_vertex(borderval, verts[1], vals[1], verts[2], vals[2]),
				interpolate_vertex(borderval, verts[1], vals[1], verts[3], vals[3])
			);
			return 1;
		case 0x3:
			// vertices 0 and 1 are inside
			emit_triang(
				interpolate_vertex(borderval, verts[3], vals[3], verts[0], vals[0]),
				interpolate_vertex(borderval, verts[2], vals[2], verts[0], vals[0]),
				interpolate_vertex(borderval, verts[1], vals[1], verts[3], vals[3])
			);
			emit_triang(
				interpolate_vertex(borderval, verts[2], vals[2], verts[0], vals[0]),
				interpolate_vertex(borderval, verts[2], vals[2], verts[1], vals[1]),
				interpolate_vertex(borderval, verts[1], vals[1], verts[3], vals[3])
			);
			return 2;
		case 0x4:
			// only vertex 2 is inside
			emit_triang(
				interpolate_vertex(borderval, verts[2], vals[2], verts[0], vals[0]),
				interpolate_vertex(borderval, verts[2], vals[2], verts[3], vals[3]),
				interpolate_vertex(borderval, verts[2], vals[2], verts[1], vals[1])
			);
			return 1;
		case 0x5:
			// vertices 0 and 2 are inside
			emit_triang(
				interpolate_vertex(borderval, verts[3], vals[3], verts[0], vals[0]),
				interpolate_vertex(borderval, verts[1], vals[1], verts[2], vals[2]),
				interpolate_vertex(borderval, verts[1], vals[1], verts[0], vals[0])
			);
			emit_triang(
				interpolate_vertex(borderval, verts[1], vals[1], verts[2], vals[2]),
				interpolate_vertex(borderval, verts[3], vals[3], verts[0], vals[0]),
				interpolate_vertex(borderval, verts[2], vals[2], verts[3], vals[3])
			);
			return 2;
		case 0x6:
			// vertices 1 and 2 are inside
			emit_triang(
				interpolate_vertex(borderval, verts[0], vals[0], verts[1], vals[1]),
				interpolate_vertex(borderval, verts[0], vals[0], verts[2], vals[2]),
				interpolate_vertex(borderval, verts[1], vals[1], verts[3], vals[3])
			);
			emit_triang(
				interpolate_vertex(borderval, verts[1], vals[1], verts[3], vals[3]),
				interpolate_vertex(borderval, verts[0], vals[0], verts[2], vals[2]),
				interpolate_vertex(borderval, verts[3], vals[3], verts[2], vals[2])
			);
			return 2;
		case 0x7:
			// vertices 0, 1 and 2 are inside
			emit_triang(
				interpolate_vertex(borderval, verts[3], vals[3], verts[0], vals[0]),
				interpolate_vertex(borderval, verts[3], vals[3], verts[2], vals[2]),
				interpolate_vertex(borderval, verts[3], vals[3], verts[1], vals[1])
			);
			return 1;
		case 0x8:
			// vertices 0, 1 and 3 are inside
			emit_triang(
				interpolate_vertex(borderval, verts[3], vals[3], verts[1], vals[1]),
				interpolate_vertex(borderval, verts[3], vals[3], verts[2], vals[2]),
				interpolate_vertex(borderval, verts[3], vals[3], verts[0], vals[0])
			);
			return 1;
		case 0x9:
			// vertices 0 and 3 are inside
			emit_triang(
				interpolate_vertex(borderval, verts[0], vals[0], verts[1], vals[1]),
				interpolate_vertex(borderval, verts[1], vals[1], verts[3], vals[3]),
				interpolate_vertex(borderval, verts[0], vals[0], verts[2], vals[2])
			);
			emit_triang(
				interpolate_vertex(borderval, verts[1], vals[1], verts[3], vals[3]),
				interpolate_vertex(borderval, verts[3], vals[3], verts[2], vals[2]),
				interpolate_vertex(borderval, verts[0], vals[0], verts[2], vals[2])
			);
			return 2;
		case 0xA:
			// vertices 1 and 3 are inside
			emit_triang(
				interpolate_vertex(borderval, verts[3], vals[3], verts[0], vals[0]),
				interpolate_vertex(borderval, verts[1], vals[1], verts[0], vals[0]),
				interpolate_vertex(borderval, verts[1], vals[1], verts[2], vals[2])
			);
			emit_triang(
				interpolate_vertex(borderval, verts[1], vals[1], verts[2], vals[2]),
				interpolate_vertex(borderval, verts[2], vals[2], verts[3], vals[3]),
				interpolate_vertex(borderval, verts[3], vals[3], verts[0], vals[0])
			);
			return 2;
		case 0xB:
			// vertices 0, 1 and 3 are inside
			emit_triang(
				interpolate_vertex(borderval, verts[2], vals[2], verts[1], vals[1]),
				interpolate_vertex(borderval, verts[2], vals[2], verts[3], vals[3]),
				interpolate_vertex(borderval, verts[2], vals[2], verts[0], vals[0])
			);
			return 1;
		case 0xC:
			// vertices 2 and 3 are inside
			emit_triang(
				interpolate_vertex(borderval, verts[1], vals[1], verts[3], vals[3]),
				interpolate_vertex(borderval, verts[2], vals[2], verts[0], vals[0]),
				interpolate_vertex(borderval, verts[3], vals[3], verts[0], vals[0])
			);
			emit_triang(
				interpolate_vertex(borderval, verts[2], vals[2], verts[0], vals[0]),
				interpolate_vertex(borderval, verts[1], vals[1], verts[3], vals[3]),
				interpolate_vertex(borderval, verts[2], vals[2], verts[1], vals[1])
			);
			return 2;
		case 0xD:
			// vertices 0, 2 and 3 are inside
			emit_triang(
				interpolate_vertex(borderval, verts[1], vals[1], verts[0], vals[0]),
				interpolate_vertex(borderval, verts[1], vals[1], verts[3], vals[3]),
				interpolate_vertex(borderval, verts[1], vals[1], verts[2], vals[2])
			);
			return 1;
		case 0xE:
			// vertices 1, 2 and 3 are inside
			emit_triang(
				interpolate_vertex(borderval, verts[0], vals[0], verts[1], vals[1]),
				interpolate_vertex(borderval, verts[0], vals[0], verts[2], vals[2]),
				interpolate_vertex(borderval, verts[0], vals[0], verts[3], vals[3])
			);
			return 1;
		case 0xF:
			// all vertices outside
			return 0;
		default:
			// never should come to this
			return 0;
	}
}

function polygonize_cell_mt(cellverts, sde_func, borderval, emit_triang)
{

	const cellvals = [
		sde_func(cellverts[0][0], cellverts[0][1], cellverts[0][2]),
		sde_func(cellverts[1][0], cellverts[1][1], cellverts[1][2]),
		sde_func(cellverts[2][0], cellverts[2][1], cellverts[2][2]),
		sde_func(cellverts[3][0], cellverts[3][1], cellverts[3][2]),
		sde_func(cellverts[4][0], cellverts[4][1], cellverts[4][2]),
		sde_func(cellverts[5][0], cellverts[5][1], cellverts[5][2]),
		sde_func(cellverts[6][0], cellverts[6][1], cellverts[6][2]),
		sde_func(cellverts[7][0], cellverts[7][1], cellverts[7][2])
	];

	/*
                 Coordinates:

                      z
                      |
                      |___ y
                      /
                     /
                    x

                 Cube layout (comes inside as a first parameter of this function):

                    4-------7
                   /|      /|
                  / |     / |
                 5-------6  |
                 |  0----|--3
                 | /     | /
                 |/      |/
                 1-------2

                 Tetrahedrons are:

                     0, 7, 3, 2
                     0, 7, 2, 6
                     0, 4, 6, 7
                     0, 6, 1, 2
                     0, 6, 1, 4
                     5, 6, 1, 4
	*/

	let ntriangs = 0;

	ntriangs += polygonize_tet(
		[cellverts[0], cellverts[7], cellverts[3], cellverts[2]],
		[cellvals[0], cellvals[7], cellvals[3], cellvals[2]],
		borderval, emit_triang
	);
	ntriangs += polygonize_tet(
		[cellverts[0], cellverts[7], cellverts[2], cellverts[6]],
		[cellvals[0], cellvals[7], cellvals[2], cellvals[6]],
		borderval, emit_triang
	);
	ntriangs += polygonize_tet(
		[cellverts[0], cellverts[4], cellverts[7], cellverts[6]],
		[cellvals[0], cellvals[4], cellvals[7], cellvals[6]],
		borderval, emit_triang
	);
	ntriangs += polygonize_tet(
		[cellverts[0], cellverts[1], cellverts[6], cellverts[2]],
		[cellvals[0], cellvals[1], cellvals[6], cellvals[2]],
		borderval, emit_triang
	);
	ntriangs += polygonize_tet(
		[cellverts[0], cellverts[4], cellverts[6], cellverts[1]],
		[cellvals[0], cellvals[4], cellvals[6], cellvals[1]],
		borderval, emit_triang
	);
	ntriangs += polygonize_tet(
		[cellverts[5], cellverts[1], cellverts[6], cellverts[4]],
		[cellvals[5], cellvals[1], cellvals[6], cellvals[4]],
		borderval, emit_triang
	);

	return ntriangs

/*
	// additional central vertex, 12 tetrahedra
	const [xc, yc, zc] = [
		(cellverts[0][0]+cellverts[1][0]+cellverts[2][0]+cellverts[3][0]+cellverts[4][0]+cellverts[5][0]+cellverts[6][0]+cellverts[7][0])/8.0,
		(cellverts[0][1]+cellverts[1][1]+cellverts[2][1]+cellverts[3][1]+cellverts[4][1]+cellverts[5][1]+cellverts[6][1]+cellverts[7][1])/8.0,
		(cellverts[0][2]+cellverts[1][2]+cellverts[2][2]+cellverts[3][2]+cellverts[4][2]+cellverts[5][2]+cellverts[6][2]+cellverts[7][2])/8.0
	];

	const vc = sde_func(xc, yc, zc);

	let ntriangs = 0;

	ntriangs += polygonize_tet(
		[cellverts[1], cellverts[0], cellverts[2], [xc, yc, zc]],
		[cellvals[1], cellvals[0], cellvals[2], vc],
		borderval, emit_triang
	);
	ntriangs += polygonize_tet(
		[cellverts[2], cellverts[0], cellverts[3], [xc, yc, zc]],
		[cellvals[2], cellvals[0], cellvals[3], vc],
		borderval, emit_triang
	);
	ntriangs += polygonize_tet(
		[cellverts[2], cellverts[3], cellverts[6], [xc, yc, zc]],
		[cellvals[2], cellvals[3], cellvals[6], vc],
		borderval, emit_triang
	);
	ntriangs += polygonize_tet(
		[cellverts[3], cellverts[7], cellverts[6], [xc, yc, zc]],
		[cellvals[3], cellvals[7], cellvals[6], vc],
		borderval, emit_triang
	);
	ntriangs += polygonize_tet(
		[cellverts[7], cellverts[4], cellverts[6], [xc, yc, zc]],
		[cellvals[7], cellvals[4], cellvals[6], vc],
		borderval, emit_triang
	);
	ntriangs += polygonize_tet(
		[cellverts[4], cellverts[5], cellverts[6], [xc, yc, zc]],
		[cellvals[4], cellvals[5], cellvals[6], vc],
		borderval, emit_triang
	);
	ntriangs += polygonize_tet(
		[cellverts[4], cellverts[7], cellverts[3], [xc, yc, zc]],
		[cellvals[4], cellvals[7], cellvals[3], vc],
		borderval, emit_triang
	);
	ntriangs += polygonize_tet(
		[cellverts[3], cellverts[0], cellverts[4], [xc, yc, zc]],
		[cellvals[3], cellvals[0], cellvals[4], vc],
		borderval, emit_triang
	);
	ntriangs += polygonize_tet(
		[cellverts[5], cellverts[4], cellverts[0], [xc, yc, zc]],
		[cellvals[5], cellvals[4], cellvals[0], vc],
		borderval, emit_triang
	);
	ntriangs += polygonize_tet(
		[cellverts[1], cellverts[5], cellverts[0], [xc, yc, zc]],
		[cellvals[1], cellvals[5], cellvals[0], vc],
		borderval, emit_triang
	);
	ntriangs += polygonize_tet(
		[cellverts[1], cellverts[2], cellverts[5], [xc, yc, zc]],
		[cellvals[1], cellvals[2], cellvals[5], vc],
		borderval, emit_triang
	);
	ntriangs += polygonize_tet(
		[cellverts[2], cellverts[6], cellverts[5], [xc, yc, zc]],
		[cellvals[2], cellvals[6], cellvals[5], vc],
		borderval, emit_triang
	);

	return ntriangs;
*/
}