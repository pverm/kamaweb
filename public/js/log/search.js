$(function() {

  $('#timerange').daterangepicker({
    locale: {
      format: "MMMM D, YYYY",
    },
    ranges: {
      'All time': [moment('2015-01-01'), moment()],
      'Today': [moment(), moment()],
      'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
      'Last 7 Days': [moment().subtract(6, 'days'), moment()],
      'Last 30 Days': [moment().subtract(29, 'days'), moment()],
      'This Month': [moment().startOf('month'), moment().endOf('month')],
      'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    },
    startDate: moment('2015-01-01'),
    endDate: moment()
  });
  
  $('#btn-search').click(function() {
    $('#result').html('');
    $('#searchInfo').html('Searching...');
    $.ajax({
      type: "POST",
      url: "search",
      data: {
        nick: $("#nick").val(),
        searchtext: $("#searchtext").val(),
        start: $("#timerange").data().daterangepicker.startDate._d,
        end: $("#timerange").data().daterangepicker.endDate._d
      },
      success: function(data) {
        var tbody;
        data.searchResult.forEach(function(e) {
          var dateStr = moment(e.postedAtDate).format('YYYY-MM-DD')
          tbody += `<tr><td><a href="date/${dateStr}?jump=msg-${e.id}">${dateStr}</a></td>`;
          tbody += `<td>${moment(e.postedAt).format('HH:mm:ss')}</td>`;
          tbody += `<td>${e.nick}</td>`;
          tbody += `<td>${e.text}</td></tr>`;
        });
        $('#searchInfo').html(`${data.searchResult.length} result${(data.searchResult.length == 1) ? '' : 's'}`);
        $("#result").html(tbody);
      }
    });
  });
  
});

