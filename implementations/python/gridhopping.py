import torch
import os
import ctypes
import numpy

#
#
#

def run(sde_fun, n):
	#
	h = 1.0/n
	eps=2*h
	#
	def xyz_to_ijk(xyz):
		# order of evaluation is very important!
		# (leave parenthese as is)
		return ( (xyz + (1.0/2.0 - h/2.0))/h ).int()
	def ijk_to_xyz(ijk):
		# order of evaluation is very important!
		# (leave parenthese as is)
		return -1.0/2.0 + (h/2.0 + ijk*h)
	#
	ls = torch.linspace(0, n-1, n, dtype=torch.int32)
	i, j = torch.meshgrid([ls, ls])
	ijk = torch.zeros(n, n, 3, dtype=torch.int32)
	ijk[:, :, 0] = i
	ijk[:, :, 1] = j
	ijk[:, :, 2] = 0
	ijk = ijk.reshape(-1, 3)
	#
	inds = []
	stop = False
	xyz = ijk_to_xyz(ijk)
	while not stop:
		dzs = torch.abs(sde_fun(xyz))
		inds.append(xyz_to_ijk(xyz[dzs < eps]))
		dzs[dzs < eps] = h
		xyz[:, 2] += dzs
		xyz = xyz[ xyz[:, 2]<0.5 ]
		if ( len(xyz)==0 ):
			stop = True
	#
	inds = torch.cat(inds)
	xyzm = inds*h - 1.0/2.0
	xyzp = (inds+1)*h - 1.0/2.0
	#
	cells = torch.zeros(inds.shape[0], 8, 3)
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

#
#
#

def polygonize_cells(filename, cells, vals, libpath="mc.c"):
	#
	os.system('cc %s -O3 -fPIC -shared -o mclib.so -Dreal_t=float' % libpath)
	mclib = ctypes.cdll.LoadLibrary('./mclib.so')
	os.system('rm mclib.so')
	#
	mclib.run(
		ctypes.c_void_p(numpy.array(filename.encode("utf8")).ctypes.data),
		ctypes.c_void_p(cells.ctypes.data),
		ctypes.c_void_p(vals.ctypes.data),
		ctypes.c_int(cells.shape[0])
	)

#
#
#

def sdf_sphere(xyz):
	return torch.sqrt(xyz[:, 0]**2 + xyz[:, 1]**2 + xyz[:, 2]**2) - 0.4

if __name__ == "__main__":
	#torch.set_default_tensor_type(torch.DoubleTensor)
	import time
	t = time.time()
	cells, vals = run(sdf_sphere, 128)
	triangs("tmp.stl", cells, vals)
	print("* %d [ms]" % int(1000.0*(time.time() - t)))
