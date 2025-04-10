// Pars Crucis
import { PC } from "./module/config.mjs";
import { ParsCrucisChatMessage } from "./module/chat-message.mjs";
import ParsCrucisActorSheet from "./module/actor/actor-sheet.mjs";
import ActorConfigure from "./module/apps/actor-configs.mjs";
import ParsCrucisItemSheet from "./module/item/item-sheet.mjs";
import { ParsCrucisActor } from "./module/actor/parscrucis-actor.mjs";
import { ParsCrucisItem } from "./module/item/parscrucis-item.mjs";
import { AbilitySchema, WeaponSchema } from "./module/item/item-schema.mjs";

import hooks from "./hooks/hooks.js";

async function preloadHandlebarsTemplates() {
  const templatePaths = [
    // Actor Sheet
    "systems/parscrucis/templates/actor/blocks/char-att-block.hbs",
    "systems/parscrucis/templates/actor/blocks/mit-minors.hbs",
    "systems/parscrucis/templates/actor/tabs/skills-tab-pdm.hbs",
    "systems/parscrucis/templates/actor/tabs/skills-tab.hbs",
    "systems/parscrucis/templates/actor/tabs/inventory-tab.hbs",
    "systems/parscrucis/templates/actor/tabs/abilities-tab.hbs",
    "systems/parscrucis/templates/actor/tabs/effects-tab.hbs",
    "systems/parscrucis/templates/actor/tabs/info-tab.hbs",
    "systems/parscrucis/templates/actor/tabs/notes-tab.hbs",
    // Chat
    "systems/parscrucis/templates/chat/ability-card.hbs",
    "systems/parscrucis/templates/chat/item-card.hbs",
    "systems/parscrucis/templates/chat/weapon-card.hbs",
    // Items
    "systems/parscrucis/templates/item/tabs/details-tab.hbs",
  ];

  return loadTemplates(templatePaths);
}

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once("init", function () {
  console.log("PARSCRUCIS | inicializando sistema");

  // Add utility classes to the global game object so that they're more easily accessible in global contexts.
  game.parscrucis = {
    ActorConfigure,
    ParsCrucisActorSheet,
    ParsCrucisChatMessage,
    ParsCrucisItemSheet,
  };

  // Add custom constants for configuration.
  CONFIG.parscrucis = PC;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "1d10 + @minors.esperteza.value + @minors.esperteza.modifiers", // + (@attributes.ref.value + @attributes.ref.modifiers) / 100",
    decimals: 2,
  };

  // Define custom Document classes
  CONFIG.Actor.documentClass = ParsCrucisActor;
  CONFIG.Item.documentClass = ParsCrucisItem;
  CONFIG.ChatMessage.documentClass = ParsCrucisChatMessage;

  // Assign custom DataModels
  CONFIG.Item.dataModels.weapon = WeaponSchema;
  CONFIG.Item.dataModels.ability = AbilitySchema;

  // Register sheet application classes
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("parscrucis", ParsCrucisItemSheet, {
    makeDefault: true,
  });

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("parscrucis", ParsCrucisActorSheet, {
    makeDefault: true,
  });

  // Preload templates.
  preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", function () {
  // Include steps that need to happen after Foundry has fully loaded here.
});

hooks();
