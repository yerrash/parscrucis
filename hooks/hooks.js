// REGISTERING HOOKS
import hotbarHooks from "./hotbar.mjs";
import chatHooks from "./chat.mjs";

export default function () {
  hotbarHooks();
  chatHooks();
}
