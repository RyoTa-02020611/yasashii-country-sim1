/**
 * 政策データ
 */
import { Policy } from '../types/game';

export const policies: Policy[] = [
  {
    id: 'policy-1',
    name: '減税',
    description: '所得税と消費税を引き下げ、国民の可処分所得を増やします。',
    targetMeters: ['price', 'treasury', 'life'],
    effects: {
      price: -5,      // 物価が少し下がる（需要増加の副作用で上昇する可能性もあるが、ここでは下がる想定）
      treasury: -30,  // 国庫が減少
      life: 8,        // 生活しやすさが向上
    },
    applicableScenarios: ['chapter2', 'final'], // 物価・生活系政策
  },
  {
    id: 'policy-2',
    name: '公共事業の拡大',
    description: '道路や橋の建設を進め、雇用を創出します。ハルが推奨する政策です。',
    targetMeters: ['unemployment', 'treasury', 'life'],
    effects: {
      unemployment: -8, // 失業率が改善
      treasury: -40,    // 財政が悪化（公共事業のコスト）
      life: 5,          // 生活しやすさが少し向上
    },
    applicableScenarios: ['chapter3', 'final'], // 失業系政策
  },
  {
    id: 'policy-3',
    name: '金利を上げる',
    description: '中央銀行が金利を引き上げ、インフレを抑制します。',
    targetMeters: ['price', 'unemployment'],
    effects: {
      price: -10,       // 物価が下がる
      unemployment: 5,  // 失業率が少し悪化（企業の投資が減る）
    },
    applicableScenarios: ['chapter2', 'chapter5', 'final'], // 物価抑制系政策
  },
  {
    id: 'policy-4',
    name: '増税',
    description: '所得税と消費税を引き上げ、財政を健全化します。',
    targetMeters: ['treasury', 'life'],
    effects: {
      treasury: 40,    // 国庫が増加
      life: -8,        // 生活しやすさが低下
    },
    applicableScenarios: ['chapter4', 'final'], // 財政健全化系政策
  },
  {
    id: 'policy-5',
    name: '外交交渉',
    description: '他国と交渉し、光の石の輸入価格を安定させます。',
    targetMeters: ['price', 'treasury'],
    effects: {
      price: -8,       // 物価が下がる
      treasury: -10,   // 外交コスト
    },
    applicableScenarios: ['chapter5', 'final'], // 外交系政策
  },
];

