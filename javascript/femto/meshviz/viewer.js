function build_threejs_mesh(triangles, normals, color)
{
	const vertices = [];
	const _normals = [];

	for (let i=0; i<triangles.length; ++i)
		for (let j=0; j<3; ++j)
		{
			vertices.push(triangles[i][j][0], triangles[i][j][1], triangles[i][j][2]);
			if (normals.length > 0)
				_normals.push(normals[i][j][0], normals[i][j][1], normals[i][j][2]);
		}

	//
	function disposeArray() {
		this.array = null;
	}
	const geometry = new THREE.BufferGeometry();
	geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ).onUpload( disposeArray ) );
	if (normals.length > 0)
		geometry.addAttribute( 'normal', new THREE.Float32BufferAttribute( _normals, 3 ).onUpload( disposeArray ) );
	else
		geometry.computeVertexNormals();
	geometry.computeBoundingBox();

	//
	const material = new THREE.MeshLambertMaterial({color: color, wireframe: false});
	const mesh = new THREE.Mesh(geometry, material);

	return mesh;
}

function new_viewer(CONTAINER)
{
	// SCENE
	const scene = new THREE.Scene();
	// CAMERA
	var SCREEN_WIDTH = CONTAINER.clientWidth, SCREEN_HEIGHT = CONTAINER.clientHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	const camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera);
	camera.position.set(1, -1, 0);
	camera.lookAt(scene.position);
	// RENDERER
	let renderer;
	if ( webgl_Detector.webgl )
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	else
		renderer = new THREE.CanvasRenderer(); 
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	const container = CONTAINER;
	container.appendChild( renderer.domElement );
	// EVENTS
	// THREEx.WindowResize(renderer, camera);
	// CONTROLS
	const controls = new THREE.OrbitControls( camera, renderer.domElement );
	// LIGHT
	const light = new THREE.PointLight(0xffffff);
    light.position.set(camera.position.x, camera.position.y, camera.position.z);
	scene.add(light);
	// SKYBOX
	var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
	var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.BackSide } );
	var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
	scene.add(skyBox);

	function animate() 
	{
		requestAnimationFrame( animate );
		renderer.render(scene, camera);
		controls.update();
		// so that the camera does not exit the skybox
		camera.position.set(Math.min(camera.position.x, 1000), Math.min(camera.position.y, 1000), Math.min(camera.position.z, 1000));
		// a light always follows the camera
		light.position.set(camera.position.x, camera.position.y, camera.position.z);
	}

	/*
		
	*/

	animate();

	const OBJECTS = {};

	const vw = {
		clean: function () {
			for (let id in OBJECTS)
				scene.remove(
					OBJECTS[id]
				);
		},
		add_model: function(params) {
			const mesh = build_threejs_mesh(params.triangles, params.normals, params.color);
			OBJECTS[params.id] = mesh;
			scene.add(mesh);
		},
		reposition_camera: function (pos, at) {
			camera.position.set(pos[0], pos[1], pos[2]);
			camera.lookAt(new THREE.Vector3(at[0], at[1], at[2]));
		},
		add_helpers: function (a) {
			// dashed lines representing the polygonization volume
			const material = new THREE.LineDashedMaterial( { color: 0x000000, dashSize: 2*a/100, gapSize: 3*a/100 } );
			const p = [
				[-a/2.0, -a/2.0, -a/2.0], [+a/2.0, -a/2.0, -a/2.0], [+a/2.0, +a/2.0, -a/2.0], [-a/2.0, +a/2.0, -a/2.0],
				[-a/2.0, -a/2.0, +a/2.0], [+a/2.0, -a/2.0, +a/2.0], [+a/2.0, +a/2.0, +a/2.0], [-a/2.0, +a/2.0, +a/2.0]
			];
			const lines = [
				[p[0], p[1]], [p[1], p[2]], [p[2], p[3]], [p[3], p[0]],
				[p[4], p[5]], [p[5], p[6]], [p[6], p[7]], [p[7], p[4]],
				[p[0], p[4]], [p[2], p[6]], [p[3], p[7]], [p[1], p[5]]
			];
			for (let i=0; i<lines.length; ++i)
			{
				const geometry = new THREE.Geometry();
				geometry.vertices.push(new THREE.Vector3(lines[i][0][0], lines[i][0][1], lines[i][0][2]));
				geometry.vertices.push(new THREE.Vector3(lines[i][1][0], lines[i][1][1], lines[i][1][2]));
				const line = new THREE.Line(geometry, material);
				line.computeLineDistances();
				scene.add(line);
				OBJECTS['dashed_line_' + i] = line;
			}
			// visualize the 3 axes in a simple way:
			//     x axis is red, y axis is green, z axis is blue
			const axes = {
				'x': {'dir': [0.6*a, 0, 0], 'color': 0xFF0000},
				'y': {'dir': [0, 0.6*a, 0], 'color': 0x00FF00},
				'z': {'dir': [0, 0, 0.6*a], 'color': 0x0000FF}
			};
			for (a in axes)
			{
				const g = new THREE.Geometry();
				g.vertices.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(axes[a]['dir'][0], axes[a]['dir'][1], axes[a]['dir'][2]));
				const line = new THREE.Line(g, new THREE.LineBasicMaterial({color: axes[a]['color']}));
				scene.add(line);
				OBJECTS[a + '-axis'] = line;
			}
		}
	};

	return vw;
}