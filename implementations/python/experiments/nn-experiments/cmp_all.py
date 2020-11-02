import os
import cmp
import json

FOLDER = "results"

M = [
	"learned-models/bird",
	"learned-models/frog",
	"learned-models/cats",
	"learned-models/bunny",
	"learned-models/mushrooms",
	"learned-models/whale"
	
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
		ght, mct = cmp.run(m, r, usecuda=True)
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
