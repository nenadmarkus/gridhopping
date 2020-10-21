This project contains experiments with a method for fast polygonization of signed distance bounds and a tiny CAD tool based on it ([https://lambdacad.gitlab.io](https://lambdacad.gitlab.io)).
The main possible applications of the method are (1) constructive solid geometry (CSG) and (2) generating triangle approximations of 3D fractals.

The core feature of this CAD approach is that you do not have a visual editor for builidng 3D models, but you write code (JavaScript, C or Go) to describe them.
Some example scenes/models that you can produce are given in the following image:

![Scenes produced by `gridhopping`](scenes.png "Scenes produced by `gridhopping`")

## Contents of the repo

Four different implementations in the folder [implementations](implementations):

* [JavaScript](implementations/javascript) (try it at <https://lambdacad.gitlab.io>)
* [C](implementations/c)
* [Go](implementations/golang)
* [Python](implementations/python)

A description of the algorithm running under the hood is available [here](algorithm.md) (also see [this post](https://nenadmarkus.github.io/p/fast-algo-sdb-to-mesh/)).

There's also a [license file](license).

## Contact

Copyright (c) 2020, [Nenad Markus](https://nenadmarkus.github.io). All rights reserved.

You can reach me at <nenad.markus@protonmail.com>.

If you like my work, consider donating: [EUR](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=4WNYJAYWPJX56&curency_code=EUR) or BTC (request address by email).
