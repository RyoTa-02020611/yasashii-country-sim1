/**
 * CFO行動フェーズパネル
 */
import { useGameStore } from '../../store/useGameStore';
import { actions } from '../../data/actions';
import { ActionType } from '../../types/game';
import ETFPanel from './ETFPanel';
import DiplomacyPanel from './DiplomacyPanel';
import SurveyPanel from './SurveyPanel';
import IndustryPanel from './IndustryPanel';

export default function ActionPanel() {
  const { selectedAction, selectAction, executeAction } = useGameStore();

  // ETFが選択された場合はETFパネルを表示
  if (selectedAction === 'etf') {
    return <ETFPanel />;
  }

  // 外交が選択された場合は外交パネルを表示
  if (selectedAction === 'diplomacy') {
    return <DiplomacyPanel />;
  }

  // 市民調査が選択された場合は調査パネルを表示
  if (selectedAction === 'survey') {
    return <SurveyPanel />;
  }

  // 産業育成が選択された場合は産業パネルを表示
  if (selectedAction === 'industry') {
    return <IndustryPanel />;
  }

  const handleActionSelect = (actionId: ActionType) => {
    selectAction(actionId);
  };

  const handleExecute = () => {
    if (selectedAction) {
      executeAction();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-white/20">
          {/* タイトル */}
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">💼 CFO 行動フェーズ</h2>
            <p className="text-sm md:text-base text-gray-300">
              政策後に追加で 1 行動選べます
            </p>
          </div>

          {/* アクションカード一覧 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {actions.map((action) => {
              const isSelected = selectedAction === action.id;
              return (
                <button
                  key={action.id}
                  onClick={() => handleActionSelect(action.id)}
                  className={`
                    text-left p-4 md:p-5 rounded-lg border-2 transition-all
                    ${isSelected
                      ? 'bg-blue-500/30 border-blue-400 shadow-lg scale-105'
                      : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30'
                    }
                  `}
                >
                  <h3 className="text-base md:text-lg font-semibold mb-2 text-white">
                    {action.name}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
                    {action.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* 実行ボタン */}
          <div className="flex justify-center">
            <button
              onClick={handleExecute}
              disabled={!selectedAction}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-bold text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
            >
              {selectedAction ? '行動を実行する' : '行動を選択してください'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

