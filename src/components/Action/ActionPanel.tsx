/**
 * CFO財務調整フェーズパネル
 * 政策フェーズとは異なり、短期的な財務調整（資金繰り）に特化したフェーズ
 */
import { useGameStore } from '../../store/useGameStore';

type CFOAction = 'issue_bond' | 'repay_bond' | 'use_reserve' | 'skip';

export default function ActionPanel() {
  const { debtLevel, reserveUsed, executeCFOAction, goHome } = useGameStore();

  const handleCFOAction = (action: CFOAction) => {
    executeCFOAction(action);
  };

  // CFO財務調整の選択肢
  const cfoActions: Array<{
    id: CFOAction;
    name: string;
    description: string;
    effects: string;
    disabled?: boolean;
    disabledReason?: string;
  }> = [
    {
      id: 'issue_bond',
      name: '国債を発行する（借金でまかなう）',
      description: '市場から資金を調達します。即座に国庫を増強できますが、借金レベルが上昇します。',
      effects: '国庫 +20, 借金レベル +1',
    },
    {
      id: 'repay_bond',
      name: '国債を返済する（借金を減らす）',
      description: '借金を返済して財政を健全化します。国庫を減らしますが、借金レベルが下がります。',
      effects: '国庫 -15, 借金レベル -1',
      disabled: debtLevel === 0,
      disabledReason: '返済する借金がありません',
    },
    {
      id: 'use_reserve',
      name: '予備費を取り崩す（1回だけ）',
      description: '緊急時のための予備費を使用します。1回だけ使用可能です。',
      effects: '国庫 +10',
      disabled: reserveUsed,
      disabledReason: '予備費は既に取り崩し済みです',
    },
    {
      id: 'skip',
      name: '何もしない',
      description: '財務調整を行わず、このフェーズをスキップします。',
      effects: '影響なし',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-white/20">
          {/* タイトルと説明 */}
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">💼 CFO財務調整フェーズ</h2>
            <p className="text-sm md:text-base text-gray-300 mb-4">
              ここはCFO（財務担当）のフェーズです。政策で決めた方向性とは別に、
              <br className="hidden md:inline" />
              今期の資金繰りをどう調整するかを選びます。
            </p>
            <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-3 mb-4">
              <p className="text-xs md:text-sm text-blue-200">
                <strong>現在の状態：</strong>
                借金レベル {debtLevel} / 予備費 {reserveUsed ? '使用済み' : '使用可能'}
              </p>
            </div>
          </div>

          {/* 財務調整選択肢 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {cfoActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleCFOAction(action.id)}
                disabled={action.disabled}
                className={`
                  text-left p-4 md:p-5 rounded-lg border-2 transition-all
                  ${
                    action.disabled
                      ? 'bg-gray-500/20 border-gray-500/30 cursor-not-allowed opacity-50'
                      : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30 hover:scale-105'
                  }
                `}
              >
                <h3 className="text-base md:text-lg font-semibold mb-2 text-white">
                  {action.name}
                </h3>
                <p className="text-xs md:text-sm text-gray-300 leading-relaxed mb-2">
                  {action.description}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs md:text-sm font-medium text-green-300">
                    {action.effects}
                  </span>
                  {action.disabled && action.disabledReason && (
                    <span className="text-xs text-red-300 ml-2">
                      {action.disabledReason}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* ホームへ戻るボタン */}
          <div className="flex justify-center gap-4">
            <button
              onClick={goHome}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-white text-sm md:text-base font-medium"
            >
              🏠 ホームへ戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
