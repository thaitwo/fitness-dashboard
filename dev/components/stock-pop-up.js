import $ from 'jquery';
import store from 'store2';
import Graph from './graph.js';


class StockPopUp {
  constructor(stocksContainer) {
    this.$mainContainer = $('.main-container');
    this.$stocksContainer = stocksContainer;
    this.graph;

    this.renderPopUp();

    this.$popupContainer = $('.popup-modal');
    this.$popupContentContainer = $('.popup-stock-container');
    this.$chartContainer = $('#popup-chart');

    this.activatePopUp();
  }

  // RENDER HTML FOR POPUP MODAL
  renderPopUp() {
    const popupModal = `
      <div class="popup-modal">
        <div class="popup-stock-container">
          <h3 class="popup-stock-name"></h3>
          <div class="popup-chart-container">
            <canvas id="popup-chart" width="800" height="340"></canvas>
          </div>
          <button class="button popup-watchlist">Add to watchlist</button>
        </div>
      </div>
    `;
    this.$mainContainer.prepend(popupModal);
  }


  // DISPLAY POPUP MODAL ON CLICK EVENT
  activatePopUp() {
    const that = this;

    // OPEN POPUP MODAL
    this.$stocksContainer.on('click', 'button', function(event) {
      event.preventDefault();

      if (that.graph) {
        that.graph.destroy();
      }

      let id = this.id;

      // CHECK IF THERE IS LOCALLY STORED DATA BEFORE MAKING AJAX REQUEST
      if (store.get(`${id}`)) {
        that.renderGraph(id);
      }
      else {
        that.getPrice(id);
      }

      that.$popupContainer.fadeIn();
      // that.$popupContainer.addClass('is-visible');
    });

    // Disable closing of viewer upon click on image content container
    this.$popupContentContainer.on('click', function(event) {
      event.stopPropagation();
    });

    // CLOSE POPUP MODAL
    this.$popupContainer.on('click', function() {
      // event.stopPropagation();
      // $(this).removeClass('is-visible');
      $(this).fadeOut();
    });
  }


  // GET COMPANY STOCK DATA
  getPrice(companyId) {
    $.ajax({
      // https://www.quandl.com/api/v3/datasets/WIKI/FB/data.json?api_key=tskzGKweRxWgnbX2pafZ
      url: `https://www.quandl.com/api/v3/datasets/WIKI/${companyId}/data.json?api_key=tskzGKweRxWgnbX2pafZ`,
      dataType: 'json',
      success: (data) => {
        // STORE COMPANY DATA
        store.set(`${companyId}`, data);

        // RENDER GRAPH
        this.renderGraph(companyId);
      }
    });
  }

  destroy() {
    if (this.graph) {
      this.graph.destroy();
    }
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


  // GET SPECIFIC DATA ARRAY OF COMPANY (STOCK OPEN PRICES, DATES, ETC.)
  getSpecificCompanyData(data, num) {
    return data.dataset_data.data.slice(0, 30).map((day) => {
      return day[num];
    }).reverse();
  }
}

export default StockPopUp;
