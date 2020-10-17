$('document').ready(function() {

  var defaultColors = ColorSet.slice(0,100);

  var drawNoDataImage = function(canvasElement) {
    var ctx = canvasElement[0].getContext("2d");
    ctx.canvas.height = 500;
    var img = new Image();
    img.src = "/images/no_data_graph.jpg";
    img.onload = function() {
      ctx.drawImage(img, (canvasElement.width() - img.width) / 2, (canvasElement.height()-img.height)/2);
    }
    canvasElement.addClass("center-block");
  };

  Chart.defaults.global.defaultFontSize = 13;
  Chart.defaults.global.maintainAspectRatio = false;

  /**
   * chartData index
   * 1:  msgByNick
   * 2:  msgByDay
   * 3   msgByTimeOfDay
   * 4:  msgContainingSearchText
   * 5:  mostPostedSites
   * 6:  mostActiveDays
   * 7:  kicksByNick
   * 8:  emotesByNick
   * 9:  avgMsgLenByNick
   * 11: leastActiveDays
   * 12: mostDistinctPostDays
   */


  /**
   * MESSAGES BY USER - DOUGHNUT CHART AND TABLE
   */
  $.ajax({
    method: "GET",
    url: "stats",
    data: { chartData: 1 },
    dataType: "json",
    success: function( rows ) {
      if (rows.length == 0) return drawNoDataImage($("#chartMsgByNick"));
      var labels = [], data=[];
      rows.forEach(function( row ) {
        labels.push( row.nick );
        data.push( row.num );
      });
      var myChart = new Chart( $( "#chartMsgByNick" ), {
        type: "doughnut",
        data: {
          labels: labels.slice(0,10),
          datasets: [{
            data: data.slice(0,10),
            backgroundColor: defaultColors
          }]
        }
      });

      $("#tableMsgByNick").DataTable({
        data: rows,
        columns: [
          { data: "nick" },
          { data: "num" }
        ],
        order: [[ 1, "desc" ], [0, "asc"]],
        paging: true,
        pagingType: "full",
        ordering: true,
        searching: true,
        true: false
      });
      $("#tableMsgByNick_length").hide()

    }
  });


  /**
   * MESSAGES BY DATE - LINE CHART
   */
  $.ajax({
    method: "GET",
    url: "stats",
    data: { chartData: 2 },
    dataType: "json",
    success: function( rows ) {
      if (rows.length == 0) return drawNoDataImage($("#chartMsgByDay"));
      var data = [], dates=[], nicks={};
      rows.forEach(function( row ) {
        if (!nicks.hasOwnProperty(row.nick)) {
          nicks[row.nick] = {};
        }
        nicks[row.nick][moment(row.postedAtDate).format("YYYY.MM.DD")] = row.num
      });
      var date = moment(rows[0].postedAtDate);
      while (date <= moment()) {
        dates.push(date.format("YYYY.MM.DD"));
        date.add(1, 'd');
      }
      var nickArr = Object.keys(nicks).sort();
      dates.forEach(function( date ) {
        nickArr.forEach(function ( nick ) {
          if (!data.hasOwnProperty(nick)) {
            data[nick] = { numMsgData: [] };
          }
          if (nicks[nick].hasOwnProperty(date)) {
            data[nick].numMsgData.push( nicks[nick][date] );
          } else {
            data[nick].numMsgData.push( "0" );
          }
        });
      });
      var datasets = [{
        label: "Total",
        data: data["0total"].numMsgData,
        borderColor: defaultColors[0],
        backgroundColor: defaultColors[0],
        fill: false,
        pointBorderWidth: 1,
        lineTension: 0.2,
        borderWidth: 2,
        pointRadius: 0,
        pointHitRadius: 10
      }];
      nickArr.slice(1).forEach(function( nick, index ) {
        datasets.push({
          label: nick,
          data: data[nick].numMsgData,
          borderColor: defaultColors[index+1],
          backgroundColor: defaultColors[index+1],
          fill: false,
          pointBorderWidth: 1,
          lineTension: 0.2,
          borderWidth: 2,
          pointRadius: 0,
          pointHitRadius: 10,
          hidden: true
        });
      });
      var myChart = new Chart( $( "#chartMsgByDay" ), {
        type: "line",
        data: {
          labels: Array.from(dates),
          datasets: JSON.parse(JSON.stringify(datasets)),
        },
        options: {
          tooltips: {
            mode: 'label'
          },
          scales: {
            xAxes: [{
              type: 'time',
              time: {
                parser: 'YYYY.MM.DD',
                tooltipFormat: "MMMM Do YYYY",
              }
            }]
          },
        }
      });
      myChart._formattedData = {
        datasets: datasets,
        nickArr: nickArr,
        dates: Array.from(dates)
      }
      window.chartMsgByDay = myChart;
    }
  });

  $("#daterange").daterangepicker({
    locale: {
      format: "YYYY.MM.DD",
    },
    ranges: {
      "All time": [moment("2015-01-01"), moment()],
      "Last 7 Days": [moment().subtract(6, "days"), moment()],
      "Last 30 Days": [moment().subtract(29, "days"), moment()],
      "This Month": [moment().startOf("month"), moment().endOf("month")],
      "This Year": [moment().startOf("year"), moment().endOf("year")],
      "Last Month": [moment().subtract(1, "month").startOf("month"), moment().subtract(1, "month").endOf("month")],
      "Last Year": [moment().subtract(1, "year").startOf("year"), moment().subtract(1, "year").endOf("year")]
    },
    startDate: moment("2015-01-01"),
    endDate: moment()
  });

  $("#daterange").on("apply.daterangepicker", function(ev, picker) {
    var chart = window.chartMsgByDay;
    var newStartIndex = chart._formattedData.dates.indexOf(picker.startDate.format("YYYY.MM.DD"));
    var newEndIndex = chart._formattedData.dates.indexOf(picker.endDate.format("YYYY.MM.DD"));
    newStartIndex = newStartIndex < 0 ? 0 : newStartIndex;
    newEndIndex = newEndIndex < 0 ? chart._formattedData.dates.length : newEndIndex;
    chart.data.datasets.forEach(function( nick, index ) {
      nick.data = chart._formattedData.datasets[index].data.slice(newStartIndex, newEndIndex+1);
    });
    chart.data.labels = chart._formattedData.dates.slice(newStartIndex, newEndIndex+1);
    chart.update();
  });


  /**
   * MESSAGES BY TIME OF DAY - BAR CHART
   */
  $.ajax({
    method: "GET",
    url: "stats",
    data: { chartData: 3 },
    dataType: "json",
    success: function( rows ) {
      if (rows.length == 0) return drawNoDataImage($("#chartMsgByTimeOfDay"));
      var labels = [], data=[];
      for (var i = 0; i < 24; i++) {
        labels.push(i);
        data.push(0);
      }
      rows.forEach(function( row ) {
        data[row.h] = row.count;
      });
      var myChart = new Chart( $( "#chartMsgByTimeOfDay" ), {
        type: "bar",
        data: {
          /*
          labels: [
            "00:00:00 - 02:59:59",
            "03:00:00 - 05:59:59",
            "06:00:00 - 08:59:59",
            "09:00:00 - 11:59:59",
            "12:00:00 - 14:59:59",
            "15:00:00 - 17:59:59",
            "18:00:00 - 20:59:59",
            "21:00:00 - 23:59:59"
          ],
          */
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: defaultColors[1],
            borderWidth: 2,
            borderColor: defaultColors[9]
          }]
        },
        options: {
          legend: {
            display: false
          }
        }
      });
    }
  });


  /**
   * MESSAGE CONTAINING SEARCHTEXT - TABLE
   */
  $.ajax({
    method: "GET",
    url: "stats",
    data: {
      chartData: 4,
      searchText: ''
    },
    dataType: "json",
    success: function( rows ) {
      $("#tableMsgContainingSearchText").DataTable({
        data: rows,
        columns: [
          { data: "nick" },
          { data: "num" },
        ],
        order: [[ 1, "desc" ], [0, "asc"]],
        columnDefs: [{
          width: "50%",
          targets: "_all"
        }],
        paging: true,
        ordering: true,
        searching: false,
        info: false,
        footerCallback: function ( row, data, start, end, display ) {
          var api = this.api(), data;
          // Remove the formatting to get integer data for summation
          var intVal = function ( i ) {
            return typeof i === "string" ?
              i.replace(/[\$,]/g, "")*1 :
              typeof i === "number" ? i : 0;
          };
          total = api
              .column( 1 )
              .data()
              .reduce( function (a, b) {
                  return intVal(a) + intVal(b);
              }, 0 );
          $( api.column( 1 ).footer() ).html(total);
        }
      });
      $("#tableMsgContainingSearchText_length").hide()
    }
  });

  $("#formSearchText").submit(function(event) {
    event.preventDefault();
    $.ajax({
      method: "GET",
      url: "stats",
      data: {
        chartData: 4,
        searchText: $("#searchText").val(),
      },
      dataType: "json",
      success: function( rows ) {
        var datatable = $("#tableMsgContainingSearchText").dataTable().api();
        datatable.clear()
        datatable.rows.add(rows);
        datatable.draw();
      }
    });
  });


  /**
   * MOST POSTED SITES - PIE CHART AND TABLE
   */
  $.ajax({
    method: "GET",
    url: "stats",
    data: { chartData: 5 },
    dataType: "json",
    success: function( rows ) {
      if (rows.length == 0) return drawNoDataImage($("#chartMostPostedSites"));
      var labels = [], data=[];
      rows.forEach(function( row ) {
        labels.push( row.domain_name );
        data.push( row.count );
      });

      var myChart5 = new Chart( $( "#chartMostPostedSites" ), {
        type: "pie",
        data: {
          labels: labels.slice(0,10),
          datasets: [{
            data: data.slice(0,10),
            backgroundColor: defaultColors
          }]
        }
      });

      $("#tableMostPostedSites").DataTable({
        data: rows,
        columns: [
          { data: "domain_name" },
          { data: "count" }
        ],
        order: [[ 1, "desc" ], [0, "asc"]],
        paging: true,
        pagingType: "full",
        ordering: true,
        searching: true,
        true: false
      });
      $("#tableMostPostedSites_length").hide()
    }
  });


  /**
   * MOST ACTIVE DAYS - TABLE
   */
  $.ajax({
    method: "GET",
    url: "stats",
    data: { chartData: 6 },
    dataType: "json",
    success: function( rows ) {
      rows.forEach(function( row, index ) {
        rows[index].link = `<a href='date/${ moment(row.postedAtDate).format("YYYY-MM-DD") }'>Go to date</a>`;
        rows[index].dateString = moment(row.postedAtDate).format("Do of MMMM YYYY");
      });
      $("#tableMostActiveDays").DataTable({
        data: rows,
        columns: [
          { data: "dateString" },
          { data: "num" },
          { data: "link" }
        ],
        paging: false,
        ordering: false,
        searching: false,
        info: false
      });
    }
  });


  /**
   * LEAST ACTIVE DAYS - TABLE
   */
  $.ajax({
    method: "GET",
    url: "stats",
    data: { chartData: 11 },
    dataType: "json",
    success: function( rows ) {
      rows.forEach(function( row, index ) {
        rows[index].link = `<a href='date/${ moment(row.postedAtDate).format("YYYY-MM-DD") }'>Go to date</a>`;
        rows[index].dateString = moment(row.postedAtDate).format("Do of MMMM YYYY");
      });
      $("#tableLeastActiveDays").DataTable({
        data: rows,
        columns: [
          { data: "dateString" },
          { data: "num" },
          { data: "link" }
        ],
        paging: false,
        ordering: false,
        searching: false,
        info: false
      });
    }
  });


  /**
   * KICKS BY NICK - DOUGHNUT CHART
   */
  $.ajax({
    method: "GET",
    url: "stats",
    data: { chartData: 7 },
    dataType: "json",
    success: function( rows ) {
      if (rows.length == 0) return drawNoDataImage($("#chartKicksByNick"));
      var labels = [], data=[];
      rows.forEach(function( row ) {
        labels.push( row.nick );
        data.push( row.num );
      });
      var myChart = new Chart( $( "#chartKicksByNick" ), {
        type: "doughnut",
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: defaultColors
          }]
        }
      });
    }
  });


  /**
   * EMOTES BY NICK - DOUGHNUT CHART
   */
  $.ajax({
    method: "GET",
    url: "stats",
    data: { chartData: 8 },
    dataType: "json",
    success: function( rows ) {
      if (rows.length == 0) return drawNoDataImage($("#chartEmotesByNick"));
      var labels = [], data=[];
      rows.forEach(function( row ) {
        labels.push( row.nick );
        data.push( row.num );
      });
      var myChart = new Chart( $( "#chartEmotesByNick" ), {
        type: "doughnut",
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: defaultColors
          }]
        }
      });
    }
  });


  /**
   * AVERAGE MESSAGE LENGTH BY NICK - TABLE
   */
  $.ajax({
    method: "GET",
    url: "stats",
    data: { chartData: 9 },
    dataType: "json",
    success: function( rows ) {
      var total = rows.pop();
      var table = $("#tableAvgMsgLenByNick").DataTable({
        data: rows,
        columns: [
          { data: "nick" },
          { data: "len" },
        ],
        order: [[ 1, "desc" ], [0, "asc"]],
        columnDefs: [{
          width: "50%",
          targets: "_all"
        }],
        paging: true,
        pagingType: "full",
        ordering: true,
        searching: true,
        info: true
      });
      $( table.column( 1 ).footer() ).html(total.len);
    }
  });


  /**
   * MOST DISTINCT POST DAYS - TABLE
   */
  $.ajax({
    method: "GET",
    url: "stats",
    data: { chartData: 12 },
    dataType: "json",
    success: function( rows ) {
      var total = rows.pop();
      var table = $("#tableMostDistinctPostDays").DataTable({
        data: rows,
        columns: [
          { data: "nick" },
          { data: "count" },
        ],
        order: [[ 1, "desc" ], [0, "asc"]],
        columnDefs: [{
          width: "50%",
          targets: "_all"
        }],
        paging: true,
        pagingType: "full",
        ordering: true,
        searching: true,
        info: true
      });
      $( table.column( 1 ).footer() ).html(total.count);
    }
  });

});