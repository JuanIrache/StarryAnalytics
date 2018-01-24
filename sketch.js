"use strict";

let locations = [];
let center;
let ww;
let hh;
let img;
let sliderP;
let palettesJSON;
let palette;
let intro;
let introB;
let saveCan = false;
let movie;
let can;
let drawing = false;
let frame = 0;
let initialPointSize = 3;
let initialAlphaLevel = 255/2;
let pointSize;
let alphaLevel;
let coloursButton;
let changeToStill;
let labelDivs = [];
let loadedP;
let takePhoto;
let playTimeline;
let feedbackFrame;
let stillButton;
let paintFromDraw;
let allSlider;
let labels = [];
let selectedAccount;
let profilesP;
let selectedProfile;
let endDay;
let minusStartDay;
let feed1;
let feed2;
let type;
let created;
let changeToMovie;
let loaded;
let feedback;
let auth;
let zoomLevel;
let doRefreshMap;
let zoom = 1;
let addBackground = false;
let timelineSet = false;
let enableMovie1;
let enableMovie2;
let objectClicked;
//let graph;
//let logOutB;

let brightestFrame = {
  index:0,
  value:0
}

function preload() {
  img = loadImage("1229.png");
  palettesJSON = loadJSON("palettes.json");

}

function setup() {
  ww = windowWidth;
  hh = windowWidth*(512/1024);//512*85/160;
  can = createCanvas(ww,hh);
  can.position(0,0);
  can.style("z-index","-1");
  center = createVector(0,0);
  let palettes = palettesJSON.palettes;
  palette = palettes[floor(random(0,palettes.length))];
  refreshLabels()

  intro = createElement("h2","Starry Analytics");
  introB = createP("Load your Google Analytics data and play with the settings to create the world map of your users' sessions.<br>For apps, each colour represents a package. For sites, colours are devices.<br>This is quite experimental, so expect bugs.<br>Can be quite slow when loading many dates or sessions. Select short time frames first.<br>Set points and opacity to low when creating stills. They will add up.<br>Have fun and feel free to provide feedback and contribute <a href='https://github.com/JuanIrache/StarryAnalytics' target='blank'>here</a>.<br> For a video example of what can be achieved, <a href='https://www.youtube.com/watch?v=w3-hyALXagU' target='blank'>click here</a>.<br>Built with <a href='https://p5js.org/' target='blank'>P5js</a>.");
  introB.id("introB");
  auth = select("#auth-button");
  auth.parent(introB);
  document.getElementById('auth-button').addEventListener('click', authorize);

  image(img,0,0,width,height);
  styles();
}

function clickObject() {
  objectClicked = true;
}

function mousePressed() {
  if (mouseX<0 || mouseY<0 || mouseX>width || mouseY>height) {
    objectClicked = true;
  }
}

function mouseReleased() {
  objectClicked = false;
}

function doubleClicked() {
  if (loaded && !paintFromDraw && !objectClicked) {
    let x = mouseX-width/2;
    let y = mouseY-height/2;
    let cx = webMercX(center.x,zoom);
    let cy = webMercY(center.y,zoom);
    let tx = inverseWebMercX(x+cx,zoom);
    let ty = inverseWebMercY(y+cy,zoom);
    center = createVector(tx,ty);
    doRefreshMap = true;
    zoom++;
    refreshZoom();
    return false;
  }
}

function mouseWheel(event) {
  if (loaded && !paintFromDraw && !objectClicked) {
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
  if (loaded && !objectClicked && !paintFromDraw) {
      let x = mouseX-width/2;
      let y = mouseY-height/2;
      let cx = webMercX(center.x,zoom);
      let cy = webMercY(center.y,zoom);
      let tx = inverseWebMercX(x+cx,zoom);
      let ty = inverseWebMercY(y+cy,zoom);
      let px = pmouseX-width/2;
      let py = pmouseY-height/2;
      let ptx = inverseWebMercX(px+cx,zoom);
      let pty = inverseWebMercY(py+cy,zoom);
      center.x -= tx-ptx;
      center.y -= ty-pty;//
      doRefreshMap = true;
    return false;
  }
}

function refreshLabels() {
  if (labelDivs) {
    for (let i=0;i<labelDivs.length;i++) {
      //console.log(labelDivs[i]);
      labelDivs[i].style("color",palette[i]);
      labelDivs[i].style("font-weight","bold");
    }
  }
}

function draw() {
  if (!drawing)  {
    image(img,0,0,width,height);
  } else if (paintFromDraw) {
    updateFeedbackFrame();
    paintMap(true);
  }

  if (paintFromDraw && saveCan) {//the previous function can override it
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
    let setuPs = selectAll(".setupB");
    for (let i=0;i<setuPs.length;i++) {
      setuPs[i].hide();
    }
    drawing = true;
    sliderP = createP("");
    feedback = createP("");
    loadedP = createP("");
    loadedP.addClass("sided");
  }




  if (Number(movie.value()) === 1 || !drawing || addBackground) {
    if (Number(movie.value()) === 1 || addBackground) {
      blendMode(BLEND);
    }
    background(0);
    addBackground = false;
  }

  blendMode(SCREEN);
  let alpha = initialAlphaLevel;
  if (alphaLevel) {
    alpha = alphaLevel.value()/10;
  }
  let multiplier = initialPointSize;
  if (pointSize) {
    multiplier = pointSize.value()/10;
  }
  if (locations[frame] && locations[frame].length > 0) {
    push();
    translate(width/2,height/2);
    let cx = webMercX(center.x,zoom);
    let cy = webMercY(center.y,zoom);
    for (let i=0;i<locations[frame].length;i++) {
      if (locations[frame].length > brightestFrame.value) {
        brightestFrame.index = frame;
        brightestFrame.value = locations[frame].length;
      }
      if (labels.indexOf(locations[frame][i][2]) === -1) {
        labels.push(locations[frame][i][2]);
      }

      let labelColor = labels.indexOf(locations[frame][i][2]);
      let c = labelColor <= 4 ? color(palette[4]) : color(255);

      stroke (red(c),green(c),blue(c),alpha);
      let lon = locations[frame][i][1];
      let lat = locations[frame][i][0];
      let x = webMercX(lon,zoom) - cx;
      let y = webMercY(lat,zoom) - cy;
      let value = (locations[frame][i][3])*multiplier;//divided as user wants?
      let diameter = (sqrt(value/PI)*2);
      strokeWeight(diameter);
      point(x,y);
    }
    pop();
  } else {
    console.log("Error. No locations for frame");
  }

  let progress = frame/((endDay.value()-minusStartDay.value()));

  feedback.html(loaded ? (""+round(progress*100)+"%") : ("Loading data "+round(progress*100)+"%"));

  if (advance) {
    if (minusStartDay.value()+frame < endDay.value()) {
      frame++;
      if (!loaded) {
        if (local) {
          loadJSON("/local/"+frame+".json",assign);
        } else {
          queryCoreReportingApi(selectedProfile);
        }
      }
    } else if (!loaded) {
      loaded = true;
      paintFromDraw = false;
      feedback.style("visibility","hidden");

      //if (movie.value() == 1) {
        allSlider = createSlider(minusStartDay.value(),endDay.value(),endDay.value());
        allSlider.mousePressed(clickObject);
        allSlider.input(slideTimeline);
        allSlider.parent(sliderP);
        allSlider.style("width","90%");
        feedbackFrame = createDiv("");
        feedbackFrame.parent(loadedP);
        updateFeedbackFrame();//
      //}
      let lin = createDiv("<br>Point Size");
      lin.parent(loadedP);

      pointSize = createSlider(10,1000,(initialPointSize*10));
      pointSize.mousePressed(clickObject);
      pointSize.parent(loadedP);
      pointSize.input(prepareRefreshMap);
      pointSize.style("width","15%");
      lin = createDiv("Opacity");
      lin.parent(loadedP);

      alphaLevel = createSlider(10,2550,initialAlphaLevel*10);
      alphaLevel.mousePressed(clickObject);
      alphaLevel.parent(loadedP);
      alphaLevel.input(prepareRefreshMap);
      alphaLevel.style("width","15%");
      lin = createDiv("Zoom");
      lin.parent(loadedP);

      zoomLevel = createSlider(100,1000,100);
      zoomLevel.mousePressed(clickObject);
      zoomLevel.parent(loadedP);
      zoomLevel.input(setZoom);
      zoomLevel.style("width","15%");
      lin = createDiv("<br>");
      lin.parent(loadedP);
      lin.addClass("noLine");

      coloursButton = createButton("Random Colours");
      coloursButton.parent(loadedP);
      coloursButton.mousePressed(shuffleColours);

      lin = createDiv("<br>");
      lin.parent(loadedP);
      lin.addClass("noLine");
      takePhoto = createButton("Photo");
      takePhoto.mousePressed(savePhoto);//
      takePhoto.parent(loadedP);
      loadLowButtons();

      lin = createP("");
      lin.parent(loadedP);
      lin.addClass("sided");//
      for (let i=0; i<labels.length; i++) {
        if ((i>=6 && labels.length > 7)) {
          labelDivs[i] = createDiv("Other...");
          labelDivs[i].id("label"+i);
          labelDivs[i].parent(lin);
          labelDivs[i].mousePressed(clickObject);
          break;
        } else {
          labelDivs[i] = createDiv(labels[i]);
          labelDivs[i].id("label"+i);
          labelDivs[i].parent(lin);
          labelDivs[i].mousePressed(clickObject);
        }
      }

      refreshLabels();

      if (Number(movie.value()) === 1) {
        showButtons(".still",false);
        showButtons(".movie",true);
        showLabels(true);
        if (allSlider) allSlider.style("visibility","visible");
      } else {
        showButtons(".movie",false);
        showButtons(".still",true);
        showLabels(true);
        if (allSlider) allSlider.style("visibility","hidden");
      }
    } else {
      paintFromDraw = false;
      if (Number(movie.value()) === 1) {
        showButtons(".still",false);
        showButtons(".movie",true);
        showLabels(true);
        if (allSlider) allSlider.style("visibility","visible");
      } else {
        showButtons(".movie",false);
        showButtons(".still",true);
        showLabels(true);
        if (allSlider) allSlider.style("visibility","hidden");
      }
      if (feedback) feedback.style("visibility","hidden");
    }
  }
  styles();
}

function prepareRefreshMap() {
  doRefreshMap = true;
}

function preRefreshMap() {
  if (loaded) {

    center.x = constrain(center.x,-180+(180/pow(2,zoom)),180-(180/pow(2,zoom)));
    center.y = constrain(center.y,-90+(90/pow(2,zoom)),90-(90/pow(2,zoom)));

    if (Number(movie.value()) === 0) {
      frame = brightestFrame.index;
      updateFeedbackFrame();
    }
    refreshMap();

    if (Number(movie.value()) === 0) {
      fill(255);
      noStroke();
      textAlign(CENTER,CENTER);
      text("Please update result to see real effect",width/2,height/2);
    }
  }
}

function movieToStill() {
  objectClicked = true;
  movie.value(0);
  redoStill();
  showButtons(".movie",false);
  showLabels(false);
  addBackground = true;
}

function stillToMovie() {
  objectClicked = true;
  movie.value(1);
  playTimelineStart();
  showButtons(".still",false);
  showLabels(false);
}

function loadLowButtons() {
  let lin = createDiv("<br>");
  lin.parent(loadedP);
  lin.addClass("movie");
  lin.addClass("noLine");
  playTimeline = createButton("Play");
  playTimeline.mousePressed(playTimelineStart);//
  playTimeline.parent(loadedP);
  playTimeline.addClass("movie");
  enableMovie2 = createCheckbox('Download all frames for movie', false);
  enableMovie2.addClass("movie");
  enableMovie2.changed(toggleMovie2);
  enableMovie2.addClass("unselectable");

  lin = createDiv("<br>");
  lin.parent(loadedP);
  lin.addClass("movie");
  lin.addClass("noLine");
  changeToStill = createButton("Change to Still");
  changeToStill.mousePressed(movieToStill);//
  changeToStill.parent(loadedP);
  changeToStill.addClass("movie");

  lin = createDiv("<br>");
  lin.parent(loadedP);
  lin.addClass("still");
  lin.addClass("noLine");
  stillButton = createButton("Update result");
  stillButton.parent(loadedP);
  stillButton.mousePressed(redoStill);
  stillButton.addClass("still");
  enableMovie1 = createCheckbox('Download frames for movie', false);
  enableMovie1.addClass("still");
  enableMovie1.changed(toggleMovie1);
  enableMovie1.addClass("unselectable");

  lin = createDiv("<br>");
  lin.parent(loadedP);
  lin.addClass("still");
  lin.addClass("noLine");
  changeToMovie = createButton("Change to Timeline");
  changeToMovie.mousePressed(stillToMovie);//
  changeToMovie.parent(loadedP);
  changeToMovie.addClass("still");

  styles();
}

function toggleMovie1() {
  objectClicked = true;
  saveCan = enableMovie1.checked();
  enableMovie2.checked(saveCan);
}

function toggleMovie2() {
  objectClicked = true;
  saveCan = enableMovie2.checked();
  enableMovie1.checked(saveCan);
}

function showButtons(s,vis) {
  let buttons = selectAll(s);
  for (let i=0; i<buttons.length;i++) {
    if (vis) {
      buttons[i].show();
    } else {
      buttons[i].hide();
    }
  }
}

function showLabels(vis) {
  for (let i=0; i<labelDivs.length;i++) {
    if (vis) {
      labelDivs[i].show();
    } else {
      labelDivs[i].hide();
    }
  }
}

function shuffleColours() {//
  objectClicked = true;
  let palettes = palettesJSON.palettes;
  palette = palettes[floor(random(0,palettes.length))];
  refreshLabels();
  doRefreshMap = true;
}

function playTimelineStart() {
  objectClicked = true;
  frame = 0;
  if (feedback) feedback.style("visibility","visible");
  if (allSlider) allSlider.style("visibility","hidden");
  paintFromDraw = true;
  showButtons(".movie",false);
  showLabels(false);
}

function refreshMap() {
  let remMovie;
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
  objectClicked = true;
  if (feedback) feedback.style("visibility","visible");
  showButtons(".still",false);
  showLabels(false);
  frame = 0;
  if (allSlider) allSlider.style("visibility","hidden");
  paintFromDraw = true;
  addBackground = true;//funciton background(0); fails?
  background(0);
}

function savePhoto(notClicked) {
  if (notClicked !== true) objectClicked = true;
  // put watermark
  let tempImage = get();
  if (!local) {
    fill(255,120);
    textAlign(RIGHT,BOTTOM);
    text("tailorandwayne.com/starry-analytics",width*.98,height*.97);
  }
  save(can,dateFromSince(-minusStartDay.value()-frame,false),"png");
  blendMode(BLEND);
  image(tempImage,0,0,width,height);
  tempImage = null;
}

function slideTimeline() {
  let preFrame = round(map(this.value(),minusStartDay.value(),endDay.value(),0,locations.length-1));
  if (preFrame >= 0 && preFrame < locations.length) {
    frame = preFrame;
    updateFeedbackFrame();
    paintMap(false);
  }
}

function updateFeedbackFrame() {
  if (feedbackFrame) {
    feedbackFrame.html(dateFromSince(-minusStartDay.value()-frame,true));
  }
}

//////////////google data retrieving
const CLIENT_ID = '';
// Set authorized scope.
const SCOPES = ['https://www.googleapis.com/auth/analytics.readonly'];

function authorize(event) {
  // Handles the authorization flow.
  // `immediate` should be false when invoked from the button click.
  let useImmdiate = event ? false : true;
  let authData = {
    client_id: CLIENT_ID,
    scope: SCOPES,
    immediate: useImmdiate,
    cookie_policy: 'single_host_origin',
    response_type: 'token id_token'
  };

  gapi.auth.authorize(authData, function(response) {
    let authButton = document.getElementById('auth-button');
    if (response.error) {
      authButton.hidden = false;
    }
    else {
      authButton.hidden = true;
      queryAccounts();
    }
  });
}

function queryAccounts() {
// Load the Google Analytics client library.
gapi.client.load('analytics', 'v3').then(function() {
  // Get a list of all Google Analytics accounts for this user
  gapi.client.analytics.management.accounts.list().then(handleAccounts).then(null, function(err) {
    // Log any errors.
    createP('Error. No analytics accounts found');
    if (err) console.log(err);
    styles();
  });
});
}


function signOut() {
   gapi.auth.signOut();
   //not working
}

function handleAccounts(response) {
  let check = select("#accountsP");
    if (check == null) {
  if (response.result.items && response.result.items.length) {
      //logout not working
      if (auth) auth.hide();
      let errs = selectAll(".error");
      for (let i=0;i<errs.length;i++) {
        err[i].hide();
      }
      let items = response.result.items;
      let accountsP = createP("Select Account<br>");
      accountsP.id("accountsP");
      accountsP.addClass("setupB");
      if (items.length>1) {
        for (let i=0; i<items.length; i++) {
          let but = createButton(items[i].name);
          but.id(items[i].id);
          but.parent(accountsP);
          but.addClass("setupB");
          but.mousePressed(selectAccount);
        }
      } else {
        selectedAccount = items[0].id;
        queryProperties(selectedAccount);
      }
      styles();
    } else {
      let err = createP('No accounts found for this user.');
      err.addClass("setupB");
      err.addClass("error");
      styles();
    }

  }
}

function selectAccount() {
  objectClicked = true;
  //console.log(this.elt.id);
  selectedAccount = this.elt.id;
  queryProperties(selectedAccount);
}

function queryProperties(accountId) {
// Get a list of all the properties for the account.
//console.log(accountId);
gapi.client.analytics.management.webproperties.list(
    {'accountId': accountId})
  .then(handleProperties)
  .then(null, function(err) {
    // Log any errors.
    createP('Error');
    if (err) console.log(err);
    styles();
  });
}

function handleProperties(response) {

//console.log(response);
// Handles the response from the webproperties list method.
let check = select("#propertiesP");
    if (check == null) {
      if (response.result.items && response.result.items.length) {
        let errs = selectAll(".error");
        for (let i=0;i<errs.length;i++) {
          err[i].hide();
        }
        let accountsP = select("#accountsP");
        accountsP.hide();
        let items = response.result.items;
        if (items.length > 1) {
        let propertiesP = createP("Select Property<br>");
        propertiesP.id("propertiesP");
        propertiesP.addClass("setupB");
          for (let i=0; i<items.length; i++) {
            let but = createButton(items[i].name);
            but.id(items[i].id);
            but.parent(propertiesP);
            but.addClass("setupB");
            but.mousePressed(selectProperty);
          }
        } else {
          selectedProperty = items[0].id;
          queryProfiles(selectedAccount, selectedProperty);
        }
        styles();
          // Query for Views (Profiles).
          //queryProfiles(selectedAccountID, selectedPropertyId);
      } else {
        console.log('No properties found for this user.');
        createP('No properties found for this user');
        styles();
      }
    }
}

function selectProperty() {
  objectClicked = true;
  //console.log(this);
  selectedProperty = this.elt.id;
  queryProfiles(selectedAccount, selectedProperty);
}
let selectedProperty;

function queryProfiles(accountId, propertyId) {
//console.log(accountId);
gapi.client.analytics.management.profiles.list({
    'accountId': accountId,
    'webPropertyId': propertyId
})
.then(handleProfiles)
.then(null, function(err) {
    // Log any errors.
    if (err) console.log(err);
    let errb = createP("Error. Please retry");
    errb.addClass("setupB");
    errb.addClass("error");
    styles();

  });
}

function handleProfiles(response) {

  let check = select("#profilesP");
    if (check == null) {
  //console.log(response);
// Handles the response from the profiles list method.
      if (response.result.items && response.result.items.length) {
        let errs = selectAll(".error");
        for (let i=0;i<errs.length;i++) {
          err[i].hide();
        }
          let propertiesP = select("#propertiesP");
          if (propertiesP) propertiesP.hide();
          let items = response.result.items;
          if (items.length > 1) {
            profilesP = createP("Select Profile<br>");
            profilesP.id("profilesP");
            profilesP.addClass("setupB");
          //profilesP.style("background-color","black");
            for (let i=0; i<items.length; i++) {
              let but = createButton(items[i].name,items[i].type+","+items[i].created);
              but.id(items[i].id);
              but.parent(profilesP);
              but.addClass("setupB");
              but.mousePressed(selectProfile);
            }
          } else {
            selectedProfile = items[0].id;
            type = items[0].type;
            created = new Date(items[0].created);
            timelineSettings();
          }
          styles();
        } else {
          console.log('No views (profiles) found for this user.');
          let err = createP("No views (profiles) found for this user.");
          err.addClass("setupB");
          err.addClass("error");
          styles();
        }
      }
}

function timelineSettings() {
  if (!timelineSet) {
    timelineSet = true;
    if (profilesP) profilesP.hide();
    let timelineP = createP("Select date range<br>");
    timelineP.id("timelineP");
    //timelineP.style("background-color","black");
    minusStartDay = createSlider(-timeSince(created),-2,-timeSince(created));
    minusStartDay.mousePressed(clickObject);
    minusStartDay.input(minusStartDayInput);
    minusStartDay.parent(timelineP);
    minusStartDay.id("#minusStartDay");
    minusStartDay.style("width","40%");
    feed1 = createDiv(dateFromSince(-minusStartDay.value(),true));
    feed1.parent(timelineP);
    feed1.id("feed1");

    endDay = createSlider(-timeSince(created)+1,-1,-1);
    endDay.mousePressed(clickObject);
    endDay.input(endDayInput);
    endDay.parent(timelineP);
    endDay.id("#endDay");
    endDay.style("width","40%");
    feed2 = createDiv(dateFromSince(-endDay.value(),true));
    feed2.parent(timelineP);
    feed2.id("feed2");

    movie = createRadio();
    movie.mousePressed(clickObject);
    movie.option("Still",0);
    movie.option("Timeline",1);
    movie.value(1);
    movie.parent(timelineP);

    let but = createButton("Run");
    but.parent(timelineP);
    but.mousePressed(runSketch);

    styles();
  }
}

function selectProfile() {
  objectClicked = true;
  type = split(this.elt.value,",")[0];
  created = new Date(split(this.elt.value,",")[1]);
  //console.log(type);
  //console.log(timeSince(created));
  selectedProfile = this.elt.id;
  profilesP.hide();
}

function minusStartDayInput() {
  //console.log(endDay.value());
  if (endDay.value()<minusStartDay.value()) {
    endDay.value(minusStartDay.value()+1);
    feed2.html(dateFromSince(-endDay.value(),true));
  }
  feed1.html(dateFromSince(-minusStartDay.value(),true));
}

function endDayInput() {
  if (endDay.value()<minusStartDay.value()) {
    endDay.value(minusStartDay.value()+1);
  }
  feed2.html(dateFromSince(-endDay.value(),true));
}

function runSketch() {
  objectClicked = true;
  if (Number(movie.value()) === 0) {
    initialPointSize = 1;
    initialAlphaLevel = 5;
  }
  let timelineP = select("#timelineP");
  timelineP.hide();
  if (local) {
    loadJSON("/local/"+frame+".json",assign);
  } else {
    queryCoreReportingApi(selectedProfile);
  }
}

  function queryCoreReportingApi(profileId) {
  // Query the Core Reporting API for the number sessions for
  let dimension = "deviceCategory";
  if (type === "APP") {
    dimension = "appId";
  }
   let daysAgo = -minusStartDay.value()-frame;
 gapi.client.analytics.data.ga.get({
    'ids': 'ga:' + profileId,
    'start-date': (daysAgo+1)+'daysAgo',
    'end-date': (daysAgo)+'daysAgo',
    'metrics': 'ga:sessions',//sessionDuration
    'dimensions':'ga:latitude,ga:longitude,ga:'+dimension,//,ga:appId',ga:deviceCategory
    'max-results':10000
  })
  .then(formatResponse)
  .then(null, function(err) {
      // Log any errors.
      errorCount++
      if (errorCount < 5) {
        setTimeout(recallCore,30000);
      } else {
        if (err) console.log(err);
        let errb = createP("Error. Please retry");
        errb.addClass("setupB");
        errb.addClass("error");
        styles();
      }
  });
}

function recallCore() {
  queryCoreReportingApi(selectedProfile);
}

let errorCount = 0;

function formatResponse(response) {
  //console.log(response);
  if (preLocal)  save(response, frame+".json");//save for offline testing
  if (response) {
    let prelocations = response.result.rows.filter(function(row) {
      return (Number(row[1]) !== 0 && Number(row[0]) !== 0);
    });
    locations.push(prelocations);
    paintMap(true);
  } else {
    console.log("Error. No response");
    let err = createP("Error. Please retry");
    err.addClass("setupB");
    err.addClass("error");
    styles();
  }
}

// Add an event listener to the 'auth-button'.
function timeSince(date) {
  let seconds = Math.floor((new Date() - date) / 1000);
  let interval = Math.floor(seconds / 86400);
  return interval;
}

function dateFromSince(since,slashes) {
  let d = new Date();
  d.setDate(d.getDate()-since);
  let date = slashes ? (d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear()) : (nf(d.getFullYear(),4)+nf((d.getMonth()+1),2)+nf(d.getDate(),2));
  return date;
}

//canvaas resize, reprint if draing and done but not paintFromdraw
function windowResized() {//doing strange things
  if (windowWidth !== ww) {
    ww = windowWidth;
    hh = windowWidth*(512/1024);//512*85/160;
    resizeCanvas(ww,hh);
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
}

function styles() {//
  let p = selectAll("P");
  for (let i=0;i<p.length;i++) {
    p[i].style("font-size",height/50+"px");
    if (!p[i].class().includes("unselectable")) p[i].addClass("unselectable");
  }

  for (let i=0;i<labelDivs.length;i++) {
    labelDivs[i].style("margin",height/300+"px");
  }
  let but = selectAll("button");
  for (let i=0;i<but.length;i++) {
    but[i].style("font-size",height/40+"px");
    but[i].style("margin",height/300+"px");

    but[i].style("padding",height/1000+"px");

    if (!but[i].class().includes("unselectable")) but[i].addClass("unselectable");
  }
  let sBut = selectAll(".setupB");
  for (let i=0;i<sBut.length;i++) {
    sBut[i].style("margin-left",height/200+"px");
    sBut[i].addClass("unselectable");
  }

  let h = selectAll("h2");
  for (let i=0;i<h.length;i++) {
    h[i].style("font-size",height/20+"px");
    if (!h[i].class().includes("unselectable")) h[i].addClass("unselectable");
  }
  let r = selectAll("radio");
  for (let i=0;i<r.length;i++) {
    //r[i].style('transform','scale('height/1000+')');
    if (!r[i].class().includes("unselectable")) r[i].addClass("unselectable");
  }
  let s = selectAll("slider");
  for (let i=0;i<s.length;i++) {
    //s[i].style("cursor","pointer");
    if (!s[i].class().includes("unselectable")) s[i].addClass("unselectable");
  }
  let b = selectAll("br");
  for (let i=0;i<b.length;i++) {
    b[i].style("line-height",height/80+"px");
    if (!b[i].class().includes("unselectable")) b[i].addClass("unselectable");
  }
  let l = selectAll("label");
  for (let i=0;i<l.length;i++) {
    l[i].style("font-size",height/70+"px");
    l[i].style("color","white");
    if (!b[i].class().includes("unselectable")) b[i].addClass("unselectable");
  }
}

function setZoom() {
  doRefreshMap = true;
  zoom = zoomLevel.value()/100;
  zoom = constrain(zoom,1,10);
}

function refreshZoom() {
  zoom = constrain(zoom,1,10);
  zoomLevel.value(zoom*100);
}

////////////////Web Mercator equations inspired by: https://github.com/CodingTrain/Rainbow-Code/blob/33d7b7508f3f92df807efa8ae1036b924c7bec97/CodingChallenges/CC_57_Earthquake_Viz/sketch.js
function webMercX(lon, zoom) {
  lon = radians(lon);
  let w = height / 2;
  let a = (w / PI) * pow(2, zoom);
  let b = (lon + PI);
  let x = a * b;
  return x;
}

function webMercY(lat, zoom) {
  lat = radians(lat);
  let w = height / 2;
  let a = (w / PI) * pow(2, zoom);
  let c = tan(PI / 4 + lat / 2);
  let b = PI - log(c);
  let y = a * b;
  //console.log("y:"+y);
  return y;
}

function inverseWebMercX(x,zoom) {
    let w = height / 2;
    let a = (w / PI) * pow(2, zoom);
    let b = x/a;
    let lon = b-PI;
    lon = degrees(lon);
    return lon;
}

function inverseWebMercY(y,zoom) {
  let w = height / 2;
  let a = (w / PI) * pow(2, zoom);
  let b = (y/a);
  let c = exp(PI-b);
  let lat = (atan(c) - (PI / 4))*2;
  lat = degrees(lat);
  return lat;
}

//for development
let preLocal = false;//save json files locally for testing
let local = false;
function assign(response) {
  locations[frame] = response.result.rows;
  paintMap(true);
}
