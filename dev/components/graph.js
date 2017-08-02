import Chart from 'chart.js';

/*
**  GRAPH
**
*/

class Graph {
  // @parameters (string, array, array, string, object)
  constructor(canvasId, newData, newLabels, graphType, options) {
    this.canvasId = canvasId;
    this.graphType = graphType || 'line';

    this.data = {
      labels: newLabels,
      display: true,
      datasets: [{
        backgroundColor: 'rgba(250, 128, 114, .2)',
        borderColor: '#FA8072',
        borderWidth: 2,
        data: newData,
        hoverRadius: 12,
        pointBackgroundColor: 'rgba(250, 128, 114, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverBorderColor: '#fff',
        pointHoverBackgroundColor: '#000',
        pointHoverRadius: 5,
        pointRadius: 5,
        radius: 4,
        lineTension: .4
      }]
    };

    this.options = options || this.getOptions();
    this.graph;

    this.renderGraph();
  }


  // DESTROY CHART
  destroy() {
    if (this.graph) {
      this.graph.destroy();
    }
  }


  // RENDER OPTIONS OBJECT
  getOptions() {
    return {
      responsive: false,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 30,
          right: 30,
          bottom: 30,
          left: 30
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
            color: 'rgba(0,0,0,0.03)',
            display : true,
            tickMarkLength: 10
          },
          ticks: {
            fontColor: '#B0BEC5',
            fontFamily: 'Montserrat, sans-serif',
            fontStyle: 'normal',
            autoSkip: false
          }
        }],
        yAxes: [{
          gridLines: {
            color: 'rgba(0,0,0,0.03)',
            drawBorder: false,
            zeroLineColor: 'rgba(0,0,0,0.04)',
            tickMarkLength: 0
          },
          ticks: {
            beginAtZero: false,
            fontColor: '#B0BEC5',
            fontFamily: 'Montserrat, sans-serif',
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