mkdir -p results/

python time.py specs/knot.json results/knot.time.json
python time.py specs/gen2.json results/gen2.time.json
python time.py specs/primitives.json results/primitives.time.json
python time.py specs/sierp.json results/sierp.time.json

python tolatex.py results/knot.time.json results/knot.tikz
python tolatex.py results/gen2.time.json results/gen2.tikz
python tolatex.py results/primitives.time.json results/primitives.tikz
python tolatex.py results/sierp.time.json results/sierp.tikz

cd results/
pdflatex knot.tikz
pdflatex gen2.tikz
pdflatex primitives.tikz
pdflatex sierp.tikz

rm *.aux *.log