#
# implementation of the basic O(N^3) algorithm
#

import numpy
from skimage.measure import marching_cubes

def get_raster_points(n):
	'''
	points = numpy.meshgrid(
		numpy.linspace(-0.5, 0.5, n),
		numpy.linspace(-0.5, 0.5, n),
		numpy.linspace(-0.5, 0.5, n)
	)
	points = numpy.stack(points)
	points = numpy.swapaxes(points, 1, 2)
	points = points.reshape(3, -1).transpose().astype(numpy.float32)
	return points
	'''
	import torch
	d = torch.linspace(0, 1, n) - 0.5
	x, y, z = torch.meshgrid([d, d, d])
	G = torch.zeros(n, n, n, 3)
	G[:, :, :, 0] = x
	G[:, :, :, 1] = y
	G[:, :, :, 2] = z
	return G.numpy()

def view(vertices, faces, normals):
	import trimesh
	mesh = trimesh.Trimesh(vertices=vertices, faces=faces, vertex_normals=normals)
	mesh.show()

# same API/output as the polygonization function in gridhopping.py
# (however, this is an O(N^3) algorithm)
def myrun(sde_fun, n):
	#
	import torch
	h = 1.0/n
	#
	ls = torch.linspace(0, n-1, n, dtype=torch.int32)
	i, j, k = torch.meshgrid([ls, ls, ls])
	ijk = torch.zeros(n, n, n, 3, dtype=torch.int32)
	ijk[:, :, :, 0] = i
	ijk[:, :, :, 1] = j
	ijk[:, :, :, 2] = k
	ijk = ijk.reshape(-1, 3)
	#
	xyzm = ijk*h - 1.0/2.0
	xyzp = (ijk+1)*h - 1.0/2.0
	#
	cells = torch.zeros(ijk.shape[0], 8, 3)
	cells[:, 0, 0], cells[:, 0, 1], cells[:, 0, 2] = xyzm[:, 0], xyzm[:, 1], xyzm[:, 2]
	cells[:, 1, 0], cells[:, 1, 1], cells[:, 1, 2] = xyzp[:, 0], xyzm[:, 1], xyzm[:, 2]
	cells[:, 2, 0], cells[:, 2, 1], cells[:, 2, 2] = xyzp[:, 0], xyzp[:, 1], xyzm[:, 2]
	cells[:, 3, 0], cells[:, 3, 1], cells[:, 3, 2] = xyzm[:, 0], xyzp[:, 1], xyzm[:, 2]
	cells[:, 4, 0], cells[:, 4, 1], cells[:, 4, 2] = xyzm[:, 0], xyzm[:, 1], xyzp[:, 2]
	cells[:, 5, 0], cells[:, 5, 1], cells[:, 5, 2] = xyzp[:, 0], xyzm[:, 1], xyzp[:, 2]
	cells[:, 6, 0], cells[:, 6, 1], cells[:, 6, 2] = xyzp[:, 0], xyzp[:, 1], xyzp[:, 2]
	cells[:, 7, 0], cells[:, 7, 1], cells[:, 7, 2] = xyzm[:, 0], xyzp[:, 1], xyzp[:, 2]
	#
	vals = sde_fun(cells.view(-1, 3)).view(-1, 8)
	#
	return cells.numpy(), vals.numpy()

# consumes a *lot* of memory
def run(sdb_fun, N):
	grid = get_raster_points(N).reshape(-1, 3)
	voxels = sdb_fun(grid).reshape((N, N, N))
	vertices, faces, normals, _ = marching_cubes(voxels, level=0)
	return vertices, faces, normals
