import './scss/style.scss';
import Graph from './components/graph.js';
import GetData from './components/get-data.js';


class App {
  constructor() {
    this.stepsChartId = document.getElementById('stepsChart');
    this.renderGraphs();
    this.stepsGraph;
    this.activateChartIntervalMenu();

    this.weeklyData = {
      labels: ['May 1', 'May 8', 'May 15', 'May 22', 'May 29', 'Jun 5'],
      display: true,
      datasets: [{
        backgroundColor: 'rgba(77,182,172, 1)',
        borderColor: 'rgb(77,182,172)',
        borderWidth: 3,
        data: [61059, 71320, 81209, 61347, 51238, 61830],
        hoverRadius: 3,
        radius: 2,
        lineTension: 0
      }]
    };

    this.monthlyData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
      display: true,
      datasets: [{
        backgroundColor: 'rgba(77,182,172, 1)',
        borderColor: 'rgb(77,182,172)',
        borderWidth: 3,
        data: [610590, 713200, 812090, 613470, 512380, 618300, 718360, 717770, 813460, 727340, 829670, 785670],
        hoverRadius: 3,
        radius: 2,
        lineTension: 0
      }]
    };

    this.yearlyData = {
      labels: ['2014', '2015', '2016', '2017'],
      display: true,
      datasets: [{
        backgroundColor: 'rgba(77,182,172, 1)',
        borderColor: 'rgb(77,182,172)',
        borderWidth: 3,
        data: [65203, 61059, 71320, 81209],
        hoverRadius: 3,
        radius: 2,
        lineTension: 0
      }]
    };
  }

  activateChartIntervalMenu() {
    const timeIntervalsId = document.querySelector('#time-intervals');
    const interval = timeIntervalsId.getElementsByTagName('li');

    timeIntervalsId.addEventListener('click', (event) => {
      let id = event.target.id;
          id = id.toUpperCase();

      if (event.target.tagName === 'LI') {

        switch(id) {
          case 'DAILY':
            this.updateGraph(this.dailyData, id);
            break;
          case 'WEEKLY':
            this.updateGraph(this.weeklyData, id);
            break;
          case 'MONTHLY':
            this.updateGraph(this.monthlyData, id);
            break;
          case 'YEARLY':
            this.updateGraph(this.yearlyData, id);
            break;
          case 'ALL-TIME':
            this.updateGraph(this.allTimeData, id);
            break;
          default:
            alert('Click a button');
        };
      }
    })
  }

  updateGraph(intervalData, interval) {
    // Destroy current graph
    this.stepsGraph.destroy();

    // Create new graph
    this.stepsGraph = new Graph(this.stepsChartId, 'bar', intervalData, interval);
  }

  renderGraphs() {
    this.stepsGraph = new Graph(this.stepsChartId, 'bar');
  }
}

new App();












// class App {
// 	constructor(props) {
// 		super(props);

//     this.$page = $('#page');
//     this.barGraph;

//     // Bind functino


//     this.renderGraphs();
//     this.activateNavBar();
// 	}

  // activateNavBar() {
  //   const timeIntervalsId = document.querySelector('#time-intervals'),
  //     interval = timeIntervalsId.getElementsByTagName('li'),
  //     stepsCanvas = document.querySelector('canvas');


  //   timeIntervalsId.addEventListener('click', (event) => {
  //     this.updateGraph(event.target.id);

  //   })
  // }

//   updateGraph(type) {
//     this.barGraph.destroy();

//     this.barGraph = new Graph(data, type, this.$page);
//   }

//   renderGraphs() {
//     // kick off initial html that needs to be in dom
//     const data = [];

//     this.barGraph = new Graph(data, 'bar', this.$page);
//     new Graph(data, 'bar', this.$page);
//     new Graph(data, 'bar', this.$page);
//     new Graph(data, 'bar', this.$page);
//   }
// }

// export default App;