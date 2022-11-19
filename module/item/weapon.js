export default class ParsCrucisWeaponSheet extends ItemSheet {
  get template() {
    return `systems/parscrucis/templates/item/${this.item.type}-sheet.html`;
  }

  getData() {
    const data = super.getData();
    data.config = CONFIG.parscrucis;
    return data;
  }
}
