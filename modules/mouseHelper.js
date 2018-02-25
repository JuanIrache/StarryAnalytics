var mouseHelper;
function setMouseHelper() {
  mouseHelper = function() {

    return {
      objectClicked:false,
      clickObject:function() {
        mouseHelper.objectClicked=true;
      }
    }
  }();
}
setMouseHelper();

function mousePressed() {
  if (mouseX<0 || mouseY<0 || mouseX>width || mouseY>height) {
    mouseHelper.clickObject();
  }
}

function mouseReleased() {
  mouseHelper.objectClicked = false;
}

function doubleClicked() {
  if (loaded && !paintFromDraw && !mouseHelper.objectClicked) {
    let x = mouseX-width/2;
    let y = mouseY-height/2;
    let cx = conversions.webMercX(center.x,zoom);
    let cy = conversions.webMercY(center.y,zoom);
    let tx = conversions.inverseWebMercX(x+cx,zoom);
    let ty = conversions.inverseWebMercY(y+cy,zoom);
    center = createVector(tx,ty);
    doRefreshMap = true;
    zoom++;
    refreshZoom();
    return false;
  }
}

function mouseWheel(event) {
  if (loaded && !paintFromDraw && !mouseHelper.objectClicked) {
    let preZoom = zoom;
    zoom -= event.delta/300;
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
      let x = mouseX-width/2;
      let y = mouseY-height/2;
      let cx = conversions.webMercX(center.x,zoom);
      let cy = conversions.webMercY(center.y,zoom);
      let tx = conversions.inverseWebMercX(x+cx,zoom);
      let ty = conversions.inverseWebMercY(y+cy,zoom);
      let px = pmouseX-width/2;
      let py = pmouseY-height/2;
      let ptx = conversions.inverseWebMercX(px+cx,zoom);
      let pty = conversions.inverseWebMercY(py+cy,zoom);
      center.x -= tx-ptx;
      center.y -= ty-pty;//
      doRefreshMap = true;
    return false;
  }
}
