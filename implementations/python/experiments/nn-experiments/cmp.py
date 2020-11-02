import sys
import time

import runner
import torch

sys.path.append("..")
sys.path.append("../..")

import gridhopping
from utils import minichunk
from utils import ON3

def run(path, gridsize, usecuda=False, view=False):
	#
	lam = 1.5
	#
	if usecuda is False:
		sdefn = runner.make(path, lam=lam)
		sdefn = minichunk.make(sdefn, k=8192)
	else:
		sdefn = runner.make(path, lam=lam, usecuda=True)
		sdefn = minichunk.make(sdefn, k=100000)

	#t = time.time()
	#cells, vals = ON3._run(sdefn, gridsize)
	#gridhopping.polygonize_cells("tmp.stl", cells, vals, libpath="../../mc.c")
	#t = int(1000.0*(time.time() - t))
	#print("* polygonization, GH: %d [ms]" % t)

	t = time.time()
	cells, vals = gridhopping.run(sdefn, gridsize)
	gridhopping.polygonize_cells("tmp.stl", cells, vals, libpath="../../mc.c")
	ght = int(1000.0*(time.time() - t))
	print("* polygonization, GH: %d [ms]" % ght)

	t = time.time()
	v, f, n = ON3.run(sdefn, gridsize)
	mct = int(1000.0*(time.time() - t))
	print("* polygonization, O(N3): %d [ms]" % mct)

	if view is True:
		ON3.view(v, f, n)

	return ght, mct

if __name__ == "__main__":
	if len(sys.argv)!=3:
		print("args: <mesh path> <grid resolution>")
		sys.exit()
	#torch.set_default_tensor_type(torch.DoubleTensor)
	meshpath = sys.argv[1]
	gridsize = int(sys.argv[2])
	run(meshpath, gridsize, usecuda=True, view=False)
