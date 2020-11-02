import mesh_to_sdf # https://github.com/marian42/mesh_to_sdf
import trimesh
import numpy

def new(params):
	if params["sampling"] == "#1":
		mesh = trimesh.load(params["meshpath"])
		points, dists = mesh_to_sdf.sample_sdf_near_surface(mesh, number_of_points=params["npoints"])
	else:
		mesh = trimesh.load(params["meshpath"])
		points, dists = mesh_to_sdf.sample_sdf_near_surface(mesh, number_of_points=10*params["npoints"])
		probs = numpy.exp(-5*numpy.abs(dists.astype(numpy.float64)))
		probs = probs/numpy.sum(probs)
		inds = numpy.random.choice(range(0, len(probs)), size=params["npoints"], p=probs)
		points = points[inds].astype(numpy.float32)
		dists = dists[inds].astype(numpy.float32)
	#
	points, dists = points/2.0, dists/2.0
	#
	def load_batch(index=-1):
		#
		inds = numpy.random.choice(range(0, params["npoints"]), params["bsize"])
		p = points[inds]
		d = dists[inds]
		#
		return p, d
	#
	return load_batch, params["npoints"], 3

def view_points(points, dists):
	import pyrender
	colors = numpy.zeros(points.shape)
	colors[dists < 0, 2] = 1
	colors[dists > 0, 0] = 1
	cloud = pyrender.Mesh.from_points(points, colors=colors)
	scene = pyrender.Scene()
	scene.add(cloud)
	viewer = pyrender.Viewer(scene, use_raymond_lighting=True, point_size=2)

if __name__ == "__main__":
	#
	import time
	#
	t = time.time()
	lb, n, p = new({
		"sampling": "#1",
		"meshpath": "chair.obj",
		"npoints": 64**3,
		"bsize": 64
	})
	print("* new: %d [ms]" % int(1000*(time.time() - t)))
	pts = []
	dst = []
	t = time.time()
	for i in range(0, 1000):
		p, d = lb()
		pts.append(p)
		dst.append(d)
	pts = numpy.vstack(pts)
	dst = numpy.concatenate(dst)
	print("* cat: %d [ms]" % int(1000*(time.time() - t)))
	#
	view_points(pts, dst)
