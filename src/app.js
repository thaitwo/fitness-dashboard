import './scss/style.scss';
import Nav from './js/components/nav.js';
import TopBar from './js/components/topBar';

class App {
  constructor() {
    new Nav('#sidebar-nav', true);
    new TopBar('#top-bar');
  }
}

new App();

feather.replace();