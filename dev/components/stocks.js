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
    this.$stockListContainer = $('#stocks-list');
    this.count = 1;

    // check if local storage exist
    if (store.get(`stocks${this.count}`)) {
      this.renderStocks(this.count);
    }
    else {
      this.getStocks(this.count);
    }

    this.activatePopUp();
    this.activateScroll();
  }


  // RENDER HTML
  render() {
    let html =
      `
        <div class="stocks-container">
          <h3>Stocks</h3>
          <ol id="stocks-list" class="stocks-list"></ol>
        </div>
      `;
    this.$container.append(html);
  }


  // GET LIST OF COMPANIES
  getStocks(num) {
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
        // store list of stocks
        store.set(`stocks${num}`, data);

        this.renderStocks(num);
      }
    });
  }


  // RENDER LIST OF COMPANIES
  renderStocks(num) {
    const stocks = store.get(`stocks${num}`);
    const { datasets } = stocks;

    // render html list for 100 stocks
    const list =  datasets.slice(0, 100).map((stock) => {
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
    this.$container.on('scroll', _.debounce(() => {
      if (this.$container.scrollTop() + this.$container.innerHeight() >= this.$stockListContainer.height()) {
        this.count++;
        if (store.get(`stocks${this.count}`)) {
          this.renderStocks(this.count);
        }
        else {
          this.getStocks(this.count);
        }
      }
    }, 500));
  }
}

export default Stocks;