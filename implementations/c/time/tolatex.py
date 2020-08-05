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
		\\addplot[color=red, line width=1]
			coordinates {
				%s
			};
		\\addplot[color=green, line width=1]
			coordinates {
				%s
			};
		\\addplot[color=blue, line width=1]
			coordinates {
				%s
			};
		\\legend{%s,%s,%s}
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

result = template % (get_rt(data["gh"]), get_rt(data["sc"]), get_rt(data["mc"]), "gh", "sc", "mc")

#
#
#

with open(sys.argv[2], "w") as fp:
	fp.write(
		result
	)