import $ from 'jquery';
import Router from './router.js';


class Nav {
  // @parameter (string, boolean, string)
  // If routeBoolean is true URL will be updated. If false URL will remain unchanged.
  constructor(navContainerId, routeBoolean, textContainerId) {
    this.navContainerId = navContainerId;
    this.routeOrNot = routeBoolean || false;

    this.$textContainer = $(`#${textContainerId}`);
    this.$navContainer = $(`#${this.navContainerId}`);

    // ACTIVATE ROUTER
    this.router = new Router();
    // ACTIVATE SIDEBAR NAV
    this.activateNav();
  }


  // ACTIVATE SIDEBAR NAV
  activateNav() {
    const that = this;

    this.$navContainer.on('click', 'a', function(event) {
      event.preventDefault();
      let id = this.id;

      that.updateActiveClass(id);

      // If marked true AND has text container, then change page URL and update header text
      if (that.routeOrNot == true && that.$textContainer) {
        that.router.changePage(id);
        that.udpateHeaderText(id);
      }
      else {
        that.udpateHeaderText(id);
      }
    });
  }


  // UPDATE TEXT IN SPECIFIED CONTAINER
  udpateHeaderText(titleText) {
    this.$textContainer.html(titleText);
  }


  // UPDATE SELECTED LINK
  updateActiveClass(activeButtonId) {
    let buttons = this.$navContainer.find('.active');
    let activeButton = this.$navContainer.find(activeButtonId);

    buttons.removeClass('active');
    activeButton.addClass('active');
  }
}

export default Nav;