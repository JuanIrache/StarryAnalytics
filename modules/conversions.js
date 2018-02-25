////////////////Web Mercator equations inspired by: https://github.com/CodingTrain/Rainbow-Code/blob/33d7b7508f3f92df807efa8ae1036b924c7bec97/CodingChallenges/CC_57_Earthquake_Viz/sketch.js


var conversions;
function setConversions() {
  conversions = function(h) {
    let screenHeight = h;
    function degreesToRadians(x) {
      return 2 * Math.PI * x / 360;
    }
    function radiansToDegrees(x) {
      return 360 * x / (2 * Math.PI);
    }
    return {
      webMercX: function(lon, zoom) {
        lon = degreesToRadians(lon);
        let w = screenHeight / 2;
        let a = (w / Math.PI) * Math.pow(2, zoom);
        let b = (lon + Math.PI);
        let x = a * b;
        return x;
      },
      webMercY: function(lat, zoom) {
        lat = degreesToRadians(lat);
        let w = screenHeight / 2;
        let a = (w / Math.PI) * Math.pow(2, zoom);
        let c = Math.tan(Math.PI / 4 + lat / 2);
        let b = Math.PI - Math.log(c);
        let y = a * b;
        return y;
      },
      inverseWebMercX: function(x,zoom) {
        let w = screenHeight / 2;
        let a = (w / Math.PI) * Math.pow(2, zoom);
        let b = x/a;
        let lon = b-Math.PI;
        lon = radiansToDegrees(lon);
        return lon;
      },
      inverseWebMercY: function(y,zoom) {
        let w = screenHeight / 2;
        let a = (w / Math.PI) * Math.pow(2, zoom);
        let b = (y/a);
        let c = Math.exp(Math.PI-b);
        let lat = (Math.atan(c) - (Math.PI / 4))*2;
        lat = radiansToDegrees(lat);
        return lat;
      }
    }
  }(height);
}
