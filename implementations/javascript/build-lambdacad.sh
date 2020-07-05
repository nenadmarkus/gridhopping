#
# for building the <lambdacad.gitlab.io> website through Gitlab CI/CD
#

# a folder that will contain all the source files
mkdir -p public/

# basic html/js
wget https://raw.githubusercontent.com/nenadmarkus/gridhopping/master/implementations/javascript/gridhopping.js -O public/gridhopping.js
wget https://raw.githubusercontent.com/nenadmarkus/gridhopping/master/implementations/javascript/worker.js -O public/worker.js
wget https://raw.githubusercontent.com/nenadmarkus/gridhopping/master/implementations/javascript/styles.css -O public/styles.css
wget https://raw.githubusercontent.com/nenadmarkus/gridhopping/master/implementations/javascript/polygonize.js -O public/polygonize.js
wget https://raw.githubusercontent.com/nenadmarkus/gridhopping/master/implementations/javascript/index.js -O public/index.js
wget https://raw.githubusercontent.com/nenadmarkus/gridhopping/master/implementations/javascript/index.html -O public/index.html
wget https://raw.githubusercontent.com/nenadmarkus/gridhopping/master/implementations/javascript/extensions.js -O public/extensions.js

# mesh visualization stuff
mkdir -p public/meshviz

wget https://raw.githubusercontent.com/nenadmarkus/gridhopping/master/implementations/javascript/meshviz/webgl_detector.js -O public/meshviz/webgl_detector.js
wget https://raw.githubusercontent.com/nenadmarkus/gridhopping/master/implementations/javascript/meshviz/three.min.js -O public/meshviz/three.min.js
wget https://raw.githubusercontent.com/nenadmarkus/gridhopping/master/implementations/javascript/meshviz/viewer.js -O public/meshviz/viewer.js
wget https://raw.githubusercontent.com/nenadmarkus/gridhopping/master/implementations/javascript/meshviz/OrbitControls.js -O public/meshviz/OrbitControls.js

# description of the algorithm
wget https://raw.githubusercontent.com/nenadmarkus/gridhopping/master/algorithm/algo.html -O public/algo.html
wget https://raw.githubusercontent.com/nenadmarkus/gridhopping/master/algorithm/boxapprox.png -O public/boxapprox.png
wget https://raw.githubusercontent.com/nenadmarkus/gridhopping/master/algorithm/scenes.png -O public/scenes.png
wget https://raw.githubusercontent.com/nenadmarkus/gridhopping/master/algorithm/times-logplot.png -O public/times-logplot.png
wget https://raw.githubusercontent.com/nenadmarkus/gridhopping/master/algorithm/sphere-tracing.png -O public/sphere-tracing.png

# about Lipschitz continuity
wget https://raw.githubusercontent.com/nenadmarkus/gridhopping/master/algorithm/lipschitz-and-sphere-tracing.html -O public/lipschitz-and-sphere-tracing.html
wget https://raw.githubusercontent.com/nenadmarkus/gridhopping/master/algorithm/l3.png -O public/l3.png
wget https://raw.githubusercontent.com/nenadmarkus/gridhopping/master/algorithm/l4.png -O public/l4.png

# additional examples
wget https://raw.githubusercontent.com/nenadmarkus/gridhopping/master/implementations/javascript/examples.md -O public/examples.md
wget https://raw.githubusercontent.com/nenadmarkus/gridhopping/master/implementations/javascript/examples.html -O public/examples.html

# create zipped github code
wget https://github.com/nenadmarkus/gridhopping/archive/master.zip -O public/code.zip