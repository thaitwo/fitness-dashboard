import $ from 'jquery';
import store from 'store2';
import axios from 'axios';
import Graph from './graph.js';


class Watchlist {
  constructor(container) {
    this.$container = container;
    this.graph;
    this.symbol;
    this.interval = '1m';
    this.watchlist = store.get('watchlist') || [];

    this.renderCanvasHTML();

    this.$watchlistCanvas = $('.watchlist-canvas');
    this.$watchlistContainer = this.$watchlistCanvas.find('.watchlist-container');
    this.$watchlist = this.$watchlistCanvas.find('.watchlist-list');
    this.$watchlistChart = this.$watchlistCanvas.find('#watchlist-chart');
    this.$stockName = this.$watchlistCanvas.find('#watchlist-stock-name');
    this.$stockSymbol = this.$watchlistCanvas.find('#watchlist-stock-symbol')
    this.$watchlistDropdown = this.$watchlistCanvas.find('#watchlist-dropdown');
    this.$keyStatsContainer = this.$watchlistCanvas.find('#watchlist-key-stats-container');

    this.getStocks();
    this.renderDataForFirstStock();
    this.activateEventListeners();
    this.udpateGraphIntervals();
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
              <div class="watchlist-chart-header">
                <div class="watchlist-chart-stock-container">
                  <h2 id="watchlist-stock-name"></h2>
                  <h3 id="watchlist-stock-symbol"></h3>
                </div>
                <div class="watchlist-dropdown-container">
                  <select id="watchlist-dropdown">
                    <option value="1m">1M</option>
                    <option value="3m">3M</option>
                    <option value="6m">6M</option>
                    <option value="ytd">YTD</option>
                    <option value="1y">1Y</option>
                    <option value="2y">2Y</option>
                    <option value="5y">5Y</option>
                    <option value="max">MAX</option>
                  </select>
                </div>
              </div>
              <canvas id="watchlist-chart" width="900" height="320"></canvas>
            </div>
            <div id="watchlist-summary-container">
              <div id="watchlist-key-stats-container" class="box marginRight">
                
              </div>
              <div class="box">
                <h2 class="text-header">Latest News</h2>
              </div>
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


  // UPDATE GRAPH WITH NEW INTERVAL
  udpateGraphIntervals() {
    const that = this;
    this.$watchlistDropdown.on('change', function(event) {
      const selectedInterval = this.value;
      that.interval = selectedInterval; // set this.interval

      // P = Prices
      // S = Stats
      // N = News
      that.fetchStockData(that.symbol, 'P');
    })
  }


  // GET DATA FOR COMPANY
  fetchStockData(symbol, requestType) {
    if (requestType === 'PS') {
      axios.all([
        axios({
          method: 'get',
          url: `https://cloud.iexapis.com/v1/stock/${symbol}/chart/${this.interval}`,
          params: {
            token: 'pk_a12f90684f2a44f180bcaeb4eff4086d',
          },
          responseType: 'json'
        }),
        axios({
          method: 'get',
          url: `https://cloud.iexapis.com/v1/stock/${symbol}/stats`,
          params: {
            token: 'pk_a12f90684f2a44f180bcaeb4eff4086d',
          },
          responseType: 'json'
        })
      ])
      .then(axios.spread((prices, stats) => {
        console.log('stats', stats.data);
        store.set(`${symbol}-${this.interval}`, prices.data);
        store.set(`${symbol}-stats`, stats.data);
      }))
      .catch(error => console.log(error))
      .finally(() => {
        this.renderGraph();
        this.renderKeyStats();
      })
    }
    else if (requestType === 'P') {
      axios({
        method: 'get',
        url: `https://cloud.iexapis.com/v1/stock/${symbol}/chart/${this.interval}`,
        params: {
          token: 'pk_a12f90684f2a44f180bcaeb4eff4086d',
        },
        responseType: 'json'
      })
      .then((prices) => {
        store.set(`${symbol}-${this.interval}`, prices.data);
      })
      .catch(error => console.log(error))
      .finally(() => {
        this.renderGraph();
      })
    }
  }


  // RENDER GRAPH
  renderGraph() {
    // check if historical prices for the company exists in localStorage
    if (store.get(`${this.symbol}-${this.interval}`) !== null) {
      const data = store.get(`${this.symbol}-${this.interval}`);
      // get closing prices for stock
      const prices = this.getSpecificCompanyData(data, 'close');
      // get dates for closing prices
      const dates = this.getSpecificCompanyData(data, 'date');
      
      // delete graph if any exists and create new graph
      if (this.graph) {
        this.graph.destroy();
      }
      this.graph = new Graph(this.$watchlistChart, prices, dates);
    }
  }


  // FORMATE LARGE NUMBERS
  formatLargeNumber(num) {
    return Math.abs(Number(num)) >= 1.0e+9 ? (Math.abs(Number(num)) / 1.0e+9).toFixed(2) + "B"
         // Six Zeroes for Millions 
         : Math.abs(Number(num)) >= 1.0e+6 ? (Math.abs(Number(num)) / 1.0e+6).toFixed(2) + "M"
         // Three Zeroes for Thousands
         : Math.abs(Number(num)) >= 1.0e+3 ? (Math.abs(Number(num)) / 1.0e+3).toFixed(2) + "K"
         : Math.abs(Number(num)).toFixed(2);
  }


  // Insert commas into numbers
  formatNumberWithCommas(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }


  // RENDER KEY STATISTICS
  renderKeyStats() {
    if (store.get(`${this.symbol}-stats`) !== null) {
      const stats = store.get(`${this.symbol}-stats`);
      let marketCap = stats.marketcap;
      marketCap = this.formatLargeNumber(marketCap);
      const peRatio = stats.peRatio;
      const wk52High = stats.week52high;
      const wk52Low = stats.week52low;
      const eps = stats.ttmEPS;
      let avg30Vol = stats.avg30Volume;
      avg30Vol = this.formatNumberWithCommas(Math.round(avg30Vol));

      const keyStatsHTML = `
        <h2 class="text-header">Key Statistics</h2>
        <table id="key-stats-table">
          <tr>
            <td>Market Cap</td>
            <td>${marketCap}</td>
          </tr>
          <tr>
            <td>P/E Ratio</td>
            <td>${peRatio}</td>
          </tr>
          <tr>
            <td>52 Wk High</td>
            <td>${wk52High}</td>
          </tr>
          <tr>
            <td>52 Wk Low</td>
            <td>${wk52Low}</td>
          </tr>
          <tr>
            <td>EPS (TTM)</td>
            <td>${eps}</td>
          </tr>
          <tr>
            <td>Avg. Volume (30D)</td>
            <td>${avg30Vol}</td>
          </tr>
        </table>
      `;

      this.$keyStatsContainer.empty();
      this.$keyStatsContainer.append(keyStatsHTML);
    }
  }


  // RENDER GRAPH & DATA FOR FIRST STOCK IN WATCHLIST
  renderDataForFirstStock() {
    // if watchlist has at least one item, render item(s)
    if (this.watchlist.length > 0) {
      const symbol = this.watchlist[0].symbol;
      const name = this.watchlist[0].name;
      this.symbol = symbol;

      this.renderStockName(name);
      
      // make Ajax call to get data for company
      this.fetchStockData(this.symbol, 'PS');
    }
    // If watchlist is empty, render button with link to stocks page
    else {
      this.$watchlistContainer.append(`<a href="/#stocks"><p class="watchlist-add-stocks">Add stocks to watchlist<i class="fa fa-plus-circle" aria-hidden="true"></i></p></a>`);
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
      that.symbol = symbol;
      const name = $(this).find('.watchlist-item-name').text();

      // Add active class to clicked watchlist item
      watchlistItems.removeClass('active');
      clickedEl.addClass('active');

      // render name and graph for watchlist item
      that.renderStockName(name);
      that.fetchStockData(that.symbol, 'PS');
    });
  }


  // RENDER STOCK NAME
  renderStockName(name) {
    this.$stockName.text(name);
    this.$stockSymbol.text(this.symbol);
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