export type Category = "筆記" | "裁断" | "計測" | "収納";

export const categories: Category[] = ["筆記", "裁断", "計測", "収納"];

export type Product = {
  id: string;
  name: string;
  reading: string;
  category: Category;
  price: number;
  material: string;
  size: string;
  inStock: boolean;
  blurb: string;
  featured?: boolean;
};

export const products: Product[] = [
  {
    id: "kg-101",
    name: "真鍮 六角ペン",
    reading: "BRASS HEX PEN",
    category: "筆記",
    price: 6800,
    material: "真鍮無垢",
    size: "φ9 × 140 mm",
    inStock: true,
    blurb:
      "削り出しの六角軸。使うほど角が丸み、手の形に合わせて色が沈みます。替芯は市販のものが入ります。",
    featured: true,
  },
  {
    id: "kg-104",
    name: "桜材 ペンレスト",
    reading: "SAKURA PEN REST",
    category: "筆記",
    price: 2400,
    material: "山桜",
    size: "80 × 28 × 14 mm",
    inStock: true,
    blurb: "一本の枝から二つ取れる寸法で挽いています。木目は個体ごとに違います。",
  },
  {
    id: "kg-210",
    name: "小鋏 三寸",
    reading: "SHEARS 90MM",
    category: "裁断",
    price: 9200,
    material: "青紙二号鋼",
    size: "全長 90 mm",
    inStock: true,
    blurb:
      "糸切りにも紙にも使える三寸の鋏。鍛冶職人が一丁ずつ刃を合わせ、研ぎ直しも受けています。",
    featured: true,
  },
  {
    id: "kg-215",
    name: "革包丁 24mm",
    reading: "LEATHER KNIFE 24MM",
    category: "裁断",
    price: 12600,
    material: "白紙一号鋼／朴柄",
    size: "刃幅 24 mm",
    inStock: false,
    blurb: "漉きと裁ちを一本で。次回の入荷は職人の作業ぶんだけ、春先を予定しています。",
  },
  {
    id: "kg-302",
    name: "竹尺 一尺",
    reading: "BAMBOO RULE 303MM",
    category: "計測",
    price: 3200,
    material: "真竹",
    size: "303 mm",
    inStock: true,
    blurb: "尺貫法とミリを表裏に刻んだ物差し。紙を傷めず、湿気で反りにくい真竹を使います。",
  },
  {
    id: "kg-308",
    name: "鋳鉄 文鎮",
    reading: "CAST IRON WEIGHT",
    category: "計測",
    price: 4800,
    material: "鋳鉄",
    size: "180 × 22 mm / 420 g",
    inStock: true,
    blurb: "定規に添えても図面を押さえても。底面にフェルトを貼り、机を傷つけません。",
    featured: true,
  },
  {
    id: "kg-405",
    name: "帆布 道具袋",
    reading: "CANVAS TOOL ROLL",
    category: "収納",
    price: 7400,
    material: "八号帆布",
    size: "展開 420 × 300 mm",
    inStock: true,
    blurb: "巻いて留めるだけの道具袋。仕切りは六つ、鋏も竹尺も一緒に入ります。",
  },
  {
    id: "kg-410",
    name: "栓材 小引出し",
    reading: "SEN WOOD CHEST",
    category: "収納",
    price: 18000,
    material: "栓（センノキ）",
    size: "240 × 180 × 160 mm",
    inStock: true,
    blurb: "三段の小引出し。金具は使わず、木の摩擦だけで止まります。奥行きは机上を想定した浅め。",
  },
];

export const featuredProducts = products.filter((product) => product.featured);

export const formatPrice = (price: number) => `¥${price.toLocaleString("ja-JP")}`;
