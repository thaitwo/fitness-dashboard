import $ from 'jquery';
import Navigo from 'navigo';
import Stocks from './components/stocks';
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
    this.router.navigate(`${DASHBOARD_URL}${pageId}`);
  }

  // LISTEN FOR ROUTE CHANGES
  activateRouter() {
    this.router.on('dashboard/stocks', () => {
        this.$canvas.empty();

        // Set current page to this content
        this.currentPage = new Stocks(this.$canvas);
      }
      // {
      //   leave: function(params) {
      //     if(this.currentPage) {
      //       this.currentPage.destroy();
      //     }
      //   }
      // }
      )
    .resolve();
  }
}

export default Router;


const myRouter = {
  init() {
    this.name = 'blah';
  },

  changePage(page) {
    this.name = page;
  }
}

