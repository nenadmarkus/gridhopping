#
# wraps an input sde_func in such a way so it can be applied in batches
# (significantly increases speed and reduces memory consumption)
#

import torch
import numpy

def make(sdefn, k=256):
	#
	def _sdefn(points):
		#
		vals = []
		n = len(points)//k
		for i in range(0, n):
			pts = points[ (i*k):((i+1)*k) ]
			vals.append(
				sdefn(pts)
			)
		#
		if n*k != len(points):
			pts = points[ (n*k): ]
			vals.append(
				sdefn(pts)
			)
		#
		if type(points) == torch.Tensor:
			return torch.cat(vals)
		else:
			return numpy.concatenate(vals)
	#
	return _sdefn
