import { PC } from "../config.mjs";

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
    const SD = itemData.system;
    const actionsData = SD.actions;

    SD.weaponCategoryLabel =
      game.i18n.localize(PC.weaponCategory[SD.weaponCategory]) ??
      SD.weaponCategory;

    SD.weaponTypeLabel =
      game.i18n.localize(PC.weaponType[SD.weaponType]) ?? SD.weaponType;

    // Handle actions.
    for (let [key, act] of Object.entries(actionsData)) {
      act.actionSkillLabel =
        game.i18n.localize(PC.skillList[act.actionSkill]) ?? act.actionSkill;
      act.actionTypeLabel =
        game.i18n.localize(PC.actionType[act.actionType]) ?? act.actionType;
    }

    // Get item owner data.
    const actorData = this.actor ? this.actor : {};

    // console.log("DADOS DO ATOR AQUI!!!!!!!!", actorData);
    // console.log("DADOS DO ITEM AQUI!!!!!!!!", SD);
  }

  prepareDerivedData() {
    const itemData = this;
    const SD = itemData.system;
    if (itemData.type === "weapon") this._prepareWeaponData(SD);
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
