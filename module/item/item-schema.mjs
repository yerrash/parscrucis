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
      // type Weapon
      typeLabel: new field.StringField({ initial: "" }),
      // category between melee, ranged or shield
      category: new field.StringField({ initial: "none" }),
      categoryLabel: new field.StringField({ initial: "" }),
      // which subtype a weapon is, for melee example: short sword, sword etc
      subtype: new field.StringField({ initial: "none" }),
      subtypeLabel: new field.StringField({ initial: "" }),
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
      load: new field.NumberField({ initial: 1 }),
      loadMax: new field.NumberField({ initial: 1 }),
      loadMaxEnabled: new field.BooleanField({ initial: true }),
      notes: new field.StringField({ initial: "" }),
      price: new field.NumberField({ initial: null }),
      currency: new field.StringField({ initial: "" }),
      rarity: new field.StringField({ initial: "common" }),
      requisites: new field.StringField({ initial: "" }),
      unarmed: new field.StringField({ initial: "false" }),
      workTime: new field.StringField({ initial: "" }),
    };
  }
}

export class AbilityActionSchema extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      effort: new field.StringField({ initial: "0" }),
      prepTime: new field.StringField({ initial: "" }),
      actionRange: new field.StringField({ initial: "0" }),
      // sets if the action is an Intection, Test or Active type
      actionType: new field.StringField({ initial: "active " }),
      // sets the skill if Interaction or Test type
      actionSkill: new field.StringField({ initial: "briga" }),
      actionSkillLabel: new field.StringField({ initial: "" }),
      // sets type if Intection, sets difficulty if Test
      interactionType: new field.StringField({ initial: "melee" }),
      interactionTypeLabel: new field.StringField({ initial: "" }),
      testDificulty: new field.StringField({ initial: "" }),
      effectDescription: new field.StringField({ initial: "" }),
      effectNotes: new field.StringField({ initial: "" }),
      // sets if the action is damaging or healing in nature
      actionNature: new field.StringField({ initial: "damage" }),
      actionNatureLabel: new field.StringField({ initial: "" }),
      value: new field.StringField({ initial: "" }),
      valueType: new field.StringField({ initial: "" }),
    };
  }
}

export class AbilitySchema extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      actions: new field.ArrayField(
        new field.EmbeddedDataField(AbilityActionSchema),
        { initial: [new AbilityActionSchema()] }
      ),
      category: new field.StringField({ initial: "none" }),
      subCategory: new field.StringField({ initial: "" }),
      type: new field.StringField({ initial: "power" }),
      typeLabel: new field.StringField({ initial: "" }),
      expCost: new field.NumberField({ initial: 2 }),
      preRequisites: new field.StringField({ initial: "" }),
      description: new field.StringField({ initial: "" }),
      informations: new field.StringField({ initial: "" }),
      notes: new field.StringField({ initial: "" }),
    };
  }
}
