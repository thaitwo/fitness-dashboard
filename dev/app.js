import './scss/style.scss';
import Dropdown from './components/Dropdown.js';
import Graph from './components/graph.js';
import GetData from './components/get-data.js';


class App {
  constructor() {
    this.stepsChartId = document.getElementById('stepsChart');
    this.renderGraphs();
    this.stepsGraph;
    this.testDropdown;
    this.activateSidebarMenu();
    // this.activateChartIntervalMenu();
    this.activateDropdown();

    this.weeklyData = {
      labels: ['May 1', 'May 8', 'May 15', 'May 22', 'May 29', 'Jun 5'],
      display: true,
      datasets: [{
        backgroundColor: '#FA8072',
        borderColor: '#FA8072',
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
        backgroundColor: '#FA8072',
        borderColor: '#FA8072',
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
        backgroundColor: '#FA8072',
        borderColor: '#FA8072',
        borderWidth: 3,
        data: [65203, 61059, 71320, 81209],
        hoverRadius: 3,
        radius: 2,
        lineTension: 0
      }]
    };
  }

  // getGraphData() {
  //   .axios()



  //   .done(this.renderGraphs(this))
  //   .success()
  // }

  activateSidebarMenu() {
    const navSidebarId = document.querySelector('#nav-sidebar');

    navSidebarId.addEventListener('click', (event) => {
      let id = event.target.id;

      if (event.target.tagName === 'A') {
        this.updateActiveClass('#nav-sidebar', event.target);
        this.udpatePageTitle(id);
      }
    })
  }



  udpatePageTitle(title) {
    const pageTitleContainer = document.querySelector('.page-title');

    pageTitleContainer.innerHTML = title;
  }



  activateDropdown() {
    const arr = ['Daily', 'Weekly', 'Monthly', 'Yearly', 'All-time'];
    this.testDropdown = new Dropdown('sleep-dropdown', 'test-button', 'test-intervals', arr);
  }



  activateChartIntervalMenu() {
    const timeIntervalsId = document.querySelector('#time-intervals');

    timeIntervalsId.addEventListener('click', (event) => {
      let id = event.target.id;
          id = id.toUpperCase();

      if (event.target.tagName === 'LI') {
        this.updateActiveClass('#time-intervals', event.target);

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



  updateActiveClass(containerName, clickedElement) {
    const containerClass = document.querySelector(containerName);
    const selectedElements = containerClass.getElementsByClassName('active');

    while (selectedElements.length) {
      selectedElements[0].classList.remove('active');
    }

    clickedElement.classList.add('active');
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
