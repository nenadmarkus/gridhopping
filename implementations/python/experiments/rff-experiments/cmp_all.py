import os
import cmp
import json

FOLDER = "results"

M = [
	"../models/bird.stl",
	"../models/frog.stl",
	"../models/cats.stl",
	"../models/bunny.stl",
	"../models/mushrooms.stl",
	"../models/whale.stl"
	
]

R = [64, 96, 128, 192, 256, 384, 512]

os.system("mkdir -p %s" % FOLDER)

for m in M:
	#
	gh = {
		"scene": m,
		"resolution": [],
		"time": []
	}
	mc = {
		"scene": m,
		"resolution": [],
		"time": []
	}
	for r in R:
		ght, mct = cmp.run(m, r)
		gh["resolution"].append(r)
		gh["time"].append(ght)
		mc["resolution"].append(r)
		mc["time"].append(mct)
	#
	path = os.path.join(FOLDER, m.replace("/", "-") + ".times")
	with open(path, "w") as fp:
		json.dump({"gh": gh, "mc": mc}, fp)
	#
	print("-------------------------------")
