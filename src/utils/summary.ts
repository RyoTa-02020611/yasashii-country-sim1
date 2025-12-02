/**
 * プレイヤーの集計ロジック
 */
import { TurnRecord, PlayerSummary, MeterType, AdvisorId } from '../types/game';

/**
 * history から PlayerSummary を作成する
 */
export function buildPlayerSummary(history: TurnRecord[]): PlayerSummary {
  // 初期値
  const advisorUseCount: Record<AdvisorId, number> = {
    riku: 0,
    haru: 0,
    sato: 0,
    tsumugi: 0,
    mina: 0,
    navi: 0,
  };

  const meterChangeSummary: PlayerSummary['meterChangeSummary'] = {
    price: { increaseTotal: 0, decreaseTotal: 0 },
    unemployment: { increaseTotal: 0, decreaseTotal: 0 },
    life: { increaseTotal: 0, decreaseTotal: 0 },
    treasury: { increaseTotal: 0, decreaseTotal: 0 },
  };

  // 各ターンレコードを処理
  history.forEach((record) => {
    // アドバイザー使用回数をカウント
    if (record.mainAdvisorId) {
      advisorUseCount[record.mainAdvisorId]++;
    }

    // メーターの変化量を集計
    record.beforeMeters.forEach((before) => {
      const after = record.afterMeters.find((m) => m.id === before.id);
      if (after) {
        const change = after.value - before.value;
        const meterType = before.id as MeterType;

        if (change > 0) {
          meterChangeSummary[meterType].increaseTotal += change;
        } else if (change < 0) {
          meterChangeSummary[meterType].decreaseTotal += Math.abs(change);
        }
      }
    });
  });

  // 最も多く使用されたアドバイザーを特定
  const maxCount = Math.max(...Object.values(advisorUseCount));
  const mostUsedAdvisorId =
    maxCount > 0
      ? (Object.entries(advisorUseCount).find(([, count]) => count === maxCount)?.[0] as AdvisorId | undefined) || null
      : null;

  // 典型的なミスパターンを検出
  const commonPitfallMessages: string[] = [];

  // パターン1: 雇用を優先するあまり、財政が悪化
  if (
    meterChangeSummary.treasury.decreaseTotal > 50 &&
    meterChangeSummary.unemployment.decreaseTotal > 20
  ) {
    commonPitfallMessages.push(
      '雇用を優先するあまり、財政が悪化しがちな傾向があります'
    );
  }

  // パターン2: 物価や生活のしやすさを十分にケアできていない
  if (
    meterChangeSummary.price.increaseTotal > 30 &&
    meterChangeSummary.life.decreaseTotal > 20
  ) {
    commonPitfallMessages.push(
      '物価や生活のしやすさを十分にケアできていない可能性があります'
    );
  }

  // パターン3: 財政を重視しすぎて、他の指標が悪化
  if (
    meterChangeSummary.treasury.increaseTotal > 40 &&
    (meterChangeSummary.unemployment.increaseTotal > 15 ||
      meterChangeSummary.life.decreaseTotal > 15)
  ) {
    commonPitfallMessages.push(
      '財政を重視しすぎて、雇用や生活の質が犠牲になっている可能性があります'
    );
  }

  // パターン4: バランスが取れている場合のポジティブメッセージ
  if (commonPitfallMessages.length === 0) {
    const totalImprovements =
      meterChangeSummary.unemployment.decreaseTotal +
      meterChangeSummary.life.increaseTotal +
      meterChangeSummary.treasury.increaseTotal;
    const totalDeteriorations =
      meterChangeSummary.price.increaseTotal +
      meterChangeSummary.unemployment.increaseTotal +
      meterChangeSummary.life.decreaseTotal +
      meterChangeSummary.treasury.decreaseTotal;

    if (totalImprovements > totalDeteriorations) {
      commonPitfallMessages.push(
        'バランスの取れた判断ができています。複数の指標を考慮した政策選択ができています。'
      );
    }
  }

  return {
    totalTurns: history.length,
    mostUsedAdvisorId,
    advisorUseCount,
    meterChangeSummary,
    commonPitfallMessages,
  };
}

