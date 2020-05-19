import sys
import json

if len(sys.argv)!=3:
	print("args: <input.json> <output.txt>")
	sys.exit()

data = json.load(
	open(sys.argv[1], "r")
)

#
# tikz plot
#

template = '''\\documentclass{standalone}
\\usepackage{pgfplots}
\\begin{document}
\\begin{tikzpicture}
\\begin{axis} [
	ymode=log,
	xlabel={Resolution},
	ylabel={Elapsed time [s]},
	xmin=64, xmax=2048,
	xmode=log, log basis x=2,
	legend pos=north west
]
		\\addplot[color=black, line width=1, mark=o]
			coordinates {
				%s
			};
		\\addplot[color=black, line width=1, mark=x]
			coordinates {
				%s
			};
		\\legend{%s,%s}
\\end{axis}
\\end{tikzpicture}
\\end{document}'''

def get_rt(data):
	#
	rt = ""
	for i in range(0, len(data["resolution"])):
		#
		r = data["resolution"][i]
		t = data["time"][i]
		#
		rt += "(%f, %f)" % (r, t/1000)
	#
	return rt

result = template % (get_rt(data["fast"]), get_rt(data["slow"]), "fast", "slow")

#
#
#

with open(sys.argv[2], "w") as fp:
	fp.write(
		result
	)