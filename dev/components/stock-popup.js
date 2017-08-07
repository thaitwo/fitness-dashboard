import $ from 'jquery';
import store from 'store2';
import Graph from './graph.js';


class StockPopUp {
  constructor(id, stocksContainer) {
    this.$mainContainer = $('.main-container');
    this.$stocksContainer = stocksContainer;
    this.graph;
    this.watchlist = [];

    this.renderPopUp();

    this.$popupContainer = $('.popup-modal');
    this.$popupContentContainer = $('.popup-stock-container');
    this.$chartContainer = $('#popup-chart');
    this.$stockName = $('.popup-stock-name');
    this.$tbody = $('.popup-modal table tbody');
    this.$loadingIcon = $('.icon-loading');
    this.$watchlistButton = $('.popup-stock-container button');

    this.activatePopUp(id);
    this.addToWatchlist();
  }

  // RENDER HTML FOR POPUP MODAL
  renderPopUp() {
    const popupModal = `
      <div class="popup-modal">
        <div class="popup-stock-container">
          <h3 class="text-headline popup-stock-name"></h3>
          <table>
            <tbody>
            </tbody>
          </table>
          <div class="popup-chart-container">
            <div class="icon-loading">
              <i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
              <span class="sr-only">Loading...</span>
            </div>
            <canvas id="popup-chart" width="700" height="320"></canvas>
          </div>
          <button class="button btn-popup-watchlist">Add to watchlist</button>
        </div>
      </div>
    `;
    this.$mainContainer.prepend(popupModal);
  }


  // DISPLAY POPUP MODAL ON CLICK EVENT
  activatePopUp(id) {

    // Destroy graph before loading new one
    if (this.graph) {
      this.graph.destroy();
    }

    // Check if there's locally stored data before making Ajax request
    if (store.get(`${id}`)) {
      this.renderStockInfo(id);
      this.renderGraph(id);
    }
    else {
      this.getPrice(id);
    }

    // let name = $(this).find('span.stock-name')[0].innerText;
    // this.$stockName.text(name);

    // Disable closing of viewer upon click on image content container
    this.$popupContentContainer.on('click', function(event) {
      event.stopPropagation();
    });

    // CLOSE POPUP MODAL
    this.$popupContainer.on('click', function() {
      $(this).remove();
    });
  }


  // GET COMPANY STOCK DATA
  getPrice(companyId) {
    this.$loadingIcon.addClass('is-visible');
    $.ajax({
      // https://www.quandl.com/api/v3/datasets/WIKI/FB/data.json?api_key=tskzGKweRxWgnbX2pafZ
      url: `https://www.quandl.com/api/v3/datasets/WIKI/${companyId}/data.json?api_key=tskzGKweRxWgnbX2pafZ`,
      dataType: 'json',
      success: (data) => {
        // STORE COMPANY DATA
        store.set(`${companyId}`, data);

        this.renderStockInfo(companyId);

        // RENDER GRAPH
        this.renderGraph(companyId);
      },
      complete: () => {
        this.$loadingIcon.removeClass('is-visible');
      }
    });
  }


  destroy() {
    if (this.graph) {
      this.graph.destroy();
    }
  }


  renderStockInfo(companyId) {
    const stockData = store.get(`${companyId}`);

    let closePrice = stockData.dataset_data.data[0][4];
    let openPrice = stockData.dataset_data.data[0][1];
    let low = stockData.dataset_data.data[0][3];
    let high = stockData.dataset_data.data[0][2];
    let volume = stockData.dataset_data.data[0][5];

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

    this.$tbody.empty();
    this.$tbody.append(row);

    this.$watchlistButton.attr('id', `${companyId}`);
  }


  // RENDER GRAPH
  renderGraph(companyId) {
    const stockData = store.get(`${companyId}`);

    // Get opening prices for company stock
    let priceData = this.getSpecificCompanyData(stockData, 1);

    // Get dates for the opening prices
    let dateLabels = this.getSpecificCompanyData(stockData, 0);

    // Create new graph for this company stock
    this.graph = new Graph(this.$chartContainer, priceData, dateLabels);
  }


  addToWatchlist() {
    const that = this;

    this.$popupContentContainer.on('click', 'button', function(event) {
      event.preventDefault();
      const $this = $(this);
      let id = this.id;

      // add/remove stock from watchlist
      if (!that.watchlist.includes(id)) {
        that.watchlist.push(id);
        console.log('Added to watchlist', that.watchlist);
      }
      else {
        let index = that.watchlist.indexOf(id);
        if (index !== -1) {
          that.watchlist.splice(index, 1);
        }
        console.log('Remove from watchlist', that.watchlist);
      }

      // update button state
      $this.toggleClass('is-disabled');

      if ($this.hasClass('is-disabled')) {
        $this.html('Remove from watchlist');
      }
      else {
        $this.html('Add to watchlist');
      }
    });
  }


  // GET SPECIFIC DATA ARRAY OF COMPANY (STOCK OPEN PRICES, DATES, ETC.)
  getSpecificCompanyData(data, num) {
    return data.dataset_data.data.slice(0, 30).map((day) => {
      return day[num];
    }).reverse();
  }
}

export default StockPopUp;
