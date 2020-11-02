import os
import torch

def load_model(folder, usecuda=False):
	#
	G = {}
	exec(open(os.path.join(folder, 'modeldef.py'), 'r').read(), G)
	model = G['init_model'](3)
	model.load_state_dict(torch.load(
		os.path.join(folder, 'params', 'latest')
	))
	if usecuda is True:
		model.cuda()
	model.eval()
	# warmup run
	##t = time.time()
	with torch.no_grad():
		tn = torch.randn(512, 3)
		if usecuda is True:
			tn = tn.cuda()
		model.forward(tn)
	##print("* warmup run completed in %d [ms]" % int(1000.0*(time.time() - t)))
	# we're done
	return model

def make(path, lam=1.0, usecuda=False):
	#
	model = load_model(path, usecuda=usecuda)
	#
	def sdefn(points):
		#
		if type(points)!=torch.Tensor:
			points = torch.from_numpy(points)
			wasnumpy = True
		else:
			wasnumpy = False
		#
		if usecuda is True:
			points = points.cuda()
		with torch.no_grad():
			vals = model.forward(points).reshape(-1)
		vals = vals/lam
		if usecuda is True:
			vals = vals.cpu()
		#
		if wasnumpy:
			return vals.numpy()
		else:
			return vals
	#
	return sdefn

if __name__ == "__main__":
	#
	import sys
	if len(sys.argv)!=3:
		print("* args: nnpath rez")
		sys.exit()
	#
	sdf = make(sys.argv[1])
	# get raster points
	n = int(sys.argv[2])
	d = torch.linspace(0, 1, n) - 0.5
	x, y, z = torch.meshgrid([d, d, d])
	G = torch.zeros(n, n, n, 3)
	G[:, :, :, 0] = x
	G[:, :, :, 1] = y
	G[:, :, :, 2] = z
	G = G.reshape(-1, 3)
	#
	import time
	t = time.time()
	voxels = sdf(G)
	print("* elapsed time: %.2f [s]" % (time.time() - t))
	voxels = voxels.cpu().numpy().reshape((n, n, n))
	#
	from skimage.measure import marching_cubes
	vertices, faces, normals, _ = marching_cubes(voxels, level=0)
	import trimesh
	mesh = trimesh.Trimesh(vertices=vertices, faces=faces, vertex_normals=normals)
	mesh.show()
