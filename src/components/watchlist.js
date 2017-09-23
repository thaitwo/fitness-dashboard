import $ from 'jquery';
import store from 'store2';
import Graph from './graph.js';


class Watchlist {
  constructor(container) {
    this.$container = container;
    this.graph;

    this.render();

    this.$watchlistContainer = $('.watchlist-container');
    this.$watchlist = this.$watchlistContainer.find('.watchlist-list');
    this.$watchlistChart = $('#watchlist-chart');
    this.$stockName = $('.watchlist-stock-name');

    this.getStocks();
    this.renderInitialStock();
    this.activateWatchlist();
  }


  // RENDER WATCHLIST CONTAINER
  render() {
    let html =
    `
      <div class="watchlist-container">
        <ol class="watchlist-list"></ol>
      </div>
      <div class="watchlist-canvas">
        <h2 class="watchlist-stock-name"></h2>
        <div class="watchlist-chart-container">
          <canvas id="watchlist-chart" width="900" height="320"></canvas>
        </div>
      </div>
    `;

    this.$container.append(html);
  }


  renderInitialStock() {
    let watchlist = store.get('watchlist') || [];

    if (watchlist.length > 0) {
      let initialStockCode = watchlist[0].split(' | ')[0];
      let initialStockName = watchlist[0].split(' | ')[1];
      let stockData = store.get(initialStockCode);

      this.renderStockName(initialStockName);

      // get opening prices for company stock
      let priceData = this.getSpecificCompanyData(stockData, 1);

      // get dates for the opening prices
      let dateLabels = this.getSpecificCompanyData(stockData, 0);

      // create graph
      this.graph = new Graph(this.$watchlistChart, priceData, dateLabels);
    }
  }


  // POPULATE WATCHLIST CONTAINER WITH STOCKS
  getStocks() {
    let stocks = store.get('watchlist') || [];

    // console.log(stocks);
    // console.log(hasStocks);

    let list = stocks.map((stock) => {
      const stockCode = stock.split(' | ')[0];
      let stockName = stock.split(' | ')[1];
      // console.log(stockCode);

      return `
        <li>
          <button id="${stockCode}">
            <span class="watchlist-item-code">${stockCode}</span>
            <span class="watchlist-item-name">${stockName}</span>
          </button>
        </li>
      `;
    });

    this.$watchlist.append(list);
  }


  // ACTIVATE EVENT LISTENERS FOR WATCHLIST
  activateWatchlist() {
    const that = this;
    this.$watchlist.on('click', 'button', function(event) {
      event.preventDefault();
      let stockCode = this.id;
      let stockName = $(this).find('span.watchlist-item-name').text();

      that.renderStockName(stockName);
      that.graph.destroy();
      that.renderGraph(stockCode);
    });
  }


  renderStockName(name) {
    this.$stockName.text(name);
  }


  // RENDER GRAPH
  renderGraph(stockCode) {
    const stockData = store.get(stockCode) || {};

    // get opening prices for company stock
    let priceData = this.getSpecificCompanyData(stockData, 1);

    // get dates for the opening prices
    let dateLabels = this.getSpecificCompanyData(stockData, 0);

    this.graph = new Graph(this.$watchlistChart, priceData, dateLabels);
  }


  // GET SPECIFIC DATA ARRAY OF COMPANY (STOCK OPEN PRICES, DATES, ETC.)
  getSpecificCompanyData(data, num) {
    return data.dataset_data.data.slice(0, 30).map((day) => {
      return day[num];
    }).reverse();
  }


  destroy() {
    if (this.$watchlistContainer) {
      this.$container.empty();
    }
  }
}

export default Watchlist;