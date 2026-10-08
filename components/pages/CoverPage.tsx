import { gsap, SplitText } from "@/lib/gsap";
import type { PageBuilder } from "@/lib/crayon";

const Taegeuk = () => (
  <svg viewBox="-80 -80 160 160" className="h-full w-full" aria-hidden>
    <circle r="46" fill="#fbf6ea" stroke="#3b2f2a" strokeWidth="3" />
    <path d="M-40 0 A40 40 0 0 1 40 0 A20 20 0 0 1 0 0 A20 20 0 0 0 -40 0Z" fill="#e8483a" />
    <path d="M40 0 A40 40 0 0 1 -40 0 A20 20 0 0 1 0 0 A20 20 0 0 0 40 0Z" fill="#3a8fd9" />
    {[45, 135, 225, 315].map((a) => (
      <g key={a} transform={`rotate(${a}) translate(0,-64)`} fill="#3b2f2a">
        {[0, 8, 16].map((y) => (
          <rect key={y} x="-14" y={y - 8} width="28" height="4.5" rx="2" />
        ))}
      </g>
    ))}
  </svg>
);

const Chili = () => (
  <svg viewBox="-20 -20 120 140" className="h-full w-full" aria-hidden>
    <path
      d="M10 10 C40 -4 78 20 76 58 C74 88 50 108 14 112 C34 96 40 74 34 56 C28 40 20 26 10 10 Z"
      fill="#e8483a"
      stroke="#3b2f2a"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />
    <path
      d="M10 10 C4 0 6 -10 16 -16 C14 -6 22 -2 24 6"
      fill="#5bb450"
      stroke="#3b2f2a"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <path d="M44 34 C58 40 62 56 56 70" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const Bowl = () => (
  <svg viewBox="0 0 200 160" className="h-full w-full" aria-hidden>
    <path d="M20 90 Q100 150 180 90 Z" fill="#fbf6ea" stroke="#3b2f2a" strokeWidth="3.5" strokeLinejoin="round" />
    <path d="M30 96 Q100 134 170 96" fill="none" stroke="#3a8fd9" strokeWidth="5" strokeLinecap="round" />
    <ellipse cx="100" cy="90" rx="80" ry="12" fill="#fff" stroke="#3b2f2a" strokeWidth="3.5" />
    <g fill="#fbf6ea" stroke="#3b2f2a" strokeWidth="2.5">
      {[70, 90, 110, 128].map((x, i) => (
        <ellipse key={x} cx={x} cy={86 + (i % 2) * 3} rx="9" ry="5" transform={`rotate(${i * 25} ${x} 88)`} />
      ))}
    </g>
    <rect x="96" y="8" width="8" height="82" rx="3" fill="#7a4a2b" stroke="#3b2f2a" strokeWidth="2.5" transform="rotate(24 100 90)" />
    <rect x="96" y="8" width="8" height="82" rx="3" fill="#a8774f" stroke="#3b2f2a" strokeWidth="2.5" transform="rotate(38 100 90)" />
  </svg>
);

const Star = () => (
  <svg viewBox="-20 -20 40 40" className="h-full w-full" aria-hidden>
    <path
      d="M0 -16 L4 -5 L16 -4 L7 4 L10 16 L0 9 L-10 16 L-7 4 L-16 -4 L-4 -5 Z"
      fill="#ffd23f"
      stroke="#3b2f2a"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

export default function CoverPage() {
  return (
    <div data-page="cover" className="kraft absolute inset-0 overflow-hidden rounded-md">
      {/* ステッチ風の点線 */}
      <div className="pointer-events-none absolute inset-[2.5%] rounded border-2 border-dashed border-kraft-dark/70" />

      {/* ステッカー（スクロールでパララックス） */}
      <div data-sticker data-depth="1.4" className="absolute left-[7%] top-[14%] h-[17vmin] w-[17vmin] min-h-16 min-w-16">
        <div data-float className="h-full w-full -rotate-12 drop-shadow-[3px_4px_0_rgba(0,0,0,.18)]">
          <Taegeuk />
        </div>
      </div>
      <div data-sticker data-depth="2" className="absolute right-[8%] top-[12%] h-[17vmin] w-[14vmin] min-h-14 min-w-12">
        <div data-float className="h-full w-full rotate-[18deg] drop-shadow-[3px_4px_0_rgba(0,0,0,.18)]">
          <Chili />
        </div>
      </div>
      <div data-sticker data-depth="1.1" className="absolute bottom-[10%] left-[8%] h-[16vmin] w-[20vmin] min-h-14 min-w-16">
        <div data-float className="h-full w-full -rotate-6 drop-shadow-[3px_4px_0_rgba(0,0,0,.18)]">
          <Bowl />
        </div>
      </div>
      <div data-sticker data-depth="2.4" className="absolute bottom-[16%] right-[12%] h-[7vmin] w-[7vmin] min-h-8 min-w-8">
        <div data-float className="h-full w-full">
          <Star />
        </div>
      </div>
      <div data-sticker data-depth="1.7" className="absolute right-[26%] top-[24%] h-[4.5vmin] w-[4.5vmin] min-h-5 min-w-5">
        <div data-float className="h-full w-full">
          <Star />
        </div>
      </div>
      <div data-sticker data-depth="2.8" className="absolute bottom-[22%] left-[24%] h-[5vmin] w-[5vmin] min-h-6 min-w-6">
        <div data-float className="h-full w-full">
          <Star />
        </div>
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <p data-cover-kicker className="font-pen text-[clamp(.8rem,2vw,1.5rem)] tracking-[.35em] text-ink/70">
          KOREAN FOOD SKETCHBOOK
        </p>
        <h1
          data-cover-title
          className="font-pen mt-3 text-[clamp(2.8rem,11vw,9rem)] leading-[1.08] text-paper text-crayon [text-shadow:3px_4px_0_rgba(59,47,42,.55)]"
        >
          韓国ごはん
          <br />
          スケッチブック
        </h1>
        <div
          data-cover-label
          className="mt-6 rounded-sm bg-paper px-6 py-2 text-[clamp(.95rem,2.2vw,1.7rem)] text-ink shadow-[3px_4px_0_rgba(59,47,42,.35)]"
        >
          <span className="font-hangul text-crayon-red">한식</span> ・ ひらいて、ごはん。
        </div>
      </div>

      <div
        data-scroll-hint
        className="absolute bottom-[5%] left-0 right-0 text-center text-[clamp(.85rem,1.8vw,1.3rem)] text-ink/80"
      >
        <span className="inline-block animate-bounce">スクロールして ページをめくる ↓</span>
      </div>
    </div>
  );
}

/** 表紙の初期状態（イントロ再生前は隠す） */
export function initCover(root: HTMLElement) {
  gsap.set(root.querySelector("[data-cover-title]"), { autoAlpha: 0 });
  gsap.set(root.querySelector("[data-cover-kicker]"), { autoAlpha: 0 });
  gsap.set(root.querySelector("[data-cover-label]"), { autoAlpha: 0, y: 20, rotate: -8 });
  gsap.set(root.querySelectorAll("[data-sticker]"), { autoAlpha: 0, scale: 0.2, rotate: -40 });
  gsap.set(root.querySelector("[data-scroll-hint]"), { autoAlpha: 0 });
}

/** ローダー後に時間で再生する表紙のイントロ */
export function playCoverIntro(root: HTMLElement) {
  const title = root.querySelector("[data-cover-title]") as HTMLElement;
  const kicker = root.querySelector("[data-cover-kicker]");
  const label = root.querySelector("[data-cover-label]");
  const stickers = root.querySelectorAll("[data-sticker]");
  const hint = root.querySelector("[data-scroll-hint]");

  const split = SplitText.create(title, { type: "chars" });
  gsap.set(title, { autoAlpha: 1 });

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.to(kicker, { autoAlpha: 1, duration: 0.8 }, 0)
    .from(
      split.chars,
      {
        yPercent: 130,
        rotate: () => gsap.utils.random(-30, 30),
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.06,
        ease: "back.out(2.2)",
      },
      0.1,
    )
    .to(label, { autoAlpha: 1, y: 0, rotate: -2, duration: 0.6, ease: "back.out(2)" }, 0.9)
    .to(
      stickers,
      { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.9, stagger: 0.1, ease: "elastic.out(1, 0.55)" },
      0.5,
    )
    .to(hint, { autoAlpha: 1, duration: 0.6 }, 1.6);

  // 付箋のふわふわ（ずっと）
  root.querySelectorAll("[data-float]").forEach((el, i) => {
    gsap.to(el, {
      y: gsap.utils.random(-10, 10),
      duration: gsap.utils.random(1.6, 2.6),
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      delay: i * 0.15,
    });
  });
  return tl;
}

/** 表紙 → 1ページ目に向かうスクロール区間 */
export const buildCover: PageBuilder = (tl, root, at) => {
  root.querySelectorAll("[data-sticker]").forEach((s) => {
    const depth = Number((s as HTMLElement).dataset.depth || 1);
    tl.to(s, { yPercent: -60 * depth, rotate: 25 * depth, duration: 2.4, ease: "none" }, at);
  });
  tl.to(root.querySelector("[data-cover-title]"), { y: -50, duration: 2.4, ease: "none" }, at);
  tl.to(root.querySelector("[data-scroll-hint]"), { autoAlpha: 0, duration: 0.5 }, at);
  return at + 2.4;
};
