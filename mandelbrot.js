var plot = document.querySelector("#plot");

plot.height = 600;
plot.width = 600;

var view = {
  left: -2,
  up: 2,
  right: 2,
  down: -2
};

var step = {
  re: (view.right - view.left) / plot.width,
  im: (view.up - view.down) / plot.height
};

function offsetToComplex (offset) {
  var x = offset % 600;
  var y = math.floor(offset / 600);

  return math.complex({
    re: x * step.re + view.left,
    im: y * step.im + view.down
  });
}

function generateSpace() {
  return Lazy.generate(function () {
    var next = 0;

    return function () {
      var current = offsetToComplex(next);

      next++;

      return current;
    };
  }(), 600*600);
}

var points = generateSpace();

var image = plot.getContext('2d').createImageData(plot.width, plot.height);

var goesToInfinity = function (complexNumber, iterations) {
  var c = complexNumber;

  function isOutsideRadius2(complexNumber) {
    return (math.pow(complexNumber.re, 2) + math.pow(complexNumber.im, 2)) > 4;
  }

  function iterate(complexNumber, currentIteration) {
    if (isOutsideRadius2(complexNumber)) {
      return currentIteration;
    }

    if (currentIteration < iterations) {
      return iterate(math.add(math.pow(complexNumber, 2), c), currentIteration + 1);
    }

    return currentIteration;
  }

  return iterate(complexNumber, 1);
};

var colormap = {
  0: [0, 0, 0, 255],
  1: [255, 0, 0, 255],
  2: [0, 255, 0, 255],
  3: [0, 0, 255, 255]
};

var i = 0;
points.map(
  function(point) {
    return colormap[goesToInfinity(point, 20) % 4];
  })
  .flatten()
  .each(function (pixelComponent){
    image.data[i++] = pixelComponent;
  });

plot.getContext('2d').putImageData(image, 0, 0);
