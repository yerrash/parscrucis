export default function () {
  /**
   * @param {ChatMessage} message   The ChatMessage document being rendered
   * @param {jQuery} html           The pending HTML as a jQuery object
   * @param {object} data           The input data provided for template rendering
   */
  Hooks.on("renderChatMessage", async (message, html, data) => {
    let imgPath = message.flags.imgPath;
    if (imgPath) {
      html[0].innerHTML = `<div class="actor-img" style="background-image: linear-gradient(to bottom, #dfddd191, #dfddd1), url(${imgPath})">\n ${html[0].innerHTML} \n</div>`;
    } else {
      html[0].innerHTML = `<div class="actor-img">\n ${html[0].innerHTML} \n</div>`;
    }

    // Do not display "Blind" chat cards to non-gm
    if (html.hasClass("blind") && !game.user.isGM) {
      html.find(".message-header").remove(); // Remove header so Foundry does not attempt to update its timestamp
      html.html("").css("display", "none");
    }
  });
}
