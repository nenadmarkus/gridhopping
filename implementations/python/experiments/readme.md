Tests how fast is [`gridhopping`](../gridhopping.py) when compared to the basic [`O(N^3)` method](utils/ON3.py).

## Methods for generating signed distance estimators

We use an estimator based on [random fourier features](https://people.eecs.berkeley.edu/~bmild/fourfeat/) when the mapping is learned by ordinary least squares.
This code is contained in the [rff-experiments folder](rff-experiments).

Also, we use an ordinary feed forward neural netowrk to approximate the distance bound: [nn-experiments](nn-experiments).

To generate these estimators for a specified 3D mesh, there is a learning phase.
The 3D meshes used in our experiments are described in the next section.

## 3D models

You can download the models using the provided script: [models/dl.sh](models/dl.sh).

![Models used in our experiments](models/all.png "Models used in our experiments")
