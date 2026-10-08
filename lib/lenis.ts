import type Lenis from "lenis";

// Lenis のインスタンスを PageTabs など他コンポーネントから参照するための入れ物
let instance: Lenis | null = null;
// Lenis の生成より先にロックが要求されることがある（子の effect は親より先に走る）ので、状態を覚えておく
let locked = false;

export const setLenis = (l: Lenis | null) => {
  instance = l;
  if (l && locked) l.stop();
};

export const getLenis = () => instance;

/**
 * スクロールのロック/解除。
 * Lenis は window.scrollTo で動かすので overflow:hidden だけでは止まらない → 両方かける。
 */
export function setScrollLocked(on: boolean) {
  locked = on;
  if (on) instance?.stop();
  else instance?.start();
  if (typeof document !== "undefined") {
    document.documentElement.style.overflow = on ? "hidden" : "";
  }
}
