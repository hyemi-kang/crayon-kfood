"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getStroke } from "perfect-freehand";
import { gsap, useGSAP } from "@/lib/gsap";
import { PALETTE, TASTES, type ColorKey, type Taste } from "@/lib/dishes";
import { recommend, type Analysis } from "@/lib/analyze";
import type { PageBuilder } from "@/lib/crayon";

type Stroke = { pts: [number, number, number][]; color: string; size: number }; // 座標は 0〜1 に正規化
const SIZES = [
  { label: "ほそい", px: 7 },
  { label: "ふつう", px: 16 },
  { label: "ふとい", px: 30 },
];
const MAX_TASTES = 3;
const PAPER = "#f1e7cf"; // 白いクレヨンも見えるよう、少し濃いめの紙色

/** perfect-freehand の輪郭点 → SVG パス文字列（公式 README のスムージング） */
function outlineToPath(stroke: number[][]) {
  if (!stroke.length) return "";
  const d = stroke.reduce<(string | number)[]>(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"],
  );
  d.push("Z");
  return d.join(" ");
}

/** クレヨンのかすれ（ところどころ穴の空いたノイズ）。固定シードなので描き直しても同じ見た目 */
function makeGrain() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(128, 128);
  let s = 12345;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < img.data.length; i += 4) {
    const r = rnd();
    img.data[i + 3] = r < 0.42 ? Math.floor(rnd() * 230) : 0;
  }
  ctx.putImageData(img, 0, 0);
  return ctx.createPattern(c, "repeat")!;
}

export default function DrawPage() {
  const root = useRef<HTMLDivElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLCanvasElement>(null);
  const liveRef = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Stroke[]>([]);
  const current = useRef<Stroke | null>(null);
  const grain = useRef<CanvasPattern | null>(null);
  const size = useRef({ w: 1, h: 1, dpr: 1 });

  const [colorKey, setColorKey] = useState<ColorKey>("red");
  const [sizeIdx, setSizeIdx] = useState(1);
  const [tastes, setTastes] = useState<Taste[]>([]);
  const [hasInk, setHasInk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Analysis | null>(null);
  const [limitHint, setLimitHint] = useState(false);

  // ---- 描画 ----
  const drawOnLive = useCallback((s: Stroke) => {
    const live = liveRef.current;
    if (!live || !grain.current) return;
    const { w, h, dpr } = size.current;
    const ctx = live.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const pts = s.pts.map(([x, y, p]) => [x * w, y * h, p]);
    const outline = getStroke(pts, { size: s.size, thinning: 0.35, smoothing: 0.65, streamline: 0.5, simulatePressure: true });
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = s.color;
    ctx.fill(new Path2D(outlineToPath(outline)));
    // かすれ：ノイズ部分をくり抜く
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = grain.current;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";
  }, []);

  const bakeLive = useCallback(() => {
    const main = mainRef.current;
    const live = liveRef.current;
    if (!main || !live) return;
    const ctx = main.getContext("2d")!;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(live, 0, 0);
    ctx.restore();
    const lctx = live.getContext("2d")!;
    lctx.save();
    lctx.setTransform(1, 0, 0, 1, 0, 0);
    lctx.clearRect(0, 0, live.width, live.height);
    lctx.restore();
  }, []);

  const redrawAll = useCallback(() => {
    const main = mainRef.current;
    if (!main) return;
    const ctx = main.getContext("2d")!;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, main.width, main.height);
    ctx.restore();
    for (const s of strokes.current) {
      drawOnLive(s);
      bakeLive();
    }
  }, [drawOnLive, bakeLive]);

  useEffect(() => {
    grain.current = makeGrain();
    const el = wrap.current;
    if (!el) return;
    const fit = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      size.current = { w, h, dpr };
      for (const c of [mainRef.current, liveRef.current]) {
        if (!c) continue;
        c.width = Math.round(w * dpr);
        c.height = Math.round(h * dpr);
      }
      redrawAll();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [redrawAll]);

  // ---- ポインタ操作 ----
  const toNorm = (e: React.PointerEvent): [number, number, number] => {
    const r = liveRef.current!.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height, e.pressure || 0.5];
  };
  const onDown = (e: React.PointerEvent) => {
    if (busy) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const color = PALETTE.find((p) => p.key === colorKey)!.hex;
    current.current = { pts: [toNorm(e)], color, size: SIZES[sizeIdx].px };
    drawOnLive(current.current);
  };
  const onMove = (e: React.PointerEvent) => {
    const s = current.current;
    if (!s) return;
    s.pts.push(toNorm(e));
    drawOnLive(s);
  };
  const onUp = () => {
    const s = current.current;
    if (!s) return;
    current.current = null;
    strokes.current.push(s);
    bakeLive();
    setHasInk(true);
    setResult(null);
  };

  const undo = () => {
    strokes.current.pop();
    redrawAll();
    setHasInk(strokes.current.length > 0);
    setResult(null);
  };
  const clearAll = () => {
    strokes.current = [];
    redrawAll();
    setHasInk(false);
    setResult(null);
  };

  const toggleTaste = (t: Taste) => {
    setResult(null);
    setTastes((cur) => {
      if (cur.includes(t)) {
        setLimitHint(false);
        return cur.filter((x) => x !== t);
      }
      if (cur.length >= MAX_TASTES) {
        setLimitHint(true);
        return cur;
      }
      setLimitHint(false);
      return [...cur, t];
    });
  };

  const search = () => {
    if (busy || !mainRef.current) return;
    setBusy(true);
    setResult(null);
    // 「さがし中…」の間をつくってから結果を出す（判定自体は一瞬で終わる）
    window.setTimeout(() => {
      setResult(recommend(mainRef.current!, tastes));
      setBusy(false);
    }, 1100);
  };

  // 結果が出たときのアニメーション
  useGSAP(
    () => {
      if (!result) return;
      const all = (s: string) => Array.from(root.current!.querySelectorAll(s));
      const cards = all("[data-card]");
      const bars = all("[data-bar]");
      const badges = all("[data-badge]");
      if (cards.length) {
        gsap.fromTo(
          cards,
          { autoAlpha: 0, y: 36, rotate: () => gsap.utils.random(-3, 3) },
          { autoAlpha: 1, y: 0, rotate: 0, duration: 0.6, stagger: 0.18, ease: "back.out(1.6)" },
        );
      }
      if (bars.length) {
        gsap.fromTo(
          bars,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.9, stagger: 0.18, delay: 0.25, ease: "power3.out", transformOrigin: "0 50%" },
        );
      }
      if (badges.length) {
        gsap.fromTo(
          badges,
          { scale: 0, rotate: -25 },
          { scale: 1, rotate: -6, duration: 0.6, delay: 0.5, ease: "elastic.out(1, 0.5)" },
        );
      }
    },
    { scope: root, dependencies: [result] },
  );

  const ok = result && result.ok ? result : null;

  return (
    <div ref={root} data-page="draw" className="paper absolute inset-0 overflow-hidden rounded-md">
      <div data-head className="absolute left-[4%] top-[6%] z-10 max-w-[60%]">
        <p className="font-pen text-[clamp(.85rem,1.6vw,1.3rem)] tracking-[.3em] text-crayon-red">CHAPTER 4</p>
        <h2 className="font-pen text-crayon text-[clamp(1.8rem,4.6vw,3.6rem)] leading-none text-ink">おえかき診断</h2>
        <p className="mt-1 text-[clamp(.85rem,1.6vw,1.25rem)] text-ink/70">
          <span className="font-hangul text-crayon-green">그림으로 찾는 한식</span>　色・形・味から、いちばん近い一皿をさがすよ。
        </p>
      </div>

      <div
        data-lenis-prevent
        className="absolute bottom-[4%] left-[3.5%] right-[3.5%] top-[22%] grid grid-cols-1 gap-[2vh] overflow-y-auto md:right-[9%] md:grid-cols-[1.25fr_1fr] md:gap-[2.5vw] md:overflow-hidden"
      >
        {/* ---- 左：お絵かき ---- */}
        <section data-draw-panel className="flex min-h-[320px] flex-col gap-2 md:min-h-0">
          <div
            ref={wrap}
            className="relative min-h-0 flex-1 overflow-hidden rounded-sm border-[3px] border-ink/60 shadow-[4px_5px_0_rgba(59,47,42,.25)]"
            style={{ backgroundColor: PAPER }}
          >
            <canvas ref={mainRef} className="absolute inset-0 h-full w-full" aria-hidden />
            <canvas
              ref={liveRef}
              role="img"
              aria-label="お絵かきキャンバス。マウスや指でなぞって描けます"
              className="absolute inset-0 h-full w-full touch-none"
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
            />
            {!hasInk && (
              <p className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center text-[clamp(1rem,2vw,1.6rem)] text-ink/40">
                食べたい一皿を、クレヨンで描いてね
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-end gap-1.5" role="radiogroup" aria-label="クレヨンの色">
              {PALETTE.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  role="radio"
                  aria-checked={colorKey === p.key}
                  aria-label={p.label}
                  title={p.label}
                  onClick={() => setColorKey(p.key)}
                  className="relative h-[34px] w-[17px] rounded-t-[3px] rounded-b-[7px] border-2 border-ink/70 shadow-[1px_2px_0_rgba(59,47,42,.3)] transition-transform"
                  style={{
                    backgroundColor: p.hex,
                    transform: colorKey === p.key ? "translateY(-8px) rotate(-4deg)" : undefined,
                  }}
                >
                  <i className="absolute inset-x-0 top-[9px] h-[10px] bg-paper/80" />
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5" role="radiogroup" aria-label="線の太さ">
              {SIZES.map((s, i) => (
                <button
                  key={s.label}
                  type="button"
                  role="radio"
                  aria-checked={sizeIdx === i}
                  aria-label={s.label}
                  onClick={() => setSizeIdx(i)}
                  className={`grid h-8 w-8 place-items-center rounded-full border-2 ${sizeIdx === i ? "border-ink bg-white" : "border-ink/30"}`}
                >
                  <span className="rounded-full bg-ink" style={{ width: 4 + i * 5, height: 4 + i * 5 }} />
                </button>
              ))}
            </div>
            <div className="ml-auto flex gap-2 text-[clamp(.8rem,1.3vw,1rem)]">
              <button type="button" onClick={undo} disabled={!hasInk} className="rounded-sm border-2 border-ink/50 px-2 py-0.5 disabled:opacity-40">ひとつ戻す</button>
              <button type="button" onClick={clearAll} disabled={!hasInk} className="rounded-sm border-2 border-ink/50 px-2 py-0.5 disabled:opacity-40">ぜんぶ消す</button>
            </div>
          </div>
        </section>

        {/* ---- 右：味のキーワード + 結果 ---- */}
        <section data-draw-panel data-lenis-prevent className="flex min-h-0 flex-col gap-3 md:overflow-y-auto md:pr-1">
          <div>
            <p className="mb-1.5 text-[clamp(.85rem,1.4vw,1.1rem)] text-ink/70">
              味のキーワード <span className="text-ink/45">（{MAX_TASTES}つまで）</span>
              {limitHint && <span className="ml-2 text-crayon-red">えらべるのは{MAX_TASTES}つまでだよ</span>}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {TASTES.map((t) => {
                const on = tastes.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleTaste(t)}
                    className={`rounded-full border-2 px-3 py-0.5 text-[clamp(.85rem,1.4vw,1.1rem)] transition-transform hover:-rotate-2 ${
                      on ? "border-ink bg-crayon-yellow shadow-[2px_2px_0_rgba(59,47,42,.4)]" : "border-ink/40 bg-white/50"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={search}
              disabled={busy || !hasInk}
              className="-rotate-1 rounded-sm border-2 border-ink bg-crayon-green px-5 py-2 text-[clamp(1rem,1.7vw,1.3rem)] text-white shadow-[4px_4px_0_rgba(59,47,42,.45)] transition-transform hover:rotate-1 hover:scale-105 disabled:opacity-50"
            >
              この絵でさがす ✎
            </button>
            {!hasInk && <span className="text-[clamp(.8rem,1.3vw,1rem)] text-ink/55">まずは絵を描いてね</span>}
          </div>

          <div aria-live="polite" className="flex flex-col gap-3">
            {busy && (
              <p className="flex items-center gap-2 text-[clamp(1rem,1.8vw,1.4rem)] text-ink/70">
                さがし中
                {[0, 1, 2].map((i) => (
                  <span key={i} className="inline-block h-2.5 w-2.5 animate-bounce rounded-full bg-crayon-red" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </p>
            )}

            {result && !result.ok && (
              <p data-card className="rounded-sm border-2 border-dashed border-crayon-red/60 bg-white/50 p-3 text-crayon-red">{result.reason}</p>
            )}

            {ok && (
              <>
                {/* あなたの絵の色 */}
                <div data-card>
                  <p className="mb-1 text-[clamp(.75rem,1.2vw,.95rem)] text-ink/60">あなたの絵の色</p>
                  <ColorBar shares={ok.features.colors} />
                </div>
                {ok.results.map((r, i) => (
                  <article
                    key={r.dish.id}
                    data-card
                    className={`relative rounded-sm border-2 bg-white/60 p-3 shadow-[3px_4px_0_rgba(59,47,42,.18)] ${i === 0 ? "border-crayon-red" : "border-ink/30"}`}
                  >
                    {i === 0 && (
                      <span data-badge className="absolute -right-2 -top-3 -rotate-6 rounded-sm bg-crayon-red px-2 py-0.5 text-[clamp(.75rem,1.2vw,.95rem)] text-white shadow-[2px_2px_0_rgba(59,47,42,.4)]">
                        いちばん近い一皿！
                      </span>
                    )}
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className={`font-pen ${i === 0 ? "text-[clamp(1.4rem,2.6vw,2.2rem)]" : "text-[clamp(1.1rem,1.9vw,1.6rem)]"}`}>
                        {i + 1}. {r.dish.name} <span className="font-hangul text-[.7em] text-crayon-orange">{r.dish.hangul}</span>
                      </h3>
                      <span className="font-pen text-[clamp(1.2rem,2.2vw,1.8rem)] text-crayon-red">{r.percent}%</span>
                    </div>
                    <div className="my-1.5 h-2.5 overflow-hidden rounded-full bg-ink/10">
                      <div data-bar className="h-full rounded-full bg-crayon-red" style={{ width: `${r.percent}%` }} />
                    </div>
                    {i === 0 && <p className="text-[clamp(.85rem,1.4vw,1.1rem)] text-ink/80">{r.dish.blurb}</p>}
                    <ul className="mt-1.5 flex flex-wrap gap-1.5">
                      {r.reasons.map((t) => (
                        <li key={t} className="rounded-full bg-crayon-yellow/60 px-2 py-0.5 text-[clamp(.75rem,1.2vw,.95rem)]">{t}</li>
                      ))}
                    </ul>
                    {i === 0 && (
                      <div className="mt-2">
                        <p className="mb-1 text-[clamp(.7rem,1.1vw,.9rem)] text-ink/55">この料理の色</p>
                        <ColorBar shares={r.dish.colors} />
                      </div>
                    )}
                  </article>
                ))}
                <p className="text-[clamp(.7rem,1.1vw,.9rem)] text-ink/50">
                  ※ 絵の色・形と味の好みから計算した、遊びの診断です。絵は端末の外には送られません。
                </p>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

/** 色の割合を1本の帯で見せる */
function ColorBar({ shares }: { shares: Partial<Record<ColorKey, number>> }) {
  const items = PALETTE.map((p) => ({ ...p, v: shares[p.key] ?? 0 })).filter((x) => x.v > 0.02);
  const total = items.reduce((a, b) => a + b.v, 0) || 1;
  return (
    <div className="flex h-4 overflow-hidden rounded-full border-2 border-ink/50">
      {items.map((x) => (
        <span key={x.key} title={`${x.label} ${Math.round((x.v / total) * 100)}%`} style={{ width: `${(x.v / total) * 100}%`, backgroundColor: x.hex }} />
      ))}
    </div>
  );
}

/** スクロール連動の区間：見出しとお絵かきパネルが現れるところまで */
export const buildDraw: PageBuilder = (tl, root, at) => {
  const q = (s: string) => root.querySelectorAll(s);
  let t = at;
  tl.fromTo(q("[data-head] > *"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, stagger: 0.12, duration: 0.5 }, t);
  t += 0.6;
  tl.fromTo(
    q("[data-draw-panel]"),
    { autoAlpha: 0, y: 40, rotate: (i: number) => (i ? 1.5 : -1.5) },
    { autoAlpha: 1, y: 0, rotate: 0, duration: 0.7, stagger: 0.25, ease: "back.out(1.4)" },
    t,
  );
  t += 1.4;
  tl.to({}, { duration: 0.8 }, t); // 描いたり選んだりできるよう、ひと呼吸おく
  return t + 0.8;
};
