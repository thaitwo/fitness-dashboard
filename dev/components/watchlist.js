import $ from 'jquery';
import Graph from './graph.js';


class Watchlist {
  constructor(container) {
    this.$container = container;
    this.renderWatchlistGraphHTML();

    this.$chartId = $('#chart');
    this.$watchlistContainer = $('#watchlist');
    this.graph;

    this.getStockData('AAPL');
    this.activateCompanySelection();
  }


  // RENDER WATCHLIST PAGE HTML
  renderWatchlistGraphHTML() {
    let html =
      `
        <div class="dashboard-stocks-container">
          <div class="stocks-tabs">
            <button id="tab-watchlist" class="tab is-active">Watch List</button>
            <button id="tab-stockslist" class="tab">Stocks</button>
          </div>
          <ul id="stocks-list" class="stocks-list"></ul>
          <ul id="watchlist" class="dashboard-watchlist"></ul>
        </div>
        <div class="dashboard-content-container clearfix">
          <div class="chart-container">
            <canvas id="chart" width="900" height="400"></canvas>
          </div>
        </div>
      `;

    this.$container.append(html);
  }


  // GET COMPANY STOCK DATA
  getStockData(companyId) {
    $.ajax({
      // https://www.quandl.com/api/v3/datasets/WIKI/FB/data.json?api_key=tskzGKweRxWgnbX2pafZ
      url: `https://www.quandl.com/api/v3/datasets/WIKI/${companyId}/data.json?api_key=tskzGKweRxWgnbX2pafZ`,
      dataType: 'json',
      success: this.renderGraph.bind(this)
    });
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
    }).reverse();
  }


  // UPDATE GRAPH ON COMPANY SELECTION
  activateCompanySelection() {
    const that = this;

    this.$watchlistContainer.on('click', 'button', function(event)  {
      event.preventDefault();

      let id = this.id;
      that.updateGraph(id);
    });
  }


  // UPDATE GRAPH
  updateGraph(id) {
    // Destroy current graph
    this.graph.destroy();
    console.log(id);

    this.getStockData(id);
  }


  // CLEAR DASHBOARD CANVAS
  destroy() {
    this.$container.empty();
  }
}

export default Watchlist;