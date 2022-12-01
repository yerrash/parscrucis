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

    // Get the Item's data
    const itemData = this;
    const actorData = this.actor ? this.actor.system : {};
    const data = itemData.system;
  }
}
