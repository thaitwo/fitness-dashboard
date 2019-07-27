import './scss/style.scss';
import Nav from './components/nav.js';
import Search from './components/search.js';

class App {
  constructor() {
    new Nav('nav-sidebar', true);
    new Search('#top-bar');
  }
}

new App();