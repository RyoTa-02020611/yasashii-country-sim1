/**
 * ゲーム状態管理ストア（Zustand）
 */
import { create } from 'zustand';
import { MeterState, GameEvent, Policy, AdvisorMessage, MeterType, MeterEffects, TurnRecord, AdvisorId, GamePhase, Scenario, ScenarioId, GameResultType, ActionType, ActiveIndustryProject, SavedGameState, GuideStep } from '../types/game';
import { events } from '../data/events';
import { policies } from '../data/policies';
import { advisorComments } from '../data/advisors';
import { scenarios } from '../data/scenarios';
import { generatePriceSeries } from '../utils/priceGenerator';
import { diplomacyOptions } from '../data/diplomacyOptions';
import { industries } from '../data/industries';
import { saveGame, loadGame } from '../utils/saveGame';

// 初期メーター値（ノヴァリア王国の「普通くらい」の値）
// 調整ポイント: メーターの上限下限は以下の通り
// - 物価（price）：0〜100
// - 失業率（unemployment）：0〜100
// - 生活（life）：0〜100
// - 財政（treasury）：-100〜200（マイナスも許容するが、-100以下にはならない）
const initialMeters: MeterState[] = [
  {
    id: 'price',
    label: '物価',
    value: 40,
    min: 0,
    max: 100,
    description: '生活必需品の価格レベル',
  },
  {
    id: 'unemployment',
    label: '失業率',
    value: 25,
    min: 0,
    max: 100,
    description: '労働人口に占める失業者の割合',
  },
  {
    id: 'life',
    label: '生活しやすさ',
    value: 50,
    min: 0,
    max: 100,
    description: '国民の生活の質',
  },
  {
    id: 'treasury',
    label: '国庫残高',
    value: 400,
    min: -100, // 調整ポイント: マイナスも許容するが、-100以下にはならない
    max: 200,  // 調整ポイント: 上限を200に設定（1000から変更）
    description: '国の財政状況',
  },
];

interface GameStore {
  // 状態
  phase: GamePhase;
  currentScenario: Scenario | null;
  meters: MeterState[];
  currentEvent: GameEvent | null;
  availablePolicies: Policy[];
  advisorMessages: AdvisorMessage[];
  turn: number;
  history: TurnRecord[]; // ターンの履歴
  currentSummary: string; // 直近ターンの振り返りコメント
  resultType: GameResultType | null;
  resultMessage: string;
  
  // CFOフェーズ（Action Phase）関連
  actionPhase: boolean; // 政策選択後に true
  selectedAction: ActionType | null;
  actionLog: string[]; // 行ったアクションの記録
  
  // ETF関連
  etfPrices: number[]; // 価格チャート
  etfHolding: number; // プレイヤー保有量
  
  // 産業プロジェクト関連
  activeIndustryProjects: ActiveIndustryProject[]; // 進行中の産業プロジェクト
  
  // デバッグモード関連
  debugMode: boolean; // デバッグモードのON/OFF
  debugLog: string[]; // デバッグログ（最新のログエントリ）
  
  // チュートリアル関連
  tutorialStep: GuideStep | null; // 現在のチュートリアルステップ（null で非表示）

  // 隠しメーター（緊急融資イベント用）
  support: number; // 支持率（初期値: 50）
  credit: number;  // 信用度（初期値: 50）
  rigidity: number; // 財政硬直度（初期値: 0）
  
  // 金融政策用の隠しメーター
  inflationRisk: number;  // インフレリスク（0-100、初期値: 0）
  productivity: number;    // 生産性（0-100、初期値: 50）
  futureCost: number;      // 将来コスト（累積値、初期値: 0）

  // アクション
  // チュートリアル関連アクション
  startTutorial: () => void;
  nextTutorialStep: () => void;
  endTutorial: () => void;
  startScenario: (scenarioId: ScenarioId) => void;
  nextEvent: () => void;
  applyPolicy: (policyId: string) => void;
  endTurnAndCheckScenario: () => void;
  resetGame: () => void;
  
  // CFOフェーズ関連アクション
  startActionPhase: () => void;
  selectAction: (action: ActionType) => void;
  executeAction: () => void;
  endActionPhase: () => void;
  
  // ETF関連アクション
  initializeETF: () => void;
  buyETF: () => void;
  sellETF: () => void;
  closeETFPanel: () => void;
  
  // 外交関連アクション
  applyDiplomacyResult: (optionId: string, success: boolean) => void;
  
  // 市民調査関連アクション
  recordSurveyAction: (voiceCount: number) => void;
  
  // 産業育成関連アクション
  startIndustryProject: (projectId: string) => void;
  applyIndustryEffectsEachTurn: () => void;
  
  // セーブ/ロード関連
  toSavedState: () => SavedGameState;
  hydrateFromSavedState: (saved: SavedGameState) => void;
  
  // デバッグ関連
  toggleDebugMode: () => void;
  addDebugLog: (entry: string) => void;
  
  // チート機能（開発者向け）
  setMeterValue: (meterId: MeterType, value: number) => void;
  forceEvent: (eventId: string) => void;
  skipToScenario: (scenarioId: ScenarioId) => void;
  testETF: () => void;
  testDiplomacy: () => void;
  testSurvey: () => void;
  testIndustry: () => void;
  
  // 内部関数
  applyEffects: (effects: MeterEffects, applyScenarioBonus?: boolean) => void;
  generateSummary: (beforeMeters: MeterState[], afterMeters: MeterState[], policy: Policy) => string;
  findMainAdvisor: (policy: Policy) => AdvisorId | null;
}

export const useGameStore = create<GameStore>((set, get) => ({
    // 初期状態
    phase: 'title',
    currentScenario: null,
    meters: initialMeters,
    currentEvent: null,
    availablePolicies: policies,
    advisorMessages: [],
    turn: 1,
    history: [],
    currentSummary: '',
    resultType: null,
    resultMessage: '',
    actionPhase: false,
    selectedAction: null,
    actionLog: [],
    etfPrices: [],
    etfHolding: 0,
    activeIndustryProjects: [],
    debugMode: false, // デバッグモード（初期値はfalse、将来的にlocalStorageで保持可能）
    debugLog: [],
    tutorialStep: null, // チュートリアルステップ（初期値はnull）
    
    // 隠しメーター（緊急融資イベント用）
    support: 50,  // 支持率（初期値: 50）
    credit: 50,   // 信用度（初期値: 50）
    rigidity: 0,   // 財政硬直度（初期値: 0）
    
    // 金融政策用の隠しメーター
    inflationRisk: 0,   // インフレリスク（初期値: 0）
    productivity: 50,   // 生産性（初期値: 50）
    futureCost: 0,      // 将来コスト（初期値: 0）

    // シナリオを開始する
  startScenario: (scenarioId: ScenarioId) => {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (!scenario) return;

    // メーター・イベント・履歴を初期状態にリセット
    set({
      meters: initialMeters.map((m) => ({ ...m })),
      currentEvent: null,
      availablePolicies: policies,
      advisorMessages: [],
      turn: 1,
      history: [],
      currentSummary: '',
      resultType: null,
      resultMessage: '',
      currentScenario: scenario,
      phase: 'playing',
    });

    // 初期イベントを生成
    get().nextEvent();
    
    // 初回プレイの場合はチュートリアルを開始
    const tutorialDone = localStorage.getItem('nova_tutorial_done');
    if (!tutorialDone) {
      set({ tutorialStep: 1 });
    }
  },

  // 次のイベントに進める（シナリオ対応）
  nextEvent: () => {
    const state = get();
    const currentScenario = state.currentScenario;

    /**
     * weighted random の処理手順:
     * 1. 各イベントに対して、weight + (scenarioWeights[currentScenario.id] || 0) を計算
     * 2. 全イベントの重みの合計を計算
     * 3. 0〜合計の間のランダムな値を生成
     * 4. 累積重みを計算しながら、ランダム値が該当するイベントを選択
     */
    const weightedRandom = (events: GameEvent[]): GameEvent => {
      // 各イベントの重みを計算
      const weights = events.map((event) => {
        const baseWeight = event.weight || 1; // デフォルトは1
        const scenarioBonus = currentScenario
          ? event.scenarioWeights?.[currentScenario.id] || 0
          : 0;
        return baseWeight + scenarioBonus;
      });

      // 重みの合計を計算
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);

      // 0〜totalWeightの間のランダムな値を生成
      const random = Math.random() * totalWeight;

      // 累積重みを計算しながら、ランダム値が該当するイベントを選択
      let cumulativeWeight = 0;
      for (let i = 0; i < events.length; i++) {
        cumulativeWeight += weights[i];
        if (random < cumulativeWeight) {
          return events[i];
        }
      }

      // フォールバック（通常は到達しない）
      return events[events.length - 1];
    };

    // 重み付きランダムでイベントを選択
    const selectedEvent = weightedRandom(events);
    set({ currentEvent: selectedEvent });

    // デバッグログに記録（安全に呼び出す）
    const storeState = get();
    if (typeof storeState.addDebugLog === 'function') {
      storeState.addDebugLog(`イベント決定: ${selectedEvent.title} (ID: ${selectedEvent.id})`);
    }

    // イベントの効果を自動的に適用
    if (selectedEvent.effects) {
      get().applyEffects(selectedEvent.effects);
    }
  },

  // 選んだ政策に応じてメーターの値を変える
  applyPolicy: (policyId: string) => {
    const policy = policies.find((p) => p.id === policyId);
    if (!policy) return;

    const state = get();
    
    // 適用前のメーター状態をコピー（スナップショット）
    const beforeMeters: MeterState[] = state.meters.map((m) => ({
      ...m,
      value: m.value,
    }));

    // 政策の効果を適用
    if (policy.effects) {
      get().applyEffects(policy.effects);
    }

    // 適用後のメーター状態を取得
    const afterMeters: MeterState[] = get().meters.map((m) => ({
      ...m,
      value: m.value,
    }));

    // サマリーを生成
    const summary = get().generateSummary(beforeMeters, afterMeters, policy);
    
    // 主なアドバイザーを特定
    const mainAdvisorId = get().findMainAdvisor(policy);

    // ターンレコードを作成
    const turnRecord: TurnRecord = {
      turn: state.turn,
      selectedPolicyId: policyId,
      mainAdvisorId,
      beforeMeters,
      afterMeters,
      summary,
    };

    // アドバイザーメッセージを生成
    const messages: AdvisorMessage[] = Object.keys(advisorComments).map((advisorId) => {
      const comments = advisorComments[advisorId as AdvisorId];
      const randomComment = comments[Math.floor(Math.random() * comments.length)];

      return {
        advisorId: advisorId as AdvisorId,
        text: randomComment,
        relatedPolicyId: policyId,
      };
    });

    // 履歴に追加して状態を更新
    set({
      advisorMessages: messages,
      history: [...state.history, turnRecord],
      currentSummary: summary,
    });

    // 政策適用後、CFOフェーズ（Action Phase）を開始
    get().startActionPhase();

    // オートセーブ
    saveGame(get().toSavedState());
  },

  // 効果をメーターに適用する内部関数
  // メーターの暴走を防ぐため、clamping（上限下限の適用）を実装
  // シナリオテーマごとの補正も適用（調整ポイント: +1〜2程度の微調整）
  // メーターに効果を適用する（内部関数）
  // パフォーマンス最適化: オブジェクト再生成を避け、ループをまとめる
  applyEffects: (effects: MeterEffects, applyScenarioBonus: boolean = false) => {
    set((state) => {
      const scenario = state.currentScenario;
      
      // シナリオ補正を先に計算（オブジェクト再生成を1回に）
      let adjustedPrice = effects.price ?? 0;
      let adjustedUnemployment = effects.unemployment ?? 0;
      let adjustedLife = effects.life ?? 0;
      let adjustedTreasury = effects.treasury ?? 0;

      // シナリオテーマごとの補正を適用（調整ポイント: +1〜2程度の微調整）
      if (applyScenarioBonus && scenario) {
        switch (scenario.theme) {
          case 'inflation':
            // chapter2（物価章）: price 上昇イベントが気持ち強め
            if (adjustedPrice > 0) adjustedPrice += 1;
            break;
          case 'unemployment':
            // chapter3（失業章）: unemployment 改善効果 +1 bonus
            if (adjustedUnemployment < 0) adjustedUnemployment -= 1; // マイナスなので-1で改善が大きくなる
            break;
          case 'fiscal':
            // chapter4（財政章）: treasury 改善効果 +1 bonus
            if (adjustedTreasury > 0) adjustedTreasury += 1;
            break;
          case 'diplomacy':
            // chapter5（外交章）: price 上昇イベントが気持ち強め
            if (adjustedPrice > 0) adjustedPrice += 1;
            break;
          case 'mixed':
            // 補正なし
            break;
        }
      }

      // メーター更新を1回のループで処理（パフォーマンス最適化）
      const newMeters = state.meters.map((meter) => {
        let newValue = meter.value;

        // 各メータータイプに対応する効果を適用し、clamp を同時に実行
        // 調整ポイント: メーターの値は必ず min と max の間になるように制限
        switch (meter.id) {
          case 'price':
            if (effects.price !== undefined) {
              newValue = Math.max(meter.min, Math.min(meter.max, meter.value + adjustedPrice));
            }
            break;
          case 'unemployment':
            if (effects.unemployment !== undefined) {
              newValue = Math.max(meter.min, Math.min(meter.max, meter.value + adjustedUnemployment));
            }
            break;
          case 'life':
            if (effects.life !== undefined) {
              newValue = Math.max(meter.min, Math.min(meter.max, meter.value + adjustedLife));
            }
            break;
          case 'treasury':
            if (effects.treasury !== undefined) {
              newValue = Math.max(meter.min, Math.min(meter.max, meter.value + adjustedTreasury));
            }
            break;
        }
        
        // 値が変わった場合のみ新しいオブジェクトを返す（参照の安定化）
        if (newValue === meter.value) {
          return meter; // 同じ参照を返すことで再レンダリングを防ぐ
        }
        return { ...meter, value: newValue };
      });
      
      return { meters: newMeters };
    });
  },

  // サマリーを生成する関数
  generateSummary: (beforeMeters: MeterState[], afterMeters: MeterState[], policy: Policy) => {
    // 各メーターの変化量を計算
    const changes: Record<MeterType, number> = {
      price: 0,
      unemployment: 0,
      life: 0,
      treasury: 0,
    };

    beforeMeters.forEach((before) => {
      const after = afterMeters.find((m) => m.id === before.id);
      if (after) {
        changes[before.id] = after.value - before.value;
      }
    });

    // 最も変化が大きかった指標を特定
    const maxChange = Math.max(
      Math.abs(changes.price),
      Math.abs(changes.unemployment),
      Math.abs(changes.life),
      Math.abs(changes.treasury)
    );

    // サマリーを生成
    if (Math.abs(changes.unemployment) === maxChange && changes.unemployment < 0) {
      return 'このターンは「仕事」を重視した判断でした。失業率が改善しました。';
    } else if (Math.abs(changes.treasury) === maxChange && changes.treasury < 0) {
      return '雇用や物価を優先した結果、財政がやや悪化しました。';
    } else if (Math.abs(changes.price) === maxChange && changes.price < 0) {
      return '物価抑制に焦点を当てた政策を選択しました。';
    } else if (Math.abs(changes.life) === maxChange && changes.life > 0) {
      return '国民の生活の質を向上させる政策を実施しました。';
    } else if (changes.treasury > 0) {
      return '財政状況が改善しました。';
    } else if (changes.unemployment > 0) {
      return '失業率が上昇しました。雇用対策が必要かもしれません。';
    } else {
      return 'バランスの取れた政策選択でした。';
    }
  },

  // 政策に関連する主なアドバイザーを特定
  findMainAdvisor: (policy: Policy): AdvisorId | null => {
    // 政策の説明や名前からアドバイザーを推測
    const policyName = policy.name.toLowerCase();
    const policyDesc = policy.description.toLowerCase();

    if (policyDesc.includes('公共事業') || policyDesc.includes('インフラ')) {
      return 'haru';
    } else if (policyDesc.includes('教育') || policyDesc.includes('学校')) {
      return 'sato';
    } else if (policyDesc.includes('医療') || policyDesc.includes('福祉') || policyDesc.includes('健康')) {
      return 'tsumugi';
    } else if (policyDesc.includes('デジタル') || policyDesc.includes('効率')) {
      return 'mina';
    } else if (policyDesc.includes('税') || policyDesc.includes('財政') || policyDesc.includes('金利')) {
      return 'riku';
    } else {
      // デフォルトはナビ（データ分析）
      return 'navi';
    }
  },

  // ターン終了とシナリオ条件チェック
  endTurnAndCheckScenario: () => {
    const state = get();
    const scenario = state.currentScenario;
    
    if (!scenario) return;

    // 産業プロジェクトの効果をターンごとに適用する
    get().applyIndustryEffectsEachTurn();

    // ターンをインクリメント
    const newTurn = state.turn + 1;

    // 失敗条件をチェック
    if (scenario.failCondition) {
      const { meter, threshold, direction, message } = scenario.failCondition;
      const meterState = state.meters.find((m) => m.id === meter);
      
      if (meterState) {
        const isFail = direction === 'below' 
          ? meterState.value < threshold
          : meterState.value > threshold;
        
        if (isFail) {
          set({
            phase: 'result',
            resultType: 'fail',
            resultMessage: message,
            turn: newTurn,
          });
          return;
        }
      }
    }

    // 最終章の複合的な失敗条件（2つ以上のメーターが危険ゾーン）
    if (scenario.id === 'final') {
      const dangerZones: string[] = [];
      
      // 各メーターの危険ゾーンをチェック
      state.meters.forEach((meter) => {
        let isDanger = false;
        
        switch (meter.id) {
          case 'price':
            isDanger = meter.value > 80; // 物価が80以上
            break;
          case 'unemployment':
            isDanger = meter.value > 80; // 失業率が80以上
            break;
          case 'treasury':
            isDanger = meter.value < 50; // 国庫残高が50未満
            break;
          case 'life':
            isDanger = meter.value < 30; // 生活しやすさが30未満
            break;
        }
        
        if (isDanger) {
          dangerZones.push(meter.label);
        }
      });
      
      // 2つ以上のメーターが危険ゾーンなら失敗
      if (dangerZones.length >= 2) {
        set({
          phase: 'result',
          resultType: 'fail',
          resultMessage: `複数の指標が危険ゾーンに達しました（${dangerZones.join('、')}）。ノヴァリアは危機を乗り越えられませんでした…`,
          turn: newTurn,
        });
        return;
      }
    }

    // maxTurnsに到達したらクリア
    if (newTurn > scenario.maxTurns) {
      set({
        phase: 'result',
        resultType: 'clear',
        resultMessage: `${scenario.title}をクリアしました！ノヴァリア王国は危機を乗り越えました。`,
        turn: newTurn,
      });
      return;
    }

    // ターンを進める
    set({ turn: newTurn });

    // ========== 緊急融資イベント（Bailout）の自動発動 ==========
    // 財政がマイナスになった場合、自動で緊急融資イベントを発生させる
    const currentStateAfterTurn = get();
    const treasuryMeter = currentStateAfterTurn.meters.find((m) => m.id === 'treasury');
    
    if (treasuryMeter && treasuryMeter.value < 0) {
      // 緊急融資イベントの効果を適用
      // 国庫に +40 追加
      get().applyEffects({ treasury: 40 });
      
      // 隠しメーターの更新
      const updatedState = get();
      set({
        support: Math.max(0, updatedState.support - 5),  // 支持率 -5
        credit: Math.max(0, updatedState.credit - 10),   // 信用度 -10
        rigidity: updatedState.rigidity + 5,              // 財政硬直度 +5
      });
      
      // イベントログに追加
      const finalState = get();
      finalState.actionLog.push('財政赤字のため国際機関から緊急融資が行われました（+40）。自由度が減少しました。');
      
      // デバッグログに記録（安全に呼び出す）
      if (typeof finalState.addDebugLog === 'function') {
        finalState.addDebugLog(`[緊急融資] 国庫: ${treasuryMeter.value} → ${treasuryMeter.value + 40}, 支持率: ${updatedState.support} → ${finalState.support}, 信用度: ${updatedState.credit} → ${finalState.credit}, 硬直度: ${updatedState.rigidity} → ${finalState.rigidity}`);
      }
    }
    // ========== 緊急融資イベント処理終了 ==========

    // オートセーブ
    saveGame(get().toSavedState());
  },

  // CFOフェーズ（Action Phase）を開始
  startActionPhase: () => {
    set({
      actionPhase: true,
      selectedAction: null,
    });
  },

  // アクションを選択
  selectAction: (action: ActionType) => {
    set({ selectedAction: action });
  },

  // アクションを実行
  executeAction: () => {
    const state = get();
    if (!state.selectedAction) return;

    const actionMessages: Record<ActionType, string> = {
      etf: '光の石ETFを売買しました。財政が少し改善しました。',
      diplomacy: '他国と交渉しました。光の石価格が安定しました。',
      survey: '市民街の調査を行いました。生活の質が向上しました。',
      industry: '特定産業に投資しました。雇用が改善しました。',
    };

    // アクションごとの効果を適用（簡易ロジック）
    const actionEffects: Record<ActionType, MeterEffects> = {
      etf: {
        treasury: 5,
        life: 1,
      },
      diplomacy: {
        price: -2,
      },
      survey: {
        life: 2,
      },
      industry: {
        unemployment: -3,
      },
    };

    const effects = actionEffects[state.selectedAction];
    if (effects) {
      get().applyEffects(effects, true); // シナリオ補正を適用
    }

    // デバッグログに記録（安全に呼び出す）
    const currentState = get();
    if (typeof currentState.addDebugLog === 'function') {
      currentState.addDebugLog(`CFO行動実行: ${state.selectedAction}`);
    }

    // ログに追加
    const logMessage = actionMessages[state.selectedAction] || `${state.selectedAction}を実行しました。`;
    set({
      actionLog: [...state.actionLog, logMessage],
    });

    // アクションフェーズを終了
    get().endActionPhase();
  },

  // CFOフェーズ（Action Phase）を終了
  endActionPhase: () => {
    set({
      actionPhase: false,
      selectedAction: null,
    });
  },

  // 市民調査アクションを記録
  recordSurveyAction: (voiceCount: number) => {
    const state = get();
    const logMessage = `市民調査を実施しました（${voiceCount}件の市民の声を聞きました）。`;
    set({
      actionLog: [...state.actionLog, logMessage],
    });
    
    // デバッグログに記録（安全に呼び出す）
    const currentState = get();
    if (typeof currentState.addDebugLog === 'function') {
      currentState.addDebugLog(`市民調査: ${voiceCount}件の声を聞きました`);
    }
  },

  // ETFを初期化
  initializeETF: () => {
    const prices = generatePriceSeries(20, 100); // 過去20ターン分の価格データ
    set({
      etfPrices: prices,
      etfHolding: 0,
    });
  },

  // ETFを購入
  buyETF: () => {
    const state = get();
    if (state.etfPrices.length === 0) return;

    const currentPrice = state.etfPrices[state.etfPrices.length - 1];
    const treasuryMeter = state.meters.find((m) => m.id === 'treasury');

    // 国庫残高が十分にあるかチェック
    if (treasuryMeter && treasuryMeter.value >= currentPrice) {
      // 国庫残高を減らす
      get().applyEffects({
        treasury: -currentPrice,
      });

      // 保有量を増やす
      set({
        etfHolding: state.etfHolding + 1,
      });
    }
  },

  // ETFを売却
  sellETF: () => {
    const state = get();
    if (state.etfPrices.length === 0 || state.etfHolding <= 0) return;

    const currentPrice = state.etfPrices[state.etfPrices.length - 1];

    // 国庫残高を増やす
    get().applyEffects({
      treasury: currentPrice,
    });

    // 保有量を減らす
    set({
      etfHolding: state.etfHolding - 1,
    });
  },

  // ETFパネルを閉じる（行動フェーズ終了）
  closeETFPanel: () => {
    // アクションフェーズを終了
    get().endActionPhase();
  },

  // 金融政策の結果を適用
  applyDiplomacyResult: (optionId: string, success: boolean) => {
    const option = diplomacyOptions.find((o) => o.id === optionId);
    if (!option) return;

    const effects = success ? option.effects : (option.failEffects || option.effects);

    // 基本メーターへの影響を適用（シナリオ補正を適用）
    get().applyEffects({
      price: effects.price,
      treasury: effects.treasury,
      unemployment: effects.unemployment,
      life: effects.life,
    }, true); // シナリオ補正を適用

    // 隠しメーター（金融政策用）への影響を適用
    const currentState = get();
    const updates: Partial<GameStore> = {};
    
    if (effects.credit !== undefined) {
      updates.credit = Math.max(0, Math.min(100, currentState.credit + effects.credit));
    }
    if (effects.support !== undefined) {
      updates.support = Math.max(0, Math.min(100, currentState.support + effects.support));
    }
    if (effects.inflationRisk !== undefined) {
      updates.inflationRisk = Math.max(0, Math.min(100, currentState.inflationRisk + effects.inflationRisk));
    }
    if (effects.productivity !== undefined) {
      updates.productivity = Math.max(0, Math.min(100, currentState.productivity + effects.productivity));
    }
    if (effects.futureCost !== undefined) {
      updates.futureCost = Math.max(0, currentState.futureCost + effects.futureCost);
    }
    
    // 産業投資（研究開発支援）の場合は、遅延効果を処理
    if (option.id === 'finance-4' && success) {
      // 2ターン後に生産性がさらに向上する効果は、別途実装が必要
      // ここでは即座に効果を適用（簡易版）
    }
    
    if (Object.keys(updates).length > 0) {
      set(updates);
    }

    // デバッグログに記録（安全に呼び出す）
    const finalState = get();
    if (typeof finalState.addDebugLog === 'function') {
      const effectDetails: string[] = [];
      if (effects.price) effectDetails.push(`物価${effects.price > 0 ? '+' : ''}${effects.price}`);
      if (effects.treasury) effectDetails.push(`国庫${effects.treasury > 0 ? '+' : ''}${effects.treasury}`);
      if (effects.unemployment) effectDetails.push(`失業率${effects.unemployment > 0 ? '+' : ''}${effects.unemployment}`);
      if (effects.credit) effectDetails.push(`信用度${effects.credit > 0 ? '+' : ''}${effects.credit}`);
      if (effects.inflationRisk) effectDetails.push(`インフレリスク${effects.inflationRisk > 0 ? '+' : ''}${effects.inflationRisk}`);
      if (effects.productivity) effectDetails.push(`生産性${effects.productivity > 0 ? '+' : ''}${effects.productivity}`);
      
      finalState.addDebugLog(`金融政策: ${option.title} (${success ? '成功' : '失敗'}) - ${effectDetails.join(', ')}`);
    }

    // 行動ログに追加
    const logMessage = success
      ? `金融政策「${option.title}」が成功しました。`
      : `金融政策「${option.title}」が失敗しました。`;
    
    const stateAfterUpdate = get();
    set({
      actionLog: [...stateAfterUpdate.actionLog, logMessage],
    });
  },

  // 産業プロジェクトを開始する
  startIndustryProject: (projectId: string) => {
    const state = get();
    const project = industries.find((p) => p.id === projectId);
    if (!project) return;

    // 国庫が足りない場合は何もしない（呼び出し側でエラーメッセージを出す想定）
    const treasuryMeter = state.meters.find((m) => m.id === 'treasury');
    if (!treasuryMeter || treasuryMeter.value < project.cost) {
      return; // 呼び出し側でエラーメッセージを表示
    }

    // 国庫からコストを差し引く
    get().applyEffects({
      treasury: -project.cost,
    });

    // ActiveIndustryProjectとして追加
    const activeProject: ActiveIndustryProject = {
      ...project,
      remainingDelay: project.delay,
      remainingDuration: project.duration,
    };

    set({
      activeIndustryProjects: [...state.activeIndustryProjects, activeProject],
      actionLog: [...state.actionLog, `産業プロジェクト「${project.name}」を開始しました（コスト: ${project.cost}）。`],
    });

    // デバッグログに記録（安全に呼び出す）
    const currentState = get();
    if (typeof currentState.addDebugLog === 'function') {
      currentState.addDebugLog(`産業プロジェクト開始: ${project.name} (コスト: ${project.cost}, 遅延: ${project.delay}ターン, 継続: ${project.duration}ターン)`);
    }

    // オートセーブ
    saveGame(get().toSavedState());
  },

  // 産業プロジェクトの効果をターンごとに適用する
  applyIndustryEffectsEachTurn: () => {
    const state = get();
    const updatedProjects: ActiveIndustryProject[] = [];
    const effects: MeterEffects = {
      unemployment: 0,
      treasury: 0,
      life: 0,
    };

    // 各プロジェクトを処理
    state.activeIndustryProjects.forEach((project) => {
      if (project.remainingDelay > 0) {
        // まだ遅延中 → remainingDelayを減らすだけ
        updatedProjects.push({
          ...project,
          remainingDelay: project.remainingDelay - 1,
        });
      } else if (project.remainingDuration > 0) {
        // 効果が発動中 → 効果を適用し、remainingDurationを減らす
        effects.unemployment += project.effectsPerTurn.unemployment;
        effects.treasury += project.effectsPerTurn.treasury;
        effects.life += project.effectsPerTurn.life;

        if (project.remainingDuration > 1) {
          // まだ効果が続く
          updatedProjects.push({
            ...project,
            remainingDuration: project.remainingDuration - 1,
          });
        }
        // remainingDuration === 1 の場合は配列に追加しない（削除される）
      }
    });

    // 効果を適用
    if (effects.unemployment !== 0 || effects.treasury !== 0 || effects.life !== 0) {
      get().applyEffects(effects);
      
      // デバッグログに記録（安全に呼び出す）
      const currentState = get();
      if (typeof currentState.addDebugLog === 'function') {
        currentState.addDebugLog(`産業プロジェクト効果適用: 失業${effects.unemployment}, 国庫${effects.treasury}, 生活${effects.life}`);
      }
    }

    // 更新されたプロジェクトリストを保存
    set({
      activeIndustryProjects: updatedProjects,
    });
  },

  // ゲームを最初の状態に戻す
  resetGame: () => {
    set({
      phase: 'title',
      currentScenario: null,
      meters: initialMeters.map((m) => ({ ...m })),
      currentEvent: null,
      availablePolicies: policies,
      advisorMessages: [],
      turn: 1,
      history: [],
      currentSummary: '',
      resultType: null,
      resultMessage: '',
      actionPhase: false,
      selectedAction: null,
      actionLog: [],
      etfPrices: [],
      etfHolding: 0,
      activeIndustryProjects: [],
      debugLog: [], // デバッグログもリセット（debugModeは保持）
      tutorialStep: null, // チュートリアルもリセット
      // 緊急融資イベント用の隠しメーターもリセット
      support: 50,
      credit: 50,
      rigidity: 0,
      // 金融政策用の隠しメーターもリセット
      inflationRisk: 0,
      productivity: 50,
      futureCost: 0,
    });
  },

  // 現在のストア状態をSavedGameStateに変換
  toSavedState: (): SavedGameState => {
    const state = get();
    return {
      version: 1,
      timestamp: Date.now(),
      phase: state.phase,
      currentScenarioId: state.currentScenario?.id || null,
      turn: state.turn,
      meters: state.meters.map((m) => ({ ...m })),
      history: state.history.map((h) => ({ ...h })),
      activeIndustryProjects: state.activeIndustryProjects.map((p) => ({ ...p })),
      etfHolding: state.etfHolding,
      // 緊急融資イベント用の隠しメーターも保存
      support: state.support,
      credit: state.credit,
      rigidity: state.rigidity,
      // 金融政策用の隠しメーターも保存
      inflationRisk: state.inflationRisk,
      productivity: state.productivity,
      futureCost: state.futureCost,
    };
  },

  // セーブデータからストア状態を復元
  hydrateFromSavedState: (saved: SavedGameState): void => {
    const scenario = saved.currentScenarioId
      ? scenarios.find((s) => s.id === saved.currentScenarioId)
      : null;

    set({
      phase: saved.phase,
      currentScenario: scenario,
      turn: saved.turn,
      meters: saved.meters.map((m) => ({ ...m })),
      history: saved.history.map((h) => ({ ...h })),
      activeIndustryProjects: saved.activeIndustryProjects.map((p) => ({ ...p })),
      etfHolding: saved.etfHolding || 0,
      // 緊急融資イベント用の隠しメーター（後方互換性のため、デフォルト値を設定）
      support: saved.support ?? 50,
      credit: saved.credit ?? 50,
      rigidity: saved.rigidity ?? 0,
      // 金融政策用の隠しメーター（後方互換性のため、デフォルト値を設定）
      inflationRisk: saved.inflationRisk ?? 0,
      productivity: saved.productivity ?? 50,
      futureCost: saved.futureCost ?? 0,
      // その他の状態は初期値のまま（必要に応じて追加）
      currentEvent: null,
      availablePolicies: policies,
      advisorMessages: [],
      currentSummary: '',
      resultType: null,
      resultMessage: '',
      actionPhase: false,
      selectedAction: null,
      actionLog: [],
      etfPrices: [],
    });

    // シナリオが復元された場合、次のイベントを生成
    if (scenario && saved.phase === 'playing') {
      get().nextEvent();
    }
  },

  // ========== チート機能（開発者向け） ==========
  // 本番環境（Vercel）では cheat panel は表示されません

  // メーター値を任意に設定
  setMeterValue: (meterId: MeterType, value: number) => {
    set((state) => {
      const newMeters = state.meters.map((meter) => {
        if (meter.id === meterId) {
          // 値を min/max の範囲にクランプ
          const clampedValue = Math.max(meter.min, Math.min(meter.max, value));
          return { ...meter, value: clampedValue };
        }
        return meter;
      });
      const currentState = get();
      if (typeof currentState.addDebugLog === 'function') {
        currentState.addDebugLog(`[CHEAT] メーター変更: ${meterId} = ${value}`);
      }
      return { meters: newMeters };
    });
  },

  // 任意のイベントを強制発火
  forceEvent: (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) {
      console.warn(`[CHEAT] イベントが見つかりません: ${eventId}`);
      return;
    }
    set({ currentEvent: event });
    const currentState = get();
    if (typeof currentState.addDebugLog === 'function') {
      currentState.addDebugLog(`[CHEAT] イベント強制発火: ${event.title}`);
    }
    
    // イベントの効果を自動的に適用
    if (event.effects) {
      get().applyEffects(event.effects);
    }
  },

  // シナリオをスキップ
  skipToScenario: (scenarioId: ScenarioId) => {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (!scenario) {
      console.warn(`[CHEAT] シナリオが見つかりません: ${scenarioId}`);
      return;
    }
    
    // シナリオを開始（リセットしてから開始）
    get().startScenario(scenarioId);
    const currentState = get();
    if (typeof currentState.addDebugLog === 'function') {
      currentState.addDebugLog(`[CHEAT] シナリオスキップ: ${scenario.title}`);
    }
  },

  // CFO行動のテスト関数
  testETF: () => {
    get().startActionPhase();
    get().selectAction('etf');
    get().executeAction();
    get().endActionPhase();
    const currentState = get();
    if (typeof currentState.addDebugLog === 'function') {
      currentState.addDebugLog('[CHEAT] ETF テスト実行');
    }
  },

  testDiplomacy: () => {
    get().startActionPhase();
    get().selectAction('diplomacy');
    // 外交は実際のパネルで選択する必要があるため、ここではアクション選択まで
    const currentState = get();
    if (typeof currentState.addDebugLog === 'function') {
      currentState.addDebugLog('[CHEAT] 外交アクション選択（実際の交渉はパネルで実行）');
    }
  },

  testSurvey: () => {
    get().startActionPhase();
    get().selectAction('survey');
    get().recordSurveyAction(3); // 3件の市民の声を聞いた想定
    get().endActionPhase();
    const currentState = get();
    if (typeof currentState.addDebugLog === 'function') {
      currentState.addDebugLog('[CHEAT] 市民調査テスト実行');
    }
  },

  testIndustry: () => {
    get().startActionPhase();
    get().selectAction('industry');
    const currentState = get();
    if (typeof currentState.addDebugLog === 'function') {
      currentState.addDebugLog('[CHEAT] 産業育成アクション選択（実際の投資はパネルで実行）');
    }
  },

  // チュートリアル関連アクション
  startTutorial: () => {
    set({ tutorialStep: 1 });
  },

  nextTutorialStep: () => {
    const state = get();
    if (state.tutorialStep === null) return;
    if (state.tutorialStep >= 5) {
      // 最後のステップなら終了
      get().endTutorial();
    } else {
      set({ tutorialStep: (state.tutorialStep + 1) as GuideStep });
    }
  },

  endTutorial: () => {
    set({ tutorialStep: null });
    // localStorageに完了フラグを保存
    localStorage.setItem('nova_tutorial_done', 'true');
  },
}));

