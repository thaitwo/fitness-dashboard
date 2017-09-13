import $ from 'jquery';
import _ from 'lodash';
import store from 'store2';
import StockPopUp from './stock-popup.js';

class Stocks {
  constructor(container) {
    // REGISTER ELEMENTS
    this.$container = container;
    this.graph;
    this.popup;

    this.render();
    this.$stocksContainer = $('.stocks-container');
    this.$loadingIcon = this.$stocksContainer.find('.icon-loading');
    this.$stockListContainer = this.$stocksContainer.find('#stocks-list');
    this.count = 1;

    this.getStocks();
    this.activatePopUp();
    this.activateScroll();
  }


  // RENDER HTML
  render() {
    let html =
      `
        <div class="stocks-container">
          <h3>Stocks</h3>
          <div class="icon-loading">
            <i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
          </div>
          <ol id="stocks-list" class="stocks-list"></ol>
        </div>
      `;
    this.$container.append(html);
  }


  // RETRIEVE STOCKS FROM EITHER API OR STORE
  getStocks() {
    const stocks = store.get(`stocks${this.count}`) || [];

    // check if local storage exist
    if (stocks.length) {
      this.renderStocks(this.count);
    }
    else {
      this.fetchStocks(this.count);
    }
  }


  // GET LIST OF COMPANIES
  fetchStocks(num) {
    // display loading icon
    this.$loadingIcon.addClass('is-visible');

    $.ajax({
      // Below is what entire URL would look like:
      // https://www.quandl.com/api/v3/datasets.json?database_code=WIKI&per_page=100&sort_by=id&page=1&api_key=tskzGKweRxWgnbX2pafZ
      url: 'https://www.quandl.com/api/v3/datasets.json',
      dataType: 'json',
      data: {
        database_code: 'WIKI',
        per_page: '100',
        sort_by: 'id',
        page: `${num}`,
        api_key: 'tskzGKweRxWgnbX2pafZ'
      },
      error: (xhr, message, error) => {
        console.log(message, error);
      },
      success: (data) => {
        let stocks = data.datasets;
        // store list of stocks
        store.set(`stocks${num}`, stocks);

        this.renderStocks(num);
      },
      complete: () => {
        this.$loadingIcon.removeClass('is-visible');
      }
    });
  }


  // RENDER LIST OF COMPANIES
  renderStocks(num) {
    const stocks = store.get(`stocks${num}`);

    // render html list for 100 stocks
    const list =  stocks.slice(0, 100).map((stock) => {
      const { dataset_code: stockCode, name } = stock;
      const stockName = name.split('(')[0];

      return `
        <li>
          <button id="${stockCode}">
            <span class="stock-code">${stockCode}</span>
            <span class="stock-name">${stockName}</span>
            <span class="icon-add-watchlist"><i class="fa fa-plus-square fa-2x" aria-hidden="true"></i></span>
          </button>
        </li>
      `;
    });
    this.$stockListContainer.append(list);
  }


  // CREATE & DISPLAY NEW POPUP MODAL WHEN A STOCK IS CLICKED
  activatePopUp() {
    const that = this;

    this.$stockListContainer.on('click', 'button', function(event) {
      event.preventDefault();

      let companyId = this.id;
      let companyName = $(this).find('span.stock-name')[0].innerText;

      // create new popup
      that.popup = new StockPopUp(companyId, companyName);
    });
  }


  // LOAD MORE STOCK ON SCROLL
  activateScroll() {
    this.$stocksContainer.on('scroll', _.debounce(() => {
      if (this.$stocksContainer.scrollTop() + this.$stocksContainer.innerHeight() >= this.$stockListContainer.height()) {
        this.count++;
        if (store.get(`stocks${this.count}`)) {
          this.renderStocks(this.count);
        }
        else {
          this.fetchStocks(this.count);
        }
      }
    }, 500));
  }


  destroy() {
    if (this.$stocksContainer) {
      this.$container.empty();
    }
  }
}

export default Stocks;