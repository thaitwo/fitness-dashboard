class Dropdown {
  constructor(menuId, buttonId, listId, arrayOfListItems) {
    this.menuId = menuId;
    this.buttonId = buttonId;
    this.listId = listId;
    this.arrayOfListItems = arrayOfListItems;
    this.menuContainer = $(`#${this.menuId}`);
    this.topContainer = $('.container-fluid');

    // RENDER DROPDOWN HTML (BUTTON AND <UL>)
    this.renderDropdownHTML();

    // REGISTER ELEMENTS
    this.dropdownButtonLabel = $('.dropdown-button-label');
    this.$menuList = $(`#${this.listId}`);
    this.$dropdownButton = $(`#${this.buttonId}`);

    // RENDER <LI> HTML
    this.createMenuListItems();

    // REGISTER <LI> ELEMENTS
    this.$listItems = $(`#${this.listId} > li`);
    this.$firstListItem = $(`#${this.listId} > li:first`);

    // ACTIVATE MENU
    this.activateDropdownMenu();
    this.activateMenuLinks(this.$menuList);
  }


  // UPDATE DROPDOWN BUTTON LABEL AND SELECTED <LI>
  activateMenuLinks(listId) {
    listId.on('click', 'li', (event) => {
      // GET DROPDOWN BUTTON VALUE
      const selectedItem = $(event.target);
      const selectedItemTextValue = selectedItem[0].innerText;

      // UPDATE DROPDOWN BUTTON LABEL
      this.dropdownButtonLabel.text(selectedItemTextValue);

      // REMOVE 'IS-ACTIVE' CLASS FROM ALL <LI>
      this.$listItems.removeClass('is-active');

      // ADD 'IS-ACTIVE' CLASS TO SELECTED <LI>
      selectedItem.addClass('is-active');
    })
  }



  // ADD 'IS-ACTIVE' CLASS TO FIRST <LI>
  // SHOW <UL> ON DROPDOWN BUTTON CLICK
  activateDropdownMenu() {
    this.$firstListItem.addClass('is-active');

    this.$dropdownButton.on('click', (event) => {
      event.stopPropagation();
      this.$menuList.toggleClass('is-visible');
    })
    this.topContainer.on('click', () => { this.$menuList.removeClass('is-visible')})
  }



  // GENERATE HTML OF LIST ITEMS WITHIN <UL>
  createMenuListItems() {
    this.arrayOfListItems.forEach((item) => {
      this.$menuList.append(`<li><i class="fa fa-check" aria-hidden="true"></i>${item}</li>`);
    })
  }



  // GENERATE HTML FOR DROPDOWN BUTTON AND <UL>
  createMenuList() {
    return `
      <button id="${this.buttonId}" class="chart-dropdown">
        <span class="dropdown-button-label">${this.arrayOfListItems[0]}</span>
        <i class="fa fa-angle-down fa-lg" aria-hidden="true"></i>
      </button>

      <ul id="${this.listId}" class="chart-dropdown">
      </ul>
    `
  }



  renderDropdownHTML() {
    this.menuContainer.append(this.createMenuList());
  }
}

export default Dropdown;
