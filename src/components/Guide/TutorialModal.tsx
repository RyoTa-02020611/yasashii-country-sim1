/**
 * チュートリアルモーダル（遊び方ガイド）
 */
import { ReactNode } from 'react';

interface TutorialModalProps {
  onClose: () => void;
  isFirstVisit?: boolean;
}

export default function TutorialModal({ onClose, isFirstVisit = false }: TutorialModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={isFirstVisit ? undefined : onClose}
      />

      {/* モーダル */}
      <div className="relative bg-slate-800 rounded-lg border border-slate-700 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-slate-100">
            📖 遊び方ガイド
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 text-2xl font-bold transition-colors"
          >
            ×
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6 md:p-8 space-y-6">
          {/* セクション1：ゲームの目的 */}
          <Section
            title="🎯 ゲームの目的"
            content={
              <p className="text-slate-200 leading-relaxed">
                ノヴァリア王国の物価・失業・生活しやすさ・財政をバランスよく守るゲームです。
                <br />
                6人のアドバイザーの意見を参考にしながら、政策を選択して国を運営していきましょう。
              </p>
            }
          />

          {/* セクション2：基本の流れ */}
          <Section
            title="🔄 基本の流れ"
            content={
              <ol className="list-decimal list-inside space-y-2 text-slate-200">
                <li>イベントを読む</li>
                <li>政策カードを1つ選ぶ</li>
                <li>CFO行動（ETF・外交・市民調査・産業育成）から1つ選ぶ</li>
                <li>メーターの変化と市民の声を確認する</li>
                <li>次のターンへ進む</li>
              </ol>
            }
          />

          {/* セクション3：メーターの意味 */}
          <Section
            title="📊 メーターの意味"
            content={
              <div className="space-y-4">
                <MeterExplanation
                  icon="💰"
                  name="物価"
                  color="text-yellow-400"
                  description="生活必需品の価格レベル。高すぎると国民の生活が圧迫されます。"
                />
                <MeterExplanation
                  icon="👥"
                  name="失業率"
                  color="text-red-400"
                  description="労働人口に占める失業者の割合。高すぎると社会不安が広がります。"
                />
                <MeterExplanation
                  icon="🏠"
                  name="生活しやすさ"
                  color="text-green-400"
                  description="国民の生活の質。物価、雇用、社会保障などが影響します。"
                />
                <MeterExplanation
                  icon="💎"
                  name="国庫残高"
                  color="text-blue-400"
                  description="国の財政状況。マイナスになると借金が増え、財政破綻のリスクがあります。"
                />
              </div>
            }
          />

          {/* セクション4：モード */}
          <Section
            title="👨‍🏫 モード"
            content={
              <div className="space-y-3 text-slate-200">
                <div>
                  <p className="font-semibold text-slate-100 mb-1">プレイヤーモード</p>
                  <p>ゲームをプレイして、政策選択とメーター管理を体験します。</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-100 mb-1">教師モード</p>
                  <p>プレイヤーの判断傾向を分析し、授業で使えるデータを確認できます。</p>
                </div>
              </div>
            }
          />

          {/* セクション5：アドバイザー */}
          <Section
            title="👥 アドバイザーについて"
            content={
              <p className="text-slate-200 leading-relaxed">
                6人のアドバイザーがそれぞれ異なる視点から意見を述べます。
                <br />
                リク（財務）、ハル（経済）、サト（社会）、ツムギ（外交）、ミナ（市民）、ナビ（データ分析）の
                <br />
                意見を参考にしながら、最適な政策を選択しましょう。
              </p>
            }
          />
        </div>

        {/* フッター */}
        <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-slate-100 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  content: ReactNode;
}

function Section({ title, content }: SectionProps) {
  return (
    <div className="bg-slate-700/50 rounded-lg p-4 md:p-5">
      <h3 className="text-lg md:text-xl font-semibold text-slate-100 mb-3">{title}</h3>
      <div>{content}</div>
    </div>
  );
}

interface MeterExplanationProps {
  icon: string;
  name: string;
  color: string;
  description: string;
}

function MeterExplanation({ icon, name, color, description }: MeterExplanationProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <p className={`font-semibold ${color} mb-1`}>{name}</p>
        <p className="text-sm text-slate-300">{description}</p>
      </div>
    </div>
  );
}

