//////////////google data retrieving

var analyticsHelper;
function setAnalyticsHelper() {
  analyticsHelper = function() {
    const CLIENT_ID = 'CLIENT_ID';
    // Set authorized scope.
    const SCOPES = ['https://www.googleapis.com/auth/analytics.readonly'];
    let selectedProperty;
    let errorCount = 0;
    let selectedAccount;
    let selectedProfile;
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
          accountsP.parent(introB);
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
      mouseHelper.clickObject();
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
      mouseHelper.clickObject();
      //console.log(this);
      selectedProperty = this.elt.id;
      queryProfiles(selectedAccount, selectedProperty);
    }


    function queryProfiles(accountId, propertyId) {
    // console.log(accountId);
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

    function formatResponse(response) {
      //console.log(response);
      if (devHelper.preLocal)  save(response, frame+".json");//save for offline testing
      if (response) {
        let prelocations = []
        if (response.result.rows) {
          prelocations = response.result.rows.filter(function(row) {
            return (Number(row[1]) !== 0 && Number(row[0]) !== 0);
          });
        }
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

    return {
      assign:function(response) {//for development
        let prelocations = response.result.rows.filter(function(row) {
          return (Number(row[1]) !== 0 && Number(row[0]) !== 0);
        });
        locations[frame] = prelocations;
        paintMap(true);
      },
      authorize:function(event) {
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
      },
      queryProfile:function () {return queryCoreReportingApi(selectedProfile)},
      selectedProfile:function() {return selectedProfile},
      selectProfile:function(value) {selectedProfile = value;}
    }
  }();
};
setAnalyticsHelper();
