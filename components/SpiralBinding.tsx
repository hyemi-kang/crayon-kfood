// スケッチブック上部のリング綴じ。ページがめくれてもこの前面に残る
export default function SpiralBinding() {
  return (
    <div className="pointer-events-none absolute inset-x-0 -top-[14px] z-50 flex justify-around px-[3%]" aria-hidden>
      {Array.from({ length: 26 }, (_, i) => (
        <span key={i} className={`relative block h-[30px] w-[13px] ${i % 2 ? "hidden sm:block" : ""}`}>
          {/* 紙に空いた穴 */}
          <i className="absolute left-1/2 top-[20px] h-[9px] w-[9px] -translate-x-1/2 rounded-full bg-black/45 shadow-[inset_0_1px_2px_rgba(0,0,0,.6)]" />
          {/* 金属のリング */}
          <i className="absolute inset-x-0 top-0 h-full rounded-full border-[3px] border-zinc-300 shadow-[0_2px_3px_rgba(0,0,0,.5),inset_0_0_0_1px_rgba(0,0,0,.3)]" />
        </span>
      ))}
    </div>
  );
}
