A JavaScript implementation of the method.

The visualization and user interface for this CAD tool is powered by the capabilities of modern web browsers.
To test this it locally, do the following:

* start a Python web server: `python3 -m http.server 1111`;
* open a web browser and go to [http://localhost:1111](http://localhost:1111).

Alternatively, test it online at [https://femtocad.gitlab.io](https://femtocad.gitlab.io) (yes, the website is hosted at GitLab for more flexibility).

## Examples (also see [here](examples.md))

As explained, the algorithm is used to polygonize implicit functions (or signed distance bounds) of the form `F(x, y, z)=0`.
Note, however, that `F` has to be [Lipschitz continuous](https://en.wikipedia.org/wiki/Lipschitz_continuity) in order to obtain correct results.

In Femto, this function is set by the user by writing a small piece of JavaScript code. For example, the following code defines a sphere with a radius equal to 0.4 centered at the origin:

```
return function (x, y, z) {
	const radius = 0.4;
	return Math.sqrt(x*x + y*y + z*z) - radius;
}
```

More examples can be found [here](examples.md).