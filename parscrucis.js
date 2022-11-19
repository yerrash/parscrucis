// Pars Crucis
import { PC } from "./module/config.js";
import ParsCrucisWeaponSheet from "./module/item/weapon.js";
import ParsCrucisPersonagem from "./module/actor/personagem.js";

async function preloadHandlebarsTemplates() {
  const templatePaths = [
    "systems/parscrucis/templates/actor/char-att-block.html",
    "systems/parscrucis/templates/actor/perks-tab.html",
    "systems/parscrucis/templates/actor/inventory-tab.html",
    "systems/parscrucis/templates/actor/abilities-tab.html",
    "systems/parscrucis/templates/actor/effects-tab.html",
    "systems/parscrucis/templates/actor/info-tab.html",
    "systems/parscrucis/templates/actor/notes-tab.html",
  ];

  return loadTemplates(templatePaths);
}

Hooks.once("init", function () {
  console.log("PARSCRUCIS | inicializando sistema");

  CONFIG.parscrucis = PC;

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("parscrucis", ParsCrucisWeaponSheet, {
    makeDefault: true,
  });

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("parscrucis", ParsCrucisPersonagem, {
    makeDefault: true,
  });

  preloadHandlebarsTemplates();
});
