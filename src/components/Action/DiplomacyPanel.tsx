/**
 * 金融政策パネル（教育用）
 * 現実の金融リテラシー教育に向けた政策選択UI
 */
import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { diplomacyOptions } from '../../data/diplomacyOptions';
import { DiplomacyOption } from '../../data/diplomacyOptions';

export default function DiplomacyPanel() {
  const { meters, applyDiplomacyResult, endActionPhase } = useGameStore();
  const [selectedOption, setSelectedOption] = useState<DiplomacyOption | null>(null);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSelectOption = (option: DiplomacyOption) => {
    if (result) return; // 既に結果が出ている場合は選択不可
    setSelectedOption(option);
  };

  const handleAttemptNegotiation = () => {
    if (!selectedOption) return;

    // 成功/失敗をランダムで判定
    const random = Math.random();
    const success = random < selectedOption.successRate;

    // 結果を適用
    applyDiplomacyResult(selectedOption.id, success);

    // 結果メッセージを生成
    const effectMessages: string[] = [];
    const effects = success ? selectedOption.effects : (selectedOption.failEffects || selectedOption.effects);
    
    if (effects.price) {
      effectMessages.push(`物価${effects.price > 0 ? '+' : ''}${effects.price}`);
    }
    if (effects.treasury) {
      effectMessages.push(`国庫${effects.treasury > 0 ? '+' : ''}${effects.treasury}`);
    }
    if (effects.unemployment) {
      effectMessages.push(`失業率${effects.unemployment > 0 ? '+' : ''}${effects.unemployment}`);
    }
    if (effects.credit) {
      effectMessages.push(`信用度${effects.credit > 0 ? '+' : ''}${effects.credit}`);
    }
    if (effects.support) {
      effectMessages.push(`支持率${effects.support > 0 ? '+' : ''}${effects.support}`);
    }
    if (effects.inflationRisk) {
      effectMessages.push(`インフレリスク${effects.inflationRisk > 0 ? '+' : ''}${effects.inflationRisk}`);
    }
    if (effects.productivity) {
      effectMessages.push(`生産性${effects.productivity > 0 ? '+' : ''}${effects.productivity}`);
    }
    if (effects.futureCost) {
      effectMessages.push(`将来コスト${effects.futureCost > 0 ? '+' : ''}${effects.futureCost}`);
    }

    const successMessage = success
      ? `政策が成功しました！${effectMessages.length > 0 ? `効果: ${effectMessages.join(', ')}` : ''}`
      : `政策が失敗しました。${effectMessages.length > 0 ? `効果: ${effectMessages.join(', ')}` : '効果は限定的でした'}`;

    setResult({
      success,
      message: successMessage,
    });
  };

  const handleEndAction = () => {
    endActionPhase();
  };

  const treasuryMeter = meters.find((m) => m.id === 'treasury');
  const treasuryValue = treasuryMeter?.value || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-white/20">
          {/* タイトル */}
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">💰 金融政策選択</h2>
            <p className="text-sm md:text-base text-gray-300">
              現実の経済政策を学びながら、国の運営を行います
            </p>
          </div>

          {/* 国庫残高表示 */}
          <div className="bg-white/5 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-400 mb-1">現在の国庫残高</p>
            <p className="text-xl font-bold">{treasuryValue.toFixed(0)}</p>
          </div>

          {/* 結果表示 */}
          {result && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                result.success
                  ? 'bg-green-500/20 border border-green-400'
                  : 'bg-red-500/20 border border-red-400'
              }`}
            >
              <p className="text-base md:text-lg font-semibold mb-2">
                {result.success ? '✅ 政策成功！' : '❌ 政策失敗'}
              </p>
              <p className="text-sm md:text-base text-gray-200">{result.message}</p>
            </div>
          )}

          {/* 金融政策オプション一覧 */}
          {!result && (
            <div className="space-y-4 mb-6">
              {diplomacyOptions.map((option) => {
                const isSelected = selectedOption?.id === option.id;
                const cost = Math.abs(option.effects.treasury || 0);
                const canAfford = treasuryValue >= cost;

                return (
                  <div
                    key={option.id}
                    className={`
                      p-4 md:p-5 rounded-lg border-2 transition-all
                      ${isSelected
                        ? 'bg-blue-500/30 border-blue-400 shadow-lg'
                        : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30'
                      }
                      ${!canAfford ? 'opacity-50' : ''}
                    `}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-base md:text-lg font-semibold text-white">
                        {option.title}
                      </h3>
                      <span className="text-sm font-medium text-yellow-300">
                        成功率: {(option.successRate * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-300 mb-3 leading-relaxed">
                      {option.description}
                    </p>
                    
                    {/* 効果表示 */}
                    <div className="mb-3">
                      <div className="text-xs text-gray-400 mb-1">成功時の効果:</div>
                      <div className="flex flex-wrap gap-2 text-xs md:text-sm">
                        {option.effects.price !== undefined && (
                          <span className="text-green-400">
                            物価 {option.effects.price > 0 ? '+' : ''}{option.effects.price}
                          </span>
                        )}
                        {option.effects.treasury !== undefined && (
                          <span className={option.effects.treasury > 0 ? 'text-green-400' : 'text-red-400'}>
                            国庫 {option.effects.treasury > 0 ? '+' : ''}{option.effects.treasury}
                          </span>
                        )}
                        {option.effects.unemployment !== undefined && (
                          <span className="text-green-400">
                            失業率 {option.effects.unemployment > 0 ? '+' : ''}{option.effects.unemployment}
                          </span>
                        )}
                        {option.effects.credit !== undefined && (
                          <span className={option.effects.credit > 0 ? 'text-green-400' : 'text-red-400'}>
                            信用度 {option.effects.credit > 0 ? '+' : ''}{option.effects.credit}
                          </span>
                        )}
                        {option.effects.support !== undefined && (
                          <span className="text-green-400">
                            支持率 +{option.effects.support}
                          </span>
                        )}
                        {option.effects.inflationRisk !== undefined && (
                          <span className="text-red-400">
                            インフレリスク +{option.effects.inflationRisk}
                          </span>
                        )}
                        {option.effects.productivity !== undefined && (
                          <span className="text-green-400">
                            生産性 +{option.effects.productivity}
                          </span>
                        )}
                        {option.effects.futureCost !== undefined && (
                          <span className="text-red-400">
                            将来コスト +{option.effects.futureCost}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {!canAfford && (
                      <p className="text-xs text-red-400 mt-2">
                        国庫残高が不足しています
                      </p>
                    )}
                    <button
                      onClick={() => handleSelectOption(option)}
                      disabled={!canAfford}
                      className={`
                        mt-3 w-full px-4 py-2 rounded-lg font-medium text-sm transition-all
                        ${isSelected
                          ? 'bg-blue-500 hover:bg-blue-600'
                          : 'bg-white/10 hover:bg-white/20'
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      {isSelected ? '✓ 選択中' : 'この政策を選択'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* 操作ボタン */}
          <div className="flex justify-center gap-4">
            {!result && selectedOption && (
              <button
                onClick={handleAttemptNegotiation}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-bold text-base md:text-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
              >
                この政策を実行する
              </button>
            )}
            {result && (
              <button
                onClick={handleEndAction}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-bold text-base md:text-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg"
              >
                行動を終える
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
