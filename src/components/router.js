import $ from 'jquery';
import Navigo from 'navigo';
import Stock from './stock';
import Stocks from './stocks-page';
import Watchlist from './watchlist';
const DASHBOARD_URL = 'stocks/';


class Router {
  constructor() {
    this.$canvas = $('.canvas');

    // INITIALIZE NAVIGO ROUTER
    this.root = null;
    this.useHash = true;
    this.router = new Navigo(this.root, this.useHash);

    this.currentPage = null;

    this.activateRouter();
  }


  // CHANGE PAGE / RENDER URL
  changePage(pageId) {
    if (pageId === 'stocks') {
      this.router.navigate(`${DASHBOARD_URL}`);
    }
    else {
      this.router.navigate(`${pageId}`);
    }
  }


  // LISTEN FOR ROUTE CHANGES
  activateRouter() {

    // Routes handler
    this.router.on({
      'stocks/:symbol': (params) => {
        const symbol = params.symbol.toUpperCase();
        this.currentPage = new Stock(symbol);
      },
      'compare': () => {
        // Insert functionality
      },
      'watchlist': () => {
        this.currentPage = new Watchlist(this.$canvas);
      },
      '*': () => {
        this.currentPage = new Stocks(this.$canvas);
      }
    })
    .resolve();

    // Global hook => clear page & event handlers before loading new route/page
    this.router.hooks({
      before: (done) => {
        if (this.currentPage && this.currentPage.destroy) {
          this.currentPage.destroy();
        }
        done();
      }
    });
  }
}

export default Router;