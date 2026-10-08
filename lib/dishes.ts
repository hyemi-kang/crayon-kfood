// おすすめ診断で使う、お絵かきのクレヨン色と料理データ

export type ColorKey = "red" | "orange" | "yellow" | "green" | "blue" | "brown" | "pink" | "white" | "black";

export const PALETTE: { key: ColorKey; label: string; hex: string; rgb: [number, number, number] }[] = [
  { key: "red", label: "あか", hex: "#e8483a", rgb: [232, 72, 58] },
  { key: "orange", label: "だいだい", hex: "#f59a23", rgb: [245, 154, 35] },
  { key: "yellow", label: "きいろ", hex: "#ffd23f", rgb: [255, 210, 63] },
  { key: "green", label: "みどり", hex: "#5bb450", rgb: [91, 180, 80] },
  { key: "blue", label: "あお", hex: "#3a8fd9", rgb: [58, 143, 217] },
  { key: "brown", label: "ちゃいろ", hex: "#7a4a2b", rgb: [122, 74, 43] },
  { key: "pink", label: "ピンク", hex: "#f4a6a0", rgb: [244, 166, 160] },
  { key: "white", label: "しろ", hex: "#ffffff", rgb: [255, 255, 255] },
  { key: "black", label: "くろ", hex: "#3b2f2a", rgb: [59, 47, 42] },
];

export const TASTES = [
  "辛い",
  "甘い",
  "しょっぱい",
  "酸っぱい",
  "あっさり",
  "こってり",
  "香ばしい",
  "温かい",
  "冷たい",
  "もちもち",
  "シャキシャキ",
] as const;
export type Taste = (typeof TASTES)[number];

export type Dish = {
  id: string;
  name: string;
  hangul: string;
  blurb: string;
  /** 色の割合（合計およそ 1） */
  colors: Partial<Record<ColorKey, number>>;
  /** 形の目安：横長さ(幅/高さ)・塗りの詰まり具合(0〜1)・細長さ(0〜1) */
  shape: { aspect: number; fill: number; elong: number };
  /** 味の特徴（0〜1） */
  taste: Partial<Record<Taste, number>>;
};

export const DISHES: Dish[] = [
  {
    id: "bibimbap",
    name: "ビビンバ",
    hangul: "비빔밥",
    blurb: "ナムルと卵をぜんぶ混ぜる、彩りごはん。熱い石鍋なら、おこげも楽しめるよ。",
    colors: { red: 0.14, orange: 0.2, yellow: 0.14, green: 0.2, brown: 0.2, white: 0.12 },
    shape: { aspect: 1.35, fill: 0.78, elong: 0.15 },
    taste: { 辛い: 0.5, 香ばしい: 0.7, しょっぱい: 0.3, あっさり: 0.4, シャキシャキ: 0.8, 温かい: 0.6 },
  },
  {
    id: "tteokbokki",
    name: "トッポッキ",
    hangul: "떡볶이",
    blurb: "もちもちのお餅を、あま辛い赤いソースでぐつぐつ。屋台の定番おやつ。",
    colors: { red: 0.6, orange: 0.12, white: 0.16, yellow: 0.06, brown: 0.06 },
    shape: { aspect: 1.5, fill: 0.72, elong: 0.2 },
    taste: { 辛い: 1, 甘い: 0.7, もちもち: 1, 温かい: 0.8, こってり: 0.5 },
  },
  {
    id: "samgyeopsal",
    name: "サムギョプサル",
    hangul: "삼겹살",
    blurb: "厚切りの豚バラをじゅうじゅう焼いて、サンチュでくるっと巻いてパクッ。",
    colors: { pink: 0.34, white: 0.2, brown: 0.2, green: 0.16, red: 0.1 },
    shape: { aspect: 1.6, fill: 0.62, elong: 0.3 },
    taste: { こってり: 1, 香ばしい: 1, しょっぱい: 0.5, 温かい: 0.8 },
  },
  {
    id: "kimchi-jjigae",
    name: "キムチチゲ",
    hangul: "김치찌개",
    blurb: "よく熟したキムチの酸味と辛さが決め手。ごはんがすすむ、あったか鍋。",
    colors: { red: 0.55, orange: 0.1, brown: 0.1, white: 0.12, green: 0.08, yellow: 0.05 },
    shape: { aspect: 1.3, fill: 0.8, elong: 0.1 },
    taste: { 辛い: 1, 酸っぱい: 0.7, 温かい: 1, しょっぱい: 0.6, こってり: 0.3 },
  },
  {
    id: "bulgogi",
    name: "プルコギ",
    hangul: "불고기",
    blurb: "甘じょっぱいタレに漬けた牛肉を、野菜といっしょに香ばしく焼いた一皿。",
    colors: { brown: 0.5, orange: 0.14, green: 0.12, white: 0.1, red: 0.08, black: 0.06 },
    shape: { aspect: 1.45, fill: 0.7, elong: 0.2 },
    taste: { 甘い: 0.8, しょっぱい: 0.6, 香ばしい: 0.8, 温かい: 0.7 },
  },
  {
    id: "japchae",
    name: "チャプチェ",
    hangul: "잡채",
    blurb: "つるつるの春雨を、ごま油と野菜でさっと炒めた、お祝いの席の人気者。",
    colors: { brown: 0.34, orange: 0.14, green: 0.2, yellow: 0.1, white: 0.1, red: 0.08, black: 0.04 },
    shape: { aspect: 1.4, fill: 0.7, elong: 0.2 },
    taste: { 甘い: 0.6, 香ばしい: 0.8, シャキシャキ: 0.5, もちもち: 0.6, しょっぱい: 0.4 },
  },
  {
    id: "samgyetang",
    name: "サムゲタン",
    hangul: "삼계탕",
    blurb: "丸ごとのひな鶏を、もち米と朝鮮人参でじっくり煮込んだ、やさしい滋養スープ。",
    colors: { white: 0.5, yellow: 0.2, brown: 0.15, green: 0.1, orange: 0.05 },
    shape: { aspect: 1.2, fill: 0.78, elong: 0.1 },
    taste: { あっさり: 1, 温かい: 1, しょっぱい: 0.2, もちもち: 0.4 },
  },
  {
    id: "yangnyeom-chicken",
    name: "ヤンニョムチキン",
    hangul: "양념치킨",
    blurb: "サクサクの揚げ鶏に、甘辛いコチュジャンだれをたっぷり絡めたやみつき系。",
    colors: { red: 0.52, orange: 0.2, brown: 0.12, white: 0.06, yellow: 0.05 },
    shape: { aspect: 1.35, fill: 0.68, elong: 0.15 },
    taste: { 甘い: 0.8, 辛い: 0.8, こってり: 0.8, 香ばしい: 0.6, 温かい: 0.5 },
  },
  {
    id: "naengmyeon",
    name: "冷麺",
    hangul: "냉면",
    blurb: "キンキンに冷えたスープに、コシのある麺。酸味がきいて夏にぴったり。",
    colors: { white: 0.32, blue: 0.16, brown: 0.14, red: 0.1, green: 0.1, yellow: 0.1, orange: 0.05 },
    shape: { aspect: 1.15, fill: 0.74, elong: 0.1 },
    taste: { 冷たい: 1, 酸っぱい: 0.7, あっさり: 0.9, もちもち: 0.5 },
  },
  {
    id: "kimbap",
    name: "キンパ",
    hangul: "김밥",
    blurb: "海苔でくるっと巻いた韓国のり巻き。ごま油の香りで、おでかけのお供にも。",
    colors: { black: 0.36, white: 0.28, green: 0.1, yellow: 0.1, red: 0.1, orange: 0.06 },
    shape: { aspect: 2.4, fill: 0.7, elong: 0.85 },
    taste: { 香ばしい: 0.6, あっさり: 0.6, シャキシャキ: 0.5 },
  },
  {
    id: "sundubu",
    name: "スンドゥブチゲ",
    hangul: "순두부찌개",
    blurb: "やわらかいおぼろ豆腐が主役。辛くてふわふわ、体の芯からあたたまる。",
    colors: { red: 0.5, white: 0.25, orange: 0.1, yellow: 0.1, green: 0.05 },
    shape: { aspect: 1.25, fill: 0.8, elong: 0.1 },
    taste: { 辛い: 0.8, 温かい: 1, あっさり: 0.3, しょっぱい: 0.4 },
  },
  {
    id: "pajeon",
    name: "パジョン",
    hangul: "파전",
    blurb: "ねぎたっぷりの韓国チヂミ。外はカリッ、中はもっちり。雨の日に食べたくなる。",
    colors: { yellow: 0.4, green: 0.3, orange: 0.14, brown: 0.1, white: 0.06 },
    shape: { aspect: 1.3, fill: 0.9, elong: 0.1 },
    taste: { 香ばしい: 1, もちもち: 0.6, しょっぱい: 0.4, シャキシャキ: 0.3, 温かい: 0.6 },
  },
  {
    id: "hotteok",
    name: "ホットク",
    hangul: "호떡",
    blurb: "黒蜜とナッツがとろりと入った、あつあつの甘い焼きパンケーキ。冬の屋台の人気者。",
    colors: { brown: 0.5, orange: 0.3, yellow: 0.14, red: 0.06 },
    shape: { aspect: 1.1, fill: 0.88, elong: 0.05 },
    taste: { 甘い: 1, 香ばしい: 0.8, もちもち: 0.8, 温かい: 0.8 },
  },
  {
    id: "bingsu",
    name: "パッピンス",
    hangul: "팥빙수",
    blurb: "ふわふわの雪のようなかき氷に、あんこやお餅をのせた、ひんやりスイーツ。",
    colors: { white: 0.45, pink: 0.18, red: 0.1, brown: 0.1, yellow: 0.1, blue: 0.07 },
    shape: { aspect: 1.0, fill: 0.8, elong: 0.05 },
    taste: { 甘い: 1, 冷たい: 1, あっさり: 0.6, もちもち: 0.4 },
  },
];
