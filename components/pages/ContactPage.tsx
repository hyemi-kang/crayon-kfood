"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis";
import { popIn, type PageBuilder } from "@/lib/crayon";

// ---- 紙飛行機の形（原点が中心）：四角 → 折った状態 → 飛行機 ----
const SHAPE_A = "M-80 -110 H80 V110 H-80 Z";
const SHAPE_B = "M0 -112 L80 -34 L80 110 H-80 V-34 Z";
const SHAPE_C = "M0 -120 L10 10 L104 72 L104 86 L8 60 L0 120 L-8 60 L-104 86 L-104 72 L-10 10 Z";

// 飛んでいく軌跡（中心スタート → ループ → 画面外）
const TRAIL =
  "M400 300 C470 255 560 230 565 160 C570 95 480 100 485 165 C490 235 640 215 725 125 C770 78 820 40 900 -40";

// ---- 破れ目の clip-path（頂点数を揃えて tween できるようにする） ----
const N = 26;
const topPts = (f: (i: number) => number) =>
  Array.from({ length: N + 1 }, (_, i) => `${((i / N) * 100).toFixed(2)}% ${f(i).toFixed(2)}%`);
const POLY_STRAIGHT = `polygon(${[...topPts(() => 0), "100% 100%", "0% 100%"].join(",")})`;
const POLY_TORN = `polygon(${[
  ...topPts((i) => (i % 2 ? 0.8 : 3.8 + ((i * 7) % 5) * 0.6)),
  "100% 100%",
  "0% 100%",
].join(",")})`;
const POLY_REMNANT = `polygon(0% 0%,100% 0%,${Array.from({ length: N + 1 }, (_, i) => `${(100 - (i / N) * 100).toFixed(2)}% ${(i % 2 ? 62 : 100 - ((i * 5) % 4) * 6).toFixed(0)}%`).join(",")})`;

// こちらの（サンプル）連絡先
const ROWS = [
  { icon: "✉", label: "メール", value: "hello@hansik-sketch.example", color: "#e8483a" },
  { icon: "☎", label: "電話", value: "03-1234-5678", color: "#3a8fd9" },
  { icon: "⌂", label: "住所", value: "〒100-0000 東京都千代田区サンプル町1-2-3", color: "#5bb450" },
  { icon: "♡", label: "Instagram", value: "@hansik_sketchbook", color: "#f59a23" },
];

type Sent = { name: string; contact: string; message: string };
type Phase = "idle" | "sending" | "resetting" | "done";

const fieldCls =
  "w-full rounded-sm border-2 border-ink/35 bg-white/70 px-3 py-2 text-[clamp(.95rem,1.7vw,1.3rem)] text-ink outline-none transition-shadow placeholder:text-ink/35 focus:border-crayon-orange focus:shadow-[3px_3px_0_rgba(245,154,35,.45)] disabled:opacity-60";

/** 送信アニメ中はスクロールを止める（スクラブ位置がずれないように） */
function lockScroll(on: boolean) {
  const lenis = getLenis();
  if (on) {
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
  } else {
    lenis?.start();
    document.documentElement.style.overflow = "";
  }
}

export default function ContactPage() {
  const root = useRef<HTMLDivElement>(null);
  const sendTl = useRef<gsap.core.Timeline | null>(null);
  const [form, setForm] = useState<Sent>({ name: "", contact: "", message: "" });
  const [error, setError] = useState("");
  const [sent, setSent] = useState<Sent | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");

  // ---- 送信時に時間で再生する演出（破る → 折る → 飛ばす → お礼）を用意しておく ----
  useGSAP(
    () => {
      const el = root.current!;
      const q = (s: string) => el.querySelectorAll(s);
      const one = (s: string) => el.querySelector(s) as HTMLElement;
      const letter = one("[data-letter]");
      const body = one("[data-letter-body]");
      const plane = one("[data-plane]");
      const shape = one("[data-plane-shape]");
      const trail = el.querySelector("[data-trail]") as unknown as SVGPathElement;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      gsap.set(letter, { clipPath: POLY_STRAIGHT });
      gsap.set(plane, { x: 400, y: 300, autoAlpha: 0 });
      gsap.set(q("[data-crease]"), { drawSVG: "0% 0%" });
      gsap.set(trail, { drawSVG: "0% 0%", autoAlpha: 0 });
      gsap.set(q("[data-thanks] > *"), { autoAlpha: 0 });

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "none" },
        onComplete: () => {
          lockScroll(false);
          setPhase("done");
        },
        onReverseComplete: () => {
          lockScroll(false);
          setPhase("idle");
          setSent(null);
          setForm({ name: "", contact: "", message: "" });
        },
      });
      let t = 0;

      // 1) ビリッ！とページを破る（上端がギザギザになり、手紙が少し浮く）
      tl.to(letter, { clipPath: POLY_TORN, duration: 0.6, ease: "power2.in" }, t);
      tl.to(letter, { rotation: -2.5, y: 14, duration: 0.6, ease: "power2.in", transformOrigin: "50% 0%" }, t);
      tl.to(letter, { rotation: -1, duration: 0.1, yoyo: true, repeat: 5, ease: "sine.inOut" }, t + 0.15);
      t += 0.8;

      // 2) 小さく畳まれて、紙飛行機の元の四角形になる
      tl.to(letter, { scale: 0.3, rotation: 6, y: 0, duration: 0.9, ease: "power3.inOut", transformOrigin: "50% 50%" }, t);
      tl.to(body, { autoAlpha: 0, duration: 0.3 }, t);
      tl.to(plane, { autoAlpha: 1, duration: 0.2 }, t + 0.55);
      tl.to(letter, { autoAlpha: 0, duration: 0.2 }, t + 0.65);
      tl.set(plane, { rotation: 6 }, t + 0.65);
      t += 1.0;

      // 3) 折る：四角 → 三角に折る → 飛行機
      tl.to(plane, { rotation: 0, duration: 0.25 }, t);
      tl.to(shape, { morphSVG: SHAPE_B, duration: 0.7, ease: "power2.inOut" }, t + 0.15);
      tl.to(plane, { scaleX: 0.7, duration: 0.35, yoyo: true, repeat: 1, ease: "sine.inOut" }, t + 0.15);
      tl.to(q("[data-crease]")[0], { drawSVG: "0% 100%", duration: 0.4 }, t + 0.4);
      tl.to(shape, { morphSVG: SHAPE_C, duration: 0.7, ease: "power2.inOut" }, t + 0.95);
      tl.to(plane, { scaleX: 0.7, duration: 0.35, yoyo: true, repeat: 1, ease: "sine.inOut" }, t + 0.95);
      tl.to(q("[data-crease]"), { drawSVG: "0% 100%", duration: 0.4 }, t + 1.3);
      tl.to(plane, { scale: 1.15, duration: 0.4, ease: "back.out(2)" }, t + 1.6);
      t += 2.0;

      // 4) 紙飛行機がクレヨンの軌跡を描いて飛んでいく
      tl.set(trail, { autoAlpha: 1 }, t);
      tl.to(
        plane,
        {
          motionPath: { path: trail, align: trail, alignOrigin: [0.5, 0.5], autoRotate: 90 },
          scale: 0.45,
          duration: 2.8,
          ease: "power1.in",
        },
        t,
      );
      tl.to(trail, { drawSVG: "0% 100%", duration: 2.8, ease: "power1.in" }, t);
      tl.to(trail, { autoAlpha: 0, duration: 0.6 }, t + 2.5);

      // 5) 下の紙にお礼と控え
      tl.to(q("[data-thanks] > :not([data-star])"), { autoAlpha: 1, duration: 0.5, stagger: 0.18 }, t + 1.6);
      popIn(tl, q("[data-star]"), t + 2.2, 0.12);
      tl.to(q("[data-star]"), { rotation: 360, duration: 3, ease: "none" }, t + 2.2);

      if (reduce) tl.timeScale(20);
      sendTl.current = tl;
      return () => {
        lockScroll(false);
      };
    },
    { scope: root },
  );

  // 送信データが確定（= 控えの DOM が描画済み）になってから演出を始める
  useEffect(() => {
    if (!sent || phase !== "sending") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    lockScroll(true);
    sendTl.current?.timeScale(reduce ? 20 : 1).play(0);
  }, [sent, phase]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phase !== "idle") return;
    const data = {
      name: form.name.trim(),
      contact: form.contact.trim(),
      message: form.message.trim(),
    };
    if (!data.contact) return setError("メールアドレスか電話番号を書いてね。");
    if (!data.message) return setError("ご意見・ご質問を書いてね。");
    setError("");
    setSent(data);
    setPhase("sending");
  };

  const writeAgain = () => {
    if (phase !== "done") return;
    setPhase("resetting");
    lockScroll(true);
    sendTl.current?.timeScale(2).reverse();
  };

  const disabled = phase !== "idle";

  return (
    <div ref={root} data-page="contact" className="paper absolute inset-0 overflow-hidden rounded-md">
      {/* 下の紙：飛行機が飛んだあとに見える */}
      <div data-thanks className="absolute inset-0 flex flex-col items-center justify-center px-[8%] text-center text-ink">
        <p className="font-pen text-crayon text-[clamp(1.8rem,5.2vw,4rem)] leading-tight text-crayon-blue">
          お便り、飛んでいきました！
        </p>
        <p data-thanks-sub className="mt-2 text-[clamp(1rem,2.2vw,1.7rem)]">
          ありがとう{sent?.name ? `、${sent.name}さん` : ""}。すぐにお返事するね ✏️
        </p>
        <div className="mt-[3vh] w-full max-w-[40rem] rounded-sm border-2 border-dashed border-ink/30 bg-paper-dark/50 px-[4%] py-[2.5vh] text-left text-[clamp(.85rem,1.5vw,1.15rem)]">
          <p className="mb-2 text-center text-ink/60">控え</p>
          <dl className="grid grid-cols-[5.5em_1fr] gap-x-3 gap-y-1">
            <dt className="text-ink/60">お名前</dt>
            <dd className="break-all">{sent?.name || "（未記入）"}</dd>
            <dt className="text-ink/60">ご連絡先</dt>
            <dd className="break-all">{sent?.contact}</dd>
            <dt className="text-ink/60">ご意見</dt>
            <dd className="line-clamp-4 whitespace-pre-wrap break-words">{sent?.message}</dd>
          </dl>
        </div>
        <button
          type="button"
          onClick={writeAgain}
          className="mt-[3vh] -rotate-1 rounded-sm border-2 border-ink/60 bg-paper px-5 py-2 text-[clamp(.95rem,1.6vw,1.2rem)] shadow-[3px_3px_0_rgba(59,47,42,.3)] transition-transform hover:rotate-1 hover:scale-105"
        >
          もう一枚書く
        </button>
        {[
          ["8%", "18%", "#ffd23f", 34],
          ["88%", "26%", "#e8483a", 26],
          ["14%", "78%", "#5bb450", 30],
          ["84%", "74%", "#3a8fd9", 36],
        ].map(([l, t, c, s], i) => (
          <svg key={i} data-star viewBox="-20 -20 40 40" className="absolute" style={{ left: l as string, top: t as string, width: s as number, height: s as number }} aria-hidden>
            <path d="M0 -16 L4 -5 L16 -4 L7 4 L10 16 L0 9 L-10 16 L-7 4 L-16 -4 L-4 -5 Z" fill={c as string} stroke="#3b2f2a" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        ))}
      </div>

      {/* 破れた跡 */}
      <div data-remnant className="absolute inset-x-0 top-0 h-[7%] bg-paper-dark" style={{ clipPath: POLY_REMNANT }} />

      {/* ちぎって飛ばす手紙（フォーム） */}
      <div data-letter className="paper absolute inset-0 shadow-[0_6px_18px_rgba(59,47,42,.25)]" style={{ clipPath: POLY_STRAIGHT }}>
        <div
          data-letter-body
          data-lenis-prevent
          className="absolute inset-0 flex flex-col items-center overflow-y-auto px-[5%] pb-[3vh] pt-[8vh] text-ink [justify-content:safe_center]"
        >
          <p className="font-pen text-[clamp(.9rem,1.8vw,1.4rem)] tracking-[.3em] text-crayon-red">CONTACT</p>
          <h2 data-contact-title className="font-pen text-crayon mt-1 text-center text-[clamp(2.2rem,7vw,5.5rem)] leading-tight text-crayon-red">
            ご連絡ください！
          </h2>
          <svg viewBox="0 0 400 20" className="w-[min(60%,22rem)]" aria-hidden>
            <path data-underline d="M5 12 Q50 0 100 12 T200 12 T300 12 T395 9" fill="none" stroke="#f59a23" strokeWidth="6" strokeLinecap="round" />
          </svg>
          <p data-contact-sub className="mt-[1vh] text-center text-[clamp(.95rem,2vw,1.5rem)] text-ink/80">
            ごはんのこと、ご意見、なんでも書いて紙飛行機で送ってね。
          </p>

          <div className="mt-[2.5vh] grid w-full max-w-[64rem] gap-[3vh] md:grid-cols-[1fr_1.25fr] md:gap-[3vw]">
            {/* こちらの連絡先（サンプル） */}
            <div className="rounded-sm bg-white/50 px-[5%] py-[2vh] shadow-[3px_4px_0_rgba(59,47,42,.12)] md:self-start">
              <p className="mb-2 text-ink/60">こちらの連絡先</p>
              <ul className="flex flex-col gap-2 text-[clamp(.85rem,1.5vw,1.15rem)]">
                {ROWS.map((r) => (
                  <li data-row key={r.label} className="flex items-baseline gap-2">
                    <span className="w-[1.3em] shrink-0 text-center" style={{ color: r.color }} aria-hidden>{r.icon}</span>
                    <span className="min-w-0 break-all">{r.value}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 入力フォーム */}
            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-[1.4vh]" aria-label="お問い合わせフォーム">
              <label data-field className="block">
                <span className="mb-1 block text-[clamp(.8rem,1.3vw,1rem)] text-ink/70">お名前（任意）</span>
                <input
                  className={fieldCls}
                  value={form.name}
                  disabled={disabled}
                  autoComplete="off"
                  maxLength={40}
                  placeholder="例）ひまわり"
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>
              <label data-field className="block">
                <span className="mb-1 block text-[clamp(.8rem,1.3vw,1rem)] text-ink/70">メールアドレス または 電話番号 <b className="text-crayon-red">*</b></span>
                <input
                  className={fieldCls}
                  value={form.contact}
                  disabled={disabled}
                  autoComplete="off"
                  maxLength={80}
                  placeholder="例）sample@example.com"
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                />
              </label>
              <label data-field className="block">
                <span className="mb-1 block text-[clamp(.8rem,1.3vw,1rem)] text-ink/70">ご意見・ご質問 <b className="text-crayon-red">*</b></span>
                <textarea
                  className={`${fieldCls} resize-none`}
                  rows={4}
                  value={form.message}
                  disabled={disabled}
                  maxLength={400}
                  placeholder="好きな韓国料理や、聞いてみたいことを書いてね"
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </label>
              <div data-field className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={disabled}
                  className="-rotate-1 rounded-sm border-2 border-ink bg-crayon-red px-5 py-2 text-[clamp(1rem,1.8vw,1.35rem)] text-white shadow-[4px_4px_0_rgba(59,47,42,.45)] transition-transform hover:rotate-1 hover:scale-105 disabled:opacity-60"
                >
                  紙飛行機にして送る ✈
                </button>
                <span role="alert" className="text-[clamp(.8rem,1.3vw,1rem)] text-crayon-red">{error}</span>
              </div>
            </form>
          </div>

          <p data-contact-note className="mt-[2vh] text-center text-[clamp(.7rem,1.2vw,.95rem)] text-ink/55">
            ※ 練習用サイトです。入力内容はどこにも送信・保存されません。本物の個人情報は入力しないでください。
          </p>
        </div>
      </div>

      {/* 紙飛行機と軌跡 */}
      <svg viewBox="0 0 800 600" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="xMidYMid meet" aria-hidden>
        <g filter="url(#crayon)">
          <path data-trail d={TRAIL} fill="none" stroke="#3a8fd9" strokeWidth="5" strokeLinecap="round" />
          <g data-plane style={{ opacity: 0, visibility: "hidden" }}>
            <path data-plane-shape d={SHAPE_A} fill="#fbf6ea" stroke="#3b2f2a" strokeWidth="4" strokeLinejoin="round" />
            <path data-crease d="M0 -120 L0 120" fill="none" stroke="#3b2f2a" strokeWidth="3" opacity=".6" />
            <path data-crease d="M10 10 L8 60 M-10 10 L-8 60" fill="none" stroke="#3b2f2a" strokeWidth="3" opacity=".6" />
          </g>
        </g>
      </svg>
    </div>
  );
}

/** スクロール連動の区間：見出しが書かれ、フォームが現れるところまで（送信演出は時間で再生） */
export const buildContact: PageBuilder = (tl, root, at) => {
  const q = (s: string) => root.querySelectorAll(s);
  const one = (s: string) => root.querySelector(s) as HTMLElement;
  let t = at;

  const split = SplitText.create(one("[data-contact-title]"), { type: "chars" });
  tl.fromTo(
    split.chars,
    { autoAlpha: 0, y: 36, rotate: () => gsap.utils.random(-18, 18) },
    { autoAlpha: 1, y: 0, rotate: 0, duration: 0.5, stagger: 0.08, ease: "back.out(2)" },
    t,
  );
  tl.fromTo(q("[data-underline]"), { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 0.7, ease: "power1.inOut" }, t + 0.7);
  tl.fromTo(q("[data-contact-sub]"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.5 }, t + 1.0);
  tl.fromTo(
    q("[data-letter-body] [data-row]"),
    { autoAlpha: 0, x: -30, rotate: -2 },
    { autoAlpha: 1, x: 0, rotate: 0, duration: 0.45, stagger: 0.15, ease: "back.out(1.6)" },
    t + 1.2,
  );
  tl.fromTo(
    q("[data-field]"),
    { autoAlpha: 0, y: 24, rotate: -1.5 },
    { autoAlpha: 1, y: 0, rotate: 0, duration: 0.45, stagger: 0.2, ease: "back.out(1.6)" },
    t + 1.5,
  );
  tl.fromTo(q("[data-contact-note]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, t + 2.4);
  t += 3.2;
  tl.to({}, { duration: 0.8 }, t); // フォームを触れるよう、少し余白を残してピンを外す
  return t + 0.8;
};
