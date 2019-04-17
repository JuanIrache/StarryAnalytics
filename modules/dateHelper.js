var dateHelper;
function setDateHelper() {
  dateHelper = (function() {
    return {
      daysSinceDate: function(date) {
        var seconds = Math.floor((new Date() - date) / 1000);
        var interval = Math.floor(seconds / 86400);
        return -interval;
      },
      dateDaysAgo: function(days, slashes) {
        var d = new Date();
        d.setDate(d.getDate() - days);
        var date = slashes
          ? d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear()
          : nf(d.getFullYear(), 4) + nf(d.getMonth() + 1, 2) + nf(d.getDate(), 2);
        return date;
      }
    };
  })();
}
setDateHelper();
