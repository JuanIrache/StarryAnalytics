////////////////Web Mercator equations inspired by: https://github.com/CodingTrain/Rainbow-Code/blob/33d7b7508f3f92df807efa8ae1036b924c7bec97/CodingChallenges/CC_57_Earthquake_Viz/sketch.js

var conversions;
function setConversions() {
  conversions = (function(h) {
    var screenHeight = h;
    function degreesToRadians(x) {
      return (2 * Math.PI * x) / 360;
    }
    function radiansToDegrees(x) {
      return (360 * x) / (2 * Math.PI);
    }
    return {
      webMercX: function(lon, zoom) {
        lon = degreesToRadians(lon);
        var w = screenHeight / 2;
        var a = (w / Math.PI) * Math.pow(2, zoom);
        var b = lon + Math.PI;
        var x = a * b;
        return x;
      },
      webMercY: function(lat, zoom) {
        lat = degreesToRadians(lat);
        var w = screenHeight / 2;
        var a = (w / Math.PI) * Math.pow(2, zoom);
        var c = Math.tan(Math.PI / 4 + lat / 2);
        var b = Math.PI - Math.log(c);
        var y = a * b;
        return y;
      },
      inverseWebMercX: function(x, zoom) {
        var w = screenHeight / 2;
        var a = (w / Math.PI) * Math.pow(2, zoom);
        var b = x / a;
        var lon = b - Math.PI;
        lon = radiansToDegrees(lon);
        return lon;
      },
      inverseWebMercY: function(y, zoom) {
        var w = screenHeight / 2;
        var a = (w / Math.PI) * Math.pow(2, zoom);
        var b = y / a;
        var c = Math.exp(Math.PI - b);
        var lat = (Math.atan(c) - Math.PI / 4) * 2;
        lat = radiansToDegrees(lat);
        return lat;
      }
    };
  })(height);
}
