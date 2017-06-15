import './scss/style.scss';
import Dropdown from './components/dropdown.js';
import Graph from './components/graph.js';
import GetData from './components/get-data.js';


class App {
  constructor() {
    this.stepsChartId = $('#stepsChart');
    this.renderGraphs();
    this.stepsGraph;
    this.testDropdown;
    this.categoriesDropdown;
    this.activateSidebarMenu();
    // this.activateDropdownMenu();
    // this.activateDropdown();

    const timeDropdownContainer = 'time-dropdown';
    const categoriesDropdownContainer = $('categories-dropdown');

    // this.updateTimeDropdown = this.updateTimeDropdown(timeDropdownContainer).bind(this);

    const healthCategories = ['Steps', 'Sleep', 'Weight', 'Calories'];
    const timeData = ['Daily', 'Weekly', 'Monthly', 'Yearly', 'All-Time'];


    new Dropdown('categories-dropdown', healthCategories);
    new Dropdown('time-dropdown', timeData);



    this.weeklyData = {
      labels: ['May 1', 'May 8', 'May 15', 'May 22', 'May 29', 'Jun 5'],
      display: true,
      datasets: [{
        backgroundColor: 'rgba(250, 128, 114, .2)',
        borderColor: '#FA8072',
        borderWidth: 3,
        data: [61059, 71320, 81209, 61347, 51238, 61830],
        hoverRadius: 12,
        radius: 4,
        lineTension: 0
      }]
    };

    this.monthlyData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
      display: true,
      datasets: [{
        backgroundColor: 'rgba(250, 128, 114, .2)',
        borderColor: '#FA8072',
        borderWidth: 2,
        data: [610590, 713200, 812090, 613470, 512380, 618300, 718360, 717770, 813460, 727340, 829670, 785670],
        hoverRadius: 12,
        radius: 4,
        lineTension: 0
      }]
    };

    this.yearlyData = {
      labels: ['2014', '2015', '2016', '2017'],
      display: true,
      datasets: [{
        backgroundColor: 'rgba(250, 128, 114, .2)',
        borderColor: '#FA8072',
        borderWidth: 3,
        data: [65203, 61059, 71320, 81209],
        hoverRadius: 12,
        radius: 4,
        lineTension: 0
      }]
    };
  }

  // getGraphData() {
  //   .axios()



  //   .done(this.renderGraphs(this))
  //   .success()
  // }


  updateTimeDropdown(id) {
    const dropdownContainer = $(``)
  }


  // ACTIVATE SIDEBAR MENU
  activateSidebarMenu() {
    const navSidebarId = document.querySelector('#nav-sidebar');

    navSidebarId.addEventListener('click', (event) => {
      let id = event.target.id;

      if (event.target.tagName === 'A') {
        this.updateActiveClass('#nav-sidebar', event.target);
        this.udpatePageHeader(id);
      }
    })
  }



  // UPDATE PAGE HEADER
  udpatePageHeader(headerText) {
    const pageTitleContainer = document.querySelector('.page-title');

    pageTitleContainer.innerHTML = headerText;
  }



  // ACTIVATE DROPDOWN MENU FOR CHART
  activateDropdown() {
    // const arr = ['Daily', 'Weekly', 'Monthly', 'Yearly', 'All-Time'];
    // this.testDropdown = new Dropdown('steps-dropdown', 'steps-button', 'steps-intervals', arr);
    // this.activateDropdownMenu('steps-intervals');

    // const healthCategories = ['Steps', 'Sleep', 'Weight', 'Calories'];
    // this.categoriesDropdown = new Dropdown('categories-dropdown', healthCategories, 'categories');
    // this.activateDropdownMenu('health-categories', healthCategories, this.testData);
  }


  // For loop - for each


  // UPDATE GRAPH WHEN DROPDOWN MENU ITEM IS SELECTED
  activateDropdownMenu(ulDropdownId, arrayOfListItems, arrayOfNewDataObjects) {
    const dropdownContainer = $(`#${ulDropdownId}`);

    dropdownContainer.on('click', (event) => {
      const id = event.target.id;

      if (event.target.tagName === 'LI') {
        // this.updateActiveClass('#time-intervals', event.target);

        switch(id) {
          // for loop

          // for (var i = 0; i < arrayOfListItems.length; i++) {
          //   return case 'arrayOfListItems[i]':;

          //   for (var x = 0; x < arrayOfNewDataObjects.length; x++) {
          //     if (x === i) {
          //       return this.updateGraph(arrayOfNewDataObjects[x]);
          //     }
          //   }
          // }

          case 'daily':
            this.updateGraph(this.dailyData);
            break;
          case 'weekly':
            this.updateGraph(this.weeklyData);
            break;
          case 'monthly':
            this.updateGraph(this.monthlyData);
            break;
          case 'yearly':
            this.updateGraph(this.yearlyData);
            break;
          case 'all-time':
            this.updateGraph(this.allTimeData);
            break;
          default:
            alert('Click a button');
        };
      }
    })
  }



  // UPDATE SELECTED LINK
  updateActiveClass(containerName, clickedElement) {
    const containerClass = document.querySelector(containerName);
    const selectedElements = containerClass.getElementsByClassName('active');

    while (selectedElements.length) {
      selectedElements[0].classList.remove('active');
    }

    clickedElement.classList.add('active');
  }



  // UPDATE GRAPH
  updateGraph(newDataObject) {
    // Destroy current graph
    this.stepsGraph.destroy();

    // Create new graph
    this.stepsGraph = new Graph(this.stepsChartId, 'line', newDataObject);
  }


  // RENDER GRAPHS
  renderGraphs() {
    this.stepsGraph = new Graph(this.stepsChartId, 'line');
  }
}

new App();
