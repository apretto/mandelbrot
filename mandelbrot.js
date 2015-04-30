var plot = document.querySelector("#plot");

plot.height = 800;
plot.width = 800;

var totalPixels = plot.height * plot.width;

var view = {
  left: -2,
  up: 2,
  right: 1,
  down: -2
};

var step = {
  re: (view.right - view.left) / plot.width,
  im: (view.up - view.down) / plot.height
};

function offsetToComplex (offset) {
  var x = offset % plot.width;
  var y = math.floor(offset / plot.width);

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
  }(), totalPixels);
}

var points = generateSpace();

var image = plot.getContext('2d').createImageData(plot.width, plot.height);

var goesToInfinity = function (complexNumber, iterations) {
  var c = complexNumber;
  var minRadius = 10;

  function radius(complexNumber) {
    return math.pow(complexNumber.re, 2) + math.pow(complexNumber.im, 2);
  }

  function iterate(complexNumber, currentIteration) {
    var currentRadius = radius(complexNumber);
    minRadius = currentRadius < minRadius ? currentRadius : minRadius;

    if (currentRadius > 4) {
      return {iterations: currentIteration, minRadius: minRadius};
    }

    if (currentIteration < iterations) {
      return iterate(math.add(math.pow(complexNumber, 2), c), currentIteration + 1);
    }

    return {iterations: -1, minRadius: minRadius};
  }

  return iterate(complexNumber, 1);
};

var colormap = {
  '-1': [0, 0, 0],
  0: [0, 255, 255],
  1: [0, 255, 0],
  2: [0, 255, 255],
  3: [0, 0, 255]
};

var i = 0;
points.map(
  function(point) {
    var pointInfo = goesToInfinity(point, 100);
    //return [0, 0, 255 - (pointInfo.minRadius / 2 * 255), 255];
    //return colormap[math.floor(pointInfo.minRadius * 10) % 4].concat(255);
    var color = colormap[pointInfo.iterations % 4];
    return Lazy(color).map(function (component) {
      return component - (pointInfo.minRadius / 4 * 128);
    }).toArray().concat(255);
  })
  .flatten()
  .each(function (pixelComponent){
    image.data[i++] = pixelComponent;
  });

plot.getContext('2d').putImageData(image, 0, 0);
