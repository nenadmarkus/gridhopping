import sys
import time
import torch
import gridhopping

if len(sys.argv)!=2:
	print("* args: <grid resolution>")
	sys.exit()

#
#
#

def sdf_sphere(xyz):
	return torch.sqrt(torch.pow(xyz, 2.0).sum(1)) - 0.4

def make_batcher(sdb_scene, k):
	def f(xyz):
		#
		sdv = []
		n = len(xyz)//k
		for i in range(0, n):
			_xyz = xyz[ (i*k):((i+1)*k) ]
			sdv.append(sdb_scene(_xyz))
		#
		if n*k != len(xyz):
			_xyz = xyz[ (n*k): ]
			sdv.append(sdb_scene(_xyz))
		#
		return torch.cat(sdv)
	return f

#
#
#

N = int(sys.argv[1])

print("* grid resolution set to: %d" % N)

sdb_scene = make_batcher(sdf_sphere, 10**5)

t = time.time()
cells, vals = gridhopping.run(sdb_scene, N)
gridhopping.polygonize_cells("out.stl", cells, vals)
print('* elapsed time (gh): %d [ms]' % int(1000.0*(time.time() - t)))

from skimage.measure import marching_cubes
import numpy
t = time.time()
def get_raster_points(n):
    points = numpy.meshgrid(
        numpy.linspace(-0.5, 0.5, n),
        numpy.linspace(-0.5, 0.5, n),
        numpy.linspace(-0.5, 0.5, n)
    )
    points = numpy.stack(points)
    points = numpy.swapaxes(points, 1, 2)
    points = points.reshape(3, -1).transpose().astype(numpy.float32)
    return points
G = torch.from_numpy(get_raster_points(N))
voxels = sdb_scene(G.reshape(-1, 3)).reshape((N, N, N)).numpy()
vertices, faces, normals, _ = marching_cubes(voxels, level=0)
print('* elapsed time (mc): %d [ms]' % int(1000.0*(time.time() - t)))
#import trimesh
#mesh = trimesh.Trimesh(vertices=vertices, faces=faces, vertex_normals=normals)
#mesh.show()
