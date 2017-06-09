import Chart from 'chart.js';

class Graph {
	constructor(data, type,  containerId) {
    this.data = data || [{
      label: "Steps Taken",
      fill: false,
      backgroundColor: 'rgba(77,182,172, 1)',
      borderColor: 'rgb(77,182,172)',
      borderWidth: 3,
      data: [6059, 7320, 8209, 6347, 5238, 6830, 7836],
      hoverRadius: 3,
      radius: 2,
      lineTension: 0
    }];
    this.type = type;
    this.containerId = containerId;
    this.graph;

    this.render();
	}

  getOptions() {...
  }

  destroy() {
    if(this.graph) {
      this.graph.destroy();
    }
  }

  render() {
    this.graph = new Chart(this.containerId, {
      // The type of chart we want to create
      type: this.type, // 'bar'

      // The data for our dataset
      data: {
        labels: ["Jun 1", "Jun 2", "Jun 3", "Jun 4", "Jun 5", "Jun 6", "Jun 7"],
        display: true,
        datasets: this.data
      },

      // Configuration options go here
      options: this.getOptions()
    });
  }
}

export default Graph;