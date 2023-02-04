import { PC } from "./config.mjs";

export class PC_Utility {
  static addBooleans(data, max = "max", value = "value") {
    data.booleans = [];
    for (let i = 0; i < getProperty(data, max); i++) {
      data.booleans.push({
        checked: i + 1 <= getProperty(data, value),
      });
    }
    return data;
  }
}
