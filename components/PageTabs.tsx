"use client";

type Tab = { key: string; label: string; color: string };

// 右端から飛び出すインデックス付箋。クリックでそのページへスクロール
export default function PageTabs({
  tabs,
  active,
  onSelect,
}: {
  tabs: Tab[];
  active: number;
  onSelect: (i: number) => void;
}) {
  return (
    <nav aria-label="ページ移動" className="fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2 md:flex">
      {tabs.map((t, i) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onSelect(i)}
          aria-current={i === active ? "page" : undefined}
          className="rounded-l-lg py-2 pl-3 pr-2 text-left text-sm text-ink shadow-[-2px_3px_0_rgba(0,0,0,.3)] transition-all duration-300 hover:-translate-x-1"
          style={{
            backgroundColor: t.color,
            transform: i === active ? "translateX(-10px)" : undefined,
            width: i === active ? 128 : 96,
            fontFamily: "var(--font-hand)",
          }}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
