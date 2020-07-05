tryit.value = `/*
	More examples at https://lambdacad.gitlab.io/examples.html
*/

const solids = [
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
	// apply random rotation around each of the three axes
	solids[i] = rotate(solids[i], [1, 0, 0], Math.random()*2.0*Math.PI);
	solids[i] = rotate(solids[i], [0, 1, 0], Math.random()*2.0*Math.PI);
	solids[i] = rotate(solids[i], [0, 0, 1], Math.random()*2.0*Math.PI);

	// apply deterministically computed translation
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
	(re)build model
*/

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

document.getElementById("build-button").onclick = rebuild;

/*
	save model code
*/

const savecodelink = document.createElement('a');
savecodelink.style.display = 'none';
document.body.appendChild(savecodelink);

// from <https://stackoverflow.com/questions/5416920/timestamp-to-human-readable-format>
function get_formated_date()
{
	const date = new Date();

	let month = date.getMonth() + 1;
	let day = date.getDate();
	let hour = date.getHours();
	let minutes = date.getMinutes();
	let seconds = date.getSeconds();

	month = (month < 10 ? "0" : "") + month;
	day = (day < 10 ? "0" : "") + day;
	hour = (hour < 10 ? "0" : "") + hour;
	minutes = (minutes < 10 ? "0" : "") + minutes;
	seconds = (seconds < 10 ? "0" : "") + seconds;

	return date.getFullYear() + "-" + month + "-" + day + "-" + hour + "-" + minutes + "-" + seconds;
}

function save_code()
{
	const code = tryit.value;

	const timestamp = get_formated_date();
	const name = "model-" + timestamp + ".js";

	const blob = new Blob([code], {type: "text/plain;charset=utf-8"});
	savecodelink.href = URL.createObjectURL(blob);
	savecodelink.download = name;
	savecodelink.click();
}

document.getElementById("save-code-button").onclick = save_code;

/*
	export model
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

/*
	build model on shift+enter
*/

const keys = {
	"shift": false,
	"enter": false
}

document.body.addEventListener("keydown", function (event) {
	if (event.keyCode == 16)
		keys["shift"] = true;
	if (event.keyCode == 13)
		keys["enter"] = true;

	if(keys["shift"]===true && keys["enter"]===true)
		rebuild();
})

document.body.addEventListener("keyup", function (event) {
	if (event.keyCode == 16)
		keys["shift"] = false;
	if (event.keyCode == 13)
		keys["enter"] = false;
})