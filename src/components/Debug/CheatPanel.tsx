/**
 * 開発者向けチートパネル
 * 本番環境（Vercel）では cheat panel は表示されません
 */
import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { events } from '../../data/events';
import { scenarios } from '../../data/scenarios';
import { MeterType, ScenarioId } from '../../types/game';

export default function CheatPanel() {
  const {
    debugMode,
    meters,
    setMeterValue,
    forceEvent,
    skipToScenario,
    endTurnAndCheckScenario,
    testETF,
    testDiplomacy,
    testSurvey,
    testIndustry,
    resetGame,
  } = useGameStore();

  const [selectedEventId, setSelectedEventId] = useState<string>('');
  // メーター入力値を現在の値で初期化・同期
  const [meterInputs, setMeterInputs] = useState<Record<MeterType, number>>(() => {
    const initial: Record<MeterType, number> = {
      price: 50,
      unemployment: 50,
      life: 50,
      treasury: 50,
    };
    meters.forEach((meter) => {
      initial[meter.id as MeterType] = meter.value;
    });
    return initial;
  });

  // メーター値が変更されたら入力値も更新
  useEffect(() => {
    const newInputs: Record<MeterType, number> = { ...meterInputs };
    meters.forEach((meter) => {
      newInputs[meter.id as MeterType] = meter.value;
    });
    setMeterInputs(newInputs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meters]);

  // 本番環境では表示しない（セキュリティ）
  // 本番環境（Vercel）では cheat panel は表示されません
  const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';
  if (!debugMode || !isDev) return null;

  const meterLabels: Record<MeterType, string> = {
    price: '物価',
    unemployment: '失業率',
    life: '生活しやすさ',
    treasury: '国庫残高',
  };

  const handleMeterChange = (meterId: MeterType, value: number) => {
    setMeterInputs((prev) => ({ ...prev, [meterId]: value }));
    setMeterValue(meterId, value);
  };

  const handleForceEvent = () => {
    if (!selectedEventId) return;
    forceEvent(selectedEventId);
    setSelectedEventId('');
  };

  return (
    <div className="fixed bottom-4 left-4 w-80 max-h-96 bg-black/40 backdrop-blur-sm border border-yellow-500/50 rounded-md p-3 text-xs text-white shadow-2xl z-50 overflow-y-auto">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-yellow-500/30">
        <h3 className="text-sm font-bold text-yellow-400">⚡ Cheat Panel</h3>
        <span className="text-xs text-red-400">DEV ONLY</span>
      </div>

      {/* メーター編集 */}
      <div className="mb-3 space-y-2">
        <div className="text-xs font-semibold text-yellow-300 mb-1">メーター編集</div>
        {meters.map((meter) => (
          <div key={meter.id} className="flex items-center gap-2">
            <label className="text-xs w-20 text-slate-300">
              {meterLabels[meter.id]}:
            </label>
            <input
              type="number"
              min={meter.min}
              max={meter.max}
              value={meterInputs[meter.id]}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10) || 0;
                handleMeterChange(meter.id as MeterType, value);
              }}
              className="w-16 px-1 py-0.5 bg-slate-800 border border-slate-600 rounded text-xs text-white"
            />
            <button
              onClick={() => handleMeterChange(meter.id as MeterType, 50)}
              className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 rounded text-xs"
            >
              50
            </button>
            <button
              onClick={() => handleMeterChange(meter.id as MeterType, meter.max)}
              className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 rounded text-xs"
            >
              MAX
            </button>
          </div>
        ))}
      </div>

      {/* イベント強制発火 */}
      <div className="mb-3">
        <div className="text-xs font-semibold text-yellow-300 mb-1">イベント強制発火</div>
        <div className="flex gap-2">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="flex-1 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs text-white"
          >
            <option value="">選択してください</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
          <button
            onClick={handleForceEvent}
            disabled={!selectedEventId}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded text-xs"
          >
            発火
          </button>
        </div>
      </div>

      {/* ターンスキップ */}
      <div className="mb-3">
        <div className="text-xs font-semibold text-yellow-300 mb-1">ターン操作</div>
        <button
          onClick={endTurnAndCheckScenario}
          className="w-full px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
        >
          ターンを進める
        </button>
      </div>

      {/* シナリオスキップ */}
      <div className="mb-3">
        <div className="text-xs font-semibold text-yellow-300 mb-1">シナリオスキップ</div>
        <div className="grid grid-cols-2 gap-1">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => skipToScenario(scenario.id)}
              className="px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs truncate"
              title={scenario.title}
            >
              {scenario.id}
            </button>
          ))}
        </div>
      </div>

      {/* CFO行動テスト */}
      <div className="mb-3">
        <div className="text-xs font-semibold text-yellow-300 mb-1">CFO行動テスト</div>
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={testETF}
            className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-xs"
          >
            ETF
          </button>
          <button
            onClick={testDiplomacy}
            className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-xs"
          >
            外交
          </button>
          <button
            onClick={testSurvey}
            className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-xs"
          >
            調査
          </button>
          <button
            onClick={testIndustry}
            className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-xs"
          >
            産業
          </button>
        </div>
      </div>

      {/* ゲームリセット */}
      <div className="pt-2 border-t border-yellow-500/30">
        <button
          onClick={resetGame}
          className="w-full px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs font-bold"
        >
          ゲームリセット
        </button>
      </div>
    </div>
  );
}

