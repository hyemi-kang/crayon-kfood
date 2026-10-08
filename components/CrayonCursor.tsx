"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

// マウスに追従するミニクレヨン（タッチ端末では表示しない）
export default function CrayonCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine || !ref.current) return;
    document.documentElement.classList.add("has-crayon-cursor");

    const el = ref.current;
    gsap.set(el, { xPercent: -10, yPercent: -90, autoAlpha: 0 });
    const xTo = gsap.quickTo(el, "x", { duration: 0.18, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.18, ease: "power3" });
    const rTo = gsap.quickTo(el, "rotation", { duration: 0.4, ease: "power3" });
    let lastX = 0;

    const move = (e: MouseEvent) => {
      gsap.to(el, { autoAlpha: 1, duration: 0.2, overwrite: "auto" });
      xTo(e.clientX);
      yTo(e.clientY);
      rTo(gsap.utils.clamp(-25, 25, (e.clientX - lastX) * 1.2));
      lastX = e.clientX;
    };
    const down = () => gsap.to(el, { scale: 0.85, duration: 0.12 });
    const up = () => gsap.to(el, { scale: 1, duration: 0.5, ease: "elastic.out(1,.4)" });

    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    return () => {
      document.documentElement.classList.remove("has-crayon-cursor");
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
    };
  });

  return (
    <div ref={ref} className="pointer-events-none fixed left-0 top-0 z-[100]" aria-hidden>
      <svg width="34" height="46" viewBox="-6 -50 40 54">
        <g transform="rotate(30)">
          <polygon points="0,0 -6,-10 6,-10" fill="#3b2f2a" />
          <rect x="-6" y="-46" width="12" height="36" rx="2" fill="#e8483a" stroke="#3b2f2a" strokeWidth="1.5" />
          <rect x="-6" y="-40" width="12" height="16" fill="#fbf6ea" opacity=".9" />
        </g>
      </svg>
    </div>
  );
}
