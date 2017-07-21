import $ from 'jquery';

class Tabs {
  constructor(container, tabsArray) {
    this.$container = container;
    this.tabs = tabsArray;

    this.renderTabs();
    this.activateTabs(this.$container);
  }

  renderTabs(tabsArr) {
    let tabs = tabsArr.map((item) => {
      return `
        <button>${item}</button>
      `;
    });

    this.$container.append(tabs);
  }

  activateTabs(container) {
    container.on('click', 'button', function(event) {
      event.preventDefault();
      let id = this.id;

    });
  }
}

export default Tabs;