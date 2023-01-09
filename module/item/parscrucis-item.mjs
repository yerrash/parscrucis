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
    const systemData = itemData.system;
    const actionsData = systemData.actions;

    if (itemData.type === "weapon") {
      systemData.weaponCategoryLabel =
        game.i18n.localize(PC.weaponCategory[systemData.weaponCategory]) ??
        systemData.weaponCategory;

      systemData.weaponTypeLabel =
        game.i18n.localize(PC.weaponType[systemData.weaponType]) ??
        systemData.weaponType;

      // Handle actions.
      for (let [key, act] of Object.entries(actionsData)) {
        act.actionSkillLabel =
          game.i18n.localize(PC.skillList[act.actionSkill]) ?? act.actionSkill;
        act.actionTypeLabel =
          game.i18n.localize(PC.actionType[act.actionType]) ?? act.actionType;
      }
    }

    if (itemData.type === "gear") {
      systemData.gearCategoryLabel =
        game.i18n.localize(PC.gearCategory[systemData.gearCategory]) ??
        systemData.gearCategory;
    }

    // Get item owner data.
    const actorData = this.actor ? this.actor : {};

    // console.log("DADOS DO ATOR AQUI!!!!!!!!", actorData);
    // console.log("DADOS DO ITEM AQUI!!!!!!!!", systemData);
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
