var canvasHelper;
function setCanvasHelper() {
  canvasHelper = function() {
    let canvasWidth;
    let canvasHeight;
    function setSizes() {
      canvasWidth = windowWidth;
      canvasHeight = windowWidth*(512/1024);
    }
    setSizes();
    return {
      windowResized:function() {
        //canvas resize, reprint if draing and done but not paintFromdraw
        if (windowWidth !== canvasWidth) {
          setSizes();
          setConversions();
          resizeCanvas(canvasWidth,canvasHeight);
          if (drawing && loaded && !paintFromDraw) {
              background(0);
              refreshMap();
              if (Number(movie.value()) === 0) {
                fill(255);
                textAlign(CENTER,CENTER);
                text("Window resized. Please update result",width/2,height/2);
              }
          }
          styles();
        }
      },
      ww:canvasWidth,
      hh:canvasHeight
    }
  }();
}
