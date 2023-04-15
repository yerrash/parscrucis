import { PC } from "../config.mjs";

/**
 * @extends { Item }
 */
export class ParsCrucisItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    super.prepareData();
    // console.log("DADOS ANTE-PREPARO!", this);

    const systemData = this.system;
    const actionsData = systemData.actions;

    if (this.type === "weapon") {
      // console.log(this);
      systemData.groupLabel =
        game.i18n.localize(PC.weaponGroups[systemData.group]) ??
        systemData.group;
      systemData.subgroupLabel =
        game.i18n.localize(PC.weaponSubgroups[systemData.subgroup]) ??
        systemData.subgroup;

      // Handle actions.
      for (let [key, act] of Object.entries(actionsData)) {
        act.actionSkillLabel =
          game.i18n.localize(PC.skillList[act.actionSkill]) ?? act.actionSkill;
        act.actionTypeLabel =
          game.i18n.localize(PC.actionType[act.actionType]) ?? act.actionType;
      }

      if (systemData.subgroup === "unarmed") {
        systemData.unarmed = true;
      } else systemData.unarmed = false;
    }

    if (this.type === "gear") {
      systemData.groupLabel =
        game.i18n.localize(PC.gearGroups[systemData.group]) ?? systemData.group;

      if (systemData.subgroup === "none" || systemData.subgroup === "") {
        systemData.subgroupLabel = systemData.groupLabel;
      } else {
        systemData.subgroupLabel =
          game.i18n.localize(PC.gearGroups[systemData.subgroup]) ??
          systemData.subgroup;
      }

      if (systemData.group === "vest" || systemData.group === "accessory") {
        systemData.cantEquip = false;
      } else systemData.cantEquip = true;
    }

    if (this.type === "passive") {
      systemData.subtypeLabel =
        game.i18n.localize(PC.passiveSubtypes[systemData.subtype]) ??
        systemData.subtype;
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
