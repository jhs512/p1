import { continueRender, delayRender } from "remotion";
import { loadFont as loadJetBrains } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadNotoSans } from "@remotion/google-fonts/NotoSansKR";

const jetBrains = loadJetBrains();
const notoSans = loadNotoSans();

export const monoFont = jetBrains.fontFamily;
export const uiFont = notoSans.fontFamily;

const handle = delayRender("Loading Google Fonts");
Promise.all([
  jetBrains.waitUntilDone(),
  notoSans.waitUntilDone(),
]).then(() => continueRender(handle));
