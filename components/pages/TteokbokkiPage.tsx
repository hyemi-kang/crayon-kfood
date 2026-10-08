import Crayon from "@/components/Crayon";
import { drawStroke, hideCrayon, popIn, zigzag, type PageBuilder } from "@/lib/crayon";

const RIM = "M120 300 A280 95 0 1 1 680 300 A280 95 0 1 1 120 300";
const BODY = "M120 300 C120 400 230 470 400 470 C570 470 680 400 680 300";
const BODY_CLOSED = `${BODY} A280 95 0 0 1 120 300 Z`;
const HANDLE = "M668 345 L790 410 L778 436 L650 372";
const SAUCE = "M152 300 A248 80 0 1 1 648 300 A248 80 0 1 1 152 300";

// [中心x, 中心y, 角度]
const TTEOK: [number, number, number][] = [
  [260, 322, 14],
  [345, 290, -12],
  [440, 276, 8],
  [535, 296, -22],
  [385, 334, -4],
  [480, 338, 14],
  [585, 336, -10],
];
const SCALLION: [number, number][] = [[300, 296], [415, 312], [510, 268], [570, 312], [350, 340], [455, 300]];
const FISHCAKE: [number, number, number][] = [
  [305, 270, -10],
  [520, 332, 16],
];

const STEAM_A = "M0 0 C-16 -26 16 -46 0 -74 C-16 -102 16 -118 0 -146";
const STEAM_B = "M0 0 C16 -26 -16 -46 0 -74 C16 -102 -16 -118 0 -146";

const CHILI = "M0 0 C13 -4 24 7 21 26 C19 42 8 56 -7 64 C-2 50 -8 36 -6 19 C-6 9 -4 2 0 0 Z";
const CHEESE = "M440 262 C426 205 478 190 452 132 C438 100 474 84 462 46";

export default function TteokbokkiPage() {
  return (
    <div data-page="tteokbokki" className="paper absolute inset-0 overflow-hidden rounded-md">
      <div data-head className="absolute left-[5%] top-[8%] z-10 max-w-[55%]">
        <p className="font-pen text-[clamp(.9rem,1.8vw,1.4rem)] tracking-[.3em] text-crayon-red">CHAPTER 2</p>
        <h2 className="font-pen text-crayon text-[clamp(2.2rem,6.5vw,5rem)] leading-none text-ink">トッポッキ</h2>
        <p className="font-hangul text-[clamp(1.2rem,2.6vw,2rem)] text-crayon-red">떡볶이</p>
        <p className="mt-2 text-[clamp(.9rem,1.7vw,1.3rem)] text-ink/70">あま辛ソースで、ぐつぐつ。</p>
      </div>

      <svg viewBox="0 0 800 600" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet" aria-label="クレヨンで描いたトッポッキ">
        <defs>
          <clipPath id="tb-body"><path d={BODY_CLOSED} /></clipPath>
          <clipPath id="tb-sauce"><path d={SAUCE} /></clipPath>
        </defs>

        {/* 色塗り */}
        <g filter="url(#crayon-fill)" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <g clipPath="url(#tb-body)"><path data-fill="pan" d={zigzag(118, 300, 564, 172, 16)} stroke="#6b6b73" strokeWidth="24" /></g>
          <path data-fill="handle" d="M662 362 L782 425" stroke="#6b6b73" strokeWidth="20" />
          <g clipPath="url(#tb-sauce)"><path data-fill="sauce" d={zigzag(150, 214, 500, 172, 12)} stroke="#e8483a" strokeWidth="19" /></g>
          <g clipPath="url(#tb-sauce)">
            <path data-fill="sauce2" d={zigzag(150, 224, 500, 160, 22)} stroke="#f59a23" strokeWidth="7" opacity=".7" />
          </g>

          {/* お餅（白く塗る） */}
          {TTEOK.map(([x, y, a], i) => (
            <rect key={i} data-tteok-fill x={x - 46} y={y - 14} width="92" height="28" rx="14" transform={`rotate(${a} ${x} ${y})`} fill="#f9ecd2" stroke="none" />
          ))}
          {FISHCAKE.map(([x, y, a], i) => (
            <path key={i} data-tteok-fill d="M-32 14 L32 14 L0 -32 Z" transform={`translate(${x} ${y}) rotate(${a})`} fill="#f4c9a0" stroke="none" />
          ))}
          {SCALLION.map(([x, y], i) => (
            <circle key={i} data-tteok-fill cx={x} cy={y} r="8" fill="#5bb450" stroke="none" />
          ))}
          <path data-fill="cheese" d={CHEESE} stroke="#ffd23f" strokeWidth="16" />
        </g>

        {/* 輪郭線 */}
        <g filter="url(#crayon)" fill="none" stroke="#3b2f2a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
          <path data-line="rim" d={RIM} />
          <path data-line="body" d={BODY} />
          <path data-line="handle" d={HANDLE} />
          <path data-line="sauce" d={SAUCE} strokeWidth="3" opacity=".55" />
          {TTEOK.map(([x, y, a], i) => (
            <rect key={i} data-line="tteok" x={x - 46} y={y - 14} width="92" height="28" rx="14" transform={`rotate(${a} ${x} ${y})`} strokeWidth="3.5" />
          ))}
          {FISHCAKE.map(([x, y, a], i) => (
            <path key={i} data-line="tteok" d="M-32 14 L32 14 L0 -32 Z" transform={`translate(${x} ${y}) rotate(${a})`} strokeWidth="3.5" />
          ))}
          {SCALLION.map(([x, y], i) => (
            <circle key={i} data-line="tteok" cx={x} cy={y} r="8" strokeWidth="3" />
          ))}
          <path data-line="cheese" d={CHEESE} stroke="#d9a400" strokeWidth="3" transform="translate(7 0)" opacity=".8" />
          {[360, 405, 450].map((x, i) => (
            <g key={x} transform={`translate(${x} 215)`}>
              <path data-steam={i} data-line="steam" d={STEAM_A} stroke="#3a8fd9" strokeWidth="4.5" />
            </g>
          ))}
        </g>

        {/* 辛さゲージ */}
        <g transform="translate(60 505)">
          <text x="0" y="-12" fontSize="28" fill="#3b2f2a" data-gauge-label style={{ fontFamily: "var(--font-hand)" }}>辛さ</text>
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i} transform={`translate(${i * 44} 4) scale(.9)`}>
              <path data-chili-line d={CHILI} fill="none" stroke="#3b2f2a" strokeWidth="3.5" strokeLinejoin="round" />
              <path data-chili-fill d={CHILI} fill="#e8483a" opacity="0" />
            </g>
          ))}
        </g>

        {/* 手書きラベル */}
        <g fontSize="30" fill="#3b2f2a" style={{ fontFamily: "var(--font-hand)" }}>
          <text data-label x="692" y="316" textAnchor="start" fontSize="26">もちもち</text>
          <text data-label x="40" y="250" textAnchor="start" fill="#e8483a">ぐつぐつ…</text>
          <text data-label x="520" y="88" textAnchor="start" fill="#d9a400">チーズびよーん！</text>
          <text data-label x="560" y="545" textAnchor="start">あま辛ソース</text>
        </g>

        <Crayon />
      </svg>
    </div>
  );
}

export const buildTteokbokki: PageBuilder = (tl, root, at) => {
  const q = (s: string) => root.querySelectorAll(s);
  const crayon = root.querySelector("[data-crayon]");
  const labels = q("[data-label]");
  let t = at;

  tl.fromTo(q("[data-head] > *"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, stagger: 0.12, duration: 0.5 }, t);
  t += 0.6;

  // フライパン
  t = drawStroke(tl, q('[data-line="rim"]'), t, 1.1, { crayon, color: "#3b2f2a", ease: "crayon" });
  t = drawStroke(tl, q('[data-line="body"]'), t, 0.9, { crayon, ease: "crayon" });
  t = drawStroke(tl, q('[data-line="handle"]'), t, 0.6, { crayon });
  t = drawStroke(tl, q('[data-fill="pan"]'), t, 1.1, { crayon, color: "#6b6b73" });
  t = drawStroke(tl, q('[data-fill="handle"]'), t, 0.4, { crayon, color: "#6b6b73" });

  // 真っ赤なソースをぐるぐる塗る
  t = drawStroke(tl, q('[data-line="sauce"]'), t, 0.6, { crayon, color: "#3b2f2a" });
  t = drawStroke(tl, q('[data-fill="sauce"]'), t, 1.5, { crayon, color: "#e8483a" });
  t = drawStroke(tl, q('[data-fill="sauce2"]'), t, 0.8, { crayon, color: "#f59a23" });
  popIn(tl, labels[1], t - 0.4, 0);

  // お餅・さつま揚げ・ねぎが描かれて色がつく
  t = drawStroke(tl, q('[data-line="tteok"]'), t, 1.6, { crayon, color: "#3b2f2a" });
  tl.fromTo(
    q("[data-tteok-fill]"),
    { autoAlpha: 0, scale: 0.6, transformOrigin: "50% 50%" },
    { autoAlpha: 1, scale: 1, duration: 0.4, stagger: 0.05, ease: "back.out(2)" },
    t - 0.3,
  );
  popIn(tl, labels[0], t + 0.3, 0);
  t += 1.0;

  // 辛さゲージ：唐辛子の輪郭 → 赤く染まる
  const gaugeLines = q("[data-chili-line]");
  const gaugeFills = q("[data-chili-fill]");
  tl.fromTo(q("[data-gauge-label]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, t);
  t = drawStroke(tl, gaugeLines, t, 0.9, { crayon, color: "#3b2f2a" });
  tl.to(gaugeFills, { opacity: 0.95, duration: 0.3, stagger: 0.18, ease: "none" }, t);
  popIn(tl, labels[3], t + 0.2, 0);
  t += 1.1;

  // 湯気（ゆらゆら形が変わる）
  t = drawStroke(tl, q('[data-line="steam"]'), t, 0.8, { crayon, color: "#3a8fd9", ease: "power1.out" });
  q('[data-line="steam"]').forEach((p, i) => {
    tl.to(p, { morphSVG: STEAM_B, duration: 0.7, repeat: 3, yoyo: true, ease: "sine.inOut" }, t - 0.8 + i * 0.15);
  });

  // チーズが伸びる
  t = drawStroke(tl, q('[data-line="cheese"]'), t, 0.4, { crayon });
  t = drawStroke(tl, q('[data-fill="cheese"]'), t, 1.3, { crayon, color: "#ffd23f", ease: "power2.inOut" });
  popIn(tl, labels[2], t - 0.3, 0);
  hideCrayon(tl, crayon, t);
  t += 1.0;
  return t;
};
