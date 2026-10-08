import { gsap } from "@/lib/gsap";
import Crayon from "@/components/Crayon";
import { drawStroke, hideCrayon, popIn, spiralPath, zigzag, type PageBuilder } from "@/lib/crayon";

const RIM = "M150 250 A250 70 0 1 1 650 250 A250 70 0 1 1 150 250";
const BODY = "M150 250 C150 400 260 480 400 480 C540 480 650 400 650 250";
// 上辺は縁(楕円)の下半分に沿わせて、開口部の内側に塗りがはみ出さないようにする
const BODY_CLOSED = `${BODY} A250 70 0 0 1 150 250 Z`;
const FOOT = "M335 478 L322 525 L478 525 L465 478";
const RICE = "M182 250 A218 55 0 1 1 618 250 A218 55 0 1 1 182 250";

type Ing = {
  id: string;
  d: string;
  color: string;
  box: [number, number, number, number];
  label: string;
  lx: number;
  ly: number;
  anchor: "start" | "middle" | "end";
  leader: string;
};

const INGREDIENTS: Ing[] = [
  {
    id: "spinach",
    d: "M225 225 C235 205 285 200 330 215 C350 232 320 255 270 255 C235 252 220 240 225 225 Z",
    color: "#5bb450",
    box: [220, 200, 135, 58],
    label: "ほうれん草",
    lx: 26,
    ly: 238,
    anchor: "start",
    leader: "M262 230 C240 236 215 238 196 236",
  },
  {
    id: "carrot",
    d: "M450 222 C470 205 540 203 575 222 C580 240 540 256 490 254 C455 250 445 235 450 222 Z",
    color: "#f59a23",
    box: [445, 200, 140, 58],
    label: "にんじん",
    lx: 600,
    ly: 168,
    anchor: "start",
    leader: "M545 216 C565 196 590 182 600 176",
  },
  {
    id: "sprouts",
    d: "M270 275 C285 262 350 262 385 272 C395 285 360 298 320 297 C285 296 262 287 270 275 Z",
    color: "#ffd23f",
    box: [262, 260, 135, 40],
    label: "もやし",
    lx: 28,
    ly: 340,
    anchor: "start",
    leader: "M285 290 C240 300 190 322 150 332",
  },
  {
    id: "mushroom",
    d: "M420 280 C440 266 505 266 540 278 C548 292 510 303 470 302 C432 300 412 290 420 280 Z",
    color: "#a8774f",
    box: [412, 264, 140, 42],
    label: "しいたけ",
    lx: 662,
    ly: 340,
    anchor: "start",
    leader: "M530 292 C575 305 620 322 656 332",
  },
];

const GOCHUJANG = "M386 284 A16 13 0 1 1 418 284 A16 13 0 1 1 386 284";
const EGG = "M345 240 A55 24 0 1 1 455 240 A55 24 0 1 1 345 240";
const YOLK = "M386 237 A14 13 0 1 1 414 237 A14 13 0 1 1 386 237";
const STEAM = [
  "M340 160 C320 140 360 125 340 100 C324 80 350 66 340 48",
  "M400 150 C380 130 420 115 400 90 C384 70 410 56 400 38",
  "M460 160 C440 140 480 125 460 100 C444 80 470 66 460 48",
];

export default function BibimbapPage() {
  return (
    <div data-page="bibimbap" className="paper absolute inset-0 overflow-hidden rounded-md">
      <div data-head className="absolute left-[5%] top-[8%] z-10 max-w-[55%]">
        <p className="font-pen text-[clamp(.9rem,1.8vw,1.4rem)] tracking-[.3em] text-crayon-red">CHAPTER 1</p>
        <h2 className="font-pen text-crayon text-[clamp(2.2rem,6.5vw,5rem)] leading-none text-ink">ビビンバ</h2>
        <p className="font-hangul text-[clamp(1.2rem,2.6vw,2rem)] text-crayon-orange">비빔밥</p>
        <p className="mt-2 text-[clamp(.9rem,1.7vw,1.3rem)] text-ink/70">混ぜて、混ぜて、しあわせ。</p>
      </div>

      <svg viewBox="0 0 800 600" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet" aria-label="クレヨンで描いたビビンバ">
        <defs>
          <clipPath id="bb-body"><path d={BODY_CLOSED} /></clipPath>
          <clipPath id="bb-rice"><path d={RIM} /></clipPath>
          <clipPath id="bb-yolk"><path d={YOLK} /></clipPath>
          <clipPath id="bb-egg"><path d={EGG} /></clipPath>
          <clipPath id="bb-gochu"><path d={GOCHUJANG} /></clipPath>
          {INGREDIENTS.map((i) => (
            <clipPath key={i.id} id={`bb-${i.id}`}><path d={i.d} /></clipPath>
          ))}
        </defs>

        {/* 色塗り（クレヨンのかすれ強め） */}
        <g filter="url(#crayon-fill)" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <g clipPath="url(#bb-body)"><path data-fill="body" d={zigzag(148, 250, 504, 232, 16)} stroke="#7a4a2b" strokeWidth="24" /></g>
          <g clipPath="url(#bb-rice)"><path data-fill="rice" d={zigzag(148, 176, 504, 150, 12)} stroke="#f6e7b8" strokeWidth="20" /></g>
          {INGREDIENTS.map((i) => (
            <g key={i.id} data-ing={i.id} clipPath={`url(#bb-${i.id})`}>
              <path data-fill={i.id} d={zigzag(i.box[0], i.box[1], i.box[2], i.box[3], 9)} stroke={i.color} strokeWidth="15" />
            </g>
          ))}
          <g data-ing="egg" clipPath="url(#bb-egg)"><path data-fill="egg" d={zigzag(344, 214, 112, 52, 9)} stroke="#ffffff" strokeWidth="15" /></g>
          <g data-ing="yolk" clipPath="url(#bb-yolk)"><path data-fill="yolk" d={zigzag(384, 222, 32, 30, 7)} stroke="#f59a23" strokeWidth="11" /></g>
          <g data-ing="gochu" clipPath="url(#bb-gochu)"><path data-fill="gochu" d={zigzag(384, 270, 36, 28, 7)} stroke="#e8483a" strokeWidth="11" /></g>
        </g>

        {/* 混ざったあと（最初は透明） */}
        <g data-mixed opacity="0" filter="url(#crayon-fill)">
          <ellipse cx="400" cy="250" rx="190" ry="44" fill="#d98b3a" opacity=".85" />
          {[
            [300, 240, "#5bb450"], [350, 262, "#ffd23f"], [420, 236, "#f59a23"], [470, 262, "#a8774f"],
            [380, 246, "#e8483a"], [330, 232, "#f59a23"], [450, 250, "#5bb450"], [400, 270, "#ffd23f"],
            [360, 238, "#fff"], [500, 240, "#f59a23"], [280, 258, "#a8774f"],
          ].map(([x, y, c], k) => (
            <circle key={k} cx={x as number} cy={y as number} r={9 + (k % 3) * 2} fill={c as string} />
          ))}
          <circle cx="400" cy="246" r="18" fill="#ffd23f" />
        </g>

        {/* 輪郭線（クレヨン） */}
        <g filter="url(#crayon)" fill="none" stroke="#3b2f2a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
          <path data-line="rim" d={RIM} />
          <path data-line="body" d={BODY} />
          <path data-line="foot" d={FOOT} />
          <path data-line="rice" d={RICE} strokeWidth="3" opacity=".6" />
          {INGREDIENTS.map((i) => (
            <path key={i.id} data-ing={i.id} data-line={i.id} d={i.d} strokeWidth="4" />
          ))}
          <path data-ing="egg" data-line="egg" d={EGG} strokeWidth="4" />
          <path data-ing="yolk" data-line="yolk" d={YOLK} strokeWidth="3.5" />
          <path data-ing="gochu" data-line="gochu" d={GOCHUJANG} strokeWidth="3.5" />
          <path data-line="spiral" d={spiralPath(400, 252, 205, 50, 2.6)} stroke="#e8483a" strokeWidth="6" />
          {STEAM.map((d, i) => (
            <path key={i} data-line="steam" d={d} stroke="#3a8fd9" strokeWidth="4.5" />
          ))}
        </g>

        {/* 手書きラベルと引き出し線 */}
        <g fill="none" stroke="#3b2f2a" strokeWidth="2.5" strokeLinecap="round" opacity=".75">
          {INGREDIENTS.map((i) => (
            <path key={i.id} data-leader d={i.leader} />
          ))}
          <path data-leader d="M402 214 C402 180 402 160 402 140" />
          <path data-leader d="M418 292 C470 330 540 380 590 408" />
        </g>
        <g fontSize="32" fill="#3b2f2a" style={{ fontFamily: "var(--font-hand)" }}>
          {INGREDIENTS.map((i) => (
            <text key={i.id} data-label x={i.lx} y={i.ly} textAnchor={i.anchor}>{i.label}</text>
          ))}
          <text data-label x="402" y="128" textAnchor="middle">たまご</text>
          <text data-label x="586" y="440" textAnchor="start">コチュジャン</text>
        </g>
        <text data-finale x="528" y="530" textAnchor="start" fontSize="34" fill="#e8483a" style={{ fontFamily: "var(--font-pen)" }}>
          <tspan x="528" dy="0">ぜんぶ混ぜて、</tspan>
          <tspan x="528" dy="44">いただきます！</tspan>
        </text>

        <Crayon />
      </svg>
    </div>
  );
}

export const buildBibimbap: PageBuilder = (tl, root, at) => {
  const q = (s: string) => root.querySelectorAll(s);
  const crayon = root.querySelector("[data-crayon]");
  const ing = q("[data-ing]");
  let t = at;

  // 見出し
  tl.fromTo(q("[data-head] > *"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, stagger: 0.12, duration: 0.5 }, t);
  t += 0.6;

  // 器の輪郭 → 色塗り
  t = drawStroke(tl, q('[data-line="rim"]'), t, 1.1, { crayon, color: "#3b2f2a", ease: "crayon" });
  t = drawStroke(tl, q('[data-line="body"]'), t, 1.0, { crayon, ease: "crayon" });
  t = drawStroke(tl, q('[data-line="foot"]'), t, 0.6, { crayon });
  t = drawStroke(tl, q('[data-fill="body"]'), t, 1.4, { crayon, color: "#7a4a2b" });
  t = drawStroke(tl, q('[data-line="rice"]'), t, 0.6, { crayon, color: "#3b2f2a" });
  t = drawStroke(tl, q('[data-fill="rice"]'), t, 0.9, { crayon, color: "#e9cf87" });

  // 具材を1つずつ：輪郭 → 色 → ラベル
  const order: [string, string][] = [
    ["spinach", "#5bb450"],
    ["carrot", "#f59a23"],
    ["sprouts", "#ffd23f"],
    ["mushroom", "#a8774f"],
  ];
  const labels = q("[data-label]");
  const leaders = q("[data-leader]");
  order.forEach(([id, color], i) => {
    t = drawStroke(tl, q(`[data-line="${id}"]`), t, 0.4, { crayon, color: "#3b2f2a" });
    t = drawStroke(tl, q(`[data-fill="${id}"]`), t, 0.55, { crayon, color });
    drawStroke(tl, leaders[i], t - 0.3, 0.35);
    popIn(tl, labels[i], t, 0);
  });

  // たまご・黄身・コチュジャン
  t = drawStroke(tl, q('[data-line="egg"]'), t, 0.4, { crayon, color: "#3b2f2a" });
  t = drawStroke(tl, q('[data-fill="egg"]'), t, 0.4, { crayon, color: "#cfcfcf" });
  t = drawStroke(tl, q('[data-line="yolk"]'), t, 0.25, { crayon, color: "#3b2f2a" });
  t = drawStroke(tl, q('[data-fill="yolk"]'), t, 0.3, { crayon, color: "#f59a23" });
  drawStroke(tl, leaders[4], t - 0.2, 0.3);
  popIn(tl, labels[4], t, 0);
  t = drawStroke(tl, q('[data-line="gochu"]'), t, 0.25, { crayon, color: "#3b2f2a" });
  t = drawStroke(tl, q('[data-fill="gochu"]'), t, 0.3, { crayon, color: "#e8483a" });
  drawStroke(tl, leaders[5], t - 0.2, 0.3);
  popIn(tl, labels[5], t, 0);
  t += 0.8;

  // 混ぜる：赤い渦 → 具材がくるくる回って混ざる
  tl.to([...labels, ...leaders], { autoAlpha: 0, duration: 0.4 }, t);
  t = drawStroke(tl, q('[data-line="spiral"]'), t + 0.2, 1.6, { crayon, color: "#e8483a", ease: "power1.inOut" });
  tl.to(
    ing,
    {
      rotation: 540,
      scale: 0.78,
      svgOrigin: "400 250",
      duration: 1.8,
      ease: "power2.inOut",
    },
    t - 1.0,
  );
  tl.to(ing, { autoAlpha: 0, duration: 0.5, ease: "none" }, t + 0.5);
  tl.to(q("[data-mixed]"), { opacity: 1, duration: 0.6, ease: "none" }, t + 0.3);
  tl.to(q('[data-line="spiral"]'), { autoAlpha: 0, duration: 0.5 }, t + 0.8);
  hideCrayon(tl, crayon, t + 0.9);
  t += 1.1;

  // 湯気 → 仕上げの一言
  t = drawStroke(tl, q('[data-line="steam"]'), t, 1.0, { ease: "power1.out" });
  tl.fromTo(
    q("[data-finale]"),
    { autoAlpha: 0, y: 20, scale: 0.8, svgOrigin: "600 550" },
    { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(2)" },
    t - 0.4,
  );
  tl.to(q('[data-line="steam"]'), { y: -14, duration: 1.2, ease: "sine.inOut" }, t - 0.6);
  t += 0.9;

  // 初期状態が隠れていることを保証
  gsap.set(q("[data-label], [data-leader], [data-finale]"), { autoAlpha: 0 });
  return t;
};
