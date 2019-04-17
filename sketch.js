'use strict';

var locations = [];
var center;
var img;
var sliderP;
var intro;
var introB;
var saveCan = false;
var movie;
var can;
var drawing = false;
var frame = 0;
var initialPointSize = 3;
var initialAlphaLevel = 255 / 2;
var pointSize;
var alphaLevel;
var coloursButton;
var changeToStill;
var labelDivs = [];
var labels = [];
var loadedP;
var takePhoto;
var playTimeline;
var feedbackFrame;
var stillButton;
var paintFromDraw;
var allSlider;
var profilesP;
var endDay;
var minusStartDay;
var feed1;
var feed2;
var type;
var created;
var changeToMovie;
var loaded;
var feedback;
var auth;
var zoomLevel;
var doRefreshMap;
var zoom = 1;
var addBackground = false;
var timelineSet = false;
var enableMovie1;
var enableMovie2;

//var graph;
//var logOutB;

var brightestFrame = {
  index: 0,
  value: 0
};

function preload() {
  img = loadImage('1229.png');
  setPaletteHelper();
}

function setup() {
  setCanvasHelper();
  paletteHelper.loadPalettes();
  can = createCanvas(canvasHelper.ww, canvasHelper.hh);
  can.position(0, 0);
  can.style('z-index', '-1');
  center = createVector(0, 0);

  refreshLabels();

  intro = createElement('h2', 'Starry Analytics');
  introB = createP(
    "Load your Google Analytics data and play with the settings to create the world map of your users' sessions.<br>For apps, each colour represents a package. For sites, colours are devices.<br>This is quite experimental, so expect bugs.<br>Can be quite slow when loading many dates or sessions. Select short time frames first.<br>Set points and opacity to low when creating stills. They will add up.<br>Have fun and feel free to provide feedback and contribute <a href='https://github.com/JuanIrache/StarryAnalytics' target='blank'>here</a>.<br> For a video example of what can be achieved, <a href='https://www.youtube.com/watch?v=w3-hyALXagU' target='blank'>click here</a>.<br>Built with <a href='https://p5js.org/' target='blank'>P5js</a>.<br>"
  );
  introB.id('introB');
  auth = select('#auth-button');
  auth.parent(introB);
  document.getElementById('auth-button').addEventListener('click', authorize);
  setConversions();
  image(img, 0, 0, width, height);
  styles();
}

function authorize(event) {
  analyticsHelper.authorize(event);
}

function refreshLabels() {
  if (labelDivs) {
    for (var i = 0; i < labelDivs.length; i++) {
      //console.log(labelDivs[i]);
      var c = i <= 4 ? color(paletteHelper.palette[i]) : color(255);
      labelDivs[i].style('color', c);
      labelDivs[i].style('font-weight', 'bold');
    }
  }
}

function draw() {
  if (!drawing) {
    image(img, 0, 0, width, height);
  } else if (paintFromDraw) {
    updateFeedbackFrame();
    paintMap(true);
  }

  if (paintFromDraw && saveCan) {
    //the previous function can override it
    savePhoto(true);
  }

  if (doRefreshMap) {
    doRefreshMap = false;
    preRefreshMap();
  }
}

function paintMap(advance) {
  if (!drawing) {
    blendMode(BLEND);
    background(0);
    intro.hide();
    introB.hide();
    var setuPs = selectAll('.setupB');
    for (var i = 0; i < setuPs.length; i++) {
      setuPs[i].hide();
    }
    drawing = true;
    sliderP = createP('');
    feedback = createP('');
    loadedP = createP('');
    loadedP.addClass('sided');
  }

  if (Number(movie.value()) === 1 || !drawing || addBackground) {
    if (Number(movie.value()) === 1 || addBackground) {
      blendMode(BLEND);
    }
    background(0);
    addBackground = false;
  }

  blendMode(SCREEN);
  var alpha = initialAlphaLevel;
  if (alphaLevel) {
    alpha = alphaLevel.value() / 10;
  }
  var multiplier = initialPointSize;
  if (pointSize) {
    multiplier = pointSize.value() / 10;
  }
  if (locations[frame] && locations[frame].length > 0) {
    push();
    translate(width / 2, height / 2);
    var cx = conversions.webMercX(center.x, zoom);
    var cy = conversions.webMercY(center.y, zoom);
    for (var i = 0; i < locations[frame].length; i++) {
      if (locations[frame].length > brightestFrame.value) {
        brightestFrame.index = frame;
        brightestFrame.value = locations[frame].length;
      }
      if (labels.indexOf(locations[frame][i][2]) === -1) {
        labels.push(locations[frame][i][2]);
      }

      var labelColor = labels.indexOf(locations[frame][i][2]);
      var c = labelColor <= 4 ? color(paletteHelper.palette[labelColor]) : color(255);

      stroke(red(c), green(c), blue(c), alpha);
      var lon = locations[frame][i][1];
      var lat = locations[frame][i][0];
      var x = conversions.webMercX(lon, zoom) - cx;
      var y = conversions.webMercY(lat, zoom) - cy;
      var value = locations[frame][i][3] * multiplier; //divided as user wants?
      var diameter = sqrt(value / PI) * 2;
      strokeWeight(diameter);
      point(x, y);
    }
    pop();
  } else {
    console.log('Error. No locations for frame');
  }

  var progress = frame / (endDay.value() - minusStartDay.value());

  feedback.html(loaded ? '' + round(progress * 100) + '%' : 'Loading data ' + round(progress * 100) + '%');

  if (advance) {
    if (minusStartDay.value() + frame < endDay.value()) {
      frame++;
      if (!loaded) {
        if (devHelper.local) {
          loadJSON('/local/' + frame + '.json', analyticsHelper.assign);
        } else {
          analyticsHelper.queryProfile();
        }
      }
    } else if (!loaded) {
      loaded = true;
      paintFromDraw = false;
      feedback.style('visibility', 'hidden');

      //if (movie.value() == 1) {
      allSlider = createSlider(minusStartDay.value(), endDay.value(), endDay.value());
      allSlider.mousePressed(mouseHelper.clickObject);
      allSlider.input(slideTimeline);
      allSlider.parent(sliderP);
      allSlider.style('width', '90%');
      feedbackFrame = createDiv('');
      feedbackFrame.parent(loadedP);
      updateFeedbackFrame(); //
      //}
      var lin = createDiv('<br>Point Size');
      lin.parent(loadedP);

      pointSize = createSlider(10, 1000, initialPointSize * 10);
      pointSize.mousePressed(mouseHelper.clickObject);
      pointSize.parent(loadedP);
      pointSize.input(prepareRefreshMap);
      pointSize.style('width', '15%');
      lin = createDiv('Opacity');
      lin.parent(loadedP);

      alphaLevel = createSlider(10, 2550, initialAlphaLevel * 10);
      alphaLevel.mousePressed(mouseHelper.clickObject);
      alphaLevel.parent(loadedP);
      alphaLevel.input(prepareRefreshMap);
      alphaLevel.style('width', '15%');
      lin = createDiv('Zoom');
      lin.parent(loadedP);

      zoomLevel = createSlider(100, 1000, 100);
      zoomLevel.mousePressed(mouseHelper.clickObject);
      zoomLevel.parent(loadedP);
      zoomLevel.input(setZoom);
      zoomLevel.style('width', '15%');
      lin = createDiv('<br>');
      lin.parent(loadedP);
      lin.addClass('noLine');

      coloursButton = createButton('Random Colours');
      coloursButton.parent(loadedP);
      coloursButton.mousePressed(shuffleColours);

      lin = createDiv('<br>');
      lin.parent(loadedP);
      lin.addClass('noLine');
      takePhoto = createButton('Photo');
      takePhoto.mousePressed(savePhoto); //
      takePhoto.parent(loadedP);
      loadLowButtons();

      lin = createP('');
      lin.parent(loadedP);
      lin.addClass('sided'); //
      for (var i = 0; i < labels.length; i++) {
        if (i >= 6 && labels.length > 7) {
          labelDivs[i] = createDiv('Other...');
          labelDivs[i].id('label' + i);
          labelDivs[i].parent(lin);
          labelDivs[i].mousePressed(mouseHelper.clickObject);
          break;
        } else {
          labelDivs[i] = createDiv(labels[i]);
          labelDivs[i].id('label' + i);
          labelDivs[i].parent(lin);
          labelDivs[i].mousePressed(mouseHelper.clickObject);
        }
      }

      refreshLabels();

      if (Number(movie.value()) === 1) {
        showButtons('.still', false);
        showButtons('.movie', true);
        showLabels(true);
        if (allSlider) allSlider.style('visibility', 'visible');
      } else {
        showButtons('.movie', false);
        showButtons('.still', true);
        showLabels(true);
        if (allSlider) allSlider.style('visibility', 'hidden');
      }
    } else {
      paintFromDraw = false;
      if (Number(movie.value()) === 1) {
        showButtons('.still', false);
        showButtons('.movie', true);
        showLabels(true);
        if (allSlider) allSlider.style('visibility', 'visible');
      } else {
        showButtons('.movie', false);
        showButtons('.still', true);
        showLabels(true);
        if (allSlider) allSlider.style('visibility', 'hidden');
      }
      if (feedback) feedback.style('visibility', 'hidden');
    }
  }
  styles();
}

function prepareRefreshMap() {
  doRefreshMap = true;
}

function preRefreshMap() {
  if (loaded) {
    center.x = constrain(center.x, -180 + 180 / pow(2, zoom), 180 - 180 / pow(2, zoom));
    center.y = constrain(center.y, -90 + 90 / pow(2, zoom), 90 - 90 / pow(2, zoom));

    if (Number(movie.value()) === 0) {
      frame = brightestFrame.index;
      updateFeedbackFrame();
    }
    refreshMap();

    if (Number(movie.value()) === 0) {
      fill(255);
      noStroke();
      textAlign(CENTER, CENTER);
      text('Please update result to see real effect', width / 2, height / 2);
    }
  }
}

function movieToStill() {
  mouseHelper.clickObject();
  movie.value(0);
  redoStill();
  showButtons('.movie', false);
  showLabels(false);
  addBackground = true;
}

function stillToMovie() {
  mouseHelper.clickObject();
  movie.value(1);
  playTimelineStart();
  showButtons('.still', false);
  showLabels(false);
}

function loadLowButtons() {
  var lin = createDiv('<br>');
  lin.parent(loadedP);
  lin.addClass('movie');
  lin.addClass('noLine');
  playTimeline = createButton('Play');
  playTimeline.mousePressed(playTimelineStart); //
  playTimeline.parent(loadedP);
  playTimeline.addClass('movie');
  enableMovie2 = createCheckbox('Download all frames for movie', false);
  enableMovie2.addClass('movie');
  enableMovie2.changed(toggleMovie2);
  enableMovie2.addClass('unselectable');

  lin = createDiv('<br>');
  lin.parent(loadedP);
  lin.addClass('movie');
  lin.addClass('noLine');
  changeToStill = createButton('Change to Still');
  changeToStill.mousePressed(movieToStill); //
  changeToStill.parent(loadedP);
  changeToStill.addClass('movie');

  lin = createDiv('<br>');
  lin.parent(loadedP);
  lin.addClass('still');
  lin.addClass('noLine');
  stillButton = createButton('Update result');
  stillButton.parent(loadedP);
  stillButton.mousePressed(redoStill);
  stillButton.addClass('still');
  enableMovie1 = createCheckbox('Download frames for movie', false);
  enableMovie1.addClass('still');
  enableMovie1.changed(toggleMovie1);
  enableMovie1.addClass('unselectable');

  lin = createDiv('<br>');
  lin.parent(loadedP);
  lin.addClass('still');
  lin.addClass('noLine');
  changeToMovie = createButton('Change to Timeline');
  changeToMovie.mousePressed(stillToMovie); //
  changeToMovie.parent(loadedP);
  changeToMovie.addClass('still');

  styles();
}

function toggleMovie1() {
  mouseHelper.clickObject();
  saveCan = enableMovie1.checked();
  enableMovie2.checked(saveCan);
}

function toggleMovie2() {
  mouseHelper.clickObject();
  saveCan = enableMovie2.checked();
  enableMovie1.checked(saveCan);
}

function showButtons(s, vis) {
  var buttons = selectAll(s);
  for (var i = 0; i < buttons.length; i++) {
    if (vis) {
      buttons[i].show();
    } else {
      buttons[i].hide();
    }
  }
}

function showLabels(vis) {
  for (var i = 0; i < labelDivs.length; i++) {
    if (vis) {
      labelDivs[i].show();
    } else {
      labelDivs[i].hide();
    }
  }
}

function shuffleColours() {
  //
  mouseHelper.clickObject();
  paletteHelper.loadPalette();
  refreshLabels();
  doRefreshMap = true;
}

function playTimelineStart() {
  mouseHelper.clickObject();
  frame = 0;
  if (feedback) feedback.style('visibility', 'visible');
  if (allSlider) allSlider.style('visibility', 'hidden');
  paintFromDraw = true;
  showButtons('.movie', false);
  showLabels(false);
}

function refreshMap() {
  var remMovie;
  if (Number(movie.value()) === 0) {
    remMovie = 0;
    movie.value(1);
  }
  if (!paintFromDraw) {
    paintMap(false);
  }
  if (remMovie === 0) {
    movie.value(0);
  }
}
function redoStill() {
  mouseHelper.clickObject();
  if (feedback) feedback.style('visibility', 'visible');
  showButtons('.still', false);
  showLabels(false);
  frame = 0;
  if (allSlider) allSlider.style('visibility', 'hidden');
  paintFromDraw = true;
  addBackground = true; //funciton background(0); fails?
  background(0);
}

function savePhoto(notClicked) {
  if (notClicked !== true) mouseHelper.clickObject();
  // put watermark
  var tempImage = get();
  if (!devHelper.local) {
    fill(255, 120);
    textAlign(RIGHT, BOTTOM);
    text('tailorandwayne.com/starry-analytics', width * 0.98, height * 0.97);
  }
  save(can, dateHelper.dateDaysAgo(-minusStartDay.value() - frame, false), 'png');
  blendMode(BLEND);
  image(tempImage, 0, 0, width, height);
  tempImage = null;
}

function slideTimeline() {
  var preFrame = round(map(this.value(), minusStartDay.value(), endDay.value(), 0, locations.length - 1));
  if (preFrame >= 0 && preFrame < locations.length) {
    frame = preFrame;
    updateFeedbackFrame();
    paintMap(false);
  }
}

function updateFeedbackFrame() {
  if (feedbackFrame) {
    feedbackFrame.html(dateHelper.dateDaysAgo(-minusStartDay.value() - frame, true));
  }
}

function timelineSettings() {
  if (!timelineSet) {
    timelineSet = true;
    if (profilesP) profilesP.hide();
    var timelineP = createP('Select date range<br>');
    timelineP.id('timelineP');
    //timelineP.style("background-color","black");
    minusStartDay = createSlider(dateHelper.daysSinceDate(created), -2, dateHelper.daysSinceDate(created));
    minusStartDay.mousePressed(mouseHelper.clickObject);
    minusStartDay.input(minusStartDayInput);
    minusStartDay.parent(timelineP);
    minusStartDay.id('#minusStartDay');
    minusStartDay.style('width', '40%');
    feed1 = createDiv(dateHelper.dateDaysAgo(-minusStartDay.value(), true));
    feed1.parent(timelineP);
    feed1.id('feed1');

    endDay = createSlider(dateHelper.daysSinceDate(created) + 1, -1, -1);
    endDay.mousePressed(mouseHelper.clickObject);
    endDay.input(endDayInput);
    endDay.parent(timelineP);
    endDay.id('#endDay');
    endDay.style('width', '40%');
    feed2 = createDiv(dateHelper.dateDaysAgo(-endDay.value(), true));
    feed2.parent(timelineP);
    feed2.id('feed2');

    movie = createRadio();
    movie.mousePressed(mouseHelper.clickObject);
    movie.option('Still', 0);
    movie.option('Timeline', 1);
    movie.value(1);
    movie.parent(timelineP);

    var but = createButton('Run');
    but.parent(timelineP);
    but.mousePressed(runSketch);

    styles();
  }
}

function selectProfile() {
  mouseHelper.clickObject();
  type = split(this.elt.value, ',')[0];
  created = new Date(split(this.elt.value, ',')[1]);
  analyticsHelper.selectProfile(this.elt.id);
  profilesP.hide();
}

function minusStartDayInput() {
  //console.log(endDay.value());
  if (endDay.value() < minusStartDay.value()) {
    endDay.value(minusStartDay.value() + 1);
    feed2.html(dateHelper.dateDaysAgo(-endDay.value(), true));
  }
  feed1.html(dateHelper.dateDaysAgo(-minusStartDay.value(), true));
}

function endDayInput() {
  if (endDay.value() < minusStartDay.value()) {
    endDay.value(minusStartDay.value() + 1);
  }
  feed2.html(dateHelper.dateDaysAgo(-endDay.value(), true));
}

function runSketch() {
  mouseHelper.clickObject();
  if (Number(movie.value()) === 0) {
    initialPointSize = 1;
    initialAlphaLevel = 5;
  }
  var timelineP = select('#timelineP');
  timelineP.hide();
  if (devHelper.local) {
    loadJSON('/local/' + frame + '.json', analyticsHelper.assign);
  } else {
    analyticsHelper.queryProfile();
  }
}

function windowResized() {
  //doing strange things
  canvasHelper.windowResized();
}

function styles() {
  //
  var p = selectAll('P');
  for (var i = 0; i < p.length; i++) {
    p[i].style('font-size', height / 50 + 'px');
    if (!p[i].class().indexOf('unselectable') != -1) p[i].addClass('unselectable');
  }

  for (var i = 0; i < labelDivs.length; i++) {
    labelDivs[i].style('margin', height / 300 + 'px');
  }
  var but = selectAll('button');
  for (var i = 0; i < but.length; i++) {
    but[i].style('font-size', height / 40 + 'px');
    but[i].style('margin', height / 300 + 'px');

    but[i].style('padding', height / 1000 + 'px');

    if (!but[i].class().indexOf('unselectable') != -1) but[i].addClass('unselectable');
  }
  var sBut = selectAll('.setupB');
  for (var i = 0; i < sBut.length; i++) {
    sBut[i].style('margin-left', height / 200 + 'px');
    sBut[i].addClass('unselectable');
  }

  var h = selectAll('h2');
  for (var i = 0; i < h.length; i++) {
    h[i].style('font-size', height / 20 + 'px');
    if (!h[i].class().indexOf('unselectable') != -1) h[i].addClass('unselectable');
  }
  var r = selectAll('radio');
  for (var i = 0; i < r.length; i++) {
    //r[i].style('transform','scale('height/1000+')');
    if (!r[i].class().indexOf('unselectable') != -1) r[i].addClass('unselectable');
  }
  var s = selectAll('slider');
  for (var i = 0; i < s.length; i++) {
    //s[i].style("cursor","pointer");
    if (!s[i].class().indexOf('unselectable') != -1) s[i].addClass('unselectable');
  }
  var b = selectAll('br');
  for (var i = 0; i < b.length; i++) {
    b[i].style('line-height', height / 80 + 'px');
    if (!b[i].class().indexOf('unselectable') != -1) b[i].addClass('unselectable');
  }
  var l = selectAll('label');
  for (var i = 0; i < l.length; i++) {
    l[i].style('font-size', height / 70 + 'px');
    l[i].style('color', 'white');
    if (!b[i].class().indexOf('unselectable') != -1) b[i].addClass('unselectable');
  }
}

function setZoom() {
  doRefreshMap = true;
  zoom = zoomLevel.value() / 100;
  zoom = constrain(zoom, 1, 10);
}

function refreshZoom() {
  zoom = constrain(zoom, 1, 10);
  zoomLevel.value(zoom * 100);
}
