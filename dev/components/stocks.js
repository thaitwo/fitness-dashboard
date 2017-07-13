import $ from 'jquery';
import Graph from '../components/graph.js';

class Stocks {
  constructor(container) {

    // REGISTER ELEMENTS
    this.$container = container;

    this.renderStocksPageHTML();

    this.$stockListContainer = $('#stocks-list');

    // INITIALIZE
    this.getStocks();
  }


  // GET LIST OF COMPANIES
  getStocks() {
    $.ajax({
      // https://www.quandl.com/api/v3/datasets.json?database_code=WIKI&per_page=100&sort_by=id&page=1&api_key=tskzGKweRxWgnbX2pafZ
      url: 'https://www.quandl.com/api/v3/datasets.json',
      dataType: 'json',
      data: {
        database_code: 'WIKI',
        per_page: '100',
        sort_by: 'id',
        page: '1',
        api_key: 'tskzGKweRxWgnbX2pafZ'
      },
      error: (xhr, message, error) => {
        console.log(message, error);
      },
      success: this.renderStocksList.bind(this)
    })
  }


  // RENDER LIST OF COMPANIES
  renderStocksList(data) {
    let { datasets, name } = data;

    let list =  datasets.slice(0, 40).map((stock) => {
      let { dataset_code: stockCode, name: stockName } = stock;
      stockName = stockName.split('(')[0];

      return `<li>
                <button id="${stockCode}">
                  <span class="stock-code">${stockCode}</span>
                  <span class="stock-name">${stockName}</span>
                </button>
              </li>`;
    });

    this.$stockListContainer.append(list);
  }


  renderStocksPageHTML() {
    let html = `
      <div class="stocks-canvas">
        <h3>Add stocks to watchlist</h3>
        <ul id="stocks-list" class="stocks-list"></ul>
      </div>
    `
    this.$container.append(html);
  }


  // CLEAR DASHBOARD CANVAS
  destroy() {
    this.$container.empty();
  }
}

export default Stocks;
