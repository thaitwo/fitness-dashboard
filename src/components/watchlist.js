import $ from 'jquery';
import store from 'store2';
import Graph from './graph.js';


class Watchlist {
  constructor(container) {
    this.$container = container;
    this.graph;
    this.watchlist = store.get('watchlist') || [];

    this.renderCanvasHTML();

    this.$watchlistCanvas = $('.watchlist-canvas');
    this.$watchlistContainer = this.$watchlistCanvas.find('.watchlist-container');
    this.$watchlist = this.$watchlistCanvas.find('.watchlist-list');
    this.$watchlistChart = this.$watchlistCanvas.find('#watchlist-chart');
    this.$stockName = this.$watchlistCanvas.find('.watchlist-stock-name');

    this.getStocks();
    this.requestDataForFirstStock();
    this.activateEventListeners();
  }


  // RENDER WATCHLIST CANVAS
  renderCanvasHTML() {
    let html =
    `
      <div class="watchlist-canvas">
        <div class="watchlist-container">
          <ol class="watchlist-list"></ol>
        </div>
        <div class="watchlist-data-container">
          <h2 class="watchlist-stock-name"></h2>
          <div class="watchlist-chart-container">
            <canvas id="watchlist-chart" width="900" height="320"></canvas>
          </div>
        </div>
      </div>
    `;

    this.$container.append(html);
  }


  // POPULATE WATCHLIST CONTAINER WITH STOCKS
  getStocks() {
    let list = this.watchlist.map((stock) => {
      const symbol = stock.symbol;
      let name = stock.name;

      return `
        <li>
          <button id="${symbol}">
            <span class="watchlist-item-code">${symbol}</span>
            <span class="watchlist-item-name">${name}</span>
          </button>
        </li>
      `;
    });

    this.$watchlist.append(list);
  }


  // GET DATA FOR COMPANY
  fetchStockData(symbol) {
    $.ajax({
      url: `https://cloud.iexapis.com/v1/stock/${symbol}/chart/1m`,
      dataType: 'json',
      data: {
        token: 'pk_a12f90684f2a44f180bcaeb4eff4086d',
      },
      error: (xhr, message, error) => {
        console.log(message, error);
      },
      success: (data) => {
        // store list of stocks
        store.set(symbol, data);
        // this.renderDataFirstStock(symbol);
      },
      complete: () => {
      },
    });
  }


  // RENDER GRAPH & DATA FOR FIRST STOCK IN WATCHLIST
  requestDataForFirstStock() {
    // If watchlist has at least one item, render item(s)
    if (this.watchlist.length > 0) {
      const symbol = this.watchlist[0].symbol;
      const name = this.watchlist[0].name;

      this.renderStockName(name);

      // Make Ajax call to get data for company
      this.fetchStockData(symbol);
      
      if (store.get(symbol) !== null) {
        console.log('store', store.get(symbol));
        const data = store.get(symbol);

        // get closing prices for stock
        const prices = this.getSpecificCompanyData(data, 'close');
        // get dates for closing prices
        const dates = this.getSpecificCompanyData(data, 'date');

        // create new graph
        this.graph = new Graph(this.$watchlistChart, prices, dates);
      }
    }
    // If watchlist is empty, render button with link to stocks page
    else {
      this.$watchlistContainer.append(`<a href="/#stocks"><p class="watchlist-add-stocks">Add stocks to watchlist<i class="fa fa-plus-circle" aria-hidden="true"></i></p></a>`);
    }
  }


  // RENDER GRAPH/DATA FOR STOCK
  renderData(symbol) {
    // Make Ajax call to get data for company
    this.fetchStockData(symbol);

    if (store.get(symbol !== null)) {
      // Retrieve company data from storage
      const data = store.get(symbol);

      // get opening prices for company stock
      const prices = this.getSpecificCompanyData(data, 'close');

      // get dates for the opening prices
      const dates = this.getSpecificCompanyData(data, 'date');
      console.log(prices, dates);
      // create graph
      this.graph.destroy();
      this.graph = new Graph(this.$watchlistChart, prices, dates);
    }
  }


  // ACTIVATE EVENT LISTENERS FOR WATCHLIST
  activateEventListeners() {
    const that = this;

    // Display graph & data for watchlist item
    this.$watchlist.on('click', 'button', function(event) {
      event.preventDefault();
      const symbol = this.id;
      console.log('id', symbol);
      let name = $(this).find('span.watchlist-item-name').text();
      // console.log('symbol', symbol);
      // console.log('name', name);

      // render name and graph for watchlist item
      that.renderStockName(name);
      that.renderData(symbol);
    });
  }


  // RENDER STOCK NAME
  renderStockName(name) {
    this.$stockName.text(name);
  }


  // RENDER GRAPH
  renderGraph(stockCode) {
    const stockData = store.get(stockCode) || {};
    // console.log('stockData', stockData);

    // get closing prices for company stock
    let priceData = this.getSpecificCompanyData(stockData, 'close');

    // get dates for the closing prices
    let dateLabels = this.getSpecificCompanyData(stockData, 'date');

    // clear graph and create new graph
    this.graph.destroy();
    this.graph = new Graph(this.$watchlistChart, priceData, dateLabels);
  }


  // GET SPECIFIC DATA ARRAY OF COMPANY (STOCK OPEN PRICES, DATES, ETC.)
  getSpecificCompanyData(data, hey) {
    // console.log('data', data);
    return data.map((day) => {
      return day[hey];
    }).reverse();
  }


  //
  destroy() {
    if (this.$watchlistCanvas) {
      this.$container.empty();
    }
  }
}

export default Watchlist;