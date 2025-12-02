/**
 * ゲームの型定義
 */

// メーターの種類
export type MeterType = "price" | "unemployment" | "life" | "treasury";

// メーター1つ分の状態
export interface MeterState {
  id: MeterType;
  label: string;
  value: number;
  min: number;
  max: number;
  description: string;
}

// メーターへの効果（変化量）
export interface MeterEffects {
  price?: number;        // 物価への影響
  unemployment?: number; // 失業率への影響
  life?: number;         // 生活しやすさへの影響
  treasury?: number;     // 国庫残高への影響
}

// イベントデータ
export interface GameEvent {
  id: string;
  title: string;
  description: string;
  effects?: MeterEffects; // イベントによる自動的な影響（プレースホルダ）
  applicableScenarios?: ScenarioId[]; // 指定されていれば、その章で優先的に出す
  weight?: number; // 基本出現率（1〜5くらい、デフォルトは1）
  scenarioWeights?: Partial<Record<ScenarioId, number>>; // シナリオごとの上乗せ重み
}

// 政策カード
export interface Policy {
  id: string;
  name: string;
  description: string;
  targetMeters: MeterType[]; // この政策が影響を与えるメーターの種類
  effects?: MeterEffects;     // 効果（プレースホルダ）
  applicableScenarios?: ScenarioId[]; // 指定されていれば、その章で優先的に出す
}

// アドバイザーID
export type AdvisorId = "riku" | "haru" | "sato" | "tsumugi" | "mina" | "navi";

// アドバイザーのセリフ
export interface AdvisorMessage {
  advisorId: AdvisorId;
  text: string;
  relatedPolicyId?: string; // 関連する政策ID（オプション）
}

// ターンの記録（振り返りレポート用）
export interface TurnRecord {
  turn: number; // ターン番号
  selectedPolicyId: string | null; // そのターンで選んだ政策
  mainAdvisorId: AdvisorId | null; // その政策の主なアドバイザー（なければ null）
  beforeMeters: MeterState[]; // 選択前のメーター状態（スナップショット）
  afterMeters: MeterState[]; // 選択後のメーター状態
  summary: string; // そのターンの簡単な振り返りコメント
}

// ゲームフェーズ
export type GamePhase = 'title' | 'playing' | 'result';

// チュートリアルステップ
export type GuideStep = 1 | 2 | 3 | 4 | 5;

// シナリオID
export type ScenarioId =
  | 'chapter1'
  | 'chapter2'
  | 'chapter3'
  | 'chapter4'
  | 'chapter5'
  | 'final';

// ゲーム結果の種類
export type GameResultType = 'clear' | 'fail' | 'bankruptcy';

// エンディング種別
export type EndingType = 'balanced' | 'austerity' | 'debt_crisis' | 'bankruptcy' | null;

// ランク評価
export type RankType = 'S' | 'A' | 'B' | 'C' | 'D';

// 失敗条件
export interface FailCondition {
  meter: MeterType;
  threshold: number;
  direction: 'below' | 'above';
  message: string;
}

// シナリオのテーマ
export type ScenarioTheme = 'inflation' | 'unemployment' | 'fiscal' | 'diplomacy' | 'mixed';

// シナリオ
export interface Scenario {
  id: ScenarioId;
  title: string;
  description: string;
  maxTurns: number;
  theme: ScenarioTheme;
  focusMeters: MeterType[]; // その章で特に見てほしいメーター
  failCondition?: FailCondition;
}

// プレイヤーの集計結果（ダッシュボード用）
export interface PlayerSummary {
  totalTurns: number;
  mostUsedAdvisorId: AdvisorId | null;
  advisorUseCount: Record<AdvisorId, number>;
  // 各メーターごとの「合計改善量」と「合計悪化量」
  meterChangeSummary: {
    [key in MeterType]: {
      increaseTotal: number;
      decreaseTotal: number;
    };
  };
  // 典型的なミスパターンをテキストで表現
  commonPitfallMessages: string[];
}

// アクションの種類
export type ActionType = 'etf' | 'diplomacy' | 'survey' | 'industry';

// ゲームアクション
export interface GameAction {
  id: ActionType;
  name: string;
  description: string;
}

// 産業の種類
export type IndustryType = 'agriculture' | 'manufacturing' | 'services' | 'magicTech';

// 産業プロジェクト
export interface IndustryProject {
  id: string;
  industry: IndustryType;
  name: string;
  description: string;
  cost: number; // 今すぐ支払う国庫コスト
  delay: number; // 何ターン後から効果が出始めるか
  duration: number; // 何ターン効果が続くか
  effectsPerTurn: {
    unemployment: number; // 失業率の変化（マイナスで改善）
    treasury: number;     // 国庫へのプラス/マイナス
    life: number;         // 生活しやすさ
  };
}

// 進行中の産業プロジェクト
export interface ActiveIndustryProject extends IndustryProject {
  remainingDelay: number;   // 残りの遅延ターン数
  remainingDuration: number; // 残りの効果継続ターン数
}

// セーブデータの型
export interface SavedGameState {
  version: number;
  timestamp: number;
  phase: GamePhase;
  currentScenarioId: ScenarioId | null;
  turn: number;
  meters: MeterState[];
  history: TurnRecord[];
  // CFO 行動関連
  activeIndustryProjects: ActiveIndustryProject[];
  // 必要なら他の state も追加（etfHolding など）
  etfHolding?: number;
  // 緊急融資イベント用の隠しメーター（オプション、後方互換性のため）
  support?: number;
  credit?: number;
  rigidity?: number;
  // 金融政策用の隠しメーター（オプション、後方互換性のため）
  inflationRisk?: number;  // インフレリスク（0-100）
  productivity?: number;    // 生産性（0-100）
  futureCost?: number;      // 将来コスト（累積値）
  // CFO財務調整関連（オプション、後方互換性のため）
  debtLevel?: number;      // 借金レベル（0から開始）
  reserveUsed?: boolean;   // 予備費取り崩しフラグ
}

