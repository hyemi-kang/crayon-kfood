import type Lenis from "lenis";

// Lenis のインスタンスを PageTabs など他コンポーネントから参照するための入れ物
let instance: Lenis | null = null;

export const setLenis = (l: Lenis | null) => {
  instance = l;
};

export const getLenis = () => instance;
