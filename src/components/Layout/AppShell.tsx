/**
 * アプリケーション共通レイアウト（ヘッダー＆フッター）
 */
import { useState, useEffect, ReactNode } from 'react';
import { useGameStore } from '../../store/useGameStore';
import TutorialModal from '../Guide/TutorialModal';
import DebugPanel from '../Debug/DebugPanel';
import CheatPanel from '../Debug/CheatPanel';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { currentScenario, phase, debugMode, toggleDebugMode } = useGameStore();
  const [showTutorial, setShowTutorial] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  // 初回アクセス時のチュートリアル自動表示
  useEffect(() => {
    const tutorialShown = localStorage.getItem('nova_tutorial_shown');
    if (!tutorialShown) {
      setIsFirstVisit(true);
      setShowTutorial(true);
      localStorage.setItem('nova_tutorial_shown', 'true');
    }
  }, []);

  const handleShowTutorial = () => {
    setShowTutorial(true);
  };

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    setIsFirstVisit(false);
  };

  // キーボードショートカットでデバッグモードをON/OFF（依存配列を最適化）
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl + D または D キーでデバッグモードを切り替え
      if ((e.ctrlKey && e.key === 'd') || e.key === 'D') {
        e.preventDefault();
        toggleDebugMode();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
    // toggleDebugMode は関数参照が安定しているため依存配列に含めない
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* ヘッダー */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 md:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl md:text-2xl font-bold text-slate-100">
              🌍 やさしい国家運営ゲーム
            </h1>
            {currentScenario && phase === 'playing' && (
              <span className="text-sm md:text-base text-slate-300 px-3 py-1 bg-slate-700 rounded-lg">
                {currentScenario.title}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {/* モード表示は各画面で管理 */}
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1">
        {children}
      </main>

      {/* フッター */}
      <footer className="bg-slate-800 border-t border-slate-700 px-4 md:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-xs md:text-sm text-slate-400">
            © Nova Nation Lab
          </p>
          <button
            onClick={handleShowTutorial}
            className="text-xs md:text-sm px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-slate-100"
          >
            遊び方を見る
          </button>
        </div>
      </footer>

      {/* チュートリアルモーダル */}
      {showTutorial && (
        <TutorialModal onClose={handleCloseTutorial} isFirstVisit={isFirstVisit} />
      )}

      {/* デバッグパネル */}
      <DebugPanel />

      {/* チートパネル（開発者向け） */}
      <CheatPanel />

      {/* デバッグモード表示ラベル */}
      {debugMode && (
        <div className="fixed top-4 right-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg px-3 py-1 text-xs text-yellow-300 z-50">
          Debug: ON
        </div>
      )}
    </div>
  );
}

