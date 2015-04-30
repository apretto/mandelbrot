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

    return {iterations: currentIteration, minRadius: minRadius};
  }

  return iterate(complexNumber, 1);
};

var colormap = [];

function hslToRgb(h, s, l){
  var r, g, b;

  if(s == 0){
    r = g = b = l; // achromatic
  }else{
    var hue2rgb = function hue2rgb(p, q, t){
      if(t < 0) t += 1;
      if(t > 1) t -= 1;
      if(t < 1/6) return p + (q - p) * 6 * t;
      if(t < 1/2) return q;
      if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function buildColormap() {
  var i;
  for (i = 0; i < 100; i++) {
    colormap.push(hslToRgb(i / 100, 1, 0.5).concat(255));
  }
}

buildColormap();

var i = 0;
var maxIterations = 1000;
points
  .map(function(point) {
    var pointInfo = goesToInfinity(point, maxIterations);
    return colormap[pointInfo.iterations % 100];
  })
  .flatten()
  .each(function (pixelComponent){
    image.data[i++] = pixelComponent;
  });

plot.getContext('2d').putImageData(image, 0, 0);
