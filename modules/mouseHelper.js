var mouseHelper;
function setMouseHelper() {
  mouseHelper = (function() {
    return {
      objectClicked: false,
      clickObject: function() {
        mouseHelper.objectClicked = true;
      }
    };
  })();
}
setMouseHelper();

function mousePressed() {
  if (mouseX < 0 || mouseY < 0 || mouseX > width || mouseY > height) {
    mouseHelper.clickObject();
  }
}

function mouseReleased() {
  mouseHelper.objectClicked = false;
}

function doubleClicked() {
  if (loaded && !paintFromDraw && !mouseHelper.objectClicked) {
    var x = mouseX - width / 2;
    var y = mouseY - height / 2;
    var cx = conversions.webMercX(center.x, zoom);
    var cy = conversions.webMercY(center.y, zoom);
    var tx = conversions.inverseWebMercX(x + cx, zoom);
    var ty = conversions.inverseWebMercY(y + cy, zoom);
    center = createVector(tx, ty);
    doRefreshMap = true;
    zoom++;
    refreshZoom();
    return false;
  }
}

function mouseWheel(event) {
  if (loaded && !paintFromDraw && !mouseHelper.objectClicked) {
    var preZoom = zoom;
    zoom -= event.delta / 300;
    refreshZoom();
    if (zoom !== preZoom) {
      doRefreshMap = true;
    }
  }
  //uncomment to block page scrolling
  return false;
}

function mouseDragged() {
  if (loaded && !mouseHelper.objectClicked && !paintFromDraw) {
    var x = mouseX - width / 2;
    var y = mouseY - height / 2;
    var cx = conversions.webMercX(center.x, zoom);
    var cy = conversions.webMercY(center.y, zoom);
    var tx = conversions.inverseWebMercX(x + cx, zoom);
    var ty = conversions.inverseWebMercY(y + cy, zoom);
    var px = pmouseX - width / 2;
    var py = pmouseY - height / 2;
    var ptx = conversions.inverseWebMercX(px + cx, zoom);
    var pty = conversions.inverseWebMercY(py + cy, zoom);
    center.x -= tx - ptx;
    center.y -= ty - pty; //
    doRefreshMap = true;
    return false;
  }
}
