/**
 * デバッグパネルコンポーネント
 */
import { useGameStore } from '../../store/useGameStore';
import { policies } from '../../data/policies';

export default function DebugPanel() {
  const {
    debugMode,
    currentScenario,
    turn,
    meters,
    currentEvent,
    history,
    selectedAction,
    activeIndustryProjects,
    debugLog,
  } = useGameStore();

  if (!debugMode) return null;

  // 直近の政策IDとタイトル
  const lastPolicy = history.length > 0 ? history[history.length - 1] : null;
  const lastPolicyTitle = lastPolicy?.selectedPolicyId
    ? policies.find((p) => p.id === lastPolicy.selectedPolicyId)?.name || lastPolicy.selectedPolicyId
    : 'なし';

  // 最新のデバッグログ（最新20件）
  const recentLogs = debugLog.slice(-20);

  return (
    <div className="fixed bottom-4 right-4 w-80 max-h-96 bg-slate-800/95 backdrop-blur-sm border border-slate-600 rounded-lg p-3 text-xs text-slate-200 shadow-2xl z-50 overflow-y-auto">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-600">
        <h3 className="text-sm font-bold text-yellow-400">🐛 Debug Panel</h3>
        <span className="text-xs text-green-400">ON</span>
      </div>

      {/* 基本情報 */}
      <div className="mb-3 space-y-1">
        <div>
          <span className="text-slate-400">シナリオ:</span>{' '}
          <span className="text-slate-200">{currentScenario?.id || 'なし'}</span>
        </div>
        <div>
          <span className="text-slate-400">ターン:</span>{' '}
          <span className="text-slate-200">{turn}</span>
        </div>
      </div>

      {/* メーター値 */}
      <div className="mb-3 space-y-1">
        <div className="text-slate-400 font-semibold mb-1">メーター値:</div>
        {meters.map((meter) => (
          <div key={meter.id} className="flex justify-between">
            <span className="text-slate-300">{meter.label}:</span>
            <span className="text-slate-100 font-mono">{meter.value}</span>
          </div>
        ))}
      </div>

      {/* 直近のイベント */}
      <div className="mb-3">
        <div className="text-slate-400 font-semibold mb-1">直近イベント:</div>
        <div className="text-slate-200 truncate" title={currentEvent?.title}>
          {currentEvent ? `${currentEvent.id}: ${currentEvent.title}` : 'なし'}
        </div>
      </div>

      {/* 直近の政策 */}
      <div className="mb-3">
        <div className="text-slate-400 font-semibold mb-1">直近政策:</div>
        <div className="text-slate-200 truncate">
          {lastPolicyTitle}
        </div>
      </div>

      {/* 直近のCFO行動 */}
      <div className="mb-3">
        <div className="text-slate-400 font-semibold mb-1">直近CFO行動:</div>
        <div className="text-slate-200">
          {selectedAction || 'なし'}
        </div>
      </div>

      {/* 産業プロジェクト */}
      <div className="mb-3">
        <div className="text-slate-400 font-semibold mb-1">産業プロジェクト:</div>
        <div className="text-slate-200">
          {activeIndustryProjects.length}件
          {activeIndustryProjects.length > 0 && (
            <div className="mt-1 space-y-0.5 text-xs">
              {activeIndustryProjects.map((p) => (
                <div key={p.id} className="truncate">
                  {p.name} (遅延:{p.remainingDelay}, 継続:{p.remainingDuration})
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* デバッグログ */}
      <div className="mt-3 pt-2 border-t border-slate-600">
        <div className="text-slate-400 font-semibold mb-1">ログ (最新20件):</div>
        <div className="space-y-0.5 max-h-32 overflow-y-auto font-mono text-xs">
          {recentLogs.length > 0 ? (
            recentLogs.map((log, index) => (
              <div key={index} className="text-slate-300 break-words">
                {log}
              </div>
            ))
          ) : (
            <div className="text-slate-500">ログなし</div>
          )}
        </div>
      </div>
    </div>
  );
}

