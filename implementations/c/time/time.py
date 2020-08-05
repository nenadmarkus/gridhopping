import time
import json
import sys
import hashlib
import os
import ctypes

#
#
#

def measure_gh_time(r, scene, n):
	os.system("cd .. && bash build.sh scenes/%s" % scene)
	t1 = time.time()
	for i in range(0, n):
		os.system("cd .. && ./exe %d" % r)
	t2 = time.time()
	dt = int(1000.0*(t2 - t1)/n)
	return dt

def measure_sc_time(r, scene, n):
	os.system("cd surfcrawl && bash build.sh ../../scenes/%s" % scene)
	t1 = time.time()
	for i in range(0, n):
		os.system("cd surfcrawl && ./exe %d" % r)
	t2 = time.time()
	dt = int(1000.0*(t2 - t1)/n)
	return dt

def measure_mc_time(r, scene, n):
	os.system("cd .. && bash build.sh scenes/%s -DSLOW_ALGO" % scene)
	t1 = time.time()
	for i in range(0, n):
		os.system("cd .. && ./exe %d" % r)
	t2 = time.time()
	dt = int(1000.0*(t2 - t1)/n)
	return dt

def run(time_fun, params, verbose=False):
	times = []
	for i in range(0, len(params["resolution"])):
		#
		r = params["resolution"][i]
		n = params["nruns"][i]
		#
		dt = time_fun(r, params["scene"], n)
		if verbose:
			print('    ^-> %d [ms]' % dt)
		times.append(dt)

	return {
		"scene": params["scene"],
		"resolution": params["resolution"],
		"time": times
	}

#
#
#

if __name__ == "__main__":
	#
	if len(sys.argv)!=2 and len(sys.argv)!=3:
		print('* args: <params.json> [output.json]')
		sys.exit()

	params = json.loads(
		open(sys.argv[1], 'r').read()
	)

	#
	print("---- sc ----")
	sc = run(measure_sc_time, params, verbose=True)
	print("---- gh ----")
	gh = run(measure_gh_time, params, verbose=True)
	print("---- mc ----")
	mc = run(measure_mc_time, params, verbose=True)
	#
	with open(sys.argv[2], 'w') as fp:
		json.dump({"gh": gh, "sc": sc, "mc": mc}, fp)