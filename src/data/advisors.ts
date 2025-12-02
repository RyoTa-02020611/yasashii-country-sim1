/**
 * アドバイザーデータ
 */
import { AdvisorId } from '../types/game';

export interface Advisor {
  id: AdvisorId;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export const advisors: Advisor[] = [
  {
    id: 'riku',
    name: 'リク',
    icon: '👨‍💼',
    color: 'blue',
    description: '経済政策の専門家。財政健全化を重視します。',
  },
  {
    id: 'haru',
    name: 'ハル',
    icon: '👩‍🔬',
    color: 'green',
    description: '技術・インフラの専門家。公共事業を推奨します。',
  },
  {
    id: 'sato',
    name: 'サト',
    icon: '👨‍🏫',
    color: 'yellow',
    description: '教育政策の専門家。若者の未来を考えます。',
  },
  {
    id: 'tsumugi',
    name: 'ツムギ',
    icon: '👩‍⚕️',
    color: 'pink',
    description: '医療・福祉の専門家。国民の健康を第一に考えます。',
  },
  {
    id: 'mina',
    name: 'ミナ',
    icon: '👩‍💻',
    color: 'purple',
    description: 'デジタル政策の専門家。効率化とイノベーションを重視します。',
  },
  {
    id: 'navi',
    name: 'ナビ',
    icon: '🤖',
    color: 'gray',
    description: 'AIアドバイザー。データ分析に基づいた客観的な意見を提供します。',
  },
];

// アドバイザーごとの簡単なコメント（政策選択時の発言例）
export const advisorComments: Record<AdvisorId, string[]> = {
  riku: [
    '経済的に良い判断だと思います。',
    '財政への影響を慎重に検討すべきです。',
    '長期的な視点で考える必要があります。',
  ],
  haru: [
    '公共事業は失業率改善に効果的です。ただし財政への負担は大きいです。',
    'インフラ整備は長期的な投資になります。',
    '技術的な観点から見て興味深い政策です。',
  ],
  sato: [
    '教育の観点から評価できます。',
    '若者の未来を考えてください。',
    '人材育成は国の基盤です。',
  ],
  tsumugi: [
    '国民の健康を第一に考えましょう。',
    '医療制度の充実が重要です。',
    '福祉政策は長期的な投資です。',
  ],
  mina: [
    'デジタル化の推進を期待します。',
    '効率化が鍵になります。',
    'イノベーションを促進する政策ですね。',
  ],
  navi: [
    'データ分析の結果、この政策は...',
    '確率論的に見ると、この選択は適切です。',
    '過去のデータと照らし合わせると...',
  ],
};

