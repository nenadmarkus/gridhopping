import torch

def encode(x, freqs):
	x = 2*3.141593*torch.matmul(x, freqs)
	x = [torch.cos(x), torch.sin(x)]
	x = torch.cat(x, 1)
	return x

def learn_sde(points, dists, nf=1024, wstd=3.0, lam=1.5):
	#
	if type(points)!=torch.Tensor:
		points = torch.from_numpy(points)
	if type(dists)!=torch.Tensor:
		dists = torch.from_numpy(dists)
	#
	freqs = wstd*torch.randn(3, nf)
	def _encode(x):
		return encode(x, freqs)
	#
	inputs = _encode(points)
	targets = dists.reshape(-1, 1)
	#
	W = torch.lstsq(targets, inputs)[0][0:(2*nf)]
	#
	# compute training error:
	errs = torch.abs(dists - torch.matmul(inputs, W).reshape(-1))
	print("* learning error statistics:")
	print("  - mean:    %f" % torch.mean(errs))
	print("  - median:  %f" % torch.median(errs))
	print("  - max:     %f" % torch.max(errs))
	#
	def sdefn(points):
		#
		if type(points)!=torch.Tensor:
			points = torch.from_numpy(points)
			wasnumpy = True
		else:
			wasnumpy = False
		#
		inputs = _encode(points)
		vals = torch.matmul(inputs, W).reshape(-1)
		#
		vals = vals/lam
		#
		if wasnumpy:
			return vals.numpy()
		else:
			return vals
	#
	return sdefn
