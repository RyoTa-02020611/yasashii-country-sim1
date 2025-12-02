/**
 * 市民調査パネル
 */
import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { citizenVoices, CitizenVoice } from '../../data/citizens';

export default function SurveyPanel() {
  const { meters, endActionPhase, applyEffects, recordSurveyAction } = useGameStore();
  const [selectedVoices, setSelectedVoices] = useState<CitizenVoice[]>([]);

  // マウント時に条件に合う市民の声をフィルタ
  useEffect(() => {
    const matchingVoices = citizenVoices.filter((voice) => {
      const meter = meters.find((m) => m.id === voice.condition.meter);
      if (!meter) return false;

      const meetsCondition =
        voice.condition.direction === 'above'
          ? meter.value >= voice.condition.threshold
          : meter.value <= voice.condition.threshold;

      return meetsCondition;
    });

    // 条件に合うものがあれば、ランダムで1〜3件選択
    if (matchingVoices.length > 0) {
      const count = Math.min(matchingVoices.length, Math.floor(Math.random() * 3) + 1);
      const shuffled = [...matchingVoices].sort(() => Math.random() - 0.5);
      setSelectedVoices(shuffled.slice(0, count));
    } else {
      // 条件に合うものがなければ、デフォルトメッセージを表示
      setSelectedVoices([]);
    }
  }, [meters]);

  const handleFinishSurvey = () => {
    // 生活しやすさを+1〜+3回復（シナリオ補正を適用）
    const recoveryAmount = Math.floor(Math.random() * 3) + 1;
    applyEffects({
      life: recoveryAmount,
    }, true); // シナリオ補正を適用

    // 調査アクションを記録
    recordSurveyAction(selectedVoices.length);

    // アクションフェーズを終了
    endActionPhase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-white/20">
          {/* タイトル */}
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              🏘️ 市民調査（ミナと市民街をまわる）
            </h2>
            <p className="text-sm md:text-base text-gray-300">
              今のノヴァリアの暮らしぶりを、市民の声から確かめます
            </p>
          </div>

          {/* 市民の声 */}
          {selectedVoices.length > 0 ? (
            <div className="space-y-4 mb-6">
              {selectedVoices.map((voice, index) => (
                <div key={voice.id} className="bg-white/5 rounded-lg p-4 md:p-5">
                  {/* 話者 */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">👤</span>
                    <span className="text-sm md:text-base font-semibold text-blue-300">
                      {voice.speaker}
                    </span>
                  </div>

                  {/* メッセージ（吹き出し風） */}
                  <div className="bg-white/10 rounded-lg p-4 mb-3 relative">
                    <div className="absolute -left-2 top-4 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-white/10 border-b-8 border-b-transparent" />
                    <p className="text-sm md:text-base text-gray-200 leading-relaxed">
                      「{voice.message}」
                    </p>
                  </div>

                  {/* ヒント（ナビが翻訳した感じ） */}
                  <div className="bg-purple-500/20 rounded-lg p-3 border border-purple-400/30">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">🤖</span>
                      <div>
                        <p className="text-xs text-purple-300 font-semibold mb-1">ナビの分析</p>
                        <p className="text-xs md:text-sm text-gray-200">
                          {voice.hint}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/5 rounded-lg p-6 mb-6 text-center">
              <p className="text-gray-300">
                現在、特に問題を訴える市民の声はありません。
                <br />
                ノヴァリアは比較的安定した状態にあります。
              </p>
            </div>
          )}

          {/* 終了ボタン */}
          <div className="flex justify-center">
            <button
              onClick={handleFinishSurvey}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-bold text-base md:text-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
            >
              市民の声を聞き終える
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

