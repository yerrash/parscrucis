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

    // console.log("DADOS ANTE-PREPARO!", this);

    // Get item data.
    const itemData = this;
    const systemData = itemData.system;
    const actionsData = systemData.actions;

    if (itemData.type === "weapon") {
      // console.log(itemData);
      systemData.groupLabel =
        game.i18n.localize(PC.weaponGroups[systemData.group]) ??
        systemData.group;
      systemData.subtypeLabel =
        game.i18n.localize(PC.weaponSubtype[systemData.subtype]) ??
        systemData.subtype;

      // Handle actions.
      for (let [key, act] of Object.entries(actionsData)) {
        act.actionSkillLabel =
          game.i18n.localize(PC.skillList[act.actionSkill]) ?? act.actionSkill;
        act.actionTypeLabel =
          game.i18n.localize(PC.actionType[act.actionType]) ?? act.actionType;
      }

      if (systemData.subtype === "unarmed") {
        systemData.unarmed = true;
      } else systemData.unarmed = false;
    }

    if (itemData.type === "gear") {
      systemData.categoryLabel =
        game.i18n.localize(PC.gearCategory[systemData.category]) ??
        systemData.category;

      if (systemData.subtype === "none" || systemData.subtype === "") {
        systemData.subtypeLabel = systemData.categoryLabel;
      } else {
        systemData.subtypeLabel =
          game.i18n.localize(PC.gearCategory[systemData.subtype]) ??
          systemData.subtype;
      }

      if (
        systemData.category === "vest" ||
        systemData.category === "accessory"
      ) {
        systemData.cantEquip = false;
      } else systemData.cantEquip = true;
    }

    // Get item owner data.
    const actorData = this.actor ? this.actor : {};

    // console.log("DADOS DO ATOR AQUI!", actorData);
    // console.log("DADOS DO ITEM AQUI!", systemData);
  }

  prepareDerivedData() {
    const itemData = this;
    const systemData = itemData.system;
    if (itemData.system.loadMax > 1) {
      itemData.system.loadMaxEnabled = false;
    } else {
      itemData.system.loadMaxEnabled = true;
    }
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
