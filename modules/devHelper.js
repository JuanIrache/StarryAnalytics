var devHelper;
function setDevHelper() {
  devHelper = function() {
    //for development
    return {
      preLocal:false,//save json files locally for testing
      local:false,
    }
  }();
}
setDevHelper();
