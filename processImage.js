function processImage (imageData, height, width, weights) {
  var imageDataAt = function (y, x, colorIdx) {
    // use closest pixel
    if (x < 0) { x = 0; }
    if (y < 0) { y = 0; }
    if (x >= width) { x = width - 1; }
    if (y >= height) { y = height - 1; }

    var i = (y * width + x) * 3 + colorIdx;
    return imageData[i];
  };

  var weightedAverageAt = function (y, x, colorIdx) {
    var acc = 0;
    for (var wy = 0; wy < weights.length; wy++) {
      for (var wx = 0; wx < weights[0].length; wx++) {
        var dy = wy - Math.floor(weights.length / 2);
        var dx = wx - Math.floor(weights[0].length / 2);
        var weight = weights[wy][wx];
        acc += imageDataAt(y + dy, x + dx, colorIdx) * weight;
      }
    }
    return acc;
  };

  var newImageData = [];
  for (var y = 0; y < height; y++) {
    for (var x = 0; x < width; x++) {
      for (var colorIdx = 0; colorIdx < 3; colorIdx++) {
        newImageData.push(weightedAverageAt(y, x, colorIdx));
      }
    }
  }

  return newImageData;
}

console.log(processImage([0,0,0,0,0,0,0,0,0,255,255,255]
  ,2, 2,
  [[0.2,0,0],[0,0.2,0.2],[0,0.2,0.2]]));
