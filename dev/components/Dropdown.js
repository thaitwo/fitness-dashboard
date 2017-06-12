class Dropdown {
  constructor(menuId, buttonId, listId, arrayOfListItems) {
    this.menuId = menuId;
    this.buttonId = buttonId;
    this.listId = listId;
    this.arrayOfListItems = arrayOfListItems;
    // this.menuContainer = $(this.menuId);
    this.renderMenu()

  }

  activateDropdownMenu() {
    const dropdownButton = $(this.buttonId);

    // console.log('MENU LIST: ', );

    dropdownButton.on('click', (event) => {
      // console.log('THIS: ', this);
      menuList.show();
    })
  }

  createMenuListItem() {
    const listContainer = document.getElementById(this.listId);
    this.arrayOfListItems.forEach((item) => {
      listContainer.appendChild(`<li>${item}</li>`);
    })
  }


  generateMenuList() {

    return `
      <button id="${this.buttonId}">${this.buttonId}</button>

      <ul id="${this.listId}" class="${this.listId}">
      </ul>
    `
  }


  renderMenu() {
    const menuContainer = document.getElementById(this.menuId);
    menuContainer.innerHTML = this.generateMenuList();
    this.createMenuListItem();
    // this.activateDropdownMenu();
  }
}

export default Dropdown;