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
    const systemData = this.system;
    // console.log("DADOS ANTE-PREPARO!", this);

    // if (this.type === "ability") {
    //   this._prepareAbilityData(systemData);
    // }

    if (this.type === "gear") {
      this._prepareGearData(systemData);
    }

    if (this.type === "passive") {
      this._preparePassiveData(systemData);
    }

    if (this.type === "weapon") {
      this._prepareWeaponData(systemData);
    }

    // Get item owner data.
    const actorData = this.actor ? this.actor : {};

    // aqui calcula coisas para o item conforme os dados do personagem

    // console.log("DADOS DO ATOR AQUI!", actorData);
    // console.log("DADOS DO ITEM AQUI!", systemData);
  }

  // _prepareAbilityData(systemData) {
  //   console.log(systemData);
  // }

  chatTemplate = {
    ability: "systems/parscrucis/templates/chat/ability-card.hbs",
    gear: "systems/parscrucis/templates/chat/item-card.hbs",
    weapon: "systems/parscrucis/templates/chat/weapon-card.hbs",
  };

  async roll() {
    console.log("it's getting in here just fine");
    console.log(this);
    console.log("split");

    let chatData = {
      user: game.user._id,
      speaker: ChatMessage.getSpeaker(),
    };

    let cardData = {
      ...this,
      owner: this.actor.id,
    };

    chatData.content = await renderTemplate(
      this.chatTemplate[this.type],
      cardData
    );

    console.log("THISSYSTEN", this.system);

    chatData.roll = true;

    return ChatMessage.create(chatData);
  }

  _prepareWeaponData(systemData) {
    const actionsData = systemData.actions;

    // console.log(this);
    systemData.groupLabel =
      game.i18n.localize(PC.weaponGroups[systemData.group]) ?? systemData.group;
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

  _prepareGearData(systemData) {
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

  _preparePassiveData(systemData) {
    systemData.subtypeLabel =
      game.i18n.localize(PC.passiveSubtypes[systemData.subtype]) ??
      systemData.subtype;

    systemData.acquisition === "learned"
      ? (systemData.learned = true)
      : (systemData.learned = false);
  }

  prepareDerivedData() {
    const itemData = this;
    const systemData = itemData.system;
    if (this.type !== "passive")
      if (itemData.system.loadMax > 1) {
        systemData.loadMaxEnabled = false;
      } else {
        systemData.loadMaxEnabled = true;
      }
    if (itemData.type === "weapon") this._prepDerivedWeaponData(systemData);
  }

  _prepDerivedWeaponData(systemData) {
    // console.log("ADICIONA AQUI", this);
    // console.log("Dados do item ->", systemData);
    // Copy the values of each weapon mod to each attack for display
    // for (let i of systemData.actions) {
    //   ("Acão a caminho por aqui");
    // }
  }
}
