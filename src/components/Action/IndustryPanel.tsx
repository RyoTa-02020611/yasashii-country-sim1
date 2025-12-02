/**
 * 産業育成ミニゲームパネル
 */
import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { industries } from '../../data/industries';

export default function IndustryPanel() {
  const { meters, startIndustryProject, endActionPhase } = useGameStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');

  const treasuryMeter = meters.find((m) => m.id === 'treasury');
  const treasuryValue = treasuryMeter?.value || 0;

  const handleInvest = (projectId: string) => {
    const project = industries.find((p) => p.id === projectId);
    if (!project) return;

    // 国庫が足りない場合
    if (treasuryValue < project.cost) {
      setMessage(`国庫が足りません（必要: ${project.cost}、現在: ${treasuryValue}）`);
      return;
    }

    // プロジェクトを開始
    startIndustryProject(projectId);
    setSelectedProjectId(projectId);
    setMessage(`「${project.name}」への投資を開始しました！`);
  };

  const handleFinish = () => {
    endActionPhase();
  };

  // 産業タイプの表示名
  const getIndustryLabel = (industry: string) => {
    switch (industry) {
      case 'agriculture':
        return '🌾 農業';
      case 'manufacturing':
        return '🏭 工業';
      case 'services':
        return '🏨 サービス';
      case 'magicTech':
        return '✨ 魔導技術';
      default:
        return industry;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-white/20">
          {/* タイトル */}
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              🏗️ 産業育成（リクと投資計画を立てる）
            </h2>
            <p className="text-sm md:text-base text-gray-300">
              今お金を使って、数ターン後の雇用や国庫を良くします
            </p>
            <p className="text-xs md:text-sm text-gray-400 mt-2">
              現在の国庫残高: <span className="font-bold text-yellow-300">{treasuryValue}</span>
            </p>
          </div>

          {/* メッセージ表示 */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.includes('足りません')
                  ? 'bg-red-500/20 border border-red-400/50'
                  : 'bg-green-500/20 border border-green-400/50'
              }`}
            >
              <p className="text-sm md:text-base text-center">{message}</p>
            </div>
          )}

          {/* プロジェクト一覧 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {industries.map((project) => {
              const canAfford = treasuryValue >= project.cost;
              const isSelected = selectedProjectId === project.id;

              return (
                <div
                  key={project.id}
                  className={`bg-white/5 rounded-lg p-4 md:p-5 border ${
                    isSelected
                      ? 'border-green-400/50 bg-green-500/10'
                      : 'border-white/20'
                  }`}
                >
                  {/* 産業タイプ */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getIndustryLabel(project.industry)}</span>
                  </div>

                  {/* プロジェクト名 */}
                  <h3 className="text-lg md:text-xl font-semibold mb-2">{project.name}</h3>

                  {/* 説明 */}
                  <p className="text-sm text-gray-300 mb-4">{project.description}</p>

                  {/* コスト */}
                  <div className="mb-3">
                    <p className="text-sm text-gray-400 mb-1">初期投資コスト</p>
                    <p className="text-lg font-bold text-yellow-300">{project.cost}</p>
                  </div>

                  {/* タイミング情報 */}
                  <div className="mb-3 space-y-1">
                    <p className="text-xs text-gray-400">
                      ⏱️ {project.delay}ターン後から効果開始
                    </p>
                    <p className="text-xs text-gray-400">
                      📅 効果継続: {project.duration}ターン
                    </p>
                  </div>

                  {/* 効果（ターンごと） */}
                  <div className="mb-4 bg-white/5 rounded p-3">
                    <p className="text-xs text-gray-400 mb-2">1ターンあたりの効果:</p>
                    <div className="space-y-1 text-sm">
                      {project.effectsPerTurn.unemployment !== 0 && (
                        <p className="text-blue-300">
                          失業率: {project.effectsPerTurn.unemployment > 0 ? '+' : ''}
                          {project.effectsPerTurn.unemployment}
                        </p>
                      )}
                      {project.effectsPerTurn.treasury !== 0 && (
                        <p className="text-yellow-300">
                          国庫: {project.effectsPerTurn.treasury > 0 ? '+' : ''}
                          {project.effectsPerTurn.treasury}
                        </p>
                      )}
                      {project.effectsPerTurn.life !== 0 && (
                        <p className="text-green-300">
                          生活しやすさ: {project.effectsPerTurn.life > 0 ? '+' : ''}
                          {project.effectsPerTurn.life}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 投資ボタン */}
                  <button
                    onClick={() => handleInvest(project.id)}
                    disabled={!canAfford || isSelected}
                    className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
                      isSelected
                        ? 'bg-green-500/50 text-gray-300 cursor-not-allowed'
                        : canAfford
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                        : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isSelected ? '投資済み' : canAfford ? '投資する' : '国庫が足りません'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* 行動を終えるボタン */}
          <div className="flex justify-center">
            <button
              onClick={handleFinish}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-bold text-base md:text-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
            >
              行動を終える
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

