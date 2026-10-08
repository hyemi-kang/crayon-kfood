import { gsap } from "@/lib/gsap";

export type PageBuilder = (
  tl: gsap.core.Timeline,
  root: HTMLElement,
  at: number,
) => number; // 戻り値 = このシーンが終わる時刻

/** viewBox(800x600) 内を行き来する色塗り用ジグザグ線 */
export function zigzag(x: number, y: number, w: number, h: number, gap = 14) {
  const rows = Math.ceil(h / gap) + 1;
  let d = `M${x} ${y}`;
  for (let i = 0; i < rows; i++) {
    const yy = y + i * gap;
    const toRight = i % 2 === 0;
    d += ` L${toRight ? x + w : x} ${yy + gap * 0.5} L${toRight ? x + w : x} ${yy + gap * 0.5}`;
    d += ` L${toRight ? x : x + w} ${yy + gap}`;
  }
  return d;
}

/** path 上の長さ len の点を、crayon が属する座標系に変換して返す */
function pointFor(path: SVGGeometryElement, crayon: SVGGraphicsElement, len: number) {
  const p = path.getPointAtLength(len);
  // 両方とも画面座標基準で取れば viewBox のスケールが相殺される
  const pm = path.getScreenCTM();
  const parent = crayon.parentNode as SVGGraphicsElement | null;
  const cm = parent?.getScreenCTM?.();
  if (!pm || !cm) return { x: p.x, y: p.y };
  const m = cm.inverse().multiply(pm);
  const q = new DOMPoint(p.x, p.y).matrixTransform(m);
  return { x: q.x, y: q.y };
}

type StrokeOpts = {
  crayon?: Element | null;
  color?: string; // クレヨン本体の色
  ease?: string;
};

/**
 * path を DrawSVG で描きながら、クレヨンの先端を線の先頭に追従させる。
 * scrub タイムライン上で逆再生してもクレヨンが線をなぞり戻る。
 */
export function drawStroke(
  tl: gsap.core.Timeline,
  paths: Element | Element[] | NodeListOf<Element>,
  at: number,
  dur: number,
  { crayon, color, ease = "none" }: StrokeOpts = {},
) {
  const list = Array.from(paths instanceof Element ? [paths] : paths) as SVGGeometryElement[];
  if (!list.length) return at + dur;
  const each = dur / list.length;

  list.forEach((path, i) => {
    const start = at + i * each;
    // 長さ0の線 + 丸い線端は点として見えてしまうので、描き始めるまで非表示にする
    tl.fromTo(path, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.001, immediateRender: true }, start);
    tl.fromTo(
      path,
      { drawSVG: "0% 0%" },
      { drawSVG: "0% 100%", duration: each, ease, immediateRender: true },
      start,
    );

    if (crayon) {
      const c = crayon as SVGGraphicsElement;
      const proxy = { p: 0 };
      const len = path.getTotalLength();
      const move = () => {
        const { x, y } = pointFor(path, c, len * proxy.p);
        gsap.set(c, { x, y });
      };
      if (color) {
        tl.set(c.querySelector(".crayon-body"), { attr: { fill: color } }, start);
      }
      tl.to(c, { autoAlpha: 1, duration: 0.01 }, start);
      tl.fromTo(proxy, { p: 0 }, { p: 1, duration: each, ease, onUpdate: move }, start);
    }
  });

  return at + dur;
}

/** クレヨンを消す（ページ切替直前など） */
export function hideCrayon(tl: gsap.core.Timeline, crayon: Element | null, at: number) {
  if (crayon) tl.to(crayon, { autoAlpha: 0, duration: 0.15 }, at);
}

/** 手書きラベル用：下から "ぽん" と出る */
export function popIn(
  tl: gsap.core.Timeline,
  targets: gsap.TweenTarget,
  at: number,
  stagger = 0.12,
) {
  tl.fromTo(
    targets,
    { autoAlpha: 0, y: 14, rotate: -6, scale: 0.7 },
    {
      autoAlpha: 1,
      y: 0,
      rotate: 0,
      scale: 1,
      duration: 0.35,
      stagger,
      ease: "back.out(2.4)",
      transformOrigin: "50% 100%",
    },
    at,
  );
}

/** 渦巻き（ビビンバを混ぜる軌跡など） */
export function spiralPath(cx: number, cy: number, rx: number, ry: number, turns = 2.5, steps = 80) {
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const k = i / steps;
    const a = k * turns * Math.PI * 2;
    const r = 0.12 + 0.88 * (1 - k);
    const x = cx + Math.cos(a) * rx * r;
    const y = cy + Math.sin(a) * ry * r;
    d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  return d.trim();
}

/** 擬似乱数（SSR とクライアントで同じ値になるよう固定シード） */
export function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
