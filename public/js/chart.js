$(document).ready(function () {
  // Fetch the chart data from the backend
  $.get("/admin/charts-data", function (data) {
    // Render the Status Pie Chart
    $.plot($("#pie"), data.chartData, {
      series: {
        pie: {
          show: true,
          label: {
            show: true,
            radius: 3 / 4,
            formatter: function (label, series) {
              return (
                '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">' +
                '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">' +
                label +
                "<br/>" +
                series.data[0][1] +
                " Tickets</div>" +
                Math.round(series.percent) +
                "%</div>"
              );
            },
            background: {
              opacity: 0.5,
              color: "#000",
            },
          },
          innerRadius: 0.2,
        },
      },
      legend: {
        show: false,
      },
    });

    // Render the Type Pie Chart
    $.plot($("#type-chart"), data.typeData, {
      series: {
        pie: {
          show: true,
          label: {
            show: true,
            radius: 3 / 4,
            formatter: function (label, series) {
              return (
                '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">' +
                '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">' +
                label +
                "<br/>" +
                series.data[0][1] +
                " Tickets</div>" +
                Math.round(series.percent) +
                "%</div>"
              );
            },
            background: {
              opacity: 0.5,
              color: "#000",
            },
          },
          innerRadius: 0.2,
        },
      },
      legend: {
        show: false,
      },
    });

    // Render the Project Pie Chart
    $.plot($("#project-chart"), data.projectData, {
      series: {
        pie: {
          show: true,
          label: {
            show: true,
            radius: 3 / 4,
            formatter: function (label, series) {
              return (
                '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">' +
                '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">' +
                label +
                "<br/>" +
                series.data[0][1] +
                " Tickets</div>" +
                Math.round(series.percent) +
                "%</div>"
              );
            },
            background: {
              opacity: 0.5,
              color: "#000",
            },
          },
          innerRadius: 0.2,
        },
      },
      legend: {
        show: false,
      },
    });

    // Render the User Pie Chart
    $.plot($("#user-chart"), data.userData, {
      series: {
        pie: {
          show: true,
          label: {
            show: true,
            radius: 3 / 4,
            formatter: function (label, series) {
              return (
                '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">' +
                '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">' +
                label +
                "<br/>" +
                series.data[0][1] +
                " Tickets</div>" +
                Math.round(series.percent) +
                "%</div>"
              );
            },
            background: {
              opacity: 0.5,
              color: "#000",
            },
          },
          innerRadius: 0.2,
        },
      },
      legend: {
        show: false,
      },
    });
  });
});
