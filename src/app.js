import './scss/style.scss';
import Nav from './components/nav.js';
import Search from './components/search.js';


class App {
  constructor() {
    // ACTIVATE SIDEBAR NAVIGATION
    new Nav('nav-sidebar', true);

    new Search();
  }
}

new App();