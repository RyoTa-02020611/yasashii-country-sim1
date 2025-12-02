# 国家運営ゲーム MVP 設計書

## ① フォルダ構成

```
src/
├── components/           # 再利用可能なコンポーネント
│   ├── Meter/           # メーター表示コンポーネント
│   │   ├── MeterBar.tsx
│   │   └── MeterPanel.tsx
│   ├── Event/           # イベント表示
│   │   └── EventCard.tsx
│   ├── Policy/          # 政策カード
│   │   ├── PolicyCard.tsx
│   │   └── PolicyList.tsx
│   ├── Advisor/         # アドバイザー会話
│   │   ├── AdvisorMessage.tsx
│   │   └── AdvisorPanel.tsx
│   └── Layout/          # レイアウトコンポーネント
│       ├── GameLayout.tsx
│       └── ResponsiveContainer.tsx
│
├── pages/               # ページコンポーネント
│   └── Home.tsx         # メインゲーム画面
│
├── hooks/               # カスタムフック
│   ├── useGameLoop.ts   # ゲームループ管理
│   └── useMeter.ts      # メーター計算ロジック
│
├── store/               # Zustand ストア
│   ├── gameStore.ts     # ゲーム状態管理
│   └── types.ts         # 型定義
│
├── data/                # データファイル
│   ├── events.ts        # イベントデータ
│   ├── policies.ts      # 政策データ
│   └── advisors.ts      # アドバイザーデータ
│
├── utils/               # ユーティリティ関数
│   └── calculations.ts  # 計算ロジック
│
├── App.tsx              # ルートコンポーネント
├── main.tsx             # エントリーポイント
└── index.css            # グローバルスタイル（Tailwind）
```

---

## ② 各ページ/コンポーネントの役割説明

### ページ
- **Home.tsx**: メインゲーム画面。すべてのUI要素を統合し、ゲームループを管理

### コンポーネント

#### Meter（メーター）
- **MeterBar.tsx**: 単一のメーターをバー形式で表示（物価、失業率、生活しやすさ、国庫残高）
- **MeterPanel.tsx**: 4つのメーターをまとめて表示するパネル

#### Event（イベント）
- **EventCard.tsx**: 発生したイベントをカード形式で表示（タイトル、説明、画像など）

#### Policy（政策）
- **PolicyCard.tsx**: 1つの政策カードを表示（タイトル、説明、効果プレビュー）
- **PolicyList.tsx**: 政策カードのリストを表示（グリッドまたは縦並び）

#### Advisor（アドバイザー）
- **AdvisorMessage.tsx**: 1人のアドバイザーのメッセージを表示（名前、アイコン、発言）
- **AdvisorPanel.tsx**: 複数のアドバイザーメッセージを表示するパネル

#### Layout（レイアウト）
- **GameLayout.tsx**: ゲーム画面全体のレイアウト（PC: 横長、スマホ: 縦スクロール）
- **ResponsiveContainer.tsx**: レスポンシブ対応のコンテナ

### カスタムフック
- **useGameLoop.ts**: ターン進行、イベント発生、政策選択の流れを管理
- **useMeter.ts**: メーター値の計算と更新ロジック

### ストア
- **gameStore.ts**: Zustandでゲーム全体の状態を管理（ターン数、メーター値、選択済み政策など）

---

## ③ ゲーム状態の型定義（TypeScript）

```tsx
// store/types.ts

// メーター値の型
export interface MeterValues {
  inflation: number;        // 物価（0-100）
  unemployment: number;     // 失業率（0-100）
  livability: number;       // 生活しやすさ（0-100）
  treasury: number;         // 国庫残高（0-1000）
}

// 政策の効果
export interface PolicyEffect {
  inflation?: number;       // 物価への影響（-10 〜 +10）
  unemployment?: number;    // 失業率への影響
  livability?: number;      // 生活しやすさへの影響
  treasury?: number;        // 国庫残高への影響
}

// 政策データ
export interface Policy {
  id: string;
  title: string;
  description: string;
  effect: PolicyEffect;
  category: 'economic' | 'social' | 'infrastructure' | 'welfare';
}

// イベントデータ
export interface Event {
  id: string;
  title: string;
  description: string;
  effect?: PolicyEffect;   // イベントによる自動的な影響
  image?: string;
}

// アドバイザー
export interface Advisor {
  id: string;
  name: string;
  icon: string;
  color: string;
}

// アドバイザーメッセージ
export interface AdvisorMessage {
  advisorId: string;
  message: string;
  timestamp: number;
}

// ゲーム状態
export interface GameState {
  // 基本情報
  turn: number;
  currentEvent: Event | null;
  selectedPolicy: Policy | null;
  
  // メーター値
  meters: MeterValues;
  
  // アドバイザーメッセージ
  advisorMessages: AdvisorMessage[];
  
  // 履歴
  policyHistory: Policy[];
  eventHistory: Event[];
  
  // UI状態
  isPolicySelected: boolean;
  showResult: boolean;
}
```

---

## ④ ダミーのイベントデータ / 政策データ

```tsx
// data/events.ts
import { Event } from '../store/types';

export const events: Event[] = [
  {
    id: 'event-1',
    title: '光の石の価格が急騰',
    description: '市場で光の石の需要が急増し、価格が2倍になりました。',
    effect: {
      inflation: 15,
      treasury: 20,
    },
  },
  {
    id: 'event-2',
    title: '大規模な自然災害',
    description: 'ノヴァリア王国で地震が発生。インフラに大きな被害が出ています。',
    effect: {
      livability: -20,
      treasury: -30,
    },
  },
  {
    id: 'event-3',
    title: '新技術の発見',
    description: '光の石を効率的に利用する新技術が発見されました！',
    effect: {
      livability: 10,
      treasury: 15,
    },
  },
  {
    id: 'event-4',
    title: '失業者の増加',
    description: '経済の停滞により、失業者が増加しています。',
    effect: {
      unemployment: 10,
      livability: -10,
    },
  },
];

// data/policies.ts
import { Policy } from '../store/types';

export const policies: Policy[] = [
  {
    id: 'policy-1',
    title: '公共事業の拡大',
    description: '道路や橋の建設を進め、雇用を創出します。',
    effect: {
      unemployment: -5,
      treasury: -20,
      livability: 5,
    },
    category: 'infrastructure',
  },
  {
    id: 'policy-2',
    title: '税制改革',
    description: '税率を調整し、国庫を安定させます。',
    effect: {
      treasury: 30,
      livability: -5,
    },
    category: 'economic',
  },
  {
    id: 'policy-3',
    title: '社会保障の充実',
    description: '失業手当や医療費の補助を拡充します。',
    effect: {
      unemployment: -3,
      livability: 10,
      treasury: -25,
    },
    category: 'welfare',
  },
  {
    id: 'policy-4',
    title: '教育投資',
    description: '学校や職業訓練施設を増設します。',
    effect: {
      unemployment: -4,
      livability: 8,
      treasury: -15,
    },
    category: 'social',
  },
  {
    id: 'policy-5',
    title: '光の石の輸出規制',
    description: '国内需要を優先し、輸出を制限します。',
    effect: {
      inflation: -5,
      treasury: -10,
    },
    category: 'economic',
  },
  {
    id: 'policy-6',
    title: '中小企業支援',
    description: '小規模事業者への融資制度を拡充します。',
    effect: {
      unemployment: -6,
      treasury: -18,
      livability: 5,
    },
    category: 'economic',
  },
];

// data/advisors.ts
import { Advisor } from '../store/types';

export const advisors: Advisor[] = [
  {
    id: 'rik',
    name: 'リク',
    icon: '👨‍💼',
    color: 'blue',
  },
  {
    id: 'haru',
    name: 'ハル',
    icon: '👩‍🔬',
    color: 'green',
  },
  {
    id: 'sato',
    name: 'サト',
    icon: '👨‍🏫',
    color: 'yellow',
  },
  {
    id: 'tsumugi',
    name: 'ツムギ',
    icon: '👩‍⚕️',
    color: 'pink',
  },
  {
    id: 'mina',
    name: 'ミナ',
    icon: '👩‍💻',
    color: 'purple',
  },
  {
    id: 'navi',
    name: 'ナビ',
    icon: '🤖',
    color: 'gray',
  },
];
```

---

## ⑤ Home画面（MVP UI）の JSX + Tailwind コード

```tsx
// pages/Home.tsx
import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import MeterPanel from '../components/Meter/MeterPanel';
import EventCard from '../components/Event/EventCard';
import PolicyList from '../components/Policy/PolicyList';
import AdvisorPanel from '../components/Advisor/AdvisorPanel';

export default function Home() {
  const {
    turn,
    currentEvent,
    meters,
    advisorMessages,
    selectPolicy,
    nextTurn,
    isPolicySelected,
  } = useGameStore();

  const handlePolicySelect = (policyId: string) => {
    selectPolicy(policyId);
  };

  const handleNext = () => {
    nextTurn();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* ヘッダー */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/20 p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-center">
            🌍 ノヴァリア王国運営
          </h1>
          <p className="text-center text-sm md:text-base mt-1 text-gray-300">
            ターン {turn}
          </p>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* PC: 横長レイアウト、スマホ: 縦スクロール */}
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
          
          {/* 左側: メーター */}
          <div className="lg:w-1/4">
            <MeterPanel meters={meters} />
          </div>

          {/* 中央: イベント + アドバイザー */}
          <div className="lg:w-1/2 flex flex-col gap-4">
            {/* イベントカード */}
            {currentEvent && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <h2 className="text-lg font-bold mb-2">📰 ニュース</h2>
                <EventCard event={currentEvent} />
              </div>
            )}

            {/* アドバイザーパネル */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 flex-1">
              <h2 className="text-lg font-bold mb-3">💬 アドバイザーの意見</h2>
              <AdvisorPanel messages={advisorMessages} />
            </div>
          </div>

          {/* 右側: 政策カード */}
          <div className="lg:w-1/4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <h2 className="text-lg font-bold mb-3">📋 政策を選択</h2>
              <PolicyList
                onSelect={handlePolicySelect}
                selectedId={isPolicySelected ? useGameStore.getState().selectedPolicy?.id : null}
              />
            </div>
          </div>
        </div>

        {/* 次へボタン */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleNext}
            disabled={!isPolicySelected}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg"
          >
            {isPolicySelected ? '次へ進む' : '政策を選択してください'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## ⑥ Zustandで管理する state のサンプル

```tsx
// store/gameStore.ts
import { create } from 'zustand';
import { GameState, MeterValues, Policy, Event, AdvisorMessage } from './types';
import { policies } from '../data/policies';
import { events } from '../data/events';
import { advisors } from '../data/advisors';

// 初期メーター値
const initialMeters: MeterValues = {
  inflation: 30,
  unemployment: 20,
  livability: 50,
  treasury: 500,
};

interface GameStore extends GameState {
  // アクション
  selectPolicy: (policyId: string) => void;
  nextTurn: () => void;
  applyEffect: (effect: Policy['effect']) => void;
  generateEvent: () => void;
  generateAdvisorMessages: (policy: Policy | null) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // 初期状態
  turn: 1,
  currentEvent: null,
  selectedPolicy: null,
  meters: initialMeters,
  advisorMessages: [],
  policyHistory: [],
  eventHistory: [],
  isPolicySelected: false,
  showResult: false,

  // 政策選択
  selectPolicy: (policyId: string) => {
    const policy = policies.find((p) => p.id === policyId);
    if (!policy) return;

    set({
      selectedPolicy: policy,
      isPolicySelected: true,
    });

    // アドバイザーの意見を生成
    get().generateAdvisorMessages(policy);
  },

  // ターン進行
  nextTurn: () => {
    const { selectedPolicy, currentEvent, turn } = get();
    
    if (!selectedPolicy) return;

    // 政策の効果を適用
    if (selectedPolicy.effect) {
      get().applyEffect(selectedPolicy.effect);
    }

    // イベントの効果を適用
    if (currentEvent?.effect) {
      get().applyEffect(currentEvent.effect);
    }

    // 履歴に追加
    set((state) => ({
      policyHistory: [...state.policyHistory, selectedPolicy],
      eventHistory: currentEvent
        ? [...state.eventHistory, currentEvent]
        : state.eventHistory,
    }));

    // 次のターンへ
    set({
      turn: turn + 1,
      selectedPolicy: null,
      isPolicySelected: false,
      currentEvent: null,
      advisorMessages: [],
    });

    // 新しいイベントを生成
    get().generateEvent();
  },

  // 効果を適用
  applyEffect: (effect) => {
    set((state) => {
      const newMeters = { ...state.meters };

      if (effect.inflation !== undefined) {
        newMeters.inflation = Math.max(0, Math.min(100, newMeters.inflation + effect.inflation));
      }
      if (effect.unemployment !== undefined) {
        newMeters.unemployment = Math.max(0, Math.min(100, newMeters.unemployment + effect.unemployment));
      }
      if (effect.livability !== undefined) {
        newMeters.livability = Math.max(0, Math.min(100, newMeters.livability + effect.livability));
      }
      if (effect.treasury !== undefined) {
        newMeters.treasury = Math.max(0, Math.min(1000, newMeters.treasury + effect.treasury));
      }

      return { meters: newMeters };
    });
  },

  // イベント生成
  generateEvent: () => {
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    set({ currentEvent: randomEvent });
  },

  // アドバイザーメッセージ生成（簡易版）
  generateAdvisorMessages: (policy: Policy | null) => {
    if (!policy) return;

    const messages: AdvisorMessage[] = advisors.map((advisor) => {
      // 簡易的なメッセージ生成（実際はもっと複雑に）
      const messagesByAdvisor: Record<string, string[]> = {
        rik: ['経済的に良い判断だと思います。', '慎重に検討すべきです。'],
        haru: ['技術的な観点から見て興味深いです。', '長期的な影響を考える必要があります。'],
        sato: ['教育の観点から評価できます。', '若者の未来を考えてください。'],
        tsumugi: ['国民の健康を第一に。', '医療制度の充実が重要です。'],
        mina: ['デジタル化の推進を期待します。', '効率化が鍵になります。'],
        navi: ['データ分析の結果、この政策は...', '確率論的に見ると...'],
      };

      const advisorMessages = messagesByAdvisor[advisor.id] || ['意見を検討中です。'];
      const randomMessage = advisorMessages[Math.floor(Math.random() * advisorMessages.length)];

      return {
        advisorId: advisor.id,
        message: randomMessage,
        timestamp: Date.now(),
      };
    });

    set({ advisorMessages: messages });
  },

  // ゲームリセット
  resetGame: () => {
    set({
      turn: 1,
      currentEvent: null,
      selectedPolicy: null,
      meters: initialMeters,
      advisorMessages: [],
      policyHistory: [],
      eventHistory: [],
      isPolicySelected: false,
      showResult: false,
    });
  },
}));

// 初期イベントを生成
useGameStore.getState().generateEvent();
```

---

## 補足: 主要コンポーネントの簡易実装例

### MeterBar.tsx
```tsx
// components/Meter/MeterBar.tsx
interface MeterBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
}

export default function MeterBar({ label, value, max, color }: MeterBarProps) {
  const percentage = (value / max) * 100;

  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm">{value}/{max}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-4">
        <div
          className={`h-4 rounded-full transition-all duration-300 bg-gradient-to-r ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
```

### MeterPanel.tsx
```tsx
// components/Meter/MeterPanel.tsx
import { MeterValues } from '../../store/types';
import MeterBar from './MeterBar';

interface MeterPanelProps {
  meters: MeterValues;
}

export default function MeterPanel({ meters }: MeterPanelProps) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
      <h2 className="text-lg font-bold mb-4">📊 国家状況</h2>
      <MeterBar label="物価" value={meters.inflation} max={100} color="from-red-500 to-orange-500" />
      <MeterBar label="失業率" value={meters.unemployment} max={100} color="from-yellow-500 to-orange-500" />
      <MeterBar label="生活しやすさ" value={meters.livability} max={100} color="from-green-500 to-emerald-500" />
      <MeterBar label="国庫残高" value={meters.treasury} max={1000} color="from-blue-500 to-cyan-500" />
    </div>
  );
}
```

---

以上が設計書です。確認後、「生成OK」と言っていただければ、実際のファイル一式を生成します。

