This project contains experiments with a method for fast polygonization of signed distance bounds and a tiny CAD tool based on it ([https://lambdacad.gitlab.io](https://lambdacad.gitlab.io)).
The main possible applications of the method are (1) constructive solid geometry (CSG) and (2) generating triangle approximations of 3D fractals.

The core feature of this CAD approach is that you do not have a visual editor for builidng 3D models, but you write code (JavaScript, C or Go) to describe them.

## Contents of the repo

Three different implementations in the folder [implementations](implementations):

* [JavaScript](implementations/javascript) (try it at <https://lambdacad.gitlab.io>)
* [C](implementations/c)
* [Go](implementations/golang)

A description of the algorithm running under the hood is available in the folder [algorithm](algorithm).
There's also a [license file](license).

## Contact

Copyright (c) 2020, [Nenad Markus](https://nenadmarkus.github.io). All rights reserved.

You can reach me at <nenad.markus@protonmail.com>.

If you like my work, consider donating: [EUR](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=4WNYJAYWPJX56&curency_code=EUR) or BTC (request address by email).