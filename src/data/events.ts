/**
 * イベントデータ
 */
import { GameEvent } from '../types/game';

export const events: GameEvent[] = [
  {
    id: 'event-1',
    title: 'パンの値段が急に3倍に！',
    description: '光の石の価格高騰により、生活必需品の価格が急上昇しました。国民の生活が圧迫されています。',
    effects: {
      price: 20,      // 物価が大幅に上昇
      life: -15,      // 生活しやすさが低下
    },
    applicableScenarios: ['chapter2', 'chapter5', 'final'], // 物価系イベント
    weight: 2, // 基本出現率
    scenarioWeights: {
      chapter2: 4, // 物価章では高確率で出現
      chapter5: 3, // 外交章でも出現しやすい
      final: 2,    // 最終章でも少し出現しやすい
    },
  },
  {
    id: 'event-2',
    title: '大規模な自然災害が発生',
    description: 'ノヴァリア王国で地震が発生。インフラに大きな被害が出ており、復興には多額の費用が必要です。',
    effects: {
      treasury: -50,  // 国庫が大幅に減少
      life: -20,      // 生活しやすさが大幅に低下
      unemployment: 5, // 失業率が少し上昇
    },
    applicableScenarios: ['chapter4', 'final'], // 財政系イベント
    weight: 1, // 基本出現率（低め）
    scenarioWeights: {
      chapter4: 4, // 財政章では高確率で出現
      final: 2,    // 最終章でも出現しやすい
    },
  },
  {
    id: 'event-3',
    title: '光の石の新技術が発見された！',
    description: '光の石を効率的に利用する革新的な技術が発見されました。これにより経済が活性化する見込みです。',
    effects: {
      treasury: 30,   // 国庫が増加
      life: 10,       // 生活しやすさが向上
      unemployment: -3, // 失業率が少し改善
    },
    // 共通イベント（全章で使用可能）
    weight: 3, // 基本出現率（中程度、良いイベントなので少し多め）
    scenarioWeights: {
      // どの章でも同じ確率（補正なし）
    },
  },
  {
    id: 'event-4',
    title: '大企業の倒産が相次ぐ',
    description: '景気の悪化により、複数の大企業が倒産しました。失業者が急増しています。',
    effects: {
      unemployment: 15, // 失業率が大幅に上昇
      treasury: -20,     // 税収が減少
    },
    applicableScenarios: ['chapter3', 'final'], // 失業系イベント
    weight: 2, // 基本出現率
    scenarioWeights: {
      chapter3: 4, // 失業章では高確率で出現
      final: 2,    // 最終章でも出現しやすい
    },
  },
  {
    id: 'event-5',
    title: '資源ショックが発生',
    description: '他国との外交関係が悪化し、光の石の輸入が制限されました。価格が急騰しています。',
    effects: {
      price: 25,     // 物価が大幅に上昇
      treasury: -15, // 輸入コストが増加
    },
    applicableScenarios: ['chapter5', 'final'], // 外交・資源ショック系イベント
    weight: 2, // 基本出現率
    scenarioWeights: {
      chapter5: 4, // 外交章では高確率で出現
      final: 2,    // 最終章でも出現しやすい
    },
  },
];

