import $ from 'jquery';
import Navigo from 'navigo';
// import Watchlist from './watchlist.js';
import Stocks from './stocks';
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

    // Root handler
    this.router.on(() => {
      this.currentPage = new Stocks(this.$canvas);
    }).resolve();

    // Routes handler
    this.router.on({
      '/watchlist': () => {
        this.currentPage = new Stocks(this.$canvas);
      },
      '/stocks': () => {
        // this.currentPage = new Stocks(this.$canvas);
      },
      '/compare': () => {
        // Insert functionality
      }
    })
    .resolve();

    // Global hook => clear page & event handlers before loading new route/page
    this.router.hooks({
      before: (done) => {
        if(this.currentPage) {
          this.currentPage.destroy();
        }
        done();
      }
    });
  }
}

export default Router;