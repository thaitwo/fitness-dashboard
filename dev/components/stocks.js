import $ from 'jquery';
import _ from 'lodash';
import store from 'store2';
// import Graph from './graph.js';
import StockPopUp from './stock-popup.js';

class Stocks {
  constructor(container) {

    // REGISTER ELEMENTS
    this.$container = container;
    this.graph;
    this.popup;

    this.render();
    this.$chartId = $('#chart');
    this.$stockListContainer = $('#stocks-list');
    this.$stockHeader = $('#stock-name-header');

    this.count = 1;

    if (store.get(`stocks${this.count}`)) {
      this.renderStocks(this.count);
    }
    else {
      this.getStocks(this.count);
    }

    this.activatePopUp();

    // new StockPopUp(this.$stockListContainer);

    this.$popupStockContainer = $('.popup-stock-container');
    this.watchlist = [];

    this.addToWatchlist();


    // this.activateScroll();
    // this.activateCompanySelection();
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
        // console.log('DATA', data);

        store.set(`stocks${num}`, data);
        console.log(`STORE${num}`, store.get(`stocks${num}`));

        this.renderStocks(num);
      }
    });
  }


  // RENDER LIST OF COMPANIES
  renderStocks(num) {
    const stocks = store.get(`stocks${num}`);
    // const firstStockId = stocks.datasets[0].dataset_code;
    // const firstStockName = stocks.datasets[0].name.split('(')[0];
    const { datasets } = stocks;

    // console.log(datasets);

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
    // this.$stockHeader.html(firstStockName);
    // this.getPrice(firstStockId);
  }


  activatePopUp() {
    const that = this;
    this.$stockListContainer.on('click', 'button', function(event) {
      event.preventDefault();

      let id = this.id;
      console.log(id);
      that.popup = new StockPopUp(id);
    });
  }


  // UPDATE GRAPH ON COMPANY SELECTION
  // activateCompanySelection() {
  //   const that = this;

  //   // Add click handler on the stocks list
  //   this.$stockListContainer.on('click', 'button', function(event)  {
  //     event.preventDefault();

  //     let id = this.id;
  //     let name = $(this).children('.stock-name').text();

  //     that.$stockHeader.html(name);
  //     that.updateGraph(id);
  //   });
  // }


  // UPDATE GRAPH
  // updateGraph(id) {
  //   // Destroy current graph
  //   this.graph.destroy();
  //   // console.log(id);

  //   this.getPrice(id);
  // }


  // LOAD MORE STOCK ON SCROLL
  activateScroll() {
    this.$container.on('scroll', _.debounce(() => {
      if (this.$container.scrollTop() + this.$container.innerHeight() >= this.$stockListContainer.height()) {
        // console.log('scrollTop', this.$container.scrollTop(), 'innerHeight', this.$container.innerHeight());
        // console.log('listHeight', this.$stockListContainer.height());
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


  // CLEAR DASHBOARD CANVAS
  destroy() {
    this.$container.empty();
  }
}

export default Stocks;
