import $ from 'jquery';
import Router from './router.js';


class Nav {
  // @parameter (string, boolean, string)
  // If routeBoolean is true URL will be updated. If false URL will remain unchanged.
  constructor(navContainerId, routeBoolean) {
    this.navContainerId = navContainerId;
    this.routeOrNot = routeBoolean || false;

    this.$navContainer = $(navContainerId);

    // ACTIVATE ROUTER
    this.router = new Router(navContainerId);
    // ACTIVATE SIDEBAR NAV
    this.activateNav();
    this.setActiveTabOnRefresh();
  }


  // SET ACTIVE MENU ITEM ON PAGE RELOAD
  setActiveTabOnRefresh() {
    $(document).ready(() => {
      const url = document.URL;
      let pageId;

      // set dashboard menu item as active on initial app load
      if (url.includes('#')) {
        pageId = url.split('#')[1].split('/')[0];
      } else {
        pageId = 'home';
      }
      if (pageId.substr(-1) === '/') {
        pageId = pageId.slice(0, -1);
      }

      this.updateActiveClass(pageId);
    })
  }


  // ACTIVATE SIDEBAR NAV
  activateNav() {
    const that = this;

    this.$navContainer.on('click', 'a', function(event) {
      event.preventDefault();
      let id = this.id;

      that.updateActiveClass(id);

      // If marked true AND has text container, then change page URL and update header text
      if (that.routeOrNot == true) {
        that.router.changePage(id);
      }
      else {
        that.udpateHeaderText(id);
      }
    });
  }


  // UPDATE SELECTED LINK
  updateActiveClass(activeButtonId) {
    const $buttons = this.$navContainer.find('.active');
    const $activeButton = this.$navContainer.find(`a#${activeButtonId}`);
    $buttons.removeClass('active');
    $activeButton.addClass('active');
  }
}

export default Nav;