import $ from 'jquery';
import Navigo from 'navigo';
import StockPage from '../pages/stock-page';
import HomePage from '../pages/home-page';
import Watchlist from './watchlist';
const DASHBOARD_URL = 'stocks/';


class Router {
  constructor(navContainerId) {
    this.$navContainer = $(navContainerId);

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
      this.router.navigate(`${pageId}/`);
    }
  }


  // LISTEN FOR ROUTE CHANGES
  activateRouter() {

    // Routes handler
    this.router.on({
      'stocks/:symbol': (params) => {
        const symbol = params.symbol.toUpperCase();
        this.currentPage = new StockPage(symbol);
        // Remove active styles for Sidenav items
        this.$navContainer.find('.active').removeClass('active');
      },
      'compare': () => {
        // Insert functionality
      },
      'watchlist': () => {
        this.currentPage = new Watchlist('#canvas');
      },
      '*': () => {
        this.currentPage = new HomePage('#canvas');
      }
    })
    .resolve();

    // Global hook => clear page & event handlers before loading new route/page
    this.router.hooks({
      before: (done) => {
        if (this.currentPage && this.currentPage.destroyPage) {
          this.currentPage.destroyPage();
        }
        done();
      }
    });
  }
}

export default Router;