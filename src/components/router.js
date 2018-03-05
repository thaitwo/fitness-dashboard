import $ from 'jquery';
import Navigo from 'navigo';
import Stocks from './stocks';
import Watchlist from './watchlist';
const DASHBOARD_URL = 'dashboard/';


class Router {
  constructor() {
    this.$canvas = $('.dashboard-canvas');

    // INITIALIZE NAVIGO ROUTER
    this.root = null;
    this.useHash = true;
    this.router = new Navigo(this.root, this.useHash);

    this.currentPage = null;

    this.activateRouter();
  }


  // CHANGE PAGE / RENDER URL
  changePage(pageId) {
    if (pageId === 'dashboard') {
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
      'stocks': () => {
        this.currentPage = new Stocks(this.$canvas);
      },
      'compare': () => {
        // Insert functionality
      },
      '*': () => {
        this.currentPage = new Watchlist(this.$canvas);
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