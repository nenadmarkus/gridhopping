// inputs:
//  * `eval_sdb` is the signed distance bound represeting a shape
//  * `N` is the grid resolution
function apply_grid_hopping(eval_sdb, N)
{
	for (var i=0; i<N; ++i)
		for (var j=0; j<N; ++j)
		{
			var k=0;
			while (true)
			{
				// set the origin of the ray
				var x=-1.0/2.0+1.0/(2.0*N)+i/N;
				var y=-1.0/2.0+1.0/(2.0*N)+j/N;
				var z=-1.0/2.0+1.0/(2.0*N)+k/N;
				// use ray marching to determine how much to move along the ray
				var t = trace_ray(
					[x, y, z],             // origin of the ray
					[0.0, 0.0, 1.0],       // direction of the ray
					eval_sdb,              // signed distance bound
					1.05*(1.0/2.0 - z),    // max distance to travel
					Math.sqrt(6.0)/(2.0*N) // distance to surface we require
				);
				// set the new value of z and its associated cell, (i, j, k)
				z = z + t;
				k = Math.floor(N*(z + 1.0/2.0  - 1.0/(2.0*N)));
				// are we outside the polygonization volume?
				if (k>N-1 || z>1.05/2.0)
					break;
				// polygonize cell (i, j, k)
				... // <- polygonizaiton code goes here, e.g., Marching cubes
				// move further along the z direction
				++k;
			}
		}
}