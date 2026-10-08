"use client";

import { useCallback, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis";
import CrayonFilters from "@/components/CrayonFilters";
import SpiralBinding from "@/components/SpiralBinding";
import PageTabs from "@/components/PageTabs";
import CrayonCursor from "@/components/CrayonCursor";
import Loader from "@/components/Loader";
import CoverPage, { buildCover, initCover, playCoverIntro } from "@/components/pages/CoverPage";
import BibimbapPage, { buildBibimbap } from "@/components/pages/BibimbapPage";
import TteokbokkiPage, { buildTteokbokki } from "@/components/pages/TteokbokkiPage";
import SamgyeopsalPage, { buildSamgyeopsal } from "@/components/pages/SamgyeopsalPage";
import DrawPage, { buildDraw } from "@/components/pages/DrawPage";
import ContactPage, { buildContact } from "@/components/pages/ContactPage";

const PX_PER_UNIT = 110; // タイムライン1単位あたりのスクロール距離(px)
const FLIP_DUR = 1.8;

const PAGES = [
  { key: "cover", tab: "表紙", color: "#c9a26b", Comp: CoverPage },
  { key: "bibimbap", tab: "ビビンバ", color: "#f59a23", Comp: BibimbapPage },
  { key: "tteokbokki", tab: "トッポッキ", color: "#e8483a", Comp: TteokbokkiPage },
  { key: "samgyeopsal", tab: "サムギョプサル", color: "#f4a6a0", Comp: SamgyeopsalPage },
  { key: "draw", tab: "おえかき診断", color: "#ffd23f", Comp: DrawPage },
  { key: "contact", tab: "ご連絡", color: "#3a8fd9", Comp: ContactPage },
];

/** 上綴じなので、ページは上辺を軸にして奥へめくれる */
function flip(tl: gsap.core.Timeline, page: HTMLElement, next: HTMLElement, at: number) {
  tl.to(page, { rotateX: -118, duration: FLIP_DUR, ease: "power2.in", transformOrigin: "50% 0%" }, at);
  tl.fromTo(page.querySelector("[data-shade]"), { opacity: 0 }, { opacity: 1, duration: FLIP_DUR, ease: "none" }, at);
  tl.fromTo(next.querySelector("[data-cast]"), { opacity: 1 }, { opacity: 0, duration: FLIP_DUR, ease: "power1.out" }, at);
  tl.to(page, { autoAlpha: 0, duration: 0.01 }, at + FLIP_DUR);
  return at + FLIP_DUR;
}

export default function Sketchbook() {
  const wrap = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const labelTimes = useRef<number[]>([]);
  const targetTimes = useRef<number[]>([]); // 付箋タブで飛ぶときの着地点
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(0);

  const root = (key: string) => wrap.current!.querySelector(`[data-page="${key}"]`) as HTMLElement;
  const flipEl = (i: number) => wrap.current!.querySelector(`[data-flip="${i}"]`) as HTMLElement;

  // ---- スクロール連動のマスタータイムライン ----
  useGSAP(
    () => {
      initCover(root("cover"));

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: wrap.current,
          start: "top top",
          end: () => `+=${Math.round(tl.duration() * PX_PER_UNIT)}`,
          pin: stage.current,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: () => {
            const time = tl.time();
            let idx = 0;
            labelTimes.current.forEach((lt, i) => {
              if (time >= lt - 0.01) idx = i;
            });
            setActive((prev) => (prev === idx ? prev : idx));
          },
        },
      });
      tlRef.current = tl;

      const labels: number[] = [0];
      let t = buildCover(tl, root("cover"), 0);
      t = flip(tl, flipEl(0), flipEl(1), t + 0.2);
      labels.push(t);

      t = buildBibimbap(tl, root("bibimbap"), t + 0.1);
      t = flip(tl, flipEl(1), flipEl(2), t + 0.3);
      labels.push(t);

      t = buildTteokbokki(tl, root("tteokbokki"), t + 0.1);
      t = flip(tl, flipEl(2), flipEl(3), t + 0.3);
      labels.push(t);

      t = buildSamgyeopsal(tl, root("samgyeopsal"), t + 0.1);
      t = flip(tl, flipEl(3), flipEl(4), t + 0.3);
      labels.push(t);

      const drawEnd = buildDraw(tl, root("draw"), t + 0.1);
      t = flip(tl, flipEl(4), flipEl(5), drawEnd + 0.3);
      labels.push(t);

      const contactEnd = buildContact(tl, root("contact"), t + 0.1);
      t = contactEnd;
      tl.to({}, { duration: 0.6 }, t); // 最後に少し余白

      labelTimes.current = labels;
      // 絵を描く・フォームに書くページは、中身が出そろった位置に着地させる
      targetTimes.current = labels.map((l, i) => (i === 4 ? drawEnd - 0.4 : i === 5 ? contactEnd - 0.4 : l + (i === 0 ? 0 : 0.2)));
      PAGES.forEach((p, i) => tl.addLabel(p.key, labels[i]));
    },
    { scope: wrap },
  );

  // ---- ローダー終了後に表紙のイントロを再生 ----
  useGSAP(
    () => {
      if (!ready) return;
      playCoverIntro(root("cover"));
      ScrollTrigger.refresh();
    },
    { scope: wrap, dependencies: [ready] },
  );

  // ---- 付箋タブ → 該当ページへスクロール ----
  const go = useCallback((i: number) => {
    const tl = tlRef.current;
    const st = tl?.scrollTrigger;
    if (!tl || !st) return;
    const time = targetTimes.current[i];
    const y = st.start + (time / tl.duration()) * (st.end - st.start);
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { duration: 2.2 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  }, []);

  return (
    <div ref={wrap} className="relative">
      <CrayonFilters />
      <CrayonCursor />
      <Loader onDone={() => setReady(true)} />

      <div ref={stage} className="relative h-[100svh] w-full overflow-hidden bg-[#2b2320]">
        {/* 木の机っぽい背景 */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "repeating-linear-gradient(92deg, rgba(0,0,0,.18) 0 2px, transparent 2px 38px), radial-gradient(ellipse at 50% 40%, #4a3a30 0%, #231a16 80%)",
          }}
        />

        <div className="absolute inset-0 flex items-center justify-center px-[3vw] pb-[3vh] pt-[5vh]">
          <div className="relative h-full w-full max-w-[1500px]" style={{ perspective: 2400 }}>
            {PAGES.map(({ key, Comp }, i) => (
              <div
                key={key}
                data-flip={i}
                className="absolute inset-0 rounded-md shadow-[0_12px_40px_rgba(0,0,0,.55)]"
                style={{ zIndex: PAGES.length - i, transformStyle: "preserve-3d" }}
              >
                {/* 表面 */}
                <div className="backface-hidden absolute inset-0 overflow-hidden rounded-md">
                  <Comp />
                  {/* めくれ始めの影 / 下のページに落ちる影 */}
                  <div data-shade className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/55 opacity-0" />
                  <div data-cast className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-transparent" style={{ opacity: i === 0 ? 0 : 1 }} />
                </div>
                {/* 裏面（めくれた時に見える） */}
                <div
                  className="backface-hidden paper absolute inset-0 rounded-md"
                  style={{
                    transform: "rotateX(180deg)",
                    backgroundImage: "repeating-linear-gradient(0deg, transparent 0 31px, rgba(90,120,170,.18) 31px 32px)",
                  }}
                />
              </div>
            ))}
            <SpiralBinding />
          </div>
        </div>

        <PageTabs tabs={PAGES.map((p) => ({ key: p.key, label: p.tab, color: p.color }))} active={active} onSelect={go} />
      </div>
    </div>
  );
}
