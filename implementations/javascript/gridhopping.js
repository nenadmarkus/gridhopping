// see <https://github.com/nenadmarkus/gridhopping> for licensing

/*
	O(n^3) complexity
*/

function polygonize_grid_slow(eval_sdb, side, n, polygonize_cell, emit_triang)
{
	const h = side/n;

	for(let i=0; i<n; ++i)
	{
		for(let j=0; j<n; ++j)
		{
			for(let k=0; k<n; ++k)
			{
				// we do the computation in this manner due to numerical stability
				const xm = i*h-side/2.0, xp = (i+1)*h-side/2.0;
				const ym = j*h-side/2.0, yp = (j+1)*h-side/2.0;
				const zm = k*h-side/2.0, zp = (k+1)*h-side/2.0;

				const cuboid = [
					[xm, ym, zm],
					[xp, ym, zm],
					[xp, yp, zm],
					[xm, yp, zm],
					[xm, ym, zp],
					[xp, ym, zp],
					[xp, yp, zp],
					[xm, yp, zp]
				];

				polygonize_cell(cuboid, eval_sdb, 0.0, emit_triang);
			}
		}
	}
}

/*
	Faster than O(n^3), something like O(n^2logn)
*/

function trace_ray(origin, direction, eval_sdb, maxt, eps)
{
	let t = 0.0;

	for (let i=0; i<1024; ++i)
	{
		const point = [
			origin[0] + t*direction[0],
			origin[1] + t*direction[1],
			origin[2] + t*direction[2]
		];

		const h = Math.abs(
			eval_sdb(point[0], point[1], point[2])
		);

		if (h<eps)
			return [0, t];

		if (t>maxt)
			return [2, t];

		t += h;
	}

	return [1, t];
}

function polygonize_grid_fast(eval_sdb, side, n, polygonize_cell, emit_triang)
{
	const h = side/n;

	for (let i=0; i<n; ++i)
		for (let j=0; j<n; ++j)
		{
			let k=0;

			while (true)
			{
				// set the origin of the ray and start ray marching
				let x=-side/2.0+h/2.0+i*h, y=-side/2.0+h/2.0+j*h, z=-side/2.0+h/2.0+k*h;

				const [flag, t] = trace_ray(
					[x, y, z],                // origin of the ray
					[0.0, 0.0, 1.0],          // direction of the ray
					eval_sdb,                 // signed distance bound
					1.05*(side/2.0 - z),      // maximum distance along the ray
					1.25*h                    // proximity to the surface which we require, \approx sqrt(6)*h/2
				);

				if(flag==2)
					break;                    // we're outside the rendering volume (t > maxt)
				//if(flag==1)
				//	assert(1 == 0);           // max number of iterations exceeded

				// a new value of z is ...
				z = z + t;

				// compute the cell this z belongs to
				if ( Math.floor((z + side/2.0  - h/2.0)/h) > k )
					k = Math.floor((z + side/2.0  - h/2.0)/h);

				if (k>n-1 || z>1.05*side/2.0)
					break;

				// polygonize the cell
				// we do the computation in this manner due to numerical stability
				const xm = i*h-side/2.0, xp = (i+1)*h-side/2.0;
				const ym = j*h-side/2.0, yp = (j+1)*h-side/2.0;
				const zm = k*h-side/2.0, zp = (k+1)*h-side/2.0;

				const cuboid = [
					[xm, ym, zm],
					[xp, ym, zm],
					[xp, yp, zm],
					[xm, yp, zm],
					[xm, ym, zp],
					[xp, ym, zp],
					[xp, yp, zp],
					[xm, yp, zp]
				];

				const ntriangs = polygonize_cell(cuboid, eval_sdb, 0.0, emit_triang);

				// move further along the z direction
				++k;
			}
		}
}