// Needs to be imported for webpack to compile SCSS files
import './scss/style.scss';
import Chart from 'chart.js';

const ctx = document.getElementById('myChart').getContext('2d');
const chart = new Chart(ctx, {
  // The type of chart we want to create
  type: 'line',

  // The data for our dataset
  data: {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [{
      label: "Steps Taken",
      backgroundColor: 'rgba(77,182,172, .2)',
      borderColor: 'rgb(77,182,172)',
      borderWidth: 3,
      data: [0, 10, 5, 8, 20, 23, 26],
      hoverRadius: 3,
      radius: 2,
      lineTension: 0
    }]
  },

  // Configuration options go here
  options: {
    layout: {
      padding: 50
    },
    legend: {
      labels: {
        // This more specific font property overrides the global property
        fontColor: 'black',
        fontFamily: "'Montserrat', sans-serif",
      }
    },
    // responsive: false,
    title: {
      display: true,
      text: 'Steps'
    }
  }
});

const chart2 = document.getElementById("chart2");
const myChart2 = new Chart(chart2, {
  type: 'doughnut',
  data: {
    labels: ["Green", "Blue", "Orange"],
    datasets: [{
      label: '# of Votes',
      data: [9, 2, 5],
      backgroundColor: [
        'rgba(75, 192, 192, .8)',
        'rgba(54, 162, 235, .8)',
        'rgba(255, 159, 64, .8)'
      ],
      // borderColor: [
      //   'rgba(255,99,132,1)',
      //   'rgba(54, 162, 235, 1)',
      //   'rgba(255, 206, 86, 1)',
      //   'rgba(75, 192, 192, 1)',
      //   'rgba(153, 102, 255, 1)',
      //   'rgba(255, 159, 64, 1)'
      // ],
      // borderWidth: 1
    }]
  },
  options: {
    layout: {
      padding: 20
    },
    // responsive: false,
    // scales: {
    //   yAxes: [{
    //     ticks: {
    //       beginAtZero:true
    //     }
    //   }]
    // }
  }
});