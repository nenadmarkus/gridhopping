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

# create zipped github code
sed -i 's/open-source code/open-source code (<a href="code.zip">code.zip<\/a>)/' public/index.html
wget https://github.com/nenadmarkus/gridhopping/archive/master.zip -O public/code.zip
