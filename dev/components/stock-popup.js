import $ from 'jquery';
import store from 'store2';
import Graph from './graph.js';


class StockPopUp {
  constructor(companyId, companyName) {
    this.$mainContainer = $('.main-container');
    this.graph;

    this.renderPopUpTemplate();

    // REGISTER POPUP ELEMENTS
    this.$popupContainer = $('.popup-modal');
    this.$popupContentContainer = $('.popup-stock-container');
    this.$chartContainer = $('#popup-chart');
    this.$stockName = $('.popup-stock-name');
    this.$tbody = $('.popup-modal table tbody');
    this.$loadingIcon = $('.icon-loading');
    this.$watchlistButton = $('.popup-stock-container button');

    this.renderPopUpContent(companyId, companyName);
    this.activateWatchlistButtonState(companyId);
    this.addToWatchlist();
  }

  // RENDER HTML FOR POPUP MODAL
  renderPopUpTemplate() {
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
            </div>
            <canvas id="popup-chart" width="700" height="320"></canvas>
          </div>
          <button class="button btn-popup-watchlist">Add to watchlist</button>
        </div>
      </div>
    `;
    this.$mainContainer.prepend(popupModal);
  }


  // RENDER STOCK CONTENT FOR POPUP
  renderPopUpContent(companyId, companyName) {

    // check if there's locally stored data before making Ajax request
    if (store.get(`${companyId}`)) {
      this.renderStockInfo(companyId, companyName);
      this.renderGraph(companyId);
    }
    else {
      this.getPrice(companyId, companyName);
    }

    // disable closing of viewer upon click on popup container
    this.$popupContentContainer.on('click', function(event) {
      event.stopPropagation();
    });

    // remove popup modal
    this.$popupContainer.on('click', function() {
      $(this).remove();
    });
  }


  // GET COMPANY STOCK DATA
  getPrice(companyId, companyName) {
    // display loading icon
    this.$loadingIcon.addClass('is-visible');
    $.ajax({
      url: `https://www.quandl.com/api/v3/datasets/WIKI/${companyId}/data.json?api_key=tskzGKweRxWgnbX2pafZ`,
      dataType: 'json',
      success: (data) => {
        // store company data
        store.set(`${companyId}`, data);

        // render stock info
        this.renderStockInfo(companyId, companyName);

        // render graph
        this.renderGraph(companyId);
      },
      complete: () => {
        this.$loadingIcon.removeClass('is-visible');
      }
    });
  }


  // RENDER TABLE WITH STOCK INFO
  renderStockInfo(companyId, companyName) {
    const stockData = store.get(`${companyId}`);

    // get stock info from local storage
    let closePrice = stockData.dataset_data.data[0][4];
    let openPrice = stockData.dataset_data.data[0][1];
    let low = stockData.dataset_data.data[0][3];
    let high = stockData.dataset_data.data[0][2];
    let volume = stockData.dataset_data.data[0][5];

    // render stock name
    this.$stockName.text(companyName);

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

    // add stock id to watchlist button
    this.$watchlistButton.attr('id', `${companyId}`);
  }


  // RENDER GRAPH
  renderGraph(companyId) {
    const stockData = store.get(`${companyId}`);

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


  // ADD STOCK TO WATCHLIST
  addToWatchlist() {
    // retrieve watchlist array from storage
    let watchlist = store.get('watchlist') || []; // ['AAPL', 'AMD'] or []


    this.$popupContentContainer.on('click', 'button', function(event) {
      event.preventDefault();
      const $this = $(this);
      let id = this.id;
      const hasStock = watchlist.includes(id);

      // if stock doesn't exist in watchlist, then add to watchlist
      if (hasStock === false) {
        // add stock into watchlist array
        watchlist.push(id);
        // store updated watchlist array
        store.set('watchlist', watchlist);

        // update watchlist button to REMOVE
        $this.addClass('is-remove');
        $this.text('Remove from watchlist');
      }
      // if stock exist, then remove it from watchlist
      else {
        // remove stock from watchlist array
        let index = watchlist.indexOf(id);
        if (index != -1) {
          watchlist.splice(index, 1);
        }

        // store upated watchlist array
        store.set('watchlist', watchlist);
        console.log('Removed from watchlist', watchlist);

        // update watchlist button to ADD
        $this.removeClass('is-remove');
        $this.text('Add to watchlist');
      }
    });
  }


  // UPDATE WATCHLIST BUTTON STATE (ADD OR REMOVE)
  activateWatchlistButtonState(companyId) {
    if (store.get('watchlist').includes(companyId)) {
      this.$watchlistButton.addClass('is-remove');
      this.$watchlistButton.text('Remove from watchlist');
    }
    else {
      this.$watchlistButton.removeClass('is-remove');
      this.$watchlistButton.text('Add to wathclist');
    }
  }
}

export default StockPopUp;