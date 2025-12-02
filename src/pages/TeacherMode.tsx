/**
 * 教師モード画面
 * PINコードで保護された設定画面
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { useTeacherSettingsStore } from '../store/teacherSettingsStore';

const TEACHER_PIN = '1234';

// 章のターン数設定コンポーネント
function ChapterTurnsSettings() {
  const { chapters, setChapterTurns, resetChapterTurns } = useTeacherSettingsStore();
  const [localValues, setLocalValues] = useState<Record<string, number>>({});

  // ローカル状態を初期化（カスタム値があればそれ、なければデフォルト値）
  useEffect(() => {
    const initialValues: Record<string, number> = {};
    chapters.forEach((chapter) => {
      initialValues[chapter.chapterId] = chapter.customTurns ?? chapter.defaultTurns;
    });
    setLocalValues(initialValues);
  }, [chapters]);

  const handleTurnsChange = (chapterId: string, value: string) => {
    const numValue = parseInt(value, 10);
    
    // バリデーション：5-20の範囲に丸める
    let validValue = numValue;
    if (isNaN(validValue) || validValue < 5) {
      validValue = 5;
    } else if (validValue > 20) {
      validValue = 20;
    }

    // ローカル状態を更新
    setLocalValues((prev) => ({
      ...prev,
      [chapterId]: validValue,
    }));

    // ストアに保存
    setChapterTurns(chapterId, validValue);
  };

  const handleReset = () => {
    if (confirm('すべての章のターン数をデフォルト値に戻しますか？')) {
      resetChapterTurns();
      // ローカル状態もリセット
      const defaultValues: Record<string, number> = {};
      chapters.forEach((chapter) => {
        defaultValues[chapter.chapterId] = chapter.defaultTurns;
      });
      setLocalValues(defaultValues);
    }
  };

  return (
    <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600/50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">📊 章のターン数を変更</h2>
        <button
          onClick={handleReset}
          className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-sm transition-colors"
        >
          デフォルトに戻す
        </button>
      </div>
      <p className="text-sm text-slate-300 mb-4">
        各章のターン数をカスタマイズできます（5〜20ターンの範囲）
      </p>
      
      <div className="space-y-3">
        {chapters.map((chapter) => {
          const currentValue = localValues[chapter.chapterId] ?? (chapter.customTurns ?? chapter.defaultTurns);
          const isCustom = chapter.customTurns !== undefined;
          
          return (
            <div
              key={chapter.chapterId}
              className="flex items-center justify-between p-3 bg-slate-800/50 rounded border border-slate-600/30"
            >
              <div className="flex-1">
                <label className="text-sm font-medium text-slate-200">
                  {chapter.title}
                </label>
                {isCustom && (
                  <span className="ml-2 text-xs text-yellow-400">（カスタム設定）</span>
                )}
                {!isCustom && (
                  <span className="ml-2 text-xs text-slate-400">（デフォルト: {chapter.defaultTurns}ターン）</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={5}
                  max={20}
                  value={currentValue}
                  onChange={(e) => handleTurnsChange(chapter.chapterId, e.target.value)}
                  className="w-20 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-300">ターン</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TeacherMode() {
  const navigate = useNavigate();
  const resetGame = useGameStore((state) => state.resetGame);
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (pin === TEACHER_PIN) {
      setIsAuthenticated(true);
    } else {
      setError('PINコードが正しくありません');
      setPin('');
    }
  };

  const handleBackToHome = () => {
    // ゲーム状態をリセットしてからホームに戻る
    resetGame();
    navigate('/');
  };

  // PIN認証画面
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-md w-full border border-slate-600/50"
        >
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">👩‍🏫</div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">教師モード</h1>
            <p className="text-sm text-slate-300">PINコードを入力してください</p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError('');
                }}
                placeholder="PINコード"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={4}
                autoFocus
              />
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm mt-2 text-center"
                >
                  {error}
                </motion.p>
              )}
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-lg transition-colors shadow-lg"
            >
              OK
            </button>
          </form>

          <button
            onClick={handleBackToHome}
            className="mt-4 w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
          >
            ホームに戻る
          </button>
        </motion.div>
      </div>
    );
  }

  // 教師モードメニュー画面
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-slate-600/50"
        >
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">👩‍🏫</div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">教師モードメニュー</h1>
            <p className="text-sm text-slate-300">ゲーム設定を変更できます</p>
          </div>

          {/* メニュー項目 */}
          <div className="space-y-4 mb-8">
            {/* 章のターン数変更セクション */}
            <ChapterTurnsSettings />

            <button
              onClick={() => {
                alert('この機能は現在準備中です：物価・失業率・生活しやすさ・国庫残高などの初期値を調整できる予定です。');
              }}
              className="w-full text-left bg-slate-700/50 rounded-lg p-4 border border-slate-600/50 hover:bg-slate-800/70 hover:border-slate-500/70 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all cursor-pointer hover:translate-y-[-2px] active:translate-y-0"
            >
              <h2 className="text-lg font-semibold mb-2">⚙️ 初期パラメータ変更</h2>
              <p className="text-sm text-slate-300">（実装予定）メーターの初期値を調整できます</p>
            </button>

            <button
              onClick={() => {
                alert('この機能は現在準備中です：特定のイベントをON/OFFできる予定です。');
              }}
              className="w-full text-left bg-slate-700/50 rounded-lg p-4 border border-slate-600/50 hover:bg-slate-800/70 hover:border-slate-500/70 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all cursor-pointer hover:translate-y-[-2px] active:translate-y-0"
            >
              <h2 className="text-lg font-semibold mb-2">🎲 イベント設定（ON/OFF）</h2>
              <p className="text-sm text-slate-300">（実装予定）特定のイベントの発生を制御できます</p>
            </button>
          </div>

          {/* ホームに戻るボタン */}
          <div className="flex justify-center">
            <button
              onClick={handleBackToHome}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-lg transition-colors shadow-lg"
            >
              ホームに戻る
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

