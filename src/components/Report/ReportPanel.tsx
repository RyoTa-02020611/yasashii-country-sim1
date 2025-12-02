/**
 * 振り返りレポートパネル
 */
import { useGameStore } from '../../store/useGameStore';
import { AdvisorId } from '../../types/game';
import { advisors } from '../../data/advisors';

export default function ReportPanel() {
  const { turn, maxTurns, history, currentSummary } = useGameStore();

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

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-white/20">
      <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
        📊 振り返りレポート
      </h2>

      {/* ターン数表示 */}
      <div className="mb-4 bg-white/5 p-3 rounded border border-blue-400/30">
        <p className="text-xs md:text-sm font-medium mb-1 text-blue-300">現在のターン数</p>
        <p className="text-base md:text-lg text-gray-200">
          ターン {turn} / {maxTurns}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          残り {maxTurns - turn + 1} ターン
        </p>
      </div>

      {/* 現在ターンのサマリー */}
      <div className="mb-6">
        <h3 className="text-sm md:text-base font-semibold mb-2 text-yellow-300">
          ターン {turn} の振り返り
        </h3>
        {currentSummary ? (
          <p className="text-xs md:text-sm text-gray-200 leading-relaxed bg-white/5 p-3 rounded">
            {currentSummary}
          </p>
        ) : (
          <p className="text-xs text-gray-400">まだ政策を選択していません</p>
        )}
      </div>

      {/* これまでの傾向 */}
      {history.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm md:text-base font-semibold mb-3 text-blue-300">
            これまでの傾向
          </h3>

          {/* もっとも多く選んだアドバイザー */}
          <div className="bg-white/5 p-3 rounded">
            <p className="text-xs md:text-sm font-medium mb-1">最も参考にしたアドバイザー</p>
            {advisorInfo ? (
              <div className="flex items-center gap-2">
                <span className="text-lg">{advisorInfo.icon}</span>
                <span className="text-xs md:text-sm text-gray-200">
                  {advisorInfo.name} ({mostSelectedAdvisor.count}回)
                </span>
              </div>
            ) : (
              <p className="text-xs text-gray-400">データがありません</p>
            )}
          </div>

          {/* よく上げているメーター */}
          <div className="bg-white/5 p-3 rounded">
            <p className="text-xs md:text-sm font-medium mb-1">最も改善している指標</p>
            <p className="text-xs md:text-sm text-gray-200">
              {mostImprovedMeter.meter}
              {mostImprovedMeter.improvement > 0 && (
                <span className="text-green-400 ml-2">
                  (+{mostImprovedMeter.improvement.toFixed(1)})
                </span>
              )}
            </p>
          </div>

          {/* 総ターン数 */}
          <div className="bg-white/5 p-3 rounded">
            <p className="text-xs md:text-sm font-medium mb-1">総ターン数</p>
            <p className="text-xs md:text-sm text-gray-200">{history.length}ターン</p>
          </div>
        </div>
      )}

      {history.length === 0 && (
        <div className="text-center py-4 text-gray-400">
          <p className="text-xs">政策を選択すると、振り返りレポートが表示されます</p>
        </div>
      )}
    </div>
  );
}

