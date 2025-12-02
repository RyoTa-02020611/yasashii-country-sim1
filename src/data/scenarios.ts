/**
 * シナリオ定義
 */
import { Scenario } from '../types/game';

export const scenarios: Scenario[] = [
  {
    id: 'chapter1',
    title: '第1章：国の危機',
    description: '物価・失業・財政が悪化し始めたノヴァリアを立て直す入門シナリオ',
    maxTurns: 8,
    theme: 'mixed',
    focusMeters: ['treasury', 'life'],
    failCondition: {
      meter: 'treasury',
      direction: 'below',
      threshold: 0,
      message: '国庫が底をつきました。ノヴァリアは財政破綻してしまいました…',
    },
  },
  {
    id: 'chapter2',
    title: '第2章：物価の乱れ',
    description: 'インフレの悪化を防ぎつつ、生活しやすさを守る章。インフレ入門シナリオです。',
    maxTurns: 10,
    theme: 'inflation',
    focusMeters: ['price', 'life'],
    failCondition: {
      meter: 'price',
      direction: 'above',
      threshold: 90,
      message: 'ハイパーインフレで通貨への信頼が失われました。ノヴァリアの経済は崩壊しました…',
    },
  },
  {
    id: 'chapter3',
    title: '第3章：仕事がなくなる',
    description: '失業率の上昇と景気の悪化に立ち向かう章。雇用政策の重要性を学びます。',
    maxTurns: 9,
    theme: 'unemployment',
    focusMeters: ['unemployment', 'treasury'],
    failCondition: {
      meter: 'unemployment',
      direction: 'above',
      threshold: 90,
      message: '失業率が極限まで達しました。社会不安が広がり、ノヴァリアは混乱に陥りました…',
    },
  },
  {
    id: 'chapter4',
    title: '第4章：借金の増加',
    description: '財政の悪化を食い止め、節約と増税のバランスを取る章。財政健全化を学びます。',
    maxTurns: 10,
    theme: 'fiscal',
    focusMeters: ['treasury', 'life'],
    failCondition: {
      meter: 'treasury',
      direction: 'below',
      threshold: -50,
      message: '借金が限界を超えました。ノヴァリアは財政破綻してしまいました…',
    },
  },
  {
    id: 'chapter5',
    title: '第5章：外交トラブル',
    description: '資源ショックと国際価格の変動に対応する章。外交と資源管理の重要性を学びます。',
    maxTurns: 9,
    theme: 'diplomacy',
    focusMeters: ['price', 'treasury'],
    failCondition: {
      meter: 'price',
      direction: 'above',
      threshold: 85,
      message: '資源ショックにより物価が暴騰しました。ノヴァリアの経済は混乱に陥りました…',
    },
  },
  {
    id: 'final',
    title: '最終章：総決算',
    description: 'これまでの学びを総動員する総合テスト。すべての指標をバランスよく管理しましょう。',
    maxTurns: 15,
    theme: 'mixed',
    focusMeters: ['price', 'unemployment', 'treasury', 'life'],
    // 最終章は複合的な失敗条件（2つ以上のメーターが危険ゾーン）
    // 実装は endTurnAndCheckScenario で処理
  },
];

