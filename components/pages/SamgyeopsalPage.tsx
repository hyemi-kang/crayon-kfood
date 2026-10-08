import { gsap } from "@/lib/gsap";
import Crayon from "@/components/Crayon";
import { drawStroke, hideCrayon, popIn, seeded, zigzag, type PageBuilder } from "@/lib/crayon";

const RIM = "M130 330 A270 90 0 1 1 670 330 A270 90 0 1 1 130 330";
const BODY = "M130 330 C130 410 160 450 210 458 L590 458 C640 450 670 410 670 330";

// 網（楕円の内側に収まる横線）
const GRATE = [288, 303, 318, 333, 348, 363].map((y) => {
  const k = Math.sqrt(1 - ((y - 330) / 90) ** 2);
  const hw = 270 * k * 0.93;
  return `M${(400 - hw).toFixed(0)} ${y} L${(400 + hw).toFixed(0)} ${y}`;
});

// [中心x, 中心y, 角度]
const MEAT: [number, number, number][] = [
  [285, 322, -14],
  [400, 300, 6],
  [515, 326, 16],
  [385, 352, -5],
];
const PIECE = "M-58 -18 C-58 -26 -46 -24 0 -24 C46 -24 58 -26 58 -18 L58 18 C58 26 46 24 0 24 C-46 24 -58 26 -58 18 Z";

const FLAME_X = [215, 305, 400, 495, 585];
const FLAME = "M0 0 C-24 -10 -18 -36 0 -58 C18 -36 24 -10 0 0 Z";

const LEAF =
  "M60 540 C50 500 100 480 140 492 C170 470 220 478 235 510 C262 520 262 560 232 572 C200 590 110 590 80 572 C60 566 56 552 60 540 Z";
const WRAP_LINES = [
  "M300 262 C340 232 470 232 505 275",
  "M290 340 C330 385 470 392 520 340",
  "M296 285 C270 310 275 335 300 350",
];

const rand = seeded(7);
const SPARKS = Array.from({ length: 16 }, (_, i) => {
  const m = MEAT[i % MEAT.length];
  return {
    x: m[0] + (rand() - 0.5) * 90,
    y: m[1] - 6 + (rand() - 0.5) * 20,
    dx: (rand() - 0.5) * 120,
    dy: -(70 + rand() * 90),
    r: 2.5 + rand() * 3.5,
    c: i % 3 === 0 ? "#ffd23f" : i % 3 === 1 ? "#f59a23" : "#e8483a",
  };
});

export default function SamgyeopsalPage() {
  return (
    <div data-page="samgyeopsal" className="paper absolute inset-0 overflow-hidden rounded-md">
      <div data-head className="absolute left-[5%] top-[8%] z-10 max-w-[55%]">
        <p className="font-pen text-[clamp(.9rem,1.8vw,1.4rem)] tracking-[.3em] text-crayon-red">CHAPTER 3</p>
        <h2 className="font-pen text-crayon text-[clamp(2.2rem,6.5vw,5rem)] leading-none text-ink">サムギョプサル</h2>
        <p className="font-hangul text-[clamp(1.2rem,2.6vw,2rem)] text-crayon-brown">삼겹살</p>
        <p className="mt-2 text-[clamp(.9rem,1.7vw,1.3rem)] text-ink/70">じゅうじゅう焼いて、葉っぱで巻く。</p>
      </div>

      <svg viewBox="0 0 800 600" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet" aria-label="クレヨンで描いたサムギョプサル">
        <defs>
          <clipPath id="sg-body"><path d={`${BODY} A270 90 0 0 1 130 330 Z`} /></clipPath>
          <clipPath id="sg-leaf"><path d={LEAF} /></clipPath>
        </defs>

        {/* 色塗り */}
        <g filter="url(#crayon-fill)" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <g clipPath="url(#sg-body)"><path data-fill="grill" d={zigzag(128, 330, 544, 130, 16)} stroke="#4a4a52" strokeWidth="24" /></g>

          {FLAME_X.map((x) => (
            <g key={x} transform={`translate(${x} 522)`}>
              <path data-flame-fill d={FLAME} fill="#f59a23" stroke="none" />
              <path data-flame-fill d="M0 -2 C-13 -7 -10 -20 0 -33 C10 -20 13 -7 0 -2 Z" fill="#ffd23f" stroke="none" />
            </g>
          ))}

          {MEAT.map(([x, y, a], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${a})`}>
              <path data-meat-fill d={PIECE} fill="#f2a09a" stroke="none" />
              <path data-fat d="M-48 -8 L48 -8" stroke="#fff" strokeWidth="7" opacity=".95" />
              <path data-fat d="M-48 8 L48 8" stroke="#fff" strokeWidth="7" opacity=".95" />
              <path data-sear d="M-50 -14 L-20 16 M-28 -16 L2 14 M-6 -16 L24 14 M16 -16 L46 14" stroke="#7a4a2b" strokeWidth="9" opacity="0" />
            </g>
          ))}

          <g clipPath="url(#sg-leaf)" data-leaf>
            <path data-fill="leaf" d={zigzag(55, 478, 212, 112, 11)} stroke="#5bb450" strokeWidth="17" />
          </g>
          <g transform="translate(0 -16)">{/* にんにく */}
          <path data-fill="garlic" d="M318 560 C300 540 316 520 338 508 C360 520 376 540 358 560 C346 568 330 568 318 560 Z" fill="#fff4dc" stroke="none" opacity="0" />
          {/* サムジャン */}
          <path data-fill="ssam" d="M388 538 L452 538 C452 566 436 578 420 578 C404 578 388 566 388 538 Z" fill="#c4452f" stroke="none" opacity="0" /></g>
        </g>

        {/* 輪郭線 */}
        <g filter="url(#crayon)" fill="none" stroke="#3b2f2a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
          <path data-line="rim" d={RIM} />
          <path data-line="body" d={BODY} />
          {GRATE.map((d, i) => (
            <path key={i} data-line="grate" d={d} strokeWidth="3.5" opacity=".7" />
          ))}

          {FLAME_X.map((x) => (
            <g key={x} transform={`translate(${x} 522)`}>
              <path data-flame-line d={FLAME} stroke="#c2410c" strokeWidth="3.5" />
            </g>
          ))}

          {MEAT.map(([x, y, a], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${a})`}>
              <path data-line="meat" d={PIECE} strokeWidth="4" />
            </g>
          ))}

          <g data-leaf>
            <path data-line="leaf" d={LEAF} stroke="#2f7a2a" strokeWidth="4" />
            <path data-line="vein" d="M70 545 C120 540 170 540 250 540 M130 541 C140 520 150 508 160 498 M170 540 C180 560 190 570 200 580 M200 540 C212 524 226 516 238 512" stroke="#2f7a2a" strokeWidth="2.5" />
          </g>
          <g transform="translate(0 -16)"><path data-line="garlic" d="M318 560 C300 540 316 520 338 508 C360 520 376 540 358 560 C346 568 330 568 318 560 Z M338 508 C338 498 340 492 344 488" strokeWidth="3.5" />
          <path data-line="ssam" d="M388 538 L452 538 C452 566 436 578 420 578 C404 578 388 566 388 538 Z" strokeWidth="3.5" /></g>

          {WRAP_LINES.map((d, i) => (
            <path key={i} data-line="wrap" d={d} stroke="#2f7a2a" strokeWidth="6" />
          ))}
        </g>

        {/* 火花 */}
        <g>
          {SPARKS.map((s, i) => (
            <circle key={i} data-spark cx={s.x} cy={s.y} r={s.r} fill={s.c} opacity="0" />
          ))}
        </g>

        {/* ラベル */}
        <g fontSize="30" fill="#3b2f2a" style={{ fontFamily: "var(--font-hand)" }}>
          <text data-label x="40" y="260" textAnchor="start" fill="#e8483a">じゅわ〜っ</text>
          <text data-label x="640" y="250" textAnchor="start" fill="#7a4a2b">カリッ</text>
          <text data-label x="70" y="596" textAnchor="start">サンチュ</text>
          <text data-label x="300" y="594" textAnchor="start" fontSize="21">にんにく</text>
          <text data-label x="382" y="594" textAnchor="start" fontSize="21">サムジャン</text>
          <text data-label x="560" y="560" textAnchor="start" fill="#2f7a2a" fontSize="28">サンチュで巻いて</text>
          <text data-label x="610" y="592" textAnchor="start" fill="#e8483a" fontSize="30">パクッ！</text>
        </g>

        <Crayon />
      </svg>
    </div>
  );
}

export const buildSamgyeopsal: PageBuilder = (tl, root, at) => {
  const q = (s: string) => root.querySelectorAll(s);
  const crayon = root.querySelector("[data-crayon]");
  const labels = q("[data-label]");
  let t = at;

  tl.fromTo(q("[data-head] > *"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, stagger: 0.12, duration: 0.5 }, t);
  t += 0.6;

  // 鉄板と網
  t = drawStroke(tl, q('[data-line="rim"]'), t, 1.1, { crayon, color: "#3b2f2a", ease: "crayon" });
  t = drawStroke(tl, q('[data-line="body"]'), t, 0.9, { crayon, ease: "crayon" });
  t = drawStroke(tl, q('[data-fill="grill"]'), t, 1.1, { crayon, color: "#4a4a52" });
  t = drawStroke(tl, q('[data-line="grate"]'), t, 0.9, { crayon, color: "#3b2f2a" });

  // 下の炎が灯る
  t = drawStroke(tl, q("[data-flame-line]"), t, 0.8, { crayon, color: "#c2410c" });
  tl.fromTo(
    q("[data-flame-fill]"),
    { autoAlpha: 0, scaleY: 0.1, transformOrigin: "50% 100%" },
    { autoAlpha: 1, scaleY: 1, duration: 0.5, stagger: 0.04, ease: "back.out(2)" },
    t - 0.3,
  );
  // ゆらゆら揺れる
  tl.to(q("[data-flame-fill]"), { scaleY: 1.18, scaleX: 0.92, duration: 0.5, yoyo: true, repeat: 7, ease: "sine.inOut", stagger: 0.03 }, t + 0.3);
  t += 0.6;

  // お肉を1枚ずつ
  t = drawStroke(tl, q('[data-line="meat"]'), t, 1.4, { crayon, color: "#3b2f2a" });
  tl.fromTo(
    q("[data-meat-fill]"),
    { autoAlpha: 0, scale: 0.7, transformOrigin: "50% 50%" },
    { autoAlpha: 1, scale: 1, duration: 0.4, stagger: 0.1, ease: "back.out(2)" },
    t - 0.2,
  );
  t += 0.4;
  t = drawStroke(tl, q("[data-fat]"), t, 1.0, { crayon, color: "#ffffff" });
  popIn(tl, labels[0], t - 0.4, 0);

  // 焼き色がついて火花が散る
  t = drawStroke(tl, q("[data-sear]"), t + 0.1, 1.2, { crayon, color: "#7a4a2b" });
  tl.to(q("[data-sear]"), { opacity: 0.55, duration: 0.5 }, t - 0.5);
  tl.fromTo(
    q("[data-spark]"),
    { opacity: 0, x: 0, y: 0, scale: 0.4 },
    {
      opacity: 1,
      x: (i: number) => (i % 2 ? 1 : -1) * (12 + (i * 7) % 40),
      y: (i: number) => -(40 + (i * 13) % 90),
      scale: 1,
      duration: 0.5,
      stagger: 0.04,
      ease: "power2.out",
    },
    t - 0.8,
  );
  tl.to(q("[data-spark]"), { opacity: 0, y: "-=40", duration: 0.5, stagger: 0.04 }, t - 0.2);
  popIn(tl, labels[1], t - 0.2, 0);
  t += 0.5;

  // サンチュ・にんにく・サムジャン
  t = drawStroke(tl, q('[data-line="leaf"]'), t, 0.8, { crayon, color: "#2f7a2a" });
  t = drawStroke(tl, q('[data-fill="leaf"]'), t, 0.9, { crayon, color: "#5bb450" });
  t = drawStroke(tl, q('[data-line="vein"]'), t, 0.5, { crayon, color: "#2f7a2a" });
  popIn(tl, labels[2], t - 0.3, 0);
  t = drawStroke(tl, q('[data-line="garlic"]'), t, 0.4, { crayon, color: "#3b2f2a" });
  t = drawStroke(tl, q('[data-line="ssam"]'), t, 0.4, { crayon });
  tl.to(q('[data-fill="garlic"], [data-fill="ssam"]'), { opacity: 1, duration: 0.3, stagger: 0.1 }, t - 0.4);
  popIn(tl, labels.length ? [labels[3], labels[4]] : [], t - 0.3, 0.1);
  hideCrayon(tl, crayon, t);
  t += 0.4;

  // サンチュがお肉の上へ飛んで、くるっと巻く
  tl.to(
    q("[data-leaf]"),
    { x: 170, y: -205, rotation: 360, scale: 1.05, svgOrigin: "148 530", duration: 1.4, ease: "power2.inOut" },
    t,
  );
  t += 1.3;
  t = drawStroke(tl, q('[data-line="wrap"]'), t, 0.8, { ease: "power1.out" });
  popIn(tl, [labels[5], labels[6]], t - 0.2, 0.2);
  tl.to(q("[data-leaf]"), { scale: 1.12, duration: 0.3, yoyo: true, repeat: 1, ease: "sine.inOut", transformOrigin: "50% 50%" }, t);

  gsap.set(q("[data-label]"), { autoAlpha: 0 });
  return t + 1.2;
};
