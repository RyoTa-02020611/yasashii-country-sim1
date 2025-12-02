/**
 * アクション一覧データ
 */
import { GameAction } from '../types/game';

export const actions: GameAction[] = [
  {
    id: 'etf',
    name: '光の石ETFを売買する',
    description: '超簡易チャート表示＋買う/売る。光の石の価格変動を利用して財政を調整します。',
  },
  {
    id: 'diplomacy',
    name: '他国と交渉する',
    description: '他国と交渉し、光の石価格に補正を与えます。外交により経済状況を改善できます。',
  },
  {
    id: 'survey',
    name: '市民街の調査',
    description: '市民街の調査を行い、生活指標にヒントをもらえます。国民の声を聞くことで政策の改善につながります。',
  },
  {
    id: 'industry',
    name: '特定産業に投資',
    description: '特定産業に投資します。数ターン後に効果が出る長期的な投資です。',
  },
];

