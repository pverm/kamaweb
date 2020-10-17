$(document).ready(() => {
  $('#datepicker').datepicker({
    orientation: "bottom right"
  });
  $('#datepicker').datepicker()
    .on('changeDate', (e) => {
      let uri = new URI(window.location.href);
      let d = moment(e.date).format('YYYY-MM-DD');
      let segments = uri.segment().slice(0,3).concat(['date', d]);
      window.location.href = uri.segment(segments).toString();
    });
});