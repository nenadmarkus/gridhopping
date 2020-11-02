# https://arxiv.org/abs/2009.09808

import time
import os
import sys
import json
import cv2
import numpy

import torch
import torch.utils.data
import torch.nn.functional as F

#
# training args
#

if len(sys.argv) != 2:
	print("* pass path to args.json as a parameter")
	sys.exit()
else:
	args = json.loads(
		open(sys.argv[1], 'r').read()
	)

#
# data loading/preparation routines
#

print('* data loader: ' + args['loaderdef'])
LOADERDEF = __import__(args['loaderdef'])
load_batch, npoints, dim = LOADERDEF.new(args["loaderparams"])

def collate_fn(batch):
	pts = numpy.vstack([b[0] for b in batch])
	dst = numpy.concatenate([b[1] for b in batch])
	return {
		"pts": torch.from_numpy(pts),
		"dst": torch.from_numpy(dst)
	}

class MyDataset(torch.utils.data.Dataset):
	def __init__(self, load_sample, nsamples):
		self.load_sample = load_sample
		self.nsamples = nsamples
	def __len__(self):
		return self.nsamples
	def __getitem__(self, index):
		return self.load_sample(index)

LOADER = torch.utils.data.DataLoader(
	MyDataset(load_batch, npoints),
	batch_size=args['nloaders'],
	collate_fn=collate_fn,
	shuffle=True,
	num_workers=args['nloaders']
)

#
# prepare the model
#

exec(open(args['modeldef']).read())
MODEL = init_model(dim)
if 'loadpath' in args:
	print('* loading pretrained weights from ' + args['loadpath'])
	MODEL.load_state_dict(torch.load(args['loadpath']))

if args['cuda'] is True:
	MODEL.cuda()
	MODEL = nn.DataParallel(MODEL)

MODEL.train()

#
# prepare the data saving
#

os.system('mkdir -p %s' % args['savedir'])
os.system('mkdir -p %s/params' % args['savedir'])

os.system('cp %s %s/modeldef.py' % (args['modeldef'], args['savedir']))
os.system('cp %s %s/loaderdef.py' % (args['loaderdef']+'.py', args['savedir']))
os.system('cp %s %s/params.json' % (sys.argv[1], args['savedir']))

def save_state(it):
	path = os.path.join(args['savedir'], 'params', str(it))
	print('* saving model weights to ' + path)
	if args['cuda']:
		MODEL.cpu()
		torch.save(MODEL.module.state_dict(), path)
		MODEL.cuda()
	else:
		torch.save(MODEL.state_dict(), path)
	os.system('mv %s %s' % (path, os.path.join(args['savedir'], 'params', 'latest')))
	print('* proceeding with training ...')

#
# define the loss
#

def loss_forward(inputs, targets):
	return torch.abs(inputs - targets).sum() / inputs.shape[0]

#
#
#

#OPTIMIZER = torch.optim.RMSprop(MODEL.parameters(), lr=args['learnrate'])
OPTIMIZER = torch.optim.Adam(MODEL.parameters(), lr=args['learnrate'])

def train_step(batch):
	#
	if args['cuda'] is True:
		pts = batch['pts'].cuda()
		dst = batch['dst'].cuda()
	else:
		pts = batch['pts']
		dst = batch['dst']
	#
	OPTIMIZER.zero_grad()
	out = MODEL.forward(pts)
	loss = loss_forward(out, dst)
	loss.backward()
	OPTIMIZER.step()
	#
	return loss.item()

ITER = iter(LOADER)

for i in range(0, args['niters']):
	#
	try:
		batch = next(ITER)
	except StopIteration:
		ITER = iter(LOADER)
		batch = next(ITER)
	#
	start = time.time()
	loss = train_step(batch)
	if 0==i%2:
		print('* batch %d processed in %3d [ms], loss: %.8f' % (i, int(1000.0*(time.time()-start)), loss))
	#
	if i!=0 and 0==i%args['savefreq']:
		save_state(i)
