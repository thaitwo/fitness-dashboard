import './scss/style.scss';       // Import required for Webpack to compile
import Chart from 'chart.js';
// const moment = require('moment');
// moment().format();





/**********   STEPS CHART   **********/

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
      fill: false,
      backgroundColor: 'rgba(77,182,172, 1)',
      borderColor: 'rgb(77,182,172)',
      borderWidth: 3,
      data: [6059, 7320, 8209, 6347, 5238, 6830, 7836],
      hoverRadius: 3,
      radius: 2,
      lineTension: 0
    }]
  },

  // Configuration options go here
  options: {
    layout: {
      padding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      }
    },
    legend: {
      display: false,
      labels: {
        // This more specific font property overrides the global property
        fontColor: 'black',
        fontFamily: "'Montserrat', sans-serif",
      }
    },
    scales: {
      xAxes: [{
        barThickness: 40,
        gridLines : {
          display : false
        },
      }],
      yAxes: [{
        gridLines: {
          color: 'rgba(0,0,0,0.05)',
          drawBorder: false
        },
        ticks: {
          beginAtZero:true,
          min: 0,
          stepSize: 2000,
          suggestedMax: 10000,
          padding: 15
        }
      }]
    },
    title: {
      display: true,
      // text: 'Steps'
    }
  }
});

const weekly = ['5/1-5/7', '5/8-5/14', '5/15-5/21', '5/22-5/28', '5/29-6/4', '6/5-6/11'],
      weeklyData = [61059, 71320, 81209, 61347, 51238, 61830],
      monthly = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
      monthlyData = [61059, 71320, 81209, 61347, 51238, 61830, 71836, 71777, 81346, 72734, 82967, 78567],
      yearly = ['2015', '2016', '2017'],
      yearlyData = [61059, 71320, 81209];

function updateChart(currentChart, chartId, chartType, chartLabels = weekly, newData) {
  // let updatedChart;
  if (updatedChart) {
    updatedChart.destroy();
  }

  console.log(currentChart);

  // chartId.destroy();

  currentChart.destroy();
  const updatedChart = new Chart(chartId, {
    type: chartType,

    // The data for our dataset
    data: {
      labels: chartLabels,
      display: true,
      datasets: [{
        label: "Steps Taken",
        fill: false,
        backgroundColor: 'rgba(77,182,172, 1)',
        borderColor: 'rgb(77,182,172)',
        borderWidth: 3,
        data: newData,
        hoverRadius: 3,
        radius: 2,
        lineTension: 0
      }]
    },

    // Configuration options go here
    options: {
      layout: {
        padding: {
          top: 20,
          right: 20,
          bottom: 20,
          left: 20
        }
      },
      legend: {
        display: false,
        labels: {
          // This more specific font property overrides the global property
          fontColor: 'black',
          fontFamily: "'Montserrat', sans-serif",
        }
      },
      scales: {
        xAxes: [{
          barThickness: 40,
          gridLines : {
            display : false
          },
        }],
        yAxes: [{
          gridLines: {
            color: 'rgba(0,0,0,0.05)',
            drawBorder: false
          },
          ticks: {
            beginAtZero: true,
            min: 0,
            padding: 15
          }
        }]
      },
      title: {
        display: true,
        text: 'Yearly'
      }
    }
  });
}


const timeIntervalsId = document.querySelector('#time-intervals'),
      interval = timeIntervalsId.getElementsByTagName('li'),
      stepsCanvas = document.querySelector('canvas');


timeIntervalsId.addEventListener('click', function(event) {
  const id = event.target.id;

  if (event.target.tagName === 'LI') {

    switch(id) {
      case 'week':
        updateChart(stepsChart, stepsChartId, 'bar', weekly, weeklyData);
        break;
      case 'month':
        updateChart(stepsChart, stepsChartId, 'line', monthly, monthlyData);
        break;
      case 'year':
        updateChart(stepsChart, stepsChartId, 'bar', yearly, yearlyData);
        break;
      case 'all-time':
        updateChart(stepsChart, stepsChartId, 'bar');
        break;
      default:
        alert('Click a button')
    };

    // updateChart(stepsChart, stepsChartId, 'bar');
  }
  // const id = event.target.id;
  // console.log(id);
  // stepsData = newObject;
  // stepsCanvas.remove();
  // removeData(stepsChart);
  // addData(stepsChart, year, yearData);
})


/**********   SLEEP CHART   **********/

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
      borderWidth: 0,
      hoverBorderWidth: 0
    }]
  },
  options: {
    layout: {
      padding: 20
    },
    title: {
      display: true,
      text: 'Sleep'
    },
    legend: {
      display: false
    },
  }
});


/**********   WEIGHT CHART   **********/

const weightChartId = document.getElementById("weightChart");
const weightChart = new Chart(weightChartId, {
  type: 'line',
  data: {
    labels: ["Jun 1", "Jun 2", "Jun 3", "Jun 4", "Jun 5", "Jun 6", "Jun 7"],
    datasets: [
      {
        label: 'Weight',
        data: [156, 154, 154, 153, 152, 153, 151],
        backgroundColor: [
          'rgba(75, 192, 192, .3)',
        ],
        borderWidth: 0,
        hoverBorderWidth: 0,
        lineTension: 0.2
      }
    ]
  },
  options: {
    layout: {
      padding: 10
    },
    legend: {
      display: false
    },
    scales: {
      yAxes: [{
        ticks: {
          stepSize: 2
        },
      }]
    },
    tooltips: {
      enabled: false
    },
    title: {
      display: true,
      text: "Today's Weight"
    }
  }
});


/**********   DISTANCE CHART   **********/

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
      padding: {
        top: 10,
        right: 5,
        bottom: 0,
        left: 5
      }
    },
    legend: {
      display: false
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
    // responsive: false,
    tooltips: {
      enabled: false
    },
    title: {
      display: true,
      text: 'Distance Covered'
    }
  }
});