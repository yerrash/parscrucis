/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class ParsCrucisItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    super.prepareData();

    // console.log(this);

    // Get item data.
    const itemData = this;
    const systemData = itemData.system;

    // Get item owner data.
    const actorData = this.actor ? this.actor : {};

    // console.log("dayum", actorData);
  }

  prepareDerivedData() {
    const itemData = this;
    const systemData = itemData.system;
    if (itemData.type === "weapon") this._prepareWeaponData(systemData);
  }

  _prepareWeaponData(systemData) {
    // console.log("ADICIONA AQUI", this);
    // console.log("Dados do item ->", systemData);
    // Copy the values of each weapon mod to each attack for display
    // for (let i of systemData.actions) {
    //   ("Acão a caminho por aqui");
    // }
  }
}
