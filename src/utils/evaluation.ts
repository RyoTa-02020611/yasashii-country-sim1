/**
 * 評価ロジック共通化ユーティリティ
 * ゲーム全体で一貫した評価（スコア・ランク・エンディングタイプ）を提供する
 */
import { MeterState, RankType, EndingType } from '../types/game';

/**
 * メーター値から総合スコアを計算（0-100）
 * 各メーターのスコアを計算し、平均を返す
 */
export function calculateScore(meters: MeterState[]): number {
  if (meters.length === 0) {
    return 0;
  }

  // 各メーターのスコアを計算（0-100）
  const meterScores = meters.map((meter) => {
    let score = 0;
    
    if (meter.id === 'price' || meter.id === 'unemployment') {
      // 物価と失業率は低い方が良い（逆転）
      score = 100 - meter.value;
    } else {
      // 生活と国庫は高い方が良い
      score = meter.value;
    }
    
    // 国庫は負の値もあるので調整
    if (meter.id === 'treasury' && meter.value < 0) {
      score = Math.max(0, 50 + meter.value); // -50以下で0、0で50
    }
    
    return score;
  });

  // 平均スコアを計算
  const averageScore = meterScores.reduce((sum, s) => sum + s, 0) / meterScores.length;
  
  return Math.round(averageScore);
}

/**
 * スコアからランクを判定
 * 統一されたランク判定ロジック
 */
export function getRankFromScore(score: number): RankType {
  if (score >= 90) {
    return 'S';
  } else if (score >= 75) {
    return 'A';
  } else if (score >= 60) {
    return 'B';
  } else if (score >= 40) {
    return 'C';
  } else {
    return 'D';
  }
}

/**
 * メーター値からエンディングタイプを判定
 * プレイスタイルや最終状態に基づいてエンディングタイプを決定
 */
export function getEndingType(meters: MeterState[]): EndingType {
  const treasuryMeter = meters.find((m) => m.id === 'treasury');
  const lifeMeter = meters.find((m) => m.id === 'life');
  const priceMeter = meters.find((m) => m.id === 'price');
  const unemploymentMeter = meters.find((m) => m.id === 'unemployment');

  const treasury = treasuryMeter?.value ?? 0;
  const life = lifeMeter?.value ?? 50;
  const price = priceMeter?.value ?? 50;
  const unemployment = unemploymentMeter?.value ?? 50;

  // 財政破綻エンディング（国庫が大きくマイナス）
  if (treasury < -50) {
    return 'bankruptcy';
  }

  // 債務危機エンディング（国庫がマイナス、または財政が悪化）
  if (treasury < -20 || (treasury < 0 && life < 40)) {
    return 'debt_crisis';
  }

  // 緊縮型エンディング（財政重視で生活が低い）
  if (treasury >= 50 && life < 40) {
    return 'austerity';
  }

  // バランス型エンディング（デフォルト）
  return 'balanced';
}

/**
 * ランクのラベルと色を取得（UI表示用）
 */
export function getRankLabel(rank: RankType): { label: string; color: string } {
  const rankLabels: Record<RankType, { label: string; color: string }> = {
    S: { label: '優秀', color: 'text-yellow-400' },
    A: { label: '良好', color: 'text-green-400' },
    B: { label: '普通', color: 'text-blue-400' },
    C: { label: '要改善', color: 'text-red-400' },
    D: { label: '危機的', color: 'text-red-600' },
  };
  
  return rankLabels[rank];
}

