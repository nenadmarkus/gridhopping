A Python implementation of the method: `gridhopping.py`. The PyTorch framework is used for vectorized computation. Approximately similar results could be achieved with NumPy.

You can use the script `test.py` to see how the method compares to the usual `O(N^3)` polygonization scheme:

	python3 test.py 512

Note that the C implementation is faster for simpler models such as a sphere in `test.py`. However, the difference becomes large in favor of the vectorized version once we start dealing with SDFs represented by NNs or Fourier features.
