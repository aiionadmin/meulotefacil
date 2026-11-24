"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";

let registered = false;

export function registerGSAP() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(
    useGSAP,
    ScrollTrigger,
    Flip,
    SplitText,
    DrawSVGPlugin,
    MorphSVGPlugin
  );
  registered = true;
}

registerGSAP();

export {
  gsap,
  useGSAP,
  ScrollTrigger,
  Flip,
  SplitText,
  DrawSVGPlugin,
  MorphSVGPlugin,
};
