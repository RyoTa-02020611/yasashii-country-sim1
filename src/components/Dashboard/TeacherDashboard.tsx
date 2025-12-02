/**
 * 教師向けダッシュボード
 */
import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { buildPlayerSummary } from '../../utils/summary';
import { advisors } from '../../data/advisors';
import { MeterType, ScenarioTheme } from '../../types/game';
import { loadGame } from '../../utils/saveGame';

export default function TeacherDashboard() {
  const { history, currentScenario, actionLog, debugLog } = useGameStore();
  const [saveInfo, setSaveInfo] = useState<{ timestamp: number; resumeCount: number } | null>(null);

  // デバッグログをコピー
  const handleCopyDebugLog = async () => {
    const logText = debugLog.join('\n');
    try {
      await navigator.clipboard.writeText(logText);
      alert('デバッグログをクリップボードにコピーしました。');
    } catch (err) {
      console.error('Failed to copy debug log', err);
      alert('ログのコピーに失敗しました。');
    }
  };

  // セーブ情報を取得
  useEffect(() => {
    const saved = loadGame();
    if (saved) {
      // 簡易的な再開回数カウント（localStorageに別途保存する想定だが、今回は簡易実装）
      const resumeCountKey = 'nova_nation_resume_count';
      let resumeCount = parseInt(localStorage.getItem(resumeCountKey) || '0', 10);
      resumeCount += 1;
      localStorage.setItem(resumeCountKey, resumeCount.toString());
      
      setSaveInfo({
        timestamp: saved.timestamp,
        resumeCount,
      });
    }
  }, []);

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // 履歴がない場合はメッセージを表示
  if (history.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
            <h2 className="text-2xl font-bold mb-4">📊 教師向けダッシュボード</h2>
            <p className="text-gray-300">
              プレイ履歴がありません。ゲームをプレイすると、ここに分析結果が表示されます。
            </p>
          </div>
        </div>
      </div>
    );
  }

  const summary = buildPlayerSummary(history);
  const mostUsedAdvisor = summary.mostUsedAdvisorId
    ? advisors.find((a) => a.id === summary.mostUsedAdvisorId)
    : null;

  const meterLabels: Record<MeterType, string> = {
    price: '物価',
    unemployment: '失業率',
    life: '生活しやすさ',
    treasury: '国庫残高',
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

  return (
    <div className="bg-slate-900 text-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="bg-slate-800 rounded-lg p-4 md:p-6 border border-slate-700">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-slate-100">📊 教師向けダッシュボード</h1>
          <p className="text-sm md:text-base text-slate-300">
            このプレイでの判断傾向を分析した結果です
          </p>
        </div>

        {/* デバッグログコピー（開発者向け） */}
        {debugLog.length > 0 && (
          <div className="bg-slate-800 rounded-lg p-4 md:p-6 border border-slate-700">
            <h2 className="text-lg md:text-xl font-semibold mb-4 text-yellow-300">
              🐛 デバッグログ
            </h2>
            <p className="text-sm text-slate-300 mb-3">
              バグ報告用にこのログをコピーして共有してください。
            </p>
            <button
              onClick={handleCopyDebugLog}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm text-white transition-colors"
            >
              デバッグログをコピー
            </button>
          </div>
        )}

        {/* 授業で使うときのヒント */}
        <div className="bg-slate-800 rounded-lg p-4 md:p-6 border border-slate-700">
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-blue-300">
            📚 授業で使うときのヒント
          </h2>
          <div className="space-y-2 text-slate-200">
            <p className="font-semibold text-slate-100 mb-2">各章の学習テーマ：</p>
            <ul className="list-disc list-inside space-y-1 text-sm md:text-base">
              <li><strong>1章：</strong>ゲームの基本に慣れる</li>
              <li><strong>2章：</strong>インフレと物価</li>
              <li><strong>3章：</strong>失業と景気</li>
              <li><strong>4章：</strong>財政と借金</li>
              <li><strong>5章：</strong>外交と資源</li>
              <li><strong>最終章：</strong>総復習</li>
            </ul>
            <p className="text-xs md:text-sm text-slate-400 mt-3">
              ※ 各章は独立してプレイできます。授業の進度に合わせて選択してください。
            </p>
          </div>
        </div>

        {/* 基本情報 */}
        <div className="bg-slate-800 rounded-lg p-4 md:p-6 border border-slate-700">
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-blue-300">基本情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">プレイした章</p>
              <p className="text-base md:text-lg font-medium text-slate-100">
                {currentScenario?.title || '不明'}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">プレイしたターン数</p>
              <p className="text-base md:text-lg font-medium text-slate-100">{summary.totalTurns}ターン</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">市民調査アクション使用回数</p>
              <p className="text-base md:text-lg font-medium text-slate-100">
                {actionLog.filter((log) => log.includes('市民調査')).length}回
              </p>
            </div>
          </div>

          {/* セーブ情報 */}
          {saveInfo && (
            <div className="bg-slate-700/50 p-4 rounded-lg mt-4 border border-blue-400/30">
              <p className="text-sm text-slate-400 mb-2">セーブ情報</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">最後にセーブした日時</p>
                  <p className="text-sm text-slate-200">
                    {formatTimestamp(saveInfo.timestamp)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">プレイ再開回数</p>
                  <p className="text-sm text-slate-200">
                    {saveInfo.resumeCount}回
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* 章テーマとfocusMeters */}
          {currentScenario && (
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <p className="text-sm text-slate-400 mb-2">今回の章テーマ</p>
              <p className="text-base md:text-lg font-medium mb-3 text-slate-100">
                {getThemeLabel(currentScenario.theme)}
              </p>
              <p className="text-sm text-slate-400 mb-2">特に見るべき指標</p>
              <div className="flex flex-wrap gap-2">
                {currentScenario.focusMeters.map((meterId) => (
                  <span
                    key={meterId}
                    className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-200"
                  >
                    {meterLabels[meterId]}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PC: 2カラム、スマホ: 1カラム */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左側: 判断傾向（アドバイザー） */}
          <div className="space-y-4">
            <div className="bg-slate-800 rounded-lg p-4 md:p-6 border border-slate-700">
              <h2 className="text-lg md:text-xl font-semibold mb-4 text-green-300">
                判断傾向（アドバイザー）
              </h2>

              {/* もっとも多く採用したアドバイザー */}
              {mostUsedAdvisor ? (
                <div className="bg-slate-700/50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-slate-400 mb-2">最も多く採用したアドバイザー</p>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{mostUsedAdvisor.icon}</span>
                    <div>
                      <p className="text-lg md:text-xl font-semibold text-slate-100">{mostUsedAdvisor.name}</p>
                      <p className="text-xs md:text-sm text-slate-300">
                        {summary.advisorUseCount[summary.mostUsedAdvisorId!]}回採用
                      </p>
                      <p className="text-xs md:text-sm text-slate-400 mt-1">
                        {mostUsedAdvisor.description}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400 mb-4">アドバイザーの採用データがありません</p>
              )}

              {/* 各アドバイザーの採用回数 */}
              <div>
                <p className="text-sm font-medium mb-2 text-slate-300">各アドバイザーの採用回数</p>
                <div className="space-y-2">
                  {(Object.entries(summary.advisorUseCount) as [AdvisorId, number][]).map(
                    ([advisorId, count]) => {
                      const advisor = advisors.find((a) => a.id === advisorId);
                      if (!advisor) return null;

                      return (
                        <div
                          key={advisorId}
                          className="flex items-center justify-between bg-slate-700/50 p-2 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{advisor.icon}</span>
                            <span className="text-sm md:text-base text-slate-200">{advisor.name}</span>
                          </div>
                          <span className="text-sm md:text-base font-medium text-slate-100">{count}回</span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 右側: 判断傾向（指標）＋ 典型的なミスパターン */}
          <div className="space-y-4">
            {/* 判断傾向（指標） */}
            <div className="bg-slate-800 rounded-lg p-4 md:p-6 border border-slate-700">
              <h2 className="text-lg md:text-xl font-semibold mb-4 text-yellow-300">
                判断傾向（指標）
              </h2>

              {/* メーター変化のテーブル */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm md:text-base">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="text-left py-2 px-2 text-slate-300">指標</th>
                      <th className="text-right py-2 px-2 text-green-400">改善量</th>
                      <th className="text-right py-2 px-2 text-red-400">悪化量</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Object.entries(summary.meterChangeSummary) as [MeterType, { increaseTotal: number; decreaseTotal: number }][]).map(
                      ([meterType, changes]) => (
                        <tr key={meterType} className="border-b border-slate-600">
                          <td className="py-2 px-2 text-slate-200">{meterLabels[meterType]}</td>
                          <td className="text-right py-2 px-2 text-green-400">
                            {meterType === 'price' || meterType === 'unemployment'
                              ? changes.decreaseTotal.toFixed(1)
                              : changes.increaseTotal.toFixed(1)}
                          </td>
                          <td className="text-right py-2 px-2 text-red-400">
                            {meterType === 'price' || meterType === 'unemployment'
                              ? changes.increaseTotal.toFixed(1)
                              : changes.decreaseTotal.toFixed(1)}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* コメント */}
              <div className="mt-4 p-3 bg-slate-700/50 rounded">
                <p className="text-xs md:text-sm text-slate-300">
                  {(() => {
                    const maxImprovement = Math.max(
                      ...Object.values(summary.meterChangeSummary).map((m) =>
                        Math.max(m.increaseTotal, m.decreaseTotal)
                      )
                    );
                    const mostImproved = Object.entries(summary.meterChangeSummary).find(
                      ([, m]) =>
                        Math.max(m.increaseTotal, m.decreaseTotal) === maxImprovement
                    )?.[0] as MeterType | undefined;

                    if (mostImproved) {
                      return `最も変化が大きかった指標は「${meterLabels[mostImproved]}」です。`;
                    }
                    return '各指標の変化を確認してください。';
                  })()}
                </p>
              </div>
            </div>

            {/* 典型的なミスパターン */}
            <div className="bg-slate-800 rounded-lg p-4 md:p-6 border border-slate-700">
              <h2 className="text-lg md:text-xl font-semibold mb-2 text-pink-300">
                先生向けコメント：授業で触れると良いポイント
              </h2>
              {summary.commonPitfallMessages.length > 0 ? (
                <ul className="space-y-2 mt-4">
                  {summary.commonPitfallMessages.map((message, index) => (
                    <li
                      key={index}
                      className="bg-slate-700/50 p-3 rounded text-sm md:text-base text-slate-200"
                    >
                      • {message}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400 mt-4">
                  特に問題となる傾向は見られませんでした。
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

