"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

let registered = false;

export function registerGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(
    useGSAP,
    ScrollTrigger,
    DrawSVGPlugin,
    MorphSVGPlugin,
    MotionPathPlugin,
    SplitText,
    CustomEase,
  );
  CustomEase.create("crayon", "M0,0 C0.2,0 0.3,0.6 0.5,0.75 0.7,0.9 0.85,1 1,1");
  registered = true;
}

registerGsap();

export { gsap, ScrollTrigger, SplitText, CustomEase, useGSAP };
