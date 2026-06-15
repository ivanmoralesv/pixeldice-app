import { useEffect, useRef } from "react";
// FoilCard — Omertà's "portada" as an elegant 3D object: a card with real
// thickness (front + back + four extruded edge faces) that tilts very gently
// toward the cursor and drifts on its own. A refined tilt, a soft directional
// sheen and a grounding shadow. Ported from the pixeldice-studio landing.
//
// Driven by a rAF lerp loop through refs, so React never re-renders on move.

const BG = "/assets/omerta-bg@2x.png";
const LOGO = "/assets/omerta-logo@2x.png";

export function FoilCard({
  width = 300,
  parallax = 0.4,     // 0..1 → tilt amount (kept gentle)
  motion = "auto",    // "auto" (drifts on its own) | "drift" | "hover"
  depth = 16,         // card thickness in px
  foil = 0.18,        // subtle directional sheen (0 = none)
  href,
  reduced = false,
  style = {},
}) {
  const wrapRef = useRef(null);
  const cardRef = useRef(null);
  const logoRef = useRef(null);
  const sheenRef = useRef(null);
  const shadowRef = useRef(null);
  const stateRef = useRef({ tx: 0, ty: 0, cx: 0, cy: 0, hover: 0, hoverT: 0 });
  const interactionRef = useRef({ suppressClick: false });

  useEffect(() => {
    const M = ({
      auto:  { amp: 0.5, tiltMul: 1.0, speed: 1.0 },
      drift: { amp: 0.7, tiltMul: 0.8, speed: 0.8 },
      hover: { amp: 0.0, tiltMul: 1.0, speed: 1.0 },
    })[motion] || { amp: 0.5, tiltMul: 1.0, speed: 1.0 };
    const maxTilt = (2.5 + parallax * 7) * M.tiltMul;   // very gentle

    let raf, t0 = performance.now();
    const lerp = (a, b, n) => a + (b - a) * n;

    const tick = (now) => {
      const s = stateRef.current;
      const t = (now - t0) / 1000;
      let autoX = 0, autoY = 0;
      if (!reduced && M.amp > 0) {
        const sp = M.speed;
        autoX = (Math.sin(t * 0.4 * sp) + 0.4 * Math.sin(t * 0.24 * sp + 1.3)) * M.amp;
        autoY = (Math.cos(t * 0.33 * sp) + 0.4 * Math.cos(t * 0.19 * sp + 0.7)) * M.amp;
      }
      const goalX = reduced ? 0 : (s.tx * s.hoverT + autoX * (1 - s.hoverT));
      const goalY = reduced ? 0 : (s.ty * s.hoverT + autoY * (1 - s.hoverT));
      s.cx = lerp(s.cx, goalX, 0.07);
      s.cy = lerp(s.cy, goalY, 0.07);
      s.hoverT = lerp(s.hoverT, s.hover, 0.06);

      const rx = (-s.cy) * maxTilt;
      const ry = (s.cx) * maxTilt;
      if (cardRef.current) cardRef.current.style.transform = `rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg)`;

      const pfc = Math.min(1, Math.hypot(s.cx, s.cy));
      // very light parallax on the badge (floats opposite the tilt)
      if (logoRef.current) {
        logoRef.current.style.transform = `translate(${(s.cx * 3.5).toFixed(2)}px, ${(s.cy * 3).toFixed(2)}px)`;
      }
      // soft directional sheen — light reads as coming from the upper-left
      if (sheenRef.current) {
        const lx = 50 - s.cx * 38, ly = 36 - s.cy * 32;
        sheenRef.current.style.background =
          `radial-gradient(70% 80% at ${lx}% ${ly}%, rgba(255,250,240,${(0.16 * foil + 0.10 * foil * pfc).toFixed(3)}) 0%, rgba(255,250,240,0) 60%)`;
      }
      // grounding shadow shifts opposite the tilt
      if (shadowRef.current) {
        shadowRef.current.style.transform =
          `translate(-50%, 0) translate(${(s.cx * 14).toFixed(1)}px, ${(8 - s.cy * 8).toFixed(1)}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const wrap = wrapRef.current;
    const touch = { active: false, pointerId: null, startX: 0, startY: 0, moved: false };

    const updateFromPointer = (e) => {
      const r = wrap.getBoundingClientRect();
      const s = stateRef.current;
      s.tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      s.ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
      s.hover = 1;
    };
    const onMove = (e) => {
      if (e.pointerType === "touch" && (!touch.active || e.pointerId !== touch.pointerId)) return;
      if (e.pointerType === "touch") {
        e.preventDefault();
        const dx = e.clientX - touch.startX;
        const dy = e.clientY - touch.startY;
        if (Math.hypot(dx, dy) > 8) touch.moved = true;
      }
      updateFromPointer(e);
    };
    const onDown = (e) => {
      if (e.pointerType !== "touch") return;
      e.preventDefault();
      touch.active = true;
      touch.pointerId = e.pointerId;
      touch.startX = e.clientX;
      touch.startY = e.clientY;
      touch.moved = false;
      interactionRef.current.suppressClick = false;
      try { wrap.setPointerCapture(e.pointerId); } catch (err) {}
      updateFromPointer(e);
    };
    const finishTouch = (e) => {
      if (e.pointerType !== "touch" || e.pointerId !== touch.pointerId) return;
      interactionRef.current.suppressClick = touch.moved;
      touch.active = false;
      touch.pointerId = null;
      const s = stateRef.current;
      s.tx = 0;
      s.ty = 0;
      s.hover = 0;
      try { wrap.releasePointerCapture(e.pointerId); } catch (err) {}
      window.setTimeout(() => { interactionRef.current.suppressClick = false; }, 180);
    };
    const onLeave = () => { const s = stateRef.current; s.tx = 0; s.ty = 0; s.hover = 0; };
    wrap.addEventListener("pointerdown", onDown, { passive: false });
    wrap.addEventListener("pointermove", onMove, { passive: false });
    wrap.addEventListener("pointerup", finishTouch);
    wrap.addEventListener("pointercancel", finishTouch);
    wrap.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      wrap.removeEventListener("pointerdown", onDown);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerup", finishTouch);
      wrap.removeEventListener("pointercancel", finishTouch);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, [motion, parallax, foil, depth, reduced]);

  const H = width * 1.42;
  const radius = 26;
  const hD = depth / 2;
  const coverLayer = { position: "absolute", inset: 0, borderRadius: radius, overflow: "hidden" };

  // edge-face styling (warm dark "paper" thickness with a faint sheen)
  const edgeV = "linear-gradient(to bottom, #0c0805, #2a2018 45%, #0c0805)"; // left/right
  const edgeH = "linear-gradient(to right, #0c0805, #2a2018 45%, #0c0805)";  // top/bottom
  const face = { position: "absolute", top: "50%", left: "50%", boxSizing: "border-box" };

  return (
    <div ref={wrapRef} onClick={() => {
      if (interactionRef.current.suppressClick) return;
      if (href) window.open(href, "_blank", "noopener");
    }} style={{ width, height: H, perspective: 1500, perspectiveOrigin: "50% 42%", flex: "0 0 auto", position: "relative", cursor: href ? "pointer" : "default", touchAction: "none", WebkitTapHighlightColor: "transparent", ...style }}>
      {/* grounding shadow (2D, behind the 3D card) */}
      <div ref={shadowRef} style={{
        position: "absolute", left: "50%", bottom: -20, width: width * 0.92, height: 38,
        background: "radial-gradient(50% 100% at 50% 50%, rgba(0,0,0,.2), rgba(0,0,0,0) 72%)",
        filter: "blur(18px)", borderRadius: "50%", pointerEvents: "none", zIndex: 0,
      }} />

      <div ref={cardRef} style={{
        position: "relative", width: "100%", height: "100%",
        transformStyle: "preserve-3d", willChange: "transform", zIndex: 1,
      }}>
        {/* back face */}
        <div style={{ ...face, width, height: H, marginLeft: -width / 2, marginTop: -H / 2,
          transform: `translateZ(${-hD}px) rotateY(180deg)`, background: "#0c0805", borderRadius: radius,
          boxShadow: "inset 0 0 0 1px rgba(212,184,120,.18)" }} />

        {/* edge faces — the thickness */}
        <div style={{ ...face, width: depth, height: H, marginLeft: -depth / 2, marginTop: -H / 2,
          transform: `rotateY(90deg) translateZ(${width / 2}px)`, background: edgeV }} />
        <div style={{ ...face, width: depth, height: H, marginLeft: -depth / 2, marginTop: -H / 2,
          transform: `rotateY(-90deg) translateZ(${width / 2}px)`, background: edgeV }} />
        <div style={{ ...face, width, height: depth, marginLeft: -width / 2, marginTop: -depth / 2,
          transform: `rotateX(90deg) translateZ(${H / 2}px)`, background: edgeH }} />
        <div style={{ ...face, width, height: depth, marginLeft: -width / 2, marginTop: -depth / 2,
          transform: `rotateX(-90deg) translateZ(${H / 2}px)`, background: edgeH }} />

        {/* front face — the cover */}
        <div style={{ ...face, width, height: H, marginLeft: -width / 2, marginTop: -H / 2,
          transform: `translateZ(${hD}px)`, borderRadius: radius,
          boxShadow: "0 1px 0 rgba(255,255,255,.06)" }}>
          {/* noir scene */}
          <div style={{ ...coverLayer, background: "#000000" }}>
            <img src={BG} alt="Omertà" draggable={false}
              style={{ position: "absolute", left: 0, bottom: -10, width: "100%", height: width * 1116 / 838, objectFit: "cover", objectPosition: "center top" }} />
            <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 60px 18px rgba(0,0,0,.6)", borderRadius: radius }} />
          </div>

          {/* badge — top-centred in the dark headroom, above the figure */}
          <div ref={logoRef} style={{
            position: "absolute", left: "50%", top: "16%", width: width * 0.48,
            marginLeft: -(width * 0.48) / 2, marginTop: -(width * 0.48 * 0.63) / 2,
            willChange: "transform", filter: "drop-shadow(0 6px 10px rgba(0,0,0,.55))",
          }}>
            <img src={LOGO} alt="" draggable={false} style={{ width: "100%", display: "block" }} />
          </div>

          {/* soft directional sheen */}
          <div ref={sheenRef} style={{ ...coverLayer, mixBlendMode: "screen", pointerEvents: "none" }} />
        </div>
      </div>
    </div>
  );
}
