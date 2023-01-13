const field = foundry.data.fields;

export class ActionSchema extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      actionSkill: new field.StringField({ initial: "briga" }),
      actionSkillLabel: new field.StringField({ initial: "" }),
      actionType: new field.StringField({ initial: "melee" }),
      actionTypeLabel: new field.StringField({ initial: "" }),
      actionModifier: new field.StringField({ initial: "0" }),
      inputModifier: new field.StringField({ initial: "" }),
      altDamage: new field.BooleanField({ initial: false }),

      dmgBase: new field.NumberField({ initial: 0 }),
      dmgBase2: new field.NumberField({ initial: 0 }),
      dmgAtt: new field.StringField({ initial: "fis" }),
      dmgAtt2: new field.StringField({ initial: "fis" }),
      dmgDiv: new field.StringField({ initial: "att50" }),
      dmgDiv2: new field.StringField({ initial: "att50" }),
      derivedDamage: new field.NumberField({ initial: null }),
      dmgType: new field.StringField({ initial: "fis" }),

      actionRange: new field.StringField({ initial: "0" }),
    };
  }
}

export class MaterialsSchema extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      material: new field.StringField({ initial: "" }),
      units: new field.NumberField({ initial: 0 }),
    };
  }
}

export class CraftingSkillSchema extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      craftSkill: new field.StringField({ initial: "alqui" }),
      craftDif: new field.NumberField({ initial: 10 }),
    };
  }
}

export class WeaponSchema extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      active: new field.BooleanField({ initial: true }),
      actions: new field.ArrayField(new field.EmbeddedDataField(ActionSchema), {
        initial: [new ActionSchema()],
      }),
      category: new field.StringField({ initial: "none" }),
      categoryLabel: new field.StringField({ initial: "" }),
      craftable: new field.BooleanField({ initial: false }),
      craftingInfo: new field.StringField({ initial: "" }),
      craftingMaterials: new field.ArrayField(
        new field.EmbeddedDataField(MaterialsSchema),
        { initial: [new MaterialsSchema()] }
      ),
      craftingSkills: new field.ArrayField(
        new field.EmbeddedDataField(CraftingSkillSchema),
        { initial: [new CraftingSkillSchema()] }
      ),
      defense: new field.NumberField({ initial: null }),
      derivedDefense: new field.NumberField({ initial: null }),
      description: new field.StringField({ initial: "" }),
      equipped: new field.BooleanField({ initial: false }),
      informations: new field.StringField({ initial: "" }),
      maxCap: new field.NumberField({ initial: 1 }),
      notes: new field.StringField({ initial: "" }),
      quantity: new field.NumberField({ initial: 1 }),
      price: new field.NumberField({ initial: null }),
      rarity: new field.StringField({ initial: "common" }),
      requisites: new field.StringField({ initial: "" }),
      subtype: new field.StringField({ initial: "" }),
      subtypeLabel: new field.StringField({ initial: "" }),
      unarmed: new field.StringField({ initial: "false" }),
      workTime: new field.StringField({ initial: "" }),
    };
  }
}
