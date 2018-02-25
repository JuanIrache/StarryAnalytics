var dateHelper;
function setDateHelper() {
  dateHelper = function() {
    return {
      daysSinceDate:function(date) {
        let seconds = Math.floor((new Date() - date) / 1000);
        let interval = Math.floor(seconds / 86400);
        return -interval;
      },
      dateDaysAgo:function(days,slashes) {
        let d = new Date();
        d.setDate(d.getDate()-days);
        let date = slashes ? (d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear()) : (nf(d.getFullYear(),4)+nf((d.getMonth()+1),2)+nf(d.getDate(),2));
        return date;
      }
    }
  }();
}
setDateHelper();
