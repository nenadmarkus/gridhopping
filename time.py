import time
import json
import sys
import hashlib
import os
import ctypes

#
#
#

def compile_lib(scene, flags):
	h = hashlib.md5((scene+flags).encode('utf8')).hexdigest()
	os.system('cc main.c %s -fPIC -shared -o lib.%s.so %s' % (scene, h, flags))
	lib = ctypes.cdll.LoadLibrary('./lib.%s.so' % h)
	os.system('rm lib.%s.so' % h)
	return lib

def run(params, slowalgo=False, verbose=False):
	flags = '-O3 -lm -Dreal_t=float'
	if slowalgo is True:
		flags += ' -DSLOW_ALGO'
	lib = compile_lib(params["scene"], flags)

	NT = []
	ET = []

	for i in range(0, len(params["resolution"])):
		#
		r = params["resolution"][i]
		a = params["nruns"][i]
		#
		t1 = time.time()
		for j in range(0, a):
			ntriangs = lib.run(ctypes.c_int(r), ctypes.c_void_p(0))
		t2 = time.time()
		dt = int(1000.0*(t2 - t1)/a)
		if verbose:
			print('* resolution=%d, ntriangles=%d, nmiliseconds=%d' % (r, ntriangs, dt))
		NT.append(ntriangs)
		ET.append(dt)

	return {
		"scene": params["scene"],
		"resolution": params["resolution"],
		"ntriangs": NT,
		"time": ET
	}

#
#
#

if __name__ == "__main__":
	#
	if len(sys.argv)!=2:
		print('* args: <params.json>')
		sys.exit()

	params = json.loads(
		open(sys.argv[1], 'r').read()
	)

	#
	print("---- fast algo ----")
	run(params, verbose=True, slowalgo=False)
	print("---- slow algo ----")
	run(params, verbose=True, slowalgo=True)