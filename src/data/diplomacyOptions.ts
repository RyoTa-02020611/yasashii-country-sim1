/**
 * 金融政策オプション（教育用）
 * 現実の金融リテラシー教育に向けた政策選択肢
 */

export interface DiplomacyOption {
  id: string;
  title: string;
  description: string;
  successRate: number; // 0〜1
  effects: {
    price?: number;        // 物価への影響
    treasury?: number;     // 財政への影響
    unemployment?: number; // 失業率への影響
    life?: number;         // 生活しやすさへの影響
    // 隠しメーターへの影響
    credit?: number;       // 信用度への影響
    support?: number;      // 支持率への影響
    inflationRisk?: number; // インフレリスクへの影響
    productivity?: number;  // 生産性への影響
    futureCost?: number;    // 将来コストへの影響
  };
  failEffects?: {
    price?: number;
    treasury?: number;
    unemployment?: number;
    life?: number;
    credit?: number;
    support?: number;
    inflationRisk?: number;
    productivity?: number;
    futureCost?: number;
  };
}

export const diplomacyOptions: DiplomacyOption[] = [
  {
    id: 'finance-1',
    title: '追加国債の発行',
    description: '国債を発行して資金を調達します。短期的には財政が改善しますが、将来の返済負担と信用度の低下が懸念されます。',
    successRate: 0.9, // 90%の成功率（国債発行は通常成功する）
    effects: {
      treasury: 30,      // 国庫 +30
      credit: -10,       // 信用度 -10
      futureCost: 5,     // 将来コスト +5
    },
    failEffects: {
      treasury: 15,      // 失敗時は半分の効果
      credit: -15,      // 失敗時は信用度がより大きく下がる
      futureCost: 3,
    },
  },
  {
    id: 'finance-2',
    title: '金融緩和（利下げ）',
    description: '中央銀行が金利を引き下げ、市場に資金を供給します。物価が上昇し、経済活動が活発になりますが、インフレリスクが高まります。',
    successRate: 0.75, // 75%の成功率
    effects: {
      price: 5,          // 物価 +5
      productivity: 3,  // 生産性 +3
      treasury: -5,     // 国庫 -5（政策コスト）
      inflationRisk: 5, // インフレリスク +5
    },
    failEffects: {
      price: 2,         // 失敗時は効果が小さい
      productivity: 1,
      treasury: -5,     // コストは発生
      inflationRisk: 3,
    },
  },
  {
    id: 'finance-3',
    title: '雇用対策（補助金投入）',
    description: '企業への雇用補助金を投入し、失業率を改善します。支持率が上がりますが、財政への負担が大きいです。',
    successRate: 0.8, // 80%の成功率
    effects: {
      unemployment: -4,  // 失業率改善
      support: 5,       // 支持率 +5
      treasury: -10,    // 国庫 -10
    },
    failEffects: {
      unemployment: -2, // 失敗時は効果が小さい
      support: 2,
      treasury: -10,    // コストは発生
    },
  },
  {
    id: 'finance-4',
    title: '産業投資（研究開発支援）',
    description: '企業の研究開発を支援し、長期的な生産性向上を目指します。効果が発現するまで時間がかかりますが、大きな成果が期待できます。',
    successRate: 0.7, // 70%の成功率
    effects: {
      productivity: 10, // 生産性 +10
      treasury: -8,     // 国庫 -8
      // 注意: 効果発動まで2ターン遅延は、useGameStore.ts で処理
    },
    failEffects: {
      productivity: 3,  // 失敗時は効果が小さい
      treasury: -8,     // コストは発生
    },
  },
];
