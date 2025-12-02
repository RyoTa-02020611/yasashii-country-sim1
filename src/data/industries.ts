/**
 * 産業プロジェクトデータ
 */
import { IndustryProject } from '../types/game';

export const industries: IndustryProject[] = [
  {
    id: 'industry-agriculture',
    industry: 'agriculture',
    name: '農業基盤整備プロジェクト',
    description: '農地の拡大と灌漑設備の整備を行い、農業生産性を向上させます。雇用を創出し、生活の質も向上します。',
    cost: 30, // バランス調整ポイント：中程度のコスト
    delay: 1, // 1ターン後から効果開始
    duration: 4, // 4ターン効果が続く
    effectsPerTurn: {
      unemployment: -2, // 失業率が改善
      treasury: 1,      // 税収が少し増える
      life: 1,          // 生活しやすさが向上
    },
  },
  {
    id: 'industry-manufacturing',
    industry: 'manufacturing',
    name: '工場近代化プロジェクト',
    description: '既存の工場を近代化し、生産効率を大幅に向上させます。雇用創出効果が大きいですが、初期投資が高額です。',
    cost: 50, // バランス調整ポイント：高コスト
    delay: 2, // 2ターン後から効果開始
    duration: 5, // 5ターン効果が続く
    effectsPerTurn: {
      unemployment: -4, // 失業率が大きく改善
      treasury: 2,      // 税収が増える
      life: 2,          // 生活しやすさが向上
    },
  },
  {
    id: 'industry-services',
    industry: 'services',
    name: '観光サービス強化プロジェクト',
    description: '観光インフラを整備し、サービス業を活性化します。生活の質と税収が少しずつ改善します。',
    cost: 25, // バランス調整ポイント：低コスト
    delay: 1, // 1ターン後から効果開始
    duration: 3, // 3ターン効果が続く
    effectsPerTurn: {
      unemployment: -1, // 失業率が少し改善
      treasury: 3,     // 税収が増える
      life: 2,          // 生活しやすさが向上
    },
  },
  {
    id: 'industry-magicTech',
    industry: 'magicTech',
    name: '魔導技術スタートアップ支援',
    description: '光の石を活用した新技術の研究開発を支援します。効果が出るまで時間がかかりますが、後半の税収への寄与が大きいです。',
    cost: 40, // バランス調整ポイント：中〜高コスト
    delay: 3, // 3ターン後から効果開始（長い遅延）
    duration: 6, // 6ターン効果が続く（長期間）
    effectsPerTurn: {
      unemployment: -2, // 失業率が改善
      treasury: 5,      // 税収が大きく増える
      life: 1,          // 生活しやすさが少し向上
    },
  },
];

