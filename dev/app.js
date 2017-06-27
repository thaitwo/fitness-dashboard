import $ from 'jquery';
import './scss/style.scss';
import Dropdown from './components/dropdown.js';
import Graph from './components/graph.js';
import GetData from './components/get-data.js';

// tskzGKweRxWgnbX2pafZ

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


    // this.getStockData('AAPL');

    this.updateTimeDropdown = this.updateTimeDropdown.bind(this);

    const timeDropdownContainer = 'time-dropdown';
    const categoriesDropdownContainer = $('categories-dropdown');


    const healthCategories = ['Steps', 'Sleep', 'Weight', 'Calories'];
    const timeData = ['Daily', 'Weekly', 'Monthly', 'Yearly', 'All-Time'];


    // new Dropdown('categories-dropdown', healthCategories, this.updateCategoryDropdown.bind(this));
    new Dropdown('time-dropdown', timeData, this.updateTimeDropdown);


  }

  // getGraphData() {
  //   .axios()



  //   .done(this.renderGraphs(this))
  //   .success()
  // }

  // On initial page load, get data for 'daily' interval
  // Use data and create new graph
  // On click, get new data for particular interval
  // Use new data to create new graph

  // To get interval data for specific stock
  // Check id of current stock, then make ajax request for that stock



  // GET COMPANY STOCK DATA
  getStockData(companyId) {
    $.ajax({
      // https://www.quandl.com/api/v3/datasets/WIKI/FB/data.json?api_key=tskzGKweRxWgnbX2pafZ
      url: `https://www.quandl.com/api/v3/datasets/WIKI/${companyId}/data.json?api_key=tskzGKweRxWgnbX2pafZ`,
      dataType: 'json',
      success: (response) => {
        console.log('Request worked!');
        let priceData = this.returnStockOpenPrice(response);
        let labels = this.returnDateLabels(response);

        this.stepsGraph = new Graph(this.stepsChartId, priceData, labels);
      }
    })
  }


  // CREATE DATA ARRAY OF STOCK PRICES
  returnStockOpenPrice(data) {
    return data.dataset_data.data.slice(0, 30).map((day) => {
      return day[1];
    }).reverse()
  }


  // CREATE DATA ARRAY OF DATES
  returnDateLabels(data) {
    return data.dataset_data.data.slice(0, 30).map((day) => {
      return day[0];
    }).reverse()
  }


  returnCompanyList(data) {
    data.datasets.slice(0, 4).map((company) => {
      console.log(company.dataset_code);
    })
  }


  // GET LIST OF COMPANIES
  getData(interval) {
    $.ajax({
      // url: 'https://www.quandl.com/api/v1/datasets/CHRIS/CME_BZ1.json?collapse=daily&api_key=tskzGKweRxWgnbX2pafZ',
      // https://www.quandl.com/api/v3/datasets.json?database_code=WIKI&per_page=100&sort_by=id&page=1&api_key=tskzGKweRxWgnbX2pafZ
      url: 'https://www.quandl.com/api/v3/datasets.json',
      dataType: 'json',
      data: {
        database_code: 'WIKI',
        per_page: '100',
        sort_by: 'id',
        page: '1',
        api_key: 'tskzGKweRxWgnbX2pafZ'
      },
      error: (xhr, message, error) => {
        console.log('error');
        console.log(message, error);
      },
      success: (data) => {
        console.log('DATA', data);
        // let newData = this.getDailyData(data);
        // let labels = this.getDailyLabels(data);
        // this.stepsGraph = new Graph(this.stepsChartId, this.stepsData(data));
        // this.stepsGraph = new Graph(this.stepsChartId, newData, labels);

        switch(interval) {
          // case 'daily':
          //   const coolArray = this.dailyData(data);
          //   // this.udpateGraph(coolArray);
          //   // this.stepsGraph = new Graph(this.stepsChartId, coolArray);
          //   break;
          // case 'weekly':
          //   break;
          case 'steps':
            const stepsArray = this.stepsData(data);
            this.updateGraph(stepsArray);
            // this.stepsGraph = new Graph(this.stepsChartId, stepsArray);
            break;
          case 'sleep':
            const sleepArray = this.sleepData(data);
            this.updateGraph(sleepArray);
            // this.stephsGraph = new Graph(this.stepsChartId, sleepArray);
            break;
          case 'weight':
            const weightArray = this.weightData(data);
            this.updateGraph(weightArray);
            // this.stepsGraph = new Graph(this.stepsChartId, weightArray);
            break;
          case 'calories':
            const caloriesArray = this.caloriesData(data);
            this.updateGraph(caloriesArray);
            // this.stepsGraph = new Graph(this.stepsChartId, caloriesArray);
            break;
        }
      }
    })
  }


  getDailyData(data) {
    let newArr = [];
    console.log('DAILY', data.data[0]);

    for (var i = 0; i < 30; i++) {
      newArr.push(data.data[i][6])
    }

    return newArr.reverse();
  }

  getDailyLabels(data) {
    let labelArray = [];

    for (var i = 0; i < 30; i++) {
      labelArray.push(data.data[i][0])
    }

    console.log('LABELS', labelArray);
    return labelArray.reverse();
  }




  stepsData(data) {
    let arr = data.activity.map((user) => {
      return user.steps;
    })
    return arr;
  }

  sleepData(data) {
    let arr = data.activity.map((user) => {
      return user.sleep;
    })

    return arr;
  }

  weightData(data) {
    let arr = data.activity.map((user) => {
      return user.weight;
    })

    return arr;
  }

  caloriesData(data) {
    let arr = data.activity.map((user) => {
      return user.calories;
    })

    return arr;
  }








  dailyData(data) {
    console.log('works');
    let arr = data.activity.map((user) => {
      return user.steps;
    })
    return arr;
  }


  weeklyData(data) {
    let weeklyArray = data
  }





  // UPDATE GRAPH WHEN TIME DROPDOWN MENU IS SELECTED
  updateTimeDropdown(id) {

    switch(id) {
      case 'daily':
        // const dataa = new GetData();
        this.getData(id);
        // this.updateGraph(dataa);
        break;
      case 'weekly':
        // const data = new GetData();
        this.updateGraph(data);
        break;
      case 'monthly':
        this.updateGraph(this.monthlyData);
        break;
      case 'yearly':
        this.updateGraph(this.yearlyData);
        break;
      case 'all-time':
        this.updateGraph();
        break;
      default:
        alert('Please select from the dropdown menu.');
    }
  }


  // UPDATE GRAPH BASED ON CATEGORY
  updateCategoryDropdown(id) {

    switch(id) {
      case 'steps':
      case 'sleep':
      case 'weight':
      case 'calories':
        this.getData(id);
        break;
    }
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
  updateGraph(newData) {
    // Destroy current graph
    this.stepsGraph.destroy();

    // Create new graph
    this.stepsGraph = new Graph(this.stepsChartId, newData);
  }


  // RENDER GRAPHS
  renderGraphs() {
    this.getStockData('CMG');

    // this.stepsGraph = new Graph(this.stepsChartId, pricelist, );
  }
}

new App();
