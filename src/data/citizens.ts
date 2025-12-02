/**
 * 市民の声データ
 */
import { MeterType } from '../types/game';

export interface CitizenVoice {
  id: string;
  condition: {
    meter: MeterType;
    threshold: number;
    direction: 'above' | 'below';
  };
  speaker: string;      // 例：「パン屋のお客さん」「工場労働者」
  message: string;      // セリフ
  hint: string;         // プレイヤーへのヒント文
}

export const citizenVoices: CitizenVoice[] = [
  // 物価が高いとき
  {
    id: 'voice-price-1',
    condition: {
      meter: 'price',
      threshold: 70,
      direction: 'above',
    },
    speaker: 'パン屋のお客さん',
    message: '最近パンの値段がどんどん上がって、お客さんも減ってきたよ…',
    hint: '物価を落ち着かせる政策や、光の石の価格に働きかけてみましょう',
  },
  {
    id: 'voice-price-2',
    condition: {
      meter: 'price',
      threshold: 60,
      direction: 'above',
    },
    speaker: '市場の商人',
    message: '光の石の値段が上がって、商品の仕入れ値も上がってるんです。このままじゃ商売が続けられません。',
    hint: '物価抑制の政策や、外交交渉で光の石の価格を安定させましょう',
  },
  
  // 失業率が高いとき
  {
    id: 'voice-unemployment-1',
    condition: {
      meter: 'unemployment',
      threshold: 70,
      direction: 'above',
    },
    speaker: '工場労働者',
    message: '工場が閉鎖されて、仕事が見つからない。家族を養えないかもしれない…',
    hint: '雇用を創出する政策、公共事業や産業投資を検討してみましょう',
  },
  {
    id: 'voice-unemployment-2',
    condition: {
      meter: 'unemployment',
      threshold: 50,
      direction: 'above',
    },
    speaker: '若者',
    message: '就職活動をしているけど、なかなか内定がもらえない。将来が不安です。',
    hint: '教育投資や職業訓練、中小企業支援などの政策が効果的かもしれません',
  },
  
  // 財政がマイナスのとき
  {
    id: 'voice-treasury-1',
    condition: {
      meter: 'treasury',
      threshold: 0,
      direction: 'below',
    },
    speaker: '公務員',
    message: '国の予算が厳しくて、公共サービスが削減されそうだ。市民の生活に影響が出るかもしれません。',
    hint: '財政を立て直すため、増税や支出の見直しを検討する必要があります',
  },
  {
    id: 'voice-treasury-2',
    condition: {
      meter: 'treasury',
      threshold: 100,
      direction: 'below',
    },
    speaker: '年金受給者',
    message: '年金の支給が遅れているとってもうすぐ生活が立ち行かなくなりそう…',
    hint: '財政状況を改善し、社会保障制度を維持する政策が必要です',
  },
  
  // 生活しやすさが低いとき
  {
    id: 'voice-life-1',
    condition: {
      meter: 'life',
      threshold: 30,
      direction: 'below',
    },
    speaker: '子育て中の母親',
    message: '医療費が高くて、子どもの病院代が払えない。生活が苦しいです。',
    hint: '生活の質を向上させる政策、社会保障の充実や物価対策を考えましょう',
  },
  {
    id: 'voice-life-2',
    condition: {
      meter: 'life',
      threshold: 40,
      direction: 'below',
    },
    speaker: '高齢者',
    message: '物価が高くて、年金だけでは生活できない。もっと支援が必要です。',
    hint: '生活しやすさを改善するには、物価対策と社会保障の両立が重要です',
  },
];

