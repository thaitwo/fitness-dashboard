import './scss/style.scss';
import Nav from './js/components/nav.js';
import Search from './js/components/search.js';

class App {
  constructor() {
    new Nav('#sidebar-nav', true);
    new Search('#top-bar');
  }
}

new App();