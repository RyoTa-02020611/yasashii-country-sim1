/**
 * タイトル画面
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { scenarios } from '../../data/scenarios';
import { ScenarioTheme } from '../../types/game';
import { loadGame, clearSavedGame } from '../../utils/saveGame';

export default function TitleScreen() {
  // Zustand shallow 比較で必要な関数のみ取得
  const startScenario = useGameStore((state) => state.startScenario);
  const hydrateFromSavedState = useGameStore((state) => state.hydrateFromSavedState);
  const resetGame = useGameStore((state) => state.resetGame);
  const startTutorial = useGameStore((state) => state.startTutorial);
  const [hasSaveData, setHasSaveData] = useState(false);
  const [saveTimestamp, setSaveTimestamp] = useState<number | null>(null);

  // セーブデータの有無をチェック
  useEffect(() => {
    const saved = loadGame();
    if (saved && saved.phase !== 'title') {
      setHasSaveData(true);
      setSaveTimestamp(saved.timestamp);
    } else {
      setHasSaveData(false);
      setSaveTimestamp(null);
    }
  }, []);

  const handleContinue = () => {
    const saved = loadGame();
    if (saved) {
      hydrateFromSavedState(saved);
    }
  };

  const handleClearSave = () => {
    if (confirm('セーブデータを削除して最初からやり直しますか？')) {
      clearSavedGame();
      resetGame();
      setHasSaveData(false);
      setSaveTimestamp(null);
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const handleStartScenario = (scenarioId: string) => {
    startScenario(scenarioId as any);
  };

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

  const getThemeColor = (theme: ScenarioTheme): string => {
    const themeColors: Record<ScenarioTheme, string> = {
      inflation: 'from-red-500 to-orange-500',
      unemployment: 'from-yellow-500 to-amber-500',
      fiscal: 'from-blue-500 to-cyan-500',
      diplomacy: 'from-green-500 to-emerald-500',
      mixed: 'from-purple-500 to-pink-500',
    };
    return themeColors[theme];
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-slate-900 text-slate-100 p-4 md:p-6 min-h-full"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ゲームタイトル */}
        <div className="text-center space-y-4">
          {/* アプリアイコン */}
          <div className="flex justify-center mb-4">
            <img 
              src="/icon-192.png" 
              alt="ノヴァリア王国の国章" 
              className="w-16 h-16 md:w-20 md:h-20 mx-auto"
              onError={(e) => {
                // アイコンが読み込めない場合は絵文字を表示
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                if (target.parentElement) {
                  target.parentElement.innerHTML = '<span class="text-6xl md:text-8xl">🌍</span>';
                }
              }}
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold">
            やさしい国家運営ゲーム
          </h1>
          <p className="text-xl md:text-2xl text-gray-200">
            ノヴァリア王国を運営しよう
          </p>
        </div>

        {/* 説明文 */}
        <div className="bg-slate-800 rounded-lg p-6 md:p-8 border border-slate-700">
          <h2 className="text-lg md:text-xl font-semibold text-yellow-300 mb-3">
            ゲームの目的
          </h2>
          <p className="text-sm md:text-base text-slate-200 leading-relaxed">
            あなたはノヴァリア王国の統治者です。
            <br />
            6人のアドバイザーの意見を参考にしながら、
            <br />
            政策を選択して国を運営していきましょう。
            <br />
            <br />
            物価・失業率・生活しやすさ・国庫残高の4つの指標を
            <br />
            バランスよく管理することが重要です。
          </p>
        </div>

        {/* セーブデータ操作 */}
        <div className="bg-slate-800 rounded-lg p-6 md:p-8 border border-slate-700">
          <h2 className="text-lg md:text-xl font-semibold text-blue-300 mb-4">
            ゲームを開始
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleContinue}
              disabled={!hasSaveData}
              className={`
                px-6 py-3 rounded-lg font-bold text-base md:text-lg transition-all shadow-lg
                ${hasSaveData
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                  : 'bg-slate-600/50 text-slate-400 cursor-not-allowed'
                }
              `}
            >
              続きから
            </button>
            {hasSaveData && saveTimestamp && (
              <div className="flex items-center text-sm text-slate-300">
                <span>最終セーブ: {formatTimestamp(saveTimestamp)}</span>
              </div>
            )}
          </div>
          {hasSaveData && (
            <button
              onClick={handleClearSave}
              className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm text-red-300 border border-red-400/50 transition-all"
            >
              セーブデータを消して最初からやり直す
            </button>
          )}
          <button
            onClick={startTutorial}
            className="mt-4 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg text-sm text-yellow-300 border border-yellow-400/50 transition-all"
          >
            もう一度チュートリアルを見直す
          </button>
        </div>

        {/* 章選択 */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-center mb-6">
            章を選択してください
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenarios.map((scenario, index) => (
              <motion.button
                key={scenario.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleStartScenario(scenario.id)}
                className={`
                  bg-slate-800 rounded-lg p-5 md:p-6 border border-slate-700
                  hover:bg-slate-700 hover:border-slate-600 transition-all
                  text-left
                `}
              >
                {/* テーマバッジ */}
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`
                      px-3 py-1 rounded-full text-xs font-semibold
                      bg-gradient-to-r ${getThemeColor(scenario.theme)}
                    `}
                  >
                    {getThemeLabel(scenario.theme)}
                  </span>
                  <span className="text-xs text-slate-400">
                    {scenario.maxTurns}ターン
                  </span>
                </div>

                {/* 章タイトル */}
                <h3 className="text-lg md:text-xl font-bold mb-2 text-slate-100">
                  {scenario.title}
                </h3>

                {/* 説明文 */}
                <p className="text-sm text-slate-300 mb-3 leading-relaxed">
                  {scenario.description}
                </p>

                {/* 主な学習テーマ */}
                <div className="mt-4 pt-3 border-t border-slate-600">
                  <p className="text-xs text-slate-400 mb-1">特に見るべき指標</p>
                  <div className="flex flex-wrap gap-2">
                    {scenario.focusMeters.map((meterId) => {
                      const meterLabels: Record<string, string> = {
                        price: '物価',
                        unemployment: '失業率',
                        life: '生活しやすさ',
                        treasury: '国庫残高',
                      };
                      return (
                    <span
                      key={meterId}
                      className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-200"
                    >
                      {meterLabels[meterId]}
                    </span>
                      );
                    })}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* フッター */}
        <p className="text-xs text-gray-400 text-center mt-8">
          高校生でも遊べる国家運営ゲーム
        </p>
      </div>
    </motion.div>
  );
}
