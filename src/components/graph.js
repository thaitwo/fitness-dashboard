import Chart from 'chart.js';

/**
* Graph Component
* @class
* @param {String} canvasId - The id of canvas to insert graph
* @param {Array} newData - Data to populate the graph
* @param {Array} newLabels - Array of labels for the dates
* @param {String} graphType (optional | default is line graph) - The type of graph to display
* @param {Object} options (optional) - Graph options
* @returns {Object}
*/

class Graph {
  constructor(canvasId, newData, newLabels, graphType, options) {
    this.canvasId = canvasId;
    this.graphType = graphType || 'line';

    this.data = {
      labels: newLabels,
      display: true,
      datasets: [{
        backgroundColor: 'rgba(249,168,37, .2)',
        borderColor: 'rgba(249,168,37, 1)',
        borderWidth: 2,
        data: newData,
        hoverRadius: 12,
        pointBackgroundColor: 'rgba(249,168,37, 0)', // rgba(250, 128, 114, 1)
        pointBorderColor: 'rgba(0,0,0,0)',
        pointBorderWidth: 0,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
        pointHoverBackgroundColor: 'rgb(249,168,37)',
        pointHoverRadius: 5,
        // pointRadius: 5,
        radius: 4,
        lineTension: 0
      }]
    };

    this.options = options || this.getOptions();
    this.graph;

    this.renderGraph();
  }


  // DESTROY GRAPH
  destroy() {
    if (this.graph) {
      this.graph.destroy();
    }
  }


  // RENDER OPTIONS OBJECT
  getOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 40,
          bottom: 32,
        }
      },
      legend: {
        display: false,
        labels: {
          // This more specific font property overrides the global property
          fontColor: 'black',
          fontFamily: 'Montserrat, sans-serif',
        }
      },
      scales: {
        xAxes: [{
          gridLines : {
            color: 'rgba(255,255,255,0.03)',
            display : true,
            tickMarkLength: 10
          },
          ticks: {
            fontColor: '#B0BEC5',
            fontFamily: 'Mukta, sans-serif',
            fontStyle: 'normal',
            autoSkip: true,
            maxTicksLimit: 22
          }
        }],
        yAxes: [{
          position: 'right',
          gridLines: {
            color: 'rgba(255,255,255,0.03)',
            drawBorder: false,
            zeroLineColor: 'rgba(0,0,0,0.04)',
            tickMarkLength: 0
          },
          ticks: {
            beginAtZero: false,
            fontColor: '#B0BEC5',
            fontFamily: 'Mukta, sans-serif',
            fontStyle: 'normal',
            padding: 15
          }
        }]
      }
    };
  }


  // RENDER NEW CHART
  renderGraph() {
    this.graph = new Chart(this.canvasId, {
      type: this.graphType,
      data: this.data,
      options: this.options
    });
  }
}

export default Graph;