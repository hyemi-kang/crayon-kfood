// 描画中の線の先端を追いかけるクレヨン。先端が (0,0) になるよう作ってある
export default function Crayon() {
  return (
    <g data-crayon style={{ opacity: 0, visibility: "hidden" }} pointerEvents="none">
      <g transform="rotate(38)">
        <polygon points="0,0 -8,-16 8,-16" fill="#3b2f2a" opacity="0.85" />
        <rect className="crayon-body" x="-8" y="-84" width="16" height="68" rx="2" fill="#e8483a" />
        <rect x="-8" y="-72" width="16" height="34" fill="#fbf6ea" opacity="0.92" />
        <rect x="-8" y="-66" width="16" height="3" fill="#3b2f2a" opacity="0.5" />
        <rect x="-8" y="-46" width="16" height="3" fill="#3b2f2a" opacity="0.5" />
        <rect x="-8" y="-84" width="16" height="4" rx="2" fill="#000" opacity="0.18" />
      </g>
    </g>
  );
}
