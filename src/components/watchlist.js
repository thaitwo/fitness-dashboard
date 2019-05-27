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
    this.$stockName = this.$watchlistCanvas.find('#watchlist-stock-name');
    this.$stockSymbol = this.$watchlistCanvas.find('#watchlist-stock-symbol')

    this.getStocks();
    this.renderDataForFirstStock();
    this.activateEventListeners();
  }


  // RENDER WATCHLIST CANVAS
  renderCanvasHTML() {
    let html =
    `
      <div class="watchlist-canvas">
        <div class="watchlist-container">
          <h2 class="watchlist-title">Watchlist</h2>
          <ol class="watchlist-list"></ol>
        </div>
        <div class="watchlist-data-container">
          <div class="watchlist-data-inner-container">
            <div class="watchlist-chart-container">
              <h2 id="watchlist-stock-name"></h2>
              <h3 id="watchlist-stock-symbol"></h3>
              <canvas id="watchlist-chart" width="900" height="320"></canvas>
            </div>
          </div>
        </div>
      </div>
    `;

    this.$container.append(html);
  }


  // POPULATE WATCHLIST CONTAINER WITH STOCKS
  getStocks() {
    let list = this.watchlist.map((stock, index) => {
      const symbol = stock.symbol;
      const name = stock.name;
      let isActive = '';

      if (index === 0) {
        isActive = 'active';
      }

      return `
        <li class="${isActive}">
          <button id="${symbol}">
            <p class="watchlist-item-symbol">${symbol}</p>
            <p class="watchlist-item-name">${name}</p>
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
        // store stock data
        store.set(symbol, data);
      },
      complete: () => {
      },
    });
  }


  // RENDER GRAPH & DATA FOR FIRST STOCK IN WATCHLIST
  renderDataForFirstStock() {
    // if watchlist has at least one item, render item(s)
    if (this.watchlist.length > 0) {
      const symbol = this.watchlist[0].symbol;
      const name = this.watchlist[0].name;

      this.renderStockName(name, symbol);

      // make Ajax call to get data for company
      this.fetchStockData(symbol);
      
      // check if stock data exist in localStorage
      // note: localStorage returns null if item does not exist
      if (store.get(symbol) !== null) {
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

    if (store.get(symbol) !== null) {
      // Retrieve company data from storage
      const data = store.get(symbol);

      // get opening prices for company stock
      const prices = this.getSpecificCompanyData(data, 'close');

      // get dates for the opening prices
      const dates = this.getSpecificCompanyData(data, 'date');

      // create new graph
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

      const clickedEl = $(this).parent();
      const watchlistItems = that.$watchlistCanvas.find('.watchlist-list li');
      const symbol = this.id;
      const name = $(this).find('.watchlist-item-name').text();

      // Add active class to clicked watchlist item
      watchlistItems.removeClass('active');
      clickedEl.addClass('active');

      // render name and graph for watchlist item
      that.renderStockName(name, symbol);
      that.renderData(symbol);
    });
  }


  // RENDER STOCK NAME
  renderStockName(name, symbol) {
    this.$stockName.text(name);
    this.$stockSymbol.text(symbol);
  }


  // RENDER GRAPH
  renderGraph(stockCode) {
    const data = store.get(stockCode) || {};

    // get closing prices for company stock
    let prices = this.getSpecificCompanyData(data, 'close');

    // get dates for the closing prices
    let dates = this.getSpecificCompanyData(data, 'date');

    // clear graph and create new graph
    this.graph.destroy();
    this.graph = new Graph(this.$watchlistChart, prices, dates);
  }


  // GET SPECIFIC DATA ARRAY OF COMPANY (STOCK OPEN PRICES, DATES, ETC.)
  getSpecificCompanyData(data, hey) {
    return data.map((day) => {
      return day[hey];
    });
  }


  //
  destroy() {
    if (this.$watchlistCanvas) {
      this.$container.empty();
    }
  }
}

export default Watchlist;