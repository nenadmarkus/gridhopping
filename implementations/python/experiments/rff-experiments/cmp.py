import sys
import time

import sd_samples
import rff

sys.path.append("..")
sys.path.append("../..")

import gridhopping
from utils import minichunk
from utils import ON3

def run(meshpath, gridsize, npoints=100000, view=False):
	t = time.time()
	points, dists = sd_samples.get(meshpath, npoints)
	print("* point sampling: %d [ms]" % int(1000.0*(time.time() - t)))

	t = time.time()
	sdefn = rff.learn_sde(points, dists)
	print("* learning SDE: %d [ms]" % int(1000.0*(time.time() - t)))

	sdefn = minichunk.make(sdefn, k=256)

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
	meshpath = sys.argv[1]
	gridsize = int(sys.argv[2])
	run(meshpath, gridsize, view=True)
