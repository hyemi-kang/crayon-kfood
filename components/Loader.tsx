"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { spiralPath } from "@/lib/crayon";

// 白紙にクレヨンでぐるぐる落書き → 0〜100% → 紙が上にめくれて表紙が現れる
export default function Loader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const [gone, setGone] = useState(false);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        setGone(true);
        onDone();
        return;
      }
      document.documentElement.style.overflow = "hidden";

      const scribble = root.current!.querySelector("[data-scribble]");
      gsap.fromTo(
        scribble,
        { drawSVG: "0% 0%" },
        { drawSVG: "0% 100%", duration: 1.2, repeat: -1, ease: "power1.inOut", repeatDelay: 0.1 },
      );
      gsap.to(root.current!.querySelector("[data-pencil]"), {
        rotation: 8,
        yoyo: true,
        repeat: -1,
        duration: 0.35,
        ease: "sine.inOut",
        transformOrigin: "50% 100%",
      });

      const counter = { v: 0 };
      gsap.to(counter, {
        v: 100,
        duration: 2.2,
        ease: "power2.inOut",
        onUpdate: () => {
          if (num.current) num.current.textContent = String(Math.round(counter.v));
        },
      });

      let cancelled = false;
      Promise.all([document.fonts.ready, new Promise((r) => setTimeout(r, 2400))]).then(() => {
        if (cancelled || !root.current) return;
        gsap
          .timeline({
            onComplete: () => {
              document.documentElement.style.overflow = "";
              setGone(true);
              onDone();
            },
          })
          .to(root.current.querySelectorAll("[data-fade]"), { autoAlpha: 0, y: -20, duration: 0.4, stagger: 0.05 })
          .to(root.current, { yPercent: -105, rotation: -2, duration: 1.0, ease: "power4.inOut" }, "-=0.1");
      });

      return () => {
        cancelled = true;
        document.documentElement.style.overflow = "";
      };
    },
    { scope: root },
  );

  if (gone) return null;

  return (
    <div ref={root} className="paper fixed inset-0 z-[90] flex flex-col items-center justify-center gap-4 text-ink shadow-[0_20px_60px_rgba(0,0,0,.5)]">
      <div data-fade className="relative h-[min(46vw,220px)] w-[min(46vw,220px)]">
        <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden>
          <g filter="url(#crayon)">
            <path data-scribble d={spiralPath(100, 100, 82, 82, 3.2, 120)} fill="none" stroke="#e8483a" strokeWidth="7" strokeLinecap="round" />
          </g>
        </svg>
        <svg data-pencil viewBox="0 0 40 60" className="absolute -right-4 -top-2 h-[34%]" aria-hidden>
          <g transform="translate(14 56) rotate(24)">
            <polygon points="0,0 -6,-10 6,-10" fill="#3b2f2a" />
            <rect x="-6" y="-46" width="12" height="36" rx="2" fill="#e8483a" stroke="#3b2f2a" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
      <p data-fade className="font-pen text-[clamp(1.4rem,4vw,2.4rem)]">
        ごはんを描いています…
      </p>
      <p data-fade className="font-pen text-[clamp(2rem,6vw,3.6rem)] text-crayon-red">
        <span ref={num}>0</span>%
      </p>
    </div>
  );
}
