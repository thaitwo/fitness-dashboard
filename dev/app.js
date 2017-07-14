
import './scss/style.scss';
import $ from 'jquery';
import Router from './components/router.js';
import Nav from './components/nav.js';
import Graph from './components/graph.js';


class App {
  constructor() {
    // ACTIVATE SIDEBAR NAVIGATION
    new Nav('nav-sidebar', true, 'page-title');
  }
}

new App();