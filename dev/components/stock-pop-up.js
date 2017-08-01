import $ from 'jquery';
import store from 'store2';
import Graph from './graph.js';


class StockPopUp {
  constructor(container) {
    this.container = container;

  }

  renderPopUp() {
    const html = `
      <div class="modal-stock-container">
        <h3 class="modal-stock-name"></h3>
        <div class="modal-chart-container">
          <canvas id="modal-chart" width="900" height="400"></canvas>
        </div>
      </div>
    `;
    html.show();
  }

  activatePopUp() {
    this.container.on('click', 'button', function() {

    });
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
}

export default StockPopUp;
