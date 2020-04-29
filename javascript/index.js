tryit.value = `const solids = [
	sphere(0.1),
	cuboid(0.15, 0.15, 0.15),
	cone(0.1, 0.2),
	cylinder(0.1, 0.2),
	torus(0.08, 0.04),
	octahedron(0.15),
	capsule([0, 0, -0.075], [0, 0, +0.075], 0.075)
];

const radius = 0.3;

for (let i=1; i<solids.length; ++i)
{
	const a = (i-1)*2.0*Math.PI/(solids.length-1);
	solids[i] = translate(solids[i], radius*Math.sin(a), radius*Math.cos(a), 0.0);
}

return union(solids);`;

document.getElementById("size").value = 1;
document.getElementById("resolution").value = 128;

//
const VIEWER = new_viewer(
	document.getElementById("VIEWPORT")
);

/*

*/

//
var TRIANGLES = null;
var NORMALS = null;
var LOCK = false;

const WORKER = new Worker("worker.js");

function rebuild()
{
	const log = document.getElementById('log');

	if (LOCK === true) {
		log.innerHTML = "You cannot assign a new job before the old one is finished ...";
		return;
	}
	else
		LOCK = true;

	log.innerHTML = "Generating triangles ... please be patient.";

	const side = Number(document.getElementById("size").value);
	const resolution = Number(document.getElementById("resolution").value);

	VIEWER.clean();
	VIEWER.add_helpers(side);
	VIEWER.reposition_camera(
		[0, 0, 2*side],
		[0, 0, 0]
	);

	WORKER.onmessage = function (event) {
		const results = event.data;
		log.innerHTML = results.log;
		TRIANGLES = results.triangles;
		NORMALS = results.normals;
		VIEWER.add_model({
			id: 0,
			color: 0x768d87,
			triangles: TRIANGLES,
			normals: NORMALS
		});
		LOCK = false;
	}
	WORKER.postMessage({
		sde_func: tryit.value,
		side: side,
		n: resolution,
		normals: false
	});
}

rebuild();

document.getElementById("render-button").onclick = rebuild;

/*
	exporter
*/

function export_to_stl(triangles)
{
	const ntriangles = triangles.length;
	let offset = 80; // skip header
	const bufferLength = ntriangles * 2 + ntriangles * 3 * 4 * 4 + 80 + 4;
	const arrayBuffer = new ArrayBuffer( bufferLength );
	const output = new DataView( arrayBuffer );
	output.setUint32(offset, ntriangles, true); offset += 4;

	for (let i=0; i<ntriangles; ++i)
	{
		// normal = [0, 0, 0]
		output.setFloat32(offset, 0, true); offset += 4;
		output.setFloat32(offset, 0, true); offset += 4;
		output.setFloat32(offset, 0, true); offset += 4;

		for (let j=0; j<3; ++j)
		{
			// vertices
			output.setFloat32(offset, triangles[i][j][0], true); offset += 4;
			output.setFloat32(offset, triangles[i][j][1], true); offset += 4;
			output.setFloat32(offset, triangles[i][j][2], true); offset += 4;
		}

		output.setUint16(offset, 0, true); offset += 2; // attribute byte count
	}

	return output;
}

// modal popup
const modal = document.getElementById("stl-download-popup");

function toggle_modal() {
	modal.classList.toggle("show-modal");
}

//document.getElementById("close-modal-button").onclick = toggle_modal;

// click is for desktop, touchstart is for mobile devices
window.onclick = window.ontouchstart = function () {
	if (event.target === modal)
		toggle_modal();
}

const link = document.createElement('a');
link.style.display = 'none';
document.body.appendChild(link);

document.getElementById("export-button").onclick = function () {
	console.log('* exporting the current mesh to STL ...');
	var buffer = export_to_stl(TRIANGLES);
	var blob = new Blob([buffer], {type: 'application/octet-stream'})
	link.href = URL.createObjectURL(blob);
	link.download = 'model.stl';

	// old:
	//link.click();

	// new:
	toggle_modal();
	document.getElementById("download-stl-button").onclick = function () {
		link.click();
	}
};