import './scss/style.scss';
import Nav from './components/nav.js';


class App {
  constructor() {
    // ACTIVATE SIDEBAR NAVIGATION
    new Nav('nav-sidebar', true, 'page-title');
  }
}

new App();