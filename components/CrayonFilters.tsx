// クレヨンの線のガタつき + 粒状のかすれを作る SVG フィルタ群（全ページ共通）
export default function CrayonFilters() {
  return (
    <svg width="0" height="0" className="pointer-events-none absolute" aria-hidden>
      <defs>
        <filter id="crayon" filterUnits="userSpaceOnUse" x="-20" y="-20" width="840" height="640">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="3" result="warp" />
          <feDisplacementMap in="SourceGraphic" in2="warp" scale="5" xChannelSelector="R" yChannelSelector="G" result="wobble" />
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="8" result="grain" />
          <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3 2.25" result="grainAlpha" />
          <feComposite in="wobble" in2="grainAlpha" operator="in" />
        </filter>
        {/* 太い塗りつぶし用：かすれ強め */}
        <filter id="crayon-fill" filterUnits="userSpaceOnUse" x="-20" y="-20" width="840" height="640">
          <feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves="2" seed="11" result="warp" />
          <feDisplacementMap in="SourceGraphic" in2="warp" scale="7" xChannelSelector="R" yChannelSelector="G" result="wobble" />
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" seed="21" result="grain" />
          <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3.4 2.3" result="grainAlpha" />
          <feComposite in="wobble" in2="grainAlpha" operator="in" />
        </filter>
        {/* HTML 見出し用 */}
        <filter id="crayon-text" x="-5%" y="-10%" width="110%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="5" result="warp" />
          <feDisplacementMap in="SourceGraphic" in2="warp" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}
