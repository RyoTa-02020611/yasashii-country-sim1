/**
 * メインゲーム画面
 */
import { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { shallow } from 'zustand/shallow';
import { loadGame } from '../utils/saveGame';
import MeterPanel from '../components/Meter/MeterPanel';
import EventCard from '../components/Event/EventCard';
import AdvisorPanel from '../components/Advisor/AdvisorPanel';
import PolicyList from '../components/Policy/PolicyList';
import ReportPanel from '../components/Report/ReportPanel';
import TitleScreen from '../components/Layout/TitleScreen';
import ActionPanel from '../components/Action/ActionPanel';
import AppShell from '../components/Layout/AppShell';
import GuideOverlay from '../components/Tutorial/GuideOverlay';

// 遅延読み込み（React.lazy）
const ResultScreen = lazy(() => import('../components/Layout/ResultScreen'));
// Vercel build fix: TeacherDashboardは将来の教師モード機能用（現在は未使用）
// TODO: 教師モード機能実装時に有効化
// const TeacherDashboard = lazy(() => import('../components/Dashboard/TeacherDashboard'));

export default function Home() {
  // Vercel build fix: viewMode は将来の教師モード機能用に予約（現在は未使用）
  // TODO: 教師モード機能実装時に有効化
  // const [viewMode, setViewMode] = useState<'player' | 'teacher'>('player');
  const [isLoaded, setIsLoaded] = useState(false);

  // Zustand shallow 比較で必要な state のみ取得
  const phase = useGameStore((state) => state.phase, shallow);
  const meters = useGameStore((state) => state.meters, shallow);
  const currentEvent = useGameStore((state) => state.currentEvent);
  const availablePolicies = useGameStore((state) => state.availablePolicies);
  const advisorMessages = useGameStore((state) => state.advisorMessages, shallow);
  const actionPhase = useGameStore((state) => state.actionPhase);
  const tutorialStep = useGameStore((state) => state.tutorialStep);
  const turn = useGameStore((state) => state.turn);
  const maxTurns = useGameStore((state) => state.maxTurns);
  
  // アクション関数は shallow 不要（関数参照は安定）
  const applyPolicy = useGameStore((state) => state.applyPolicy);
  const nextEvent = useGameStore((state) => state.nextEvent);
  const endTurnAndCheckScenario = useGameStore((state) => state.endTurnAndCheckScenario);
  const hydrateFromSavedState = useGameStore((state) => state.hydrateFromSavedState);

  // 起動時にセーブデータをロード（依存配列を最適化）
  useEffect(() => {
    if (isLoaded) return;
    
    const saved = loadGame();
    if (saved && saved.phase !== 'title') {
      hydrateFromSavedState(saved);
    }
    
    setIsLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 初回のみ実行

  // コールバック関数を useCallback で最適化
  const handlePolicySelect = useCallback((policyId: string) => {
    applyPolicy(policyId);
  }, [applyPolicy]);

  const handleNextEvent = useCallback(() => {
    nextEvent();
    // ターン終了チェック（次のイベントへ進む = ターンが進む）
    endTurnAndCheckScenario();
  }, [nextEvent, endTurnAndCheckScenario]);

  // フェーズに応じて表示を切り替え（フェードアニメーション付き）
  if (phase === 'title') {
    return (
      <AppShell>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <TitleScreen />
        </motion.div>
      </AppShell>
    );
  }

  if (phase === 'result') {
    return (
      <AppShell>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-slate-300">読み込み中...</div>}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ResultScreen />
          </motion.div>
        </Suspense>
      </AppShell>
    );
  }

  // phase === 'playing' のときのゲーム画面

  // CFOフェーズ（Action Phase）の場合はActionPanelを表示
  if (phase === 'playing' && actionPhase) {
    return (
      <AppShell>
        <div className={tutorialStep === 4 ? 'ring-4 ring-yellow-400 z-50 relative' : ''}>
          <ActionPanel />
        </div>
        {tutorialStep && <GuideOverlay />}
      </AppShell>
    );
  }

  // Vercel build fix: 教師モード機能は将来実装予定（現在は未使用）
  // TODO: 教師モード機能実装時に有効化
  // if (phase === 'playing' && viewMode === 'teacher') {
  //   return (
  //     <AppShell>
  //       <div className="bg-slate-900 text-slate-100 min-h-full">
  //         <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-slate-300">読み込み中...</div>}>
  //           <TeacherDashboard />
  //         </Suspense>
  //       </div>
  //     </AppShell>
  //   );
  // }

  // phase === 'playing' のときのゲーム画面（プレイヤーモード）
  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-slate-900 text-slate-100 min-h-full"
      >

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* ターン数表示とゴール説明 */}
        <div className="mb-4 md:mb-6 bg-white/10 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-white/20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-blue-300 mb-2">
                ターン {turn} / {maxTurns}
              </h2>
              <p className="text-sm md:text-base text-gray-300">
                この章は {maxTurns} ターンで終了します。
              </p>
              <p className="text-xs md:text-sm text-gray-400 mt-1">
                クリア条件：{maxTurns} ターン目終了時点で 国庫残高 &gt;= 0、生活しやすさ &gt;= 50
              </p>
            </div>
          </div>
        </div>

        {/* PC: 横長レイアウト、スマホ: 縦並び */}
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
          {/* 左側: メーター + イベント + 政策 */}
          <div className="flex-1 space-y-4 md:space-y-6">
            {/* メーター */}
            <div className={`w-full ${tutorialStep === 3 ? 'ring-4 ring-yellow-400 z-50 relative' : ''}`}>
              <MeterPanel meters={meters} />
            </div>

            {/* イベント */}
            <div className={`bg-white/10 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-white/20 ${tutorialStep === 1 ? 'ring-4 ring-yellow-400 z-50 relative' : ''}`}>
              <h2 className="text-lg md:text-xl font-bold mb-3 flex items-center gap-2">
                📰 ニュース
              </h2>
              {currentEvent ? (
                <EventCard event={currentEvent} />
              ) : (
                <p className="text-gray-300">イベントがありません</p>
              )}
            </div>

            {/* 政策カード */}
            <div className={`bg-slate-800 rounded-lg p-4 md:p-6 border border-slate-700 ${tutorialStep === 2 ? 'ring-4 ring-yellow-400 z-50 relative' : ''}`}>
              <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2 text-slate-100">
                📋 政策を選択
              </h2>
              <PolicyList
                policies={availablePolicies}
                onSelect={handlePolicySelect}
              />
            </div>

            {/* 次のイベントへボタン */}
            <div className={`flex justify-center ${tutorialStep === 5 ? 'ring-4 ring-yellow-400 z-50 relative rounded-lg' : ''}`}>
              <button
                onClick={handleNextEvent}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-bold text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg text-white"
              >
                次のイベントへ
              </button>
            </div>
          </div>

          {/* 右側: アドバイザー + 振り返りレポート（PCのみ） */}
          <div className="lg:w-80 space-y-4 md:space-y-6">
            {/* アドバイザー */}
            <div className="bg-slate-800 rounded-lg p-4 md:p-6 border border-slate-700">
              <h2 className="text-lg md:text-xl font-bold mb-3 flex items-center gap-2 text-slate-100">
                💬 アドバイザーの意見
              </h2>
              <AdvisorPanel messages={advisorMessages} />
            </div>

            {/* 振り返りレポート */}
            <ReportPanel />
          </div>
        </div>
      </div>
      </motion.div>
      
      {/* チュートリアルオーバーレイ */}
      {tutorialStep && <GuideOverlay />}
    </AppShell>
  );
}

