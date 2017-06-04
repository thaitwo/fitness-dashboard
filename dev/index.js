import Chart from 'chart.js';

var ctx = document.getElementById('myChart').getContext('2d');
var chart = new Chart(ctx, {
  // The type of chart we want to create
  type: 'line',

  // The data for our dataset
  data: {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [{
        label: "Steps Taken",
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: [0, 10, 5, 2, 20, 30, 45],
    }]
  },

  // Configuration options go here
  options: {
    layout: {
      padding: {
        left: 200,
        right: 200,
        top: 0,
        bottom: 200
      }
    },
    title: {
      display: true,
      text: 'Steps'
    }
  }
});