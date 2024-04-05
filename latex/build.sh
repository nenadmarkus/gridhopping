#/bin/bash

pdflatex body
bibtex body
pdflatex body
pdflatex body

#rm *.bbl
rm *.aux *.blg *.log *.out
