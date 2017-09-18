import $ from 'jquery';
import store from 'store2';
import Graph from './graph.js';


class StockPopUp {
  constructor(companyId, companyName) {
    this.companyId = companyId;
    this.companyName = companyName;
    this.$mainContainer = $('.main-container');
    this.graph;

    this.render();

    // REGISTER POPUP ELEMENTS
    this.$popupContainer = $('.popup-modal');
    this.$popupContentContainer = this.$popupContainer.find('.popup-stock-container');
    this.$chartContainer = this.$popupContainer.find('#popup-chart');
    this.$stockName = this.$popupContainer.find('.popup-stock-name');
    this.$tbody = this.$popupContainer.find('table tbody');
    this.$exitIcon = this.$popupContainer.find('.fa-times-circle');
    this.$loadingIcon = this.$popupContainer.find('.icon-loading');
    this.$watchlistButton = this.$popupContainer.find('#btn-watchlist');

    this.activateEventListeners();
    this.getStockData();
  }


  // RENDER HTML FOR POPUP MODAL
  render() {
    const popupModal = `
      <div class="popup-modal">
        <div class="popup-stock-container">
          <h3 class="text-headline popup-stock-name"></h3>
          <i class="fa fa-times-circle fa-2x" aria-hidden="true"></i>
          <table>
            <tbody>
            </tbody>
          </table>
          <div class="popup-chart-container">
            <div class="icon-loading">
              <i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
            </div>
            <canvas id="popup-chart" width="700" height="320"></canvas>
          </div>
          <button id="btn-watchlist" class="button btn-popup-watchlist">Add to watchlist</button>
        </div>
      </div>
    `;
    this.$mainContainer.prepend(popupModal);
  }


  // REMOVE EVENT LISTENERS & DESTROY POPUP HTML
  destroy() {
    this.$popupContainer.off();
    this.$popupContentContainer.off();
    this.graph.destroy();
    this.$popupContainer.remove();
  }


  // ACTIVATE EVENT LISTENERS
  activateEventListeners() {
    const that = this;

    // retrieve watchlist array from storage
    let watchlist = store.get('watchlist') || []; // ['AAPL', 'AMD'] or []
    let hasStock = watchlist.includes(`${this.companyId} | ${this.companyName}`); // true/false

    // update watchlist button state
    this.toggleButtonState(hasStock);

    // Add/remove stock from watchlist
    this.$popupContentContainer.on('click', '#btn-watchlist', function(event) {
      event.preventDefault();

      const $this = $(this);
      let hasStock = watchlist.includes(`${that.companyId} | ${that.companyName}`);

      // if stock is not in watchlist, then add to watchlist
      if (hasStock === false) {
        watchlist.push(`${that.companyId} | ${that.companyName}`);
        store.set('watchlist', watchlist);

        // update watchlist button to REMOVE
        $this.addClass('has-warning');
        $this.text('Remove from watchlist');
      }
      // if stock exist, then remove it from watchlist
      else {
        // remove stock from watchlist array
        let index = watchlist.indexOf(`${that.companyId} | ${that.companyName}`);
        if (index != -1) {
          watchlist.splice(index, 1);
        }

        // store upated watchlist array
        store.set('watchlist', watchlist);

        // update watchlist button to ADD
        $this.removeClass('has-warning');
        $this.text('Add to watchlist');
      }
    });

    // Disable closing of viewer upon click on popup container
    this.$popupContentContainer.on('click', function(event) {
      event.stopPropagation();
    });

    // Remove popup modal on click of exit icon
    this.$exitIcon.on('click', function(event) {
      event.stopPropagation();
      that.destroy();
    });

    // Remove popup modal on click outside of modal
    this.$popupContainer.on('click', function() {
      that.destroy();
    });
  }


  // UPDATE WATCHLIST BUTTON STATE - TRUE: STOCK IN WATCHLIST, FALSE: STOCK NOT IN WATCHLIST
  toggleButtonState(boolean) {
    if (boolean === true) {
      this.$watchlistButton.addClass('has-warning');
      this.$watchlistButton.text('Remove from watchlist');
    }
    else {
      this.$watchlistButton.removeClass('has-warning');
      this.$watchlistButton.text('Add to wathclist');
    }
  }


  // RENDER STOCK CONTENT FOR POPUP
  getStockData() {

    // check if there's locally stored data before making Ajax request
    if (store.get(`${this.companyId}`)) {
      this.renderStockInfo();
      this.renderGraph();
    }
    else {
      this.fetchStockData();
    }
  }


  // FETCH STOCK DATA
  fetchStockData() {
    // display loading icon
    this.$loadingIcon.addClass('is-visible');

    // request stock data
    $.ajax({
      url: `https://www.quandl.com/api/v3/datasets/WIKI/${this.companyId}/data.json?api_key=tskzGKweRxWgnbX2pafZ`,
      dataType: 'json',
      error: (xhr, message, error) => {
        console.log(message, error);
      },
      success: (data) => {
        // store company data
        store.set(`${this.companyId}`, data);

        // render stock info
        this.renderStockInfo();

        // render graph
        this.renderGraph();
      },
      complete: () => {
        this.$loadingIcon.removeClass('is-visible');
      }
    });
  }


  // RENDER TABLE WITH STOCK INFO
  renderStockInfo() {
    const stockData = store.get(`${this.companyId}`);
    let details = stockData.dataset_data.data[0];

    // get stock info from local storage
    let closePrice = details[4];
    let openPrice = details[1];
    let low = details[3];
    let high = details[2];
    let volume = details[5];

    // render stock name
    this.$stockName.text(this.companyName);

    let row = `
      <tr>
        <td class="key">Close</td>
        <td class="val">${closePrice}</td>
      </tr>
      <tr>
        <td class="key">Open</td>
        <td class="val">${openPrice}</td>
      </tr>
      <tr>
        <td class="key">Day's Range</td>
        <td class="val">${low} - ${high}</td>
      </tr>
      <tr>
        <td class="key">Volume</td>
        <td class="val">${volume}</td>
      </tr>
    `;
    this.$tbody.append(row);
  }


  // RENDER GRAPH
  renderGraph() {
    const stockData = store.get(`${this.companyId}`);

    // get opening prices for company stock
    let priceData = this.getSpecificCompanyData(stockData, 1);

    // get dates for the opening prices
    let dateLabels = this.getSpecificCompanyData(stockData, 0);

    // create new graph for this company stock
    this.graph = new Graph(this.$chartContainer, priceData, dateLabels);
  }


  // GET SPECIFIC DATA ARRAY OF COMPANY (STOCK OPEN PRICES, DATES, ETC.)
  getSpecificCompanyData(data, num) {
    return data.dataset_data.data.slice(0, 30).map((day) => {
      return day[num];
    }).reverse();
  }
}

export default StockPopUp;