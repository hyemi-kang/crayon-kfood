import { DISHES, PALETTE, type ColorKey, type Dish, type Taste } from "@/lib/dishes";

export type Features = {
  colors: Record<ColorKey, number>; // 描かれた部分の中での割合
  coverage: number; // キャンバス全体に対する塗りの割合
  aspect: number; // 描いた範囲の 幅/高さ
  fill: number; // 描いた範囲の中の詰まり具合
  elong: number; // 細長さ（0=丸い、1=すごく細長い）
};

export type Recommendation = {
  dish: Dish;
  score: number; // 0〜1
  percent: number;
  reasons: string[];
  parts: { color: number; shape: number; taste: number | null };
};

export type Analysis =
  | { ok: false; reason: string }
  | { ok: true; features: Features; results: Recommendation[] };

const W = 96;
const H = 72;

const colorLabel = (k: ColorKey) => PALETTE.find((p) => p.key === k)!.label;

/** キャンバスの絵を小さく縮めて、色の割合と形の特徴を数える */
export function extractFeatures(source: HTMLCanvasElement): Features | null {
  const tmp = document.createElement("canvas");
  tmp.width = W;
  tmp.height = H;
  const ctx = tmp.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(source, 0, 0, W, H);
  const { data } = ctx.getImageData(0, 0, W, H);

  const counts = Object.fromEntries(PALETTE.map((p) => [p.key, 0])) as Record<ColorKey, number>;
  let n = 0;
  let minX = W, maxX = -1, minY = H, maxY = -1;
  let sx = 0, sy = 0;
  const xs: number[] = [];
  const ys: number[] = [];

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (data[i + 3] < 60) continue; // ほぼ透明 = 何も描いていない
      // 一番近いクレヨン色に分類
      let best: ColorKey = "black";
      let bd = Infinity;
      for (const p of PALETTE) {
        const d = (data[i] - p.rgb[0]) ** 2 + (data[i + 1] - p.rgb[1]) ** 2 + (data[i + 2] - p.rgb[2]) ** 2;
        if (d < bd) {
          bd = d;
          best = p.key;
        }
      }
      counts[best]++;
      n++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      sx += x;
      sy += y;
      xs.push(x);
      ys.push(y);
    }
  }

  if (n < W * H * 0.012) return null; // 描きこみが少なすぎる

  const bw = maxX - minX + 1;
  const bh = maxY - minY + 1;
  // 共分散から「細長さ」を出す（固有値の比）
  const mx = sx / n;
  const my = sy / n;
  let cxx = 0, cyy = 0, cxy = 0;
  for (let k = 0; k < n; k++) {
    const dx = xs[k] - mx;
    const dy = ys[k] - my;
    cxx += dx * dx;
    cyy += dy * dy;
    cxy += dx * dy;
  }
  cxx /= n;
  cyy /= n;
  cxy /= n;
  const tr = cxx + cyy;
  const det = cxx * cyy - cxy * cxy;
  const disc = Math.sqrt(Math.max(0, (tr * tr) / 4 - det));
  const l1 = tr / 2 + disc;
  const l2 = Math.max(0.0001, tr / 2 - disc);
  const elong = Math.min(1, Math.max(0, 1 - Math.sqrt(l2 / l1)));

  const colors = Object.fromEntries(
    (Object.keys(counts) as ColorKey[]).map((k) => [k, counts[k] / n]),
  ) as Record<ColorKey, number>;

  return {
    colors,
    coverage: n / (W * H),
    aspect: bw / bh,
    fill: n / (bw * bh),
    elong,
  };
}

const gauss = (a: number, b: number, sigma: number) => Math.exp(-((a - b) ** 2) / (2 * sigma * sigma));

function colorScore(f: Features, d: Dish) {
  // コサイン類似度：色の「配合」がどれだけ似ているか
  let dot = 0, na = 0, nb = 0;
  for (const p of PALETTE) {
    const a = f.colors[p.key];
    const b = d.colors[p.key] ?? 0;
    dot += a * b;
    na += a * a;
    nb += b * b;
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

function shapeScore(f: Features, d: Dish) {
  const aspect = gauss(Math.log(f.aspect), Math.log(d.shape.aspect), 0.5);
  const fill = gauss(f.fill, d.shape.fill, 0.28);
  const elong = gauss(f.elong, d.shape.elong, 0.35);
  return aspect * 0.4 + fill * 0.3 + elong * 0.3;
}

function tasteScore(tastes: Taste[], d: Dish) {
  if (!tastes.length) return null;
  const sum = tastes.reduce((acc, t) => acc + (d.taste[t] ?? 0), 0);
  return sum / tastes.length;
}

/** 絵の特徴 + 選んだ味のキーワード → 近い料理を順位づけ */
export function recommend(source: HTMLCanvasElement, tastes: Taste[]): Analysis {
  const f = extractFeatures(source);
  if (!f) return { ok: false, reason: "まだ絵が少ないみたい。もう少し大きく描いてね！" };

  const results: Recommendation[] = DISHES.map((d) => {
    const c = colorScore(f, d);
    const s = shapeScore(f, d);
    const t = tasteScore(tastes, d);
    // 味を選んだときは味の比重を大きく、選ばないときは色と形で決める
    const score = t === null ? c * 0.68 + s * 0.32 : c * 0.4 + s * 0.2 + t * 0.4;

    const reasons: string[] = [];
    // 重なっている色（絵の割合 × 料理の割合）が大きい順
    const overlaps = PALETTE.map((p) => ({ k: p.key, v: Math.min(f.colors[p.key], d.colors[p.key] ?? 0) }))
      .filter((o) => o.v >= 0.06)
      .sort((a, b) => b.v - a.v)
      .slice(0, 2);
    if (overlaps.length) reasons.push(`${overlaps.map((o) => colorLabel(o.k)).join("と")}の色づかいがそっくり`);
    if (d.shape.elong > 0.6 && f.elong > 0.5) reasons.push("細長い形がぴったり");
    else if (d.shape.elong < 0.3 && f.elong < 0.4 && f.fill > 0.55) reasons.push("まんまるでぎゅっと詰まった形");
    else if (s > 0.7) reasons.push("描いた形のバランスが近い");
    const hit = tastes.filter((x) => (d.taste[x] ?? 0) >= 0.6);
    if (hit.length) reasons.push(`「${hit.join("・")}」の気分にぴったり`);

    return {
      dish: d,
      score,
      percent: Math.round(Math.min(0.99, score) * 100),
      reasons: reasons.length ? reasons : ["全体の雰囲気が似ているよ"],
      parts: { color: c, shape: s, taste: t },
    };
  }).sort((a, b) => b.score - a.score);

  return { ok: true, features: f, results: results.slice(0, 3) };
}
