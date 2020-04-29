importScripts('gridhopping.js');
importScripts('polygonize.js');
importScripts('extensions.js');

const cuboid = primitives3d.cuboid;
const sphere = primitives3d.sphere;
const capsule = primitives3d.capsule;
const torus = primitives3d.torus;
const cylinder = primitives3d.cylinder;
const plane = primitives3d.plane;
const cone = primitives3d.cone;
const octahedron = primitives3d.octahedron;

const union = ops.union;
const intersection = ops.intersection;
const difference = ops.difference;
const translate = ops.translate;
const rotate = ops.rotate;
const scale = ops.scale;
const shell = ops.shell;
const extrusion = ops.extrusion;
const round = ops.round;

onmessage = function(event) {
	console.log('* <worker.js> message received from main script ...');
	const job = event.data;

	let t0, t1, log;

	const triangles = [], normals = [];

	function emit_triang(v0, v1, v2)
	{
		triangles.push([v2, v1, v0]);
	}

	function compute_normals(sde_func, eps)
	{
		for (let i=0; i<triangles.length; ++i)
			normals.push([
				get_normal_at(sde_func, triangles[i][0][0], triangles[i][0][1], triangles[i][0][2], eps),
				get_normal_at(sde_func, triangles[i][1][0], triangles[i][1][1], triangles[i][1][2], eps),
				get_normal_at(sde_func, triangles[i][2][0], triangles[i][2][1], triangles[i][2][2], eps)
			]);

		return normals;
	}

	try {
		const sde_func = new Function(job.sde_func)();
		t0 = performance.now();
		polygonize_grid_fast(sde_func, job.side, job.n, polygonize_cell_mc, emit_triang);
		t1 = performance.now();
		log = "Generated " + triangles.length + " triangles in " + Math.trunc(t1 - t0) + " miliseconds.";
		if (job.normals)
		{
			t0 = performance.now();
			const eps = job.side/(2*job.n);
			compute_normals(sde_func, eps);
			t1 = performance.now();
			log += " Normals computed in " + (t1 - t0) + " miliseconds.";
		}
	}
	catch (e) {
		log = e.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}

	postMessage({
		log: log,
		triangles: triangles,
		normals: normals
	});
}