import './scss/style.scss';       // Import required for Webpack to compile
import Chart from 'chart.js';
const moment = require('moment');
moment().format();

const stepsChartId = document.getElementById('stepsChart');
const stepsChart = new Chart(stepsChartId, {
  // The type of chart we want to create
  type: 'bar',

  // The data for our dataset
  data: {
    labels: ["Jun 1", "Jun 2", "Jun 3", "Jun 4", "Jun 5", "Jun 6", "Jun 7"],
    display: true,
    datasets: [{
      label: "Steps Taken",
      backgroundColor: 'rgba(77,182,172, 1)',
      borderColor: 'rgb(77,182,172)',
      borderWidth: 3,
      data: [11259, 9320, 8309, 9347, 10238, 9830, 8836],
      hoverRadius: 3,
      radius: 2,
      lineTension: 0
    }]
  },

  // Configuration options go here
  options: {
    layout: {
      padding: 10
    },
    legend: {
      labels: {
        // This more specific font property overrides the global property
        fontColor: 'black',
        fontFamily: "'Montserrat', sans-serif",
      }
    },
    scales: {
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Steps'
        },
        ticks: {
          stepSize: 5000
        }
      }]
    },
    title: {
      display: true,
      text: 'Steps'
    }
  }
});

const sleepChartId = document.getElementById("sleepChart");
const sleepChart = new Chart(sleepChartId, {
  type: 'doughnut',
  data: {
    labels: ["Sleep", ""],
    datasets: [{
      label: 'Sleep',
      data: [7, 5],
      backgroundColor: [
        'rgba(75, 192, 192, .8)',
      ],
    }]
  },
  options: {
    layout: {
      padding: 20
    },
  }
});

const weightChartId = document.getElementById("weightChart");
const weightChart = new Chart(weightChartId, {
  type: 'doughnut',
  data: {
    labels: ["Weight", ""],
    datasets: [{
      label: 'Weight',
      data: [7, 5],
      backgroundColor: [
        'rgba(75, 192, 192, .8)',
      ],
    }]
  },
  options: {
    layout: {
      padding: 20
    },
    title: {
      display: true,
      text: 'Current Weight'
    }
  }
});

let distance = 2.0;
let max = 3.0;

const distanceChartId = document.getElementById("distanceChart");
const distanceChart = new Chart(distanceChartId, {
  type: 'horizontalBar',
  data: {
    labels: ["", ""],
    datasets: [{
      // label: 'Distance',
      data: [distance],
      backgroundColor: 'rgba(75, 192, 192, .8)'
    }, {
      data: [max - distance],
      backgroundColor: 'rgba(0, 0, 0, .1)'
    }]
  },
  options: {
    layout: {
      padding: 10
    },
    scales: {
      xAxes: [{
        display: false,
        stacked: true
      }],
      yAxes: [{
        ticks: {
          beginAtZero: true,
          stepSize: 1
        },
        display: false,
        stacked: true
      }]
    },
    title: {
      display: true,
      text: 'Distance Traveled'
    }
  }
});