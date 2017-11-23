
//TODO
//dates!
//datefeedback (only on stills?)
//auth button (reuse real and reposition)
//font Size
//look for brightest frame for still preview
//canvaas resize, reprint if not drawing and if draing and done but not paintfromdraw
//analoytics
//pages for more than 10000 results per queryReports NO
//signout
// github?
//Limit data to avoid penalties on site or google
// zoom into area
//add other metrics
var img;
var sliderP;
var palettesJSON;
var palette;
var intro;
var introB;
var saveCan = false;
var movie;
var can;
var drawing = false;
var frame = 0;
var initialPointSize = 3;
var initialAlphaLevel = 255/2;
var pointSize;
var alphaLevel;
var coloursButton;
var changeToStill;
var labelDivs = [];
var loadedP;
var takePhoto;
var playTimeline;
var feedbackFrame;
var stillButton;
var paintFromDraw;
var allSlider;
var labels = [];
var selectedAccount;
var profilesP;
var selectedProfile;
var endDay;
var minusStartDay;
var feed1;
var feed2;
var type;
var created;
var changeToMovie;
var loaded;
var feedback;

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
  var palettes = palettesJSON.palettes;
  palette = palettes[floor(random(0,palettes.length))];
  refreshLabels()

  intro = createElement("h2","Starry Analytics");
  introB = createP("Load your analytics data and play with the settings to create the world map of your users.<br>This is quite experimental, so expect bugs.<br>Can be quite slow when loading many dates or sessions.<br>Set points and opacity to low when creating stills. They will add up.<br>have fun and feel free to provide feedback.<br>");

  var auth = createButton("Authorize");
  auth.id("auth-button");
  //auth.hide();
  auth.parent(introB);
  document.getElementById('auth-button').addEventListener('click', authorize);

  image(img,0,0,width,height);
}

function refreshLabels() {
  if (labelDivs) {
    for (var i=0;i<labelDivs.length;i++) {
      //console.log(labelDivs[i]);
      labelDivs[i].style("color",palette[i]);
      labelDivs[i].style("font-weight","bold");
    }
  }
}

function draw() {

  if (!drawing)  {
    //background(0);
    image(img,0,0,width,height);
  }

  if (paintFromDraw) {
    updateFeedbackFrame();
    paintMap(true);
  }
}

function paintMap(advance) {

  if (!drawing) {

    blendMode(BLEND);
    background(0);

      let progress = frame/((endDay.value()-minusStartDay.value()));
      sliderP = createP("");
      feedback = createP("");
      loadedP = createP("");
      loadedP.class("sided");
  }
  /*
  //zoom
  if (mouseIsPressed) {
    zoom = constrain(zoom+.03,1,10);
  } else {
    zoom = constrain(zoom-.03,1,10);
  }
  clon = map(mouseX,0,width,-180,180);
  clat = map(mouseY,0,height,90,-90);
*/
  push();
  translate(width / 2, height / 2);
  if (movie.value()==1 || !drawing) {
    if (movie.value()==1) {
      blendMode(BLEND);
    }
    background(0);
  }
  intro.hide();
  introB.hide();
  drawing = true;
  //console.log(minusStartDay);

  blendMode(SCREEN);
  let alpha = initialAlphaLevel;
  if (alphaLevel) {
    alpha = alphaLevel.value();
  }
  let multiplier = initialPointSize;
  if (pointSize) {
    multiplier = pointSize.value()/10;
  }
  if (locations[frame] && locations[frame].length > 0) {
  for (let i=0;i<locations[frame].length;i++) {
    if (!(locations[frame][i][1]==0 && locations[frame][i][0]==0)) {
        var c = color(0);
          if (labels.indexOf(locations[frame][i][2])==-1) {
            labels.push(locations[frame][i][2]);
          } else {
          }

        labelColor = labels.indexOf(locations[frame][i][2]);

        if (labelColor == 0) {
          c = color(palette[0]);
        } else if (labelColor == 1) {
          c = color(palette[1]);
        } else if (labelColor == 2) {
          c = color(palette[2]);
        } else if (labelColor == 3) {
          c = color(palette[3]);
        } else if (labelColor == 4) {
          c = color(palette[4]);
        } else {
          c = color(255);
        }

        stroke (red(c),green(c),blue(c),alpha);
        var lon = locations[frame][i][1];
        var lat = locations[frame][i][0];
        var cx = mercX(clon);
        var cy = mercY(clat);

        var x = mercX(lon) - cx;
        var y = mercY(lat) - cy;
        // This addition fixes the case where the longitude is non-zero and
        // points can go off the screen.
        /*if(x < - width/2) {
          x += width;
        } else if(x > width / 2) {
          x -= width;
        }*/
        let units = (locations[frame][i][3])*multiplier;//(locations[i][3])*multiplier;//area / divided as user wants?
        //console.log(units);

        let diameter = (sqrt(units/PI)*2);
        strokeWeight(diameter);
        point(x,y);
      }
    }
  } else {
    console.log("Error. No locations for frame");
  }

  if (!loaded||movie.value()==0) {
    let progress = frame/((endDay.value()-minusStartDay.value()));
    feedback.html("Loading data "+round(progress*100)+"%");
  }

  if (saveCan) {
    saveCanvas(can,nf(frame,4),"png");
  }

  if (advance) {
    if (minusStartDay.value()+frame < endDay.value()) {
      frame++;
      if (loaded) {
      } else {
        queryCoreReportingApi(selectedProfile);
      }
    } else if (!loaded) {
      loaded = true;
      feedback.style("visibility","hidden");

      if (movie.value() == 1) {
        allSlider = createSlider(minusStartDay.value(),endDay.value(),endDay.value());
        allSlider.input(slideTimeline);
        allSlider.parent(sliderP);
        allSlider.style("width","90%");
        feedbackFrame = createDiv("");
        feedbackFrame.parent(loadedP);
        updateFeedbackFrame();//
      }
      var line = createDiv("<br>Point Size");
      line.parent(loadedP);

      pointSize = createSlider(10,1000,(initialPointSize*10));
      pointSize.parent(loadedP);
      pointSize.input(refreshMap);

      line = createDiv("<br>Opacity");
      line.parent(loadedP);

      alphaLevel = createSlider(1,255,initialAlphaLevel);
      alphaLevel.parent(loadedP);
      alphaLevel.input(refreshMap);

      line = createDiv("<br>");
      line.parent(loadedP);

      coloursButton = createButton("Random Colours");
      coloursButton.parent(loadedP);
      coloursButton.mousePressed(shuffleColours);

      line = createDiv("<br>");
      line.parent(loadedP);
      takePhoto = createButton("Photo");
      takePhoto.mousePressed(savePhoto);//
      takePhoto.parent(loadedP);
      loadLowButtons();

      line = createP("");
      line.parent(loadedP);
      line.class("sided");//
      for (let i=0; i<labels.length; i++) {
        labelDivs[i] = createDiv(labels[i]);
        labelDivs[i].id("label"+i);
        labelDivs[i].parent(line);
      }

      refreshLabels();

      if (movie.value() == 1) {
        showButtons(".still",false);
        showButtons(".movie",true);
        if (allSlider) allSlider.style("visibility","visible");
      } else {
        showButtons(".still",true);
        showButtons(".movie",false);
        if (allSlider) allSlider.style("visibility","hidden");
      }
    } else {
      paintFromDraw = false;
      if (movie.value() == 1) {
        showButtons(".still",false);
        showButtons(".movie",true);
        if (allSlider) allSlider.style("visibility","visible");
      } else {
        showButtons(".still",true);
        showButtons(".movie",false);
        if (allSlider) allSlider.style("visibility","hidden");
      }
      if (feedback) feedback.style("visibility","hidden");
    }
  }
  pop();
}

function movieToStill() {
  movie.value(0);
  redoStill();
  showButtons(".movie",false);
}

function stillToMovie() {
  movie.value(1);
  playTimelineStart();
  showButtons(".still",false);
}

function loadLowButtons() {
  line = createDiv("<br>");
  line.parent(loadedP);
  line.class("movie");
  playTimeline = createButton("Play");
  playTimeline.mousePressed(playTimelineStart);//
  playTimeline.parent(loadedP);
  playTimeline.class("movie");

  line = createDiv("<br>");
  line.parent(loadedP);
  line.class("movie");
  changeToStill = createButton("Change to Still");
  changeToStill.mousePressed(movieToStill);//
  changeToStill.parent(loadedP);
  changeToStill.class("movie");

  var line = createDiv("<br>");
  line.parent(loadedP);
  line.class("still");
  stillButton = createButton("Update result");
  stillButton.parent(loadedP);
  stillButton.mousePressed(redoStill);
  stillButton.class("still");

  line = createDiv("<br>");
  line.parent(loadedP);
  line.class("still");
  changeToMovie = createButton("Change to Timeline");
  changeToMovie.mousePressed(stillToMovie);//
  changeToMovie.parent(loadedP);
  changeToMovie.class("still");
}

function showButtons(s,vis) {
  var buttons = selectAll(s);
  for (var i=0; i<buttons.length;i++) {
    if (vis) {
      buttons[i].show();
    } else {
      buttons[i].hide();
    }
  }

  for (var i=0; i<labelDivs.length;i++) {
    if (vis) {
      labelDivs[i].show();
    } else {
      labelDivs[i].hide();
    }
  }
}

function shuffleColours() {
  var palettes = palettesJSON.palettes;
  palette = palettes[floor(random(0,palettes.length))];
  refreshLabels();
  refreshMap();
}

function playTimelineStart() {
  frame = 0;
  if (allSlider) allSlider.style("visibility","hidden");
  paintFromDraw = true;
  showButtons(".movie",false);
}

function refreshMap() {
  if (movie.value() == 0) {
    var remMovie = 0;
    movie.value(1);
  }
  if (!paintFromDraw) {
    paintMap(false);
  }
  if (remMovie == 0) {
    movie.value(0);
  }

}
function redoStill() {
  if (feedback) feedback.style("visibility","visible");
  background(0);
  showButtons(".still",false);
  frame = 0;
  if (allSlider) allSlider.style("visibility","hidden");
  paintFromDraw = true;
}

function savePhoto() {
  //aqui put watermark
  saveCanvas(can,nf(dateFromSince(minusStartDay.value()+frame,false),4),"png");
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
var CLIENT_ID = '347798334249-tf4endbgfnkh6670g5k5le0t5ljhv50j.apps.googleusercontent.com';
// Set authorized scope.
var SCOPES = ['https://www.googleapis.com/auth/analytics.readonly'];

function authorize(event) {
  // Handles the authorization flow.
  // `immediate` should be false when invoked from the button click.
  var useImmdiate = event ? false : true;
  var authData = {
    client_id: CLIENT_ID,
    scope: SCOPES,
    immediate: useImmdiate
  };

  gapi.auth.authorize(authData, function(response) {
    var authButton = document.getElementById('auth-button');
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
  gapi.client.analytics.management.accounts.list().then(handleAccounts);
});
}

function handleAccounts(response) {

  if (response.result.items && response.result.items.length) {
    var check = select("#accountsP");
    if (check == null) {
      var hidden = createDiv("");
      hidden.id("hidden");
      hidden.hide();
      let items = response.result.items;
      var accountsP = createP("Select Account<br>");
      accountsP.id("accountsP");
      if (items.length>1) {
        for (let i=0; i<items.length; i++) {
          var but = createButton(items[i].name);
          but.id(items[i].id);
          but.parent(accountsP);
          but.mousePressed(selectAccount);
        }
      } else {
        selectedAccount = items[0].id;
        queryProperties(selectedAccount);
      }
    }
  } else {
    createP('No accounts found for this user.');
  }
}

function selectAccount() {
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
    console.log(err);
});
}

function handleProperties(response) {

//console.log(response);
// Handles the response from the webproperties list method.
if (response.result.items && response.result.items.length) {
  let accountsP = select("#accountsP");
  accountsP.hide();
  let items = response.result.items;
  var propertiesP = createP("Select Property<br>");
  propertiesP.id("propertiesP");
  if (items.length > 1) {
    for (let i=0; i<items.length; i++) {
      var but = createButton(items[i].name);
      but.id(items[i].id);
      but.parent(propertiesP);
      but.mousePressed(selectProperty);
    }
  } else {
    selectedProperty = items[0].id;
    queryProfiles(selectedAccount, selectedProperty);
  }
    // Query for Views (Profiles).
    //queryProfiles(selectedAccountID, selectedPropertyId);
  } else {
    console.log('No properties found for this user.');
    createP('No properties found for this user');
  }
}

function selectProperty() {
  //console.log(this);
  selectedProperty = this.elt.id;
  queryProfiles(selectedAccount, selectedProperty);
}
var selectedProperty;

function queryProfiles(accountId, propertyId) {
//console.log(accountId);
gapi.client.analytics.management.profiles.list({
    'accountId': accountId,
    'webPropertyId': propertyId
})
.then(handleProfiles)
.then(null, function(err) {
    // Log any errors.
    console.log(err);
    createP("Error");
});
}

function handleProfiles(response) {
  //console.log(response);
// Handles the response from the profiles list method.
if (response.result.items && response.result.items.length) {

    let propertiesP = select("#propertiesP");
    propertiesP.hide();

    let items = response.result.items;
    profilesP = createP("Select Profile<br>");
    profilesP.id("profilesP");
    //profilesP.style("background-color","black");
    if (items.length > 1) {
      for (let i=0; i<items.length; i++) {
        var but = createButton(items[i].name,items[i].type+","+items[i].created);
        but.id(items[i].id);
        but.parent(profilesP);
        but.mousePressed(selectProfile);
      }
    } else {
      selectedProfile = items[0].id;
      type = items[0].type;
      created = new Date(items[0].created);
      timelineSettings();
    }
  } else {
    console.log('No views (profiles) found for this user.');
    createP("No views (profiles) found for this user.");
  }
}

function timelineSettings() {
  profilesP.hide();
  var timelineP = createP("Select date range<br>");
  timelineP.id("timelineP");
  //timelineP.style("background-color","black");
  minusStartDay = createSlider(-timeSince(created),0,-timeSince(created));
  minusStartDay.input(minusStartDayInput);
  minusStartDay.parent(timelineP);
  minusStartDay.id("#minusStartDay");
  minusStartDay.style("width","40%");
  feed1 = createDiv(dateFromSince(-minusStartDay.value(),true));
  feed1.parent(timelineP);
  feed1.id("feed1");

  endDay = createSlider(-timeSince(created),0,0);
  endDay.input(endDayInput);
  endDay.parent(timelineP);
  endDay.id("#endDay");
  endDay.style("width","40%");
  feed2 = createDiv(dateFromSince(-endDay.value(),true));
  feed2.parent(timelineP);
  feed2.id("feed2");

  movie = createRadio();
  movie.option("Still",0);
  movie.option("Timeline",1);
  movie.value(1);
  movie.parent(timelineP);

  var but = createButton("Run");
  but.parent(timelineP);
  but.mousePressed(runSketch);
}

function selectProfile() {
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
    endDay.value(minusStartDay.value());
  }
  feed1.html(dateFromSince(-minusStartDay.value(),true));
}

function endDayInput() {
  if (endDay.value()<minusStartDay.value()) {
    endDay.value(minusStartDay.value());
  }
  feed2.html(dateFromSince(-endDay.value()+1,true));
}

function runSketch() {
  if (movie.value() == 0) {
    initialPointSize = 1;
    initialAlphaLevel = 5;
  }
  let timelineP = select("#timelineP");
  timelineP.hide();
    queryCoreReportingApi(selectedProfile);
}

  function queryCoreReportingApi(profileId) {
  // Query the Core Reporting API for the number sessions for
  var dimension = "deviceCategory";
  if (type == "APP") {
    dimension = "appId";
  }
  var daysAgo = -minusStartDay.value()+frame;
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
      console.log(err);
      createP("Error");
  });
}

function formatResponse(response) {
  if (response) {
    locations.push(response.result.rows);
    //console.log(locations)
    paintMap(true);
  } else {
    console.log("Error. No response");
  }
}
var locations = [];

// Add an event listener to the 'auth-button'.

function timeSince(date) {
  var seconds = Math.floor((new Date() - date) / 1000);
  var interval = Math.floor(seconds / 86400);
  return interval;
}

function dateFromSince(since,slashes) {
  var d = new Date();
  d.setDate(d.getDate()-since);
  var date;
  if (slashes) {
    date = d.getDate()+"/"+d.getMonth()+"/"+d.getFullYear();
  } else {
    date = nf(d.getFullYear(),4)+nf(d.getMonth(),2)+nf(d.getDate(),2);
  }
  //console.log(date);
  return date;
}

/////////////////////////////////////////////////This section is mostly taken from Daniel Shiffman https://gist.github.com/shiffman/a0d2fde31f571163c730ba0da4a01c82
var clat = 0;
var clon = 0;
var ww;
var hh;//512*85/160;
var zoom = 1;

function mercX(lon) {
  //console.log("in "+lon);
  lon = radians(lon);
  var a = (hh/2 / PI) * pow(2, zoom);
  var b = lon + PI;
  //console.log("out "+a * b);
  return a * b;
}

function mercY(lat) {
  lat = radians(lat);
  var a = (hh/2 / PI) * pow(2, zoom);
  var b = tan(PI / 4 + lat / 2);
  var c = PI - log(b);
  return a * c;
}
/////////////////////////////////////////

/*function windowResized() {//doing strange things
  ww = windowWidth;
  hh = windowWidth*(512/1024);//512*85/160;
  resizeCanvas(ww,hh);
}*/
