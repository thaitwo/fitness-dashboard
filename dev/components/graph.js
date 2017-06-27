import Chart from 'chart.js';

/*
**  GRAPH CLASS
**  Create new class
*/

class Graph {
  // @parameters (string, string, object, object)
  constructor(canvasId, newData, newLabels, graphType, options) {
    this.canvasId = canvasId;
    this.graphType = graphType || 'line';

    // this.newData = data ||
    //   {
    //     labels: ["Jun 1", "Jun 2", "Jun 3", "Jun 4", "Jun 5", "Jun 6", "Jun 7"],
    //     display: true,
    //     datasets: [{
    //       backgroundColor: 'rgba(250, 128, 114, .2)',
    //       borderColor: '#FA8072',
    //       borderWidth: 2,
    //       data: [6059, 7320, 8209, 6347, 5238, 6830, 7836],
    //       hoverRadius: 12,
    //       radius: 4,
    //       lineTension: 0
    //     }]
    //   };

    // console.log('NEW DATA', newData);

    this.data =
      {
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

    this.render();
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
      layout: {
        padding: {
          top: 30,
          right: 20,
          bottom: 30,
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
          gridLines : {
            color: 'rgba(0,0,0,0.03)',
            display : true,
            tickMarkLength: 10
          },
          ticks: {
            fontColor: '#B0BEC5',
            fontFamily: "'Montserrat', sans-serif",
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
            // stepSize: 1,
            fontColor: '#B0BEC5',
            fontFamily: "'Montserrat', sans-serif",
            fontStyle: 'normal',
            // min: 0,
            padding: 15
          }
        }]
      }
    }
  }


  // RENDER NEW CHART
  render() {
    this.graph = new Chart(this.canvasId, {
      type: this.graphType,

      data: this.data,

      options: this.getOptions()
    })
  }
}

export default Graph;