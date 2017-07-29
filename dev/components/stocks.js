import $ from 'jquery';
import store from 'store2';
import Graph from './graph.js';

class Stocks {
  constructor(container) {

    // REGISTER ELEMENTS
    this.$container = container;
    this.graph;

    this.render();
    this.$chartId = $('#chart');
    this.$stockListContainer = $('#stocks-list');
    this.$stockHeader = $('#stock-name-header');

    if (store.get('stocks')) {
      this.renderStocks();
    }
    else {
      this.getStocks(1);
    }

    this.activateScroll();
    // this.activateCompanySelection();
  }


  // RENDER HTML
  render() {
    let html =
      `
        <div class="stocks-container">
          <h3>All Stocks</h3>
          <ul id="stocks-list" class="stocks-list"></ul>
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
        store.set('stocks', data);
        this.renderStocks();
      }
    });
  }


  // RENDER LIST OF COMPANIES
  renderStocks() {
    const stocks = store.get('stocks');
    const firstStockId = stocks.datasets[0].dataset_code;
    const firstStockName = stocks.datasets[0].name.split('(')[0];
    const { datasets } = stocks;

    console.log(datasets);

    const list =  datasets.slice(0, 100).map((stock) => {
      const { dataset_code: stockCode, name } = stock;
      const stockName = name.split('(')[0];

      return `
        <li>
          <button id="${stockCode}">
            <span class="stock-code">${stockCode}</span>
            <span class="stock-name">${stockName}</span>
          </button>
        </li>
      `;
    });

    this.$stockListContainer.append(list);
    // this.$stockHeader.html(firstStockName);
    // this.getPrice(firstStockId);
  }


  // GET COMPANY STOCK DATA
  getPrice(companyId) {
    $.ajax({
      // https://www.quandl.com/api/v3/datasets/WIKI/FB/data.json?api_key=tskzGKweRxWgnbX2pafZ
      url: `https://www.quandl.com/api/v3/datasets/WIKI/${companyId}/data.json?api_key=tskzGKweRxWgnbX2pafZ`,
      dataType: 'json',
      success: this.renderGraph.bind(this)
    });
  }


  // RENDER GRAPH
  renderGraph(data) {
    // Get opening prices for company stock
    let priceData = this.getSpecificCompanyData(data, 1);

    // Get dates for the opening prices
    let dateLabels = this.getSpecificCompanyData(data, 0);

    // Create new graph for this company stock
    this.graph = new Graph(this.$chartId, priceData, dateLabels);
  }


  // GET SPECIFIC DATA ARRAY OF COMPANY (STOCK OPEN PRICES, DATES, ETC.)
  getSpecificCompanyData(data, num) {
    return data.dataset_data.data.slice(0, 30).map((day) => {
      return day[num];
    }).reverse();
  }


  // UPDATE GRAPH ON COMPANY SELECTION
  activateCompanySelection() {
    const that = this;

    // Add click handler on the stocks list
    this.$stockListContainer.on('click', 'button', function(event)  {
      event.preventDefault();

      let id = this.id;
      let name = $(this).children('.stock-name').text();

      that.$stockHeader.html(name);
      that.updateGraph(id);
    });
  }


  // UPDATE GRAPH
  updateGraph(id) {
    // Destroy current graph
    this.graph.destroy();
    // console.log(id);

    this.getPrice(id);
  }


  activateScroll() {
    let count = 1;
    // console.log(this.$container.height());
    // console.log(this.$stockListContainer.height());
    this.$container.scroll(() => {
      if (this.$container.scrollTop() + this.$container.innerHeight() >= this.$stockListContainer.height()) {
        count++;
        this.getStocks(count);
      }
    });
  }


  // CLEAR DASHBOARD CANVAS
  destroy() {
    this.$container.empty();
  }
}

export default Stocks;
