var urlPattern = /((?:(?:https?)|(?:ftp)):\/\/)?((?:[\da-zA-Z.-]+)\.(?:[a-zA-Z]{2,6})(?::[0-9]*)?(?:[\/\-+-?_%~&?#a-zA-Z]*)*\/?)/gm;
function highlightURL(message) {
  var highlighted = message.replace(urlPattern, function(match, p1, p2) {
    if (p1)
      return '<a href="' + match + '" target="_blank">' + match + '</a>';
    else
      return '<a href="//' + p2 + '" target="_blank">' + match + '</a>';
  });
  return highlighted;
}

$(document).ready(function() {

  //if (document.documentElement.scrollTop === 0)
  //  window.scrollTo(0,document.body.scrollHeight);

  // insert links and colors into log
  $('.log-text').each(function() {
    var result = URI.withinString($(this).html(), function(url) {
      var uri = new URI(url);
      uri.normalize();
      return '<a href="' + uri + '" target="_blank">' + uri.readable() + '</a>'; 
    });
    $(this).html(textToColor(result));
  });

  // jump to linked message
  var jump = URI(window.location.href).query(true).jump;
  if (jump) {
    $("html, body").animate({ scrollTop: $('#'+jump).offset().top }, 1000);
  }

  // display message link
  $(".log-line").hover(function() {
    $(this).find(".loglink").css("visibility", "visible");
  }, function() {
    $(this).find(".loglink").css("visibility", "hidden");
  });

  // page elevatar
  var elevator = new Elevator({
    element: $(".elevator")[0],
    mainAudio: '/sounds/elevator2.mp3', // Music from http://www.bensound.com/
    endAudio:  '/sounds/ding.mp3'
  });

});
