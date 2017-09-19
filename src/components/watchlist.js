import $ from 'jquery';
import store from 'store2';

class Watchlist {
  constructor(container) {
    this.$container = container;

    this.render();

    this.$watchlistContainer = $('.watchlist-container');
    this.$watchlist = this.$watchlistContainer.find('.watchlist-list');

    this.getStocks();
  }


  render() {
    let html =
    `
      <div class="watchlist-container">
        <ol class="watchlist-list"></ol>
      </div>
    `;

    this.$container.append(html);
  }


  getStocks() {
    let stocks = store.get('watchlist') || [];
    // let hasStocks = stocks.includes(`${this.companyId} ${this.companyName}`);

    // console.log(stocks);
    // console.log(hasStocks);

    // if (hasStocks === true) {
    let list = stocks.map((stock) => {
      const stockCode = stock.split('|')[0];
      let stockName = stock.split('|')[1];
      console.log(stockCode);

      return `
        <li>
          <button>
            <span class="watchlist-item-code">${stockCode}</span><span class="watchlist-item-name">${stockName}</span>
          </button>
        </li>
      `;
    });

    this.$watchlist.append(list);
    // }
  }


  activateWatchlist() {

  }


  fetchData() {

  }


  destroy() {
    if (this.$watchlistContainer) {
      this.$container.empty();
    }
  }
}

export default Watchlist;