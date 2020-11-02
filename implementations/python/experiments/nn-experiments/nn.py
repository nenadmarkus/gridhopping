import torch
import torch.nn as nn
import torch.nn.functional as F

class NN(nn.Module):
	def __init__(self, n, l, k):
		super(NN, self).__init__()
		self.lk = [l, k]
		#
		layers = [nn.Linear(n, k, bias=False), nn.ReLU()]
		for i in range(1, l-1):
			layers.append(nn.Linear(k, k, bias=False))
			layers.append(nn.BatchNorm1d(k))
			layers.append(nn.ReLU())
		layers.append(nn.Linear(k, 1, bias=False))
		#
		self.layers = nn.Sequential(*layers)

	def forward(self, x):
		return self.layers.forward(x).view(-1)

#
#
#

def init_model(n, l=8, k=64):
	return NN(n, l, k)

def test_shape():
	with torch.no_grad():
		net = init_model(3)
		x = torch.randn(1024, 3)
		y = net.forward(x)
		print(y.shape)

def test_speed(n):
	import time
	print("----- testing model speed -----")
	with torch.no_grad():
		net = init_model(3)
		x = torch.randn(n, 3)
		y = net.forward(x)
		t = time.time()
		y = net.forward(x)
		t = int( 1000.0*(time.time() - t) )
		print("* " + str(x.shape) + " -> " + str(y.shape))
		print("* time: %d [ms]" % t)

#test_shape()
#test_speed(1000000)
