#
# This code improves over the basic functionality from <https://github.com/marian42/mesh_to_sdf> to fit our needs (RFF-based learning)
# Unfortuantely the built-in functions of that library does not offer a routine useful for our experiments and we implement it here
# (points near surface + uniform-ish points inside unit cube)
#

import mesh_to_sdf
import trimesh
import numpy

def sample_sdf_near_surface(self, number_of_points=500000, use_scans=True, sign_method='normal', normal_sample_count=11, min_size=0):
	query_points = []
	surface_sample_count = int(number_of_points * 47 / 50) // 2
	surface_points = self.get_random_surface_points(surface_sample_count, use_scans=use_scans)
	query_points.append(surface_points + numpy.random.normal(scale=0.0025, size=(surface_sample_count, 3)))
	query_points.append(surface_points + numpy.random.normal(scale=0.00025, size=(surface_sample_count, 3)))

	pts = numpy.random.uniform(-1, 1, size=( (number_of_points - surface_points.shape[0] * 2) * 2 + 20, 3))
	query_points.append(pts)
	query_points = numpy.concatenate(query_points).astype(numpy.float32)

	if sign_method == 'normal':
		sdf = self.get_sdf_in_batches(query_points, use_depth_buffer=False, sample_count=normal_sample_count)
	elif sign_method == 'depth':
		sdf = self.get_sdf_in_batches(query_points, use_depth_buffer=True)
	else:
		raise ValueError('Unknown sign determination method: {:s}'.format(sign_method))

	if min_size > 0:
		model_size = numpy.count_nonzero(sdf[-unit_sphere_sample_count:] < 0) / unit_sphere_sample_count
		if model_size < min_size:
			raise BadMeshException()

	return query_points, sdf

def sample_points(mesh, npts):
	#
	number_of_points = npts
	surface_point_method='scan'
	sign_method='normal'
	scan_count=100
	scan_resolution=400
	sample_point_count=10000000
	normal_sample_count=11
	min_size=0
	#
	mesh = mesh_to_sdf.utils.scale_to_unit_sphere(mesh)
	#
	surface_point_cloud = mesh_to_sdf.get_surface_point_cloud(mesh, surface_point_method, 1, scan_count, scan_resolution, sample_point_count, calculate_normals=sign_method=='normal')
	#
	p, d = sample_sdf_near_surface(surface_point_cloud, number_of_points, surface_point_method=='scan', sign_method, normal_sample_count, min_size)
	return p/2.0, d/2.0 # scale to unit cube

def get(meshpath, npts):
	#
	mesh = trimesh.load(meshpath)
	return sample_points(mesh, npts)

if __name__ == "__main__":
	points, sdf = get("chair.obj", 250000)
	colors = numpy.zeros(points.shape)
	colors[sdf < 0, 2] = 1
	colors[sdf > 0, 0] = 1
	import pyrender
	cloud = pyrender.Mesh.from_points(points, colors=colors)
	scene = pyrender.Scene()
	scene.add(cloud)
	viewer = pyrender.Viewer(scene, use_raymond_lighting=True, point_size=2)
