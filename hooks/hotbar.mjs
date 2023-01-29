export default function () {
  Hooks.on("hotbarDrop", (bar, data, slot) => {
    if (data.type === "Actor" || data.type === "Item") {
      handleMacroCreation(bar, data, slot);
      return false;
    }
  });
}

async function handleMacroCreation(bar, data, slot) {
  const document = await fromUuid(data.uuid);

  if (!document) return;

  let macro;
  if (document.documentName === "Actor") {
    const command = `Hotbar.toggleDocumentSheet("${document.uuid}")`;
    macro = game.macros.contents.find((m) => m.command === command);
    if (!macro) {
      macro = await Macro.create(
        {
          name: `${document.name}`,
          type: "script",
          img: document.img,
          command: command,
        },
        { displaySheet: false }
      );
    }
  }

  if (document.documentName === "Item") {
    const command = `Hotbar.toggleDocumentSheet("${document.uuid}")`;
    macro = game.macros.contents.find((m) => m.command === command);
    if (!macro) {
      macro = await Macro.create(
        {
          name: `${document.name}`,
          type: "script",
          img: document.img,
          command: command,
        },
        { displaySheet: false }
      );
    }
  }

  game.user.assignHotbarMacro(macro, slot);
}
