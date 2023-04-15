export class ParsCrucisChat {
  static renderRollCard(rollResult, cardData) {
    console.log("----> ParsCrucisChat renderRollCard IS GETTING THROUGH");

    rollResult.rolls.forEach((r) => {
      console.log("----> ParsCrucisChat rollResults.rolls IS GETTING THROUGH");
      // r.img =
      //   r.img = `systems/degenesis/icons/dice-faces/d${r.result}.svg`;
    });

    if (rollResult.secondaryRolls) {
      rollResult.secondaryRolls.forEach((r) => {
        // r.img = `systems/degenesis/icons/dice-faces/d${r.result}.svg`;
      });
    }

    // Original result before translation - used for styling
    rollResult.enResult = rollResult.result;
    // rollResult.result = DEGENESIS.rollResults[rollResult.result];

    mergeObject(cardData, rollResult);

    renderTemplate(cardData.template, cardData).then((html) => {
      let chatData = DEG_Utility.chatDataSetup(html, cardData.speaker); // Passing additional data here
      chatData.speaker = cardData.speaker;
      ChatMessage.create(chatData);
    });
  }
}
