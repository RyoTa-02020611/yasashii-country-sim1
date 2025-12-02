/**
 * 結果画面
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { AdvisorId, ScenarioTheme, MeterType } from '../../types/game';
import { advisors } from '../../data/advisors';
import { policies } from '../../data/policies';
import { calculateScore, getRankFromScore, getEndingType, getRankLabel } from '../../utils/evaluation';

// カウントアップアニメーション用のカスタムフック
function useCountUp(targetValue: number, duration: number = 1000): number {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (targetValue === 0) {
      setDisplayValue(0);
      return;
    }

    const startTime = Date.now();
    const startValue = displayValue;
    const endValue = targetValue;

    const updateValue = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // イージング関数（ease-out）
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startValue + (endValue - startValue) * easedProgress);
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(updateValue);
      } else {
        setDisplayValue(endValue);
      }
    };

    const frameId = requestAnimationFrame(updateValue);
    return () => cancelAnimationFrame(frameId);
  }, [targetValue, duration]);

  return displayValue;
}

export default function ResultScreen() {
  const {
    resultType,
    resultMessage,
    history,
    currentScenario,
    startScenario,
    resetGame,
    resetToTitle, // バグ修正：タイトル画面に戻る専用関数
    resetAllAndGoHome, // ゲーム全体を初期化してタイトルに戻る
    restartCurrentChapter, // 現在の章だけリセットして続きから遊ぶ
    actionLog,
    meters,
    endingType,
    rank: storeRank, // useGameStoreから取得したrank（共通ロジックで計算済み）
    turn,
    maxTurns,
  } = useGameStore();
  
  // 評価ロジック共通化：共通のevaluation.tsを使用して一貫した評価を提供
  // storeRankが存在する場合はそれを使用、ない場合は共通ロジックで計算
  const finalMeters = history.length > 0 ? (history[history.length - 1]?.afterMeters || meters) : meters;
  const score = calculateScore(finalMeters);
  // storeRankが存在する場合はそれを使用（10ターン終了時にcalculateRankで計算済み）
  // ない場合は共通ロジックで計算（早期ゲームオーバーなど）
  const calculatedRank = storeRank || getRankFromScore(score);
  const calculatedEndingType = endingType || getEndingType(finalMeters) || 'balanced';

  // もっとも多く選んだアドバイザーを算出
  const getMostSelectedAdvisor = (): { advisor: AdvisorId | null; count: number } => {
    if (history.length === 0) {
      return { advisor: null, count: 0 };
    }

    const advisorCounts: Record<AdvisorId, number> = {
      riku: 0,
      haru: 0,
      sato: 0,
      tsumugi: 0,
      mina: 0,
      navi: 0,
    };

    history.forEach((record) => {
      if (record.mainAdvisorId) {
        advisorCounts[record.mainAdvisorId]++;
      }
    });

    const maxCount = Math.max(...Object.values(advisorCounts));
    const mostSelected = Object.entries(advisorCounts).find(
      ([, count]) => count === maxCount
    )?.[0] as AdvisorId | undefined;

    return {
      advisor: mostSelected || null,
      count: maxCount,
    };
  };

  // よく上げているメーター（改善量の合計で判定）
  const getMostImprovedMeter = (): { meter: string; improvement: number } => {
    if (history.length === 0) {
      return { meter: 'なし', improvement: 0 };
    }

    const improvements: Record<string, number> = {
      price: 0,
      unemployment: 0,
      life: 0,
      treasury: 0,
    };

    history.forEach((record) => {
      record.beforeMeters.forEach((before) => {
        const after = record.afterMeters.find((m) => m.id === before.id);
        if (after) {
          const change = after.value - before.value;
          // 物価と失業率は下がる方が良い、生活しやすさと国庫は上がる方が良い
          if (before.id === 'price' || before.id === 'unemployment') {
            improvements[before.id] += -change; // 下がった分をプラスとしてカウント
          } else {
            improvements[before.id] += change;
          }
        }
      });
    });

    const maxImprovement = Math.max(...Object.values(improvements));
    const mostImproved = Object.entries(improvements).find(
      ([, value]) => value === maxImprovement
    )?.[0];

    const meterLabels: Record<string, string> = {
      price: '物価',
      unemployment: '失業率',
      life: '生活しやすさ',
      treasury: '国庫残高',
    };

    return {
      meter: meterLabels[mostImproved || ''] || 'なし',
      improvement: maxImprovement,
    };
  };

  const mostSelectedAdvisor = getMostSelectedAdvisor();
  const mostImprovedMeter = getMostImprovedMeter();
  const advisorInfo = mostSelectedAdvisor.advisor
    ? advisors.find((a) => a.id === mostSelectedAdvisor.advisor)
    : null;

  // カウントアップアニメーション
  const displayTurnCount = useCountUp(history.length, 800);
  const displayAdvisorCount = useCountUp(mostSelectedAdvisor.count, 600);
  const displayImprovement = useCountUp(Math.floor(mostImprovedMeter.improvement), 800);

  // 難易度まとめの計算
  const getDifficultySummary = () => {
    // 行動フェーズの使用回数
    const actionPhaseCount = actionLog.length;

    // イベントの種類数と平均severity（簡易版：historyから推測）
    // 実際のイベント履歴は別途管理が必要だが、今回は簡易的に計算
    const eventTypes = new Set<string>();
    let totalSeverity = 0;
    let eventCount = 0;

    // historyからイベント効果を推測（簡易版）
    history.forEach((record) => {
      record.beforeMeters.forEach((before) => {
        const after = record.afterMeters.find((m) => m.id === before.id);
        if (after) {
          const change = Math.abs(after.value - before.value);
          if (change > 5) {
            // 大きな変化があった場合、イベントの影響とみなす
            eventTypes.add(before.id);
            totalSeverity += change;
            eventCount++;
          }
        }
      });
    });

    const avgSeverity = eventCount > 0 ? totalSeverity / eventCount : 0;
    const uniqueEventTypes = eventTypes.size;

    // 最適プレイかどうかのコメント
    let playComment = '';
    if (currentScenario) {
      const theme = currentScenario.theme;
      if (theme === 'inflation' && uniqueEventTypes > 0) {
        playComment = 'この章では物価系イベントが多く発生しました。インフレ対策が重要な局面でした。';
      } else if (theme === 'unemployment' && actionPhaseCount > 0) {
        playComment = '雇用対策のアクションを積極的に活用しました。失業率の改善に貢献したでしょう。';
      } else if (theme === 'fiscal' && mostImprovedMeter.meter === '国庫残高') {
        playComment = '財政管理が適切でした。国庫の健全化に成功しています。';
      } else if (theme === 'diplomacy' && uniqueEventTypes > 0) {
        playComment = '外交と資源管理のバランスが重要でした。';
      } else {
        playComment = 'バランスの取れた政策運営ができました。';
      }
    }

    return {
      uniqueEventTypes,
      avgSeverity,
      actionPhaseCount,
      playComment,
    };
  };

  const difficultySummary = getDifficultySummary();

  // ========== 統治タイプ診断 ==========
  type GovernanceType = 'market' | 'welfare' | 'fiscal' | 'diplomatic' | 'balanced';

  const getGovernanceType = (): { type: GovernanceType; label: string; description: string; icon: string } => {
    if (history.length === 0) {
      return {
        type: 'balanced',
        label: 'バランス型統治者',
        description: '様々な政策をバランスよく選択しました',
        icon: '⚖️',
      };
    }

    // 政策選択の傾向を分析
    const policyCounts: Record<string, number> = {};
    history.forEach((record) => {
      if (record.selectedPolicyId) {
        policyCounts[record.selectedPolicyId] = (policyCounts[record.selectedPolicyId] || 0) + 1;
      }
    });

    // アドバイザー選択の傾向
    const advisorCounts: Record<AdvisorId, number> = {
      riku: 0,
      haru: 0,
      sato: 0,
      tsumugi: 0,
      mina: 0,
      navi: 0,
    };
    history.forEach((record) => {
      if (record.mainAdvisorId) {
        advisorCounts[record.mainAdvisorId]++;
      }
    });

    // 外交行動の使用回数
    const diplomacyActions = actionLog.filter((log) => log.includes('外交')).length;

    // 各タイプのスコアを計算
    let marketScore = 0;
    let welfareScore = 0;
    let fiscalScore = 0;
    let diplomaticScore = 0;

    // 政策から判定
    Object.entries(policyCounts).forEach(([policyId, count]) => {
      const policy = policies.find((p) => p.id === policyId);
      if (!policy) return;

      // 物価改善政策 → 市場重視
      if (policy.effects?.price && policy.effects.price < 0) {
        marketScore += count;
      }
      // 生活改善政策 → 社会福祉
      if (policy.effects?.life && policy.effects.life > 0) {
        welfareScore += count;
      }
      // 財政改善政策 → 財政規律
      if (policy.effects?.treasury && policy.effects.treasury > 0) {
        fiscalScore += count;
      }
    });

    // アドバイザーから判定
    // リク（財務）→ 財政規律
    fiscalScore += advisorCounts.riku * 2;
    // サト（社会）→ 社会福祉
    welfareScore += advisorCounts.sato * 2;
    // ハル（経済）→ 市場重視
    marketScore += advisorCounts.haru * 2;
    // ツムギ（外交）→ 外交協調
    diplomaticScore += advisorCounts.tsumugi * 2;

    // 外交行動の使用
    diplomaticScore += diplomacyActions * 3;

    // 最も高いスコアのタイプを決定
    const scores = [
      { type: 'market' as GovernanceType, score: marketScore },
      { type: 'welfare' as GovernanceType, score: welfareScore },
      { type: 'fiscal' as GovernanceType, score: fiscalScore },
      { type: 'diplomatic' as GovernanceType, score: diplomaticScore },
    ];

    const maxScore = Math.max(...scores.map((s) => s.score));
    const selectedType = maxScore > 0
      ? scores.find((s) => s.score === maxScore)?.type || 'balanced'
      : 'balanced';

    const typeLabels: Record<GovernanceType, { label: string; description: string; icon: string }> = {
      market: {
        label: '市場重視タイプ（Business-oriented Leader）',
        description: '経済成長と市場の効率性を重視する統治スタイル',
        icon: '📈',
      },
      welfare: {
        label: '社会福祉タイプ（Public Good Leader）',
        description: '国民の生活の質と社会福祉を最優先する統治スタイル',
        icon: '🏛️',
      },
      fiscal: {
        label: '財政規律タイプ（Fiscal Conservative）',
        description: '財政の健全化と長期的な安定を重視する統治スタイル',
        icon: '💰',
      },
      diplomatic: {
        label: '外交協調タイプ（Diplomatic Leader）',
        description: '国際協調と外交関係を重視する統治スタイル',
        icon: '🌍',
      },
      balanced: {
        label: 'バランス型統治者（Balanced Leader）',
        description: '様々な政策をバランスよく選択する統治スタイル',
        icon: '⚖️',
      },
    };

    return {
      type: selectedType,
      ...typeLabels[selectedType],
    };
  };

  const governanceType = getGovernanceType();

  // ========== 国の未来テキスト（Ending Narrative） ==========
  const getEndingNarrative = (): string => {
    if (history.length === 0) {
      return 'ノヴァリア王国の未来は、あなたの選択によって決まります。';
    }

    // メーターの最終値を取得
    const finalMeters = history[history.length - 1]?.afterMeters || meters;
    const priceMeter = finalMeters.find((m) => m.id === 'price');
    const unemploymentMeter = finalMeters.find((m) => m.id === 'unemployment');
    const lifeMeter = finalMeters.find((m) => m.id === 'life');
    const treasuryMeter = finalMeters.find((m) => m.id === 'treasury');

    const price = priceMeter?.value || 50;
    const unemployment = unemploymentMeter?.value || 50;
    const life = lifeMeter?.value || 50;
    const treasury = treasuryMeter?.value || 50;

    // 各メーターの評価
    const priceGood = price <= 40;
    const priceBad = price >= 80;
    const unemploymentGood = unemployment <= 30;
    const unemploymentBad = unemployment >= 70;
    const lifeGood = life >= 70;
    const lifeBad = life <= 30;
    const treasuryGood = treasury >= 50;
    const treasuryBad = treasury <= -20;

    // ストーリーパターンを生成
    const narratives: string[] = [];

    // 物価の評価
    if (priceGood) {
      narratives.push('物価は安定し、');
    } else if (priceBad) {
      narratives.push('物価は高騰し、');
    } else {
      narratives.push('物価はやや不安定な状態で、');
    }

    // 失業率の評価
    if (unemploymentGood) {
      narratives.push('雇用は安定しています。');
    } else if (unemploymentBad) {
      narratives.push('失業問題が深刻です。');
    } else {
      narratives.push('雇用状況は改善の余地があります。');
    }

    // 生活の評価
    if (lifeGood) {
      narratives.push('市民の生活は改善し、');
    } else if (lifeBad) {
      narratives.push('市民の生活は圧迫され、');
    } else {
      narratives.push('市民の生活は維持され、');
    }

    // 財政の評価
    if (treasuryGood) {
      narratives.push('財政は健全です。');
    } else if (treasuryBad) {
      narratives.push('財政赤字は深刻です。');
    } else {
      narratives.push('財政は改善の余地があります。');
    }

    // 総合的な未来予測
    const goodCount = [priceGood, unemploymentGood, lifeGood, treasuryGood].filter(Boolean).length;
    const badCount = [priceBad, unemploymentBad, lifeBad, treasuryBad].filter(Boolean).length;

    let futureText = '';
    if (goodCount >= 3) {
      futureText = 'ノヴァリアは穏やかな成長期に入ります。';
    } else if (badCount >= 2) {
      futureText = '次代の王に課題が残りました。';
    } else if (treasuryGood && lifeGood) {
      futureText = '財政と生活のバランスが取れた、安定した未来が待っています。';
    } else if (governanceType.type === 'diplomatic') {
      futureText = '国際連携が強まり、資源確保に成功し、国は新たな繁栄へ。';
    } else {
      futureText = 'バランスの取れた統治により、国は安定した発展を続けます。';
    }

    return narratives.join(' ') + ' ' + futureText;
  };

  const endingNarrative = getEndingNarrative();

  // ========== 総合スコア表示 ==========
  // 評価ロジック共通化：共通のevaluation.tsを使用して一貫した評価を提供
  // calculatedRankとcalculatedEndingTypeを使用して、すべての評価表示を統一
  const getOverallScore = (): { score: number; rank: 'S' | 'A' | 'B' | 'C' | 'D'; label: string; color: string } => {
    if (history.length === 0) {
      return { score: 0, rank: 'C', label: '評価なし', color: 'text-gray-400' };
    }

    // 共通の評価ロジックを使用（calculatedRankと統一）
    const rankInfo = getRankLabel(calculatedRank);

    return { score, rank: calculatedRank, label: rankInfo.label, color: rankInfo.color };
  };

  const overallScore = getOverallScore();
  const displayScore = useCountUp(overallScore.score, 1000);

  const getThemeLabel = (theme: ScenarioTheme): string => {
    const themeLabels: Record<ScenarioTheme, string> = {
      inflation: 'インフレ',
      unemployment: '失業',
      fiscal: '財政',
      diplomacy: '外交',
      mixed: '総合',
    };
    return themeLabels[theme];
  };

  const meterLabels: Record<string, string> = {
    price: '物価',
    unemployment: '失業率',
    life: '生活しやすさ',
    treasury: '国庫残高',
  };

  // 同じ章でもう一度遊ぶ（現在の章だけリセットして再開）
  const handleRetry = () => {
    restartCurrentChapter();
  };

  // 最初からやり直す（ゲーム全体を初期化してタイトルに戻る）
  const handleBackToTitle = () => {
    resetAllAndGoHome();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-slate-900 text-slate-100 min-h-full flex items-center justify-center p-4"
    >
      <div className="max-w-2xl w-full space-y-6">
        {/* 見出し */}
        <div className="text-center">
          {resultType === 'clear' ? (
            <h1 className="text-4xl md:text-5xl font-bold text-green-400 mb-4">
              🎉 章クリア！
            </h1>
          ) : (
            <h1 className="text-4xl md:text-5xl font-bold text-red-400 mb-4">
              💔 国家は危機に…
            </h1>
          )}
        </div>

        {/* 結果メッセージ */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-white/20">
          <p className="text-base md:text-lg text-gray-200 leading-relaxed text-center mb-4">
            {resultMessage}
          </p>
          
          {/* ランク表示 */}
          {/* 評価ロジック共通化：共通のevaluation.tsで計算したrankを使用 */}
          {calculatedRank && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-400 mb-2">最終評価</p>
              <div className={`text-4xl md:text-5xl font-bold ${getRankLabel(calculatedRank).color}`}>
                {calculatedRank}ランク
              </div>
            </div>
          )}
          
          {/* エンディング種別 */}
          {/* 評価ロジック共通化：共通のevaluation.tsで計算したendingTypeを使用 */}
          {calculatedEndingType && (
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-400">
                {calculatedEndingType === 'balanced' && 'バランス型エンディング'}
                {calculatedEndingType === 'austerity' && '緊縮型エンディング'}
                {calculatedEndingType === 'debt_crisis' && '債務危機エンディング'}
                {calculatedEndingType === 'bankruptcy' && '財政破綻エンディング'}
              </p>
            </div>
          )}
        </div>

        {/* メーターの最終値 */}
        {meters.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-white/20">
            <h2 className="text-lg md:text-xl font-semibold text-blue-300 mb-4">
              最終メーター値
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {meters.map((meter) => {
                const isGood = (meter.id === 'price' || meter.id === 'unemployment') 
                  ? meter.value <= 50 
                  : meter.value >= 50;
                const isBad = (meter.id === 'price' || meter.id === 'unemployment')
                  ? meter.value >= 70
                  : meter.value <= 30;
                
                return (
                  <div key={meter.id} className="bg-white/5 p-3 rounded">
                    <p className="text-xs text-gray-400 mb-1">{meter.label}</p>
                    <p className={`text-lg font-bold ${
                      isGood ? 'text-green-400' :
                      isBad ? 'text-red-400' :
                      'text-gray-200'
                    }`}>
                      {meter.value}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {meter.id === 'treasury' && meter.value < 0 && '財政赤字'}
                      {meter.id === 'treasury' && meter.value >= 0 && meter.value < 50 && '財政不安定'}
                      {meter.id === 'treasury' && meter.value >= 50 && '財政健全'}
                      {meter.id === 'life' && meter.value < 30 && '生活困窮'}
                      {meter.id === 'life' && meter.value >= 30 && meter.value < 50 && '生活普通'}
                      {meter.id === 'life' && meter.value >= 50 && '生活良好'}
                      {meter.id === 'price' && meter.value > 70 && '物価高騰'}
                      {meter.id === 'price' && meter.value <= 70 && meter.value > 40 && '物価普通'}
                      {meter.id === 'price' && meter.value <= 40 && '物価安定'}
                      {meter.id === 'unemployment' && meter.value > 70 && '失業深刻'}
                      {meter.id === 'unemployment' && meter.value <= 70 && meter.value > 30 && '失業普通'}
                      {meter.id === 'unemployment' && meter.value <= 30 && '失業改善'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 簡単なまとめ */}
        {history.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-white/20 space-y-4">
            <h2 className="text-lg md:text-xl font-semibold text-blue-300 mb-4">
              プレイ結果
            </h2>

            {/* 章テーマとfocusMeters */}
            {currentScenario && (
              <div className="bg-white/5 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-400 mb-2">今回の章テーマ</p>
                <p className="text-base md:text-lg font-medium mb-3">
                  {getThemeLabel(currentScenario.theme)}
                </p>
                <p className="text-sm text-gray-400 mb-2">特に見るべき指標</p>
                <div className="flex flex-wrap gap-2">
                  {currentScenario.focusMeters.map((meterId) => (
                    <span
                      key={meterId}
                      className="px-2 py-1 bg-white/10 rounded text-xs"
                    >
                      {meterLabels[meterId]}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* プレイしたターン数 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="bg-white/5 p-3 rounded"
            >
              <p className="text-sm md:text-base font-medium mb-1">プレイしたターン数</p>
              <p className="text-base md:text-lg text-gray-200">
                {turn - 1}ターン / {maxTurns}ターン
              </p>
            </motion.div>

            {/* もっとも多く選んだアドバイザー */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="bg-white/5 p-3 rounded"
            >
              <p className="text-sm md:text-base font-medium mb-1">最も参考にしたアドバイザー</p>
              {advisorInfo ? (
                <div className="flex items-center gap-2">
                  <span className="text-xl">{advisorInfo.icon}</span>
                  <span className="text-base md:text-lg text-gray-200">
                    {advisorInfo.name} ({displayAdvisorCount}回)
                  </span>
                </div>
              ) : (
                <p className="text-sm text-gray-400">データがありません</p>
              )}
            </motion.div>

            {/* よく上げたメーター */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="bg-white/5 p-3 rounded"
            >
              <p className="text-sm md:text-base font-medium mb-1">最も改善している指標</p>
              <p className="text-base md:text-lg text-gray-200">
                {mostImprovedMeter.meter}
                {mostImprovedMeter.improvement > 0 && (
                  <span className="text-green-400 ml-2">
                    (+{displayImprovement.toFixed(0)})
                  </span>
                )}
              </p>
            </motion.div>

            {/* 難易度まとめ */}
            <div className="bg-white/5 p-4 rounded-lg border border-blue-400/30 mt-4">
              <h3 className="text-sm md:text-base font-semibold text-blue-300 mb-3">
                難易度まとめ
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">出現したイベントの種類数:</span>
                  <span className="text-gray-200 font-medium">
                    {difficultySummary.uniqueEventTypes}種類
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">平均イベント severity:</span>
                  <span className="text-gray-200 font-medium">
                    {difficultySummary.avgSeverity.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">行動フェーズ使用回数:</span>
                  <span className="text-gray-200 font-medium">
                    {difficultySummary.actionPhaseCount}回
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-xs text-gray-400 mb-1">プレイ評価:</p>
                  <p className="text-sm text-gray-200">{difficultySummary.playComment}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 統治タイプ診断 */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-purple-400/30"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{governanceType.icon}</span>
              <h2 className="text-xl md:text-2xl font-bold text-purple-300">
                あなたの統治タイプ
              </h2>
            </div>
            <p className="text-base md:text-lg font-semibold text-white mb-2">
              {governanceType.label}
            </p>
            <p className="text-sm md:text-base text-slate-300">
              {governanceType.description}
            </p>
          </motion.div>
        )}

        {/* 総合スコア表示 */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.3 }}
            className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-blue-400/30"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">📊</span>
              <h2 className="text-xl md:text-2xl font-bold text-blue-300">
                あなたの評価
              </h2>
            </div>
            <div className="flex items-center gap-4">
              {/* 評価ロジック共通化：共通のevaluation.tsで計算したrankを使用（overallScore.rankと統一） */}
              <div className={`text-5xl md:text-6xl font-bold ${overallScore.color}`}>
                {overallScore.rank}
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-white">
                  {displayScore}点
                </p>
                <p className={`text-base md:text-lg font-medium ${overallScore.color}`}>
                  {overallScore.label}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 国の未来テキスト */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.3 }}
            className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-green-400/30"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">📖</span>
              <h2 className="text-xl md:text-2xl font-bold text-green-300">
                ノヴァリア王国の未来
              </h2>
            </div>
            <p className="text-base md:text-lg text-slate-200 leading-relaxed">
              {endingNarrative}
            </p>
          </motion.div>
        )}

        {/* ボタン */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold text-base md:text-lg transition-all shadow-lg text-white"
          >
            同じ章でもう一度遊ぶ
          </button>
          <button
            onClick={handleBackToTitle}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold text-base md:text-lg transition-all shadow-lg text-white"
          >
            最初からやり直す
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

