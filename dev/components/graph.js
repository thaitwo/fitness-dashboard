import Chart from 'chart.js';

/*
**  GRAPH CLASS
**  Create new class
*/

class Graph {
  constructor(containerId, type, data, interval) {
    this.containerId = containerId;
    this.type = type;

    this.data = data || {
      labels: ["Jun 1", "Jun 2", "Jun 3", "Jun 4", "Jun 5", "Jun 6", "Jun 7"],
      display: true,
      datasets: [{
        // label: "Steps Taken",
        fill: false,
        backgroundColor: '#FA8072',
        borderColor: '#FA8072',
        borderWidth: 3,
        data: [6059, 7320, 8209, 6347, 5238, 6830, 7836],
        hoverRadius: 3,
        radius: 2,
      }]
    };

    this.interval = interval;
    this.options = this.getOptions();
    this.graph;

    this.render();
  }

  destroy() {
    if (this.graph) {
      this.graph.destroy();
    }
  }

  getOptions() {
    return {
      layout: {
        padding: {
          top: 10,
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
            display : false
          },
          ticks: {
            fontColor: '#B0BEC5',
            fontFamily: "'Montserrat', sans-serif",
            fontStyle: 'normal'
          }
        }],
        yAxes: [{
          gridLines: {
            color: 'rgba(0,0,0,0.04)',
            drawBorder: false,
            zeroLineColor: 'rgba(0,0,0,0.04)',
            tickMarkLength: 0
          },
          ticks: {
            beginAtZero:true,
            fontColor: '#B0BEC5',
            fontFamily: "'Montserrat', sans-serif",
            fontStyle: 'normal',
            min: 0,
            padding: 15
          }
        }]
      },
      title: {
        display: true,
        fontColor: '#CFD8DC',
        fontFamily: "'Montserrat', sans-serif",
        fontSize: 16,
        fontStyle: 'normal',
        padding: 30,
        position: 'top',
        text: this.interval || 'DAILY'
      }
    }
  }

  render() {
    this.graph = new Chart(this.containerId, {
      type: this.type,

      data: this.data,

      options: this.getOptions()
    })
  }
}

export default Graph;