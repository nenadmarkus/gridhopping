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
	xmin=64, xmax=512,
	xmode=log, log basis x=2,
	legend pos=north west
]
		\\addplot[color=red, line width=1]
			coordinates {
				%s
			};
		\\addplot[color=blue, line width=1]
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

result = template % (get_rt(data["gh"]), get_rt(data["mc"]), "gh", "mc")

#
#
#

with open(sys.argv[2], "w") as fp:
	fp.write(
		result
	)

# for rendering RFF results
'''
cd ../rff-experiments/results/

python ../../utils/tolatex.py models-bird.stl.times bird.tikz
python ../../utils/tolatex.py models-bunny.stl.times bunny.tikz
python ../../utils/tolatex.py models-cats.stl.times cats.tikz
python ../../utils/tolatex.py models-mushrooms.stl.times mushrooms.tikz
python ../../utils/tolatex.py models-frog.stl.times frog.tikz
python ../../utils/tolatex.py models-whale.stl.times whale.tikz

pdflatex bird.tikz
pdflatex bunny.tikz
pdflatex cats.tikz
pdflatex mushrooms.tikz
pdflatex frog.tikz
pdflatex whale.tikz

rm *.aux *.log
# rm *.pdf *.tikz

cd -
'''

# for rendering NN results
'''
cd ../nn-experiments/results/

python ../../utils/tolatex.py learned-models-bird.times bird.tikz
python ../../utils/tolatex.py learned-models-bunny.times bunny.tikz
python ../../utils/tolatex.py learned-models-cats.times cats.tikz
python ../../utils/tolatex.py learned-models-mushrooms.times mushrooms.tikz
python ../../utils/tolatex.py learned-models-frog.times frog.tikz
python ../../utils/tolatex.py learned-models-whale.times whale.tikz

pdflatex bird.tikz
pdflatex bunny.tikz
pdflatex cats.tikz
pdflatex mushrooms.tikz
pdflatex frog.tikz
pdflatex whale.tikz

rm *.aux *.log
# rm *.pdf *.tikz

cd -
'''
