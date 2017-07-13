
import './scss/style.scss';
import $ from 'jquery';
import Router from './route.js';
// import Companies from './views/companies.js';
import Graph from './components/graph.js';


class App {
  constructor() {
    // REGISTER ELEMENTS
    this.$chartId = $('#chart');
    this.$companyList = $('#company-list');
    this.$pageTitleContainer = $('.page-title');
    this.$sidebarNav = $('#nav-sidebar');
    this.graph;
    // this.updateGraph = this.updateGraph.bind(this);

    this.router = new Router();

    // ACTIVATE SIDEBAR
    this.activateSidebarMenu();

    // GET COMPANIES & RENDER / UPDATE GRAPH
    this.renderInitialGraph();
    this.activateCompanySelection();
  }


  // GET COMPANY STOCK DATA
  getStockData(companyId) {
    $.ajax({
      // https://www.quandl.com/api/v3/datasets/WIKI/FB/data.json?api_key=tskzGKweRxWgnbX2pafZ
      url: `https://www.quandl.com/api/v3/datasets/WIKI/${companyId}/data.json?api_key=tskzGKweRxWgnbX2pafZ`,
      dataType: 'json',
      success: this.renderGraph.bind(this)
    })
  }


  // RENDER GRAPH
  renderGraph(data) {
    // Get opening prices for company stock
    let priceData = this.getSpecificCompanyData(data, 1);

    // Get dates for the opening prices
    let dateLabels = this.getSpecificCompanyData(data, 0);

    // Create new graph for this company stock
    this.graph = new Graph(this.$chartId, priceData, dateLabels);
  }


  // GET SPECIFIC DATA ARRAY OF COMPANY (STOCK OPEN PRICES, DATES, ETC.)
  getSpecificCompanyData(data, num) {
    return data.dataset_data.data.slice(0, 30).map((day) => {
      return day[num];
    }).reverse()
  }


  // UPDATE GRAPH ON COMPANY SELECTION
  activateCompanySelection() {
    const that = this;

    this.$companyList.on('click', 'button', function(event)  {
      event.preventDefault();

      let id = this.id;
      that.updateGraph(id);
    })
  }


  // ACTIVATE SIDEBAR MENU
  activateSidebarMenu() {
    const that = this;

    this.$sidebarNav.on('click', 'a', function(event) {
      event.preventDefault();
      let id = this.id;

      // Change page and url
      that.router.changePage(id)

      that.updateActiveClass('#nav-sidebar', id);
      that.udpatePageTitle(id);
    })
  }


  // UPDATE PAGE HEADER
  udpatePageTitle(titleText) {
    this.$pageTitleContainer.html(titleText);
  }


  // UPDATE SELECTED LINK
  updateActiveClass(containerName, clickedElementId) {
    let activeElements = $(`${containerName} .active`);
    let clickedElement = $(`${containerName} #${clickedElementId}`);

    activeElements.removeClass('active');
    clickedElement.addClass('active');
  }


  // UPDATE GRAPH
  updateGraph(id) {
    // Destroy current graph
    this.graph.destroy();
    console.log(id);

    this.getStockData(id);
  }


  // RENDER GRAPHS
  renderInitialGraph() {
    this.getStockData('AAPL');
  }
}

new App();
