// src/components/Tutorial/GuideOverlay.tsx
import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "../../store/useGameStore";

// store 側と合わせておけば OK（型が違っていたら `type` は消しても動きます）
type GuideStep = 1 | 2 | 3 | 4 | 5;

const stepTexts: Record<GuideStep, { title: string; body: string }> = {
  1: {
    title: "Step 1：イベントカードの読み方",
    body: "ここに国の状況が表示されます。タイトルと本文を読んで、今どんな問題が起きているかをつかみましょう。",
  },
  2: {
    title: "Step 2：政策カードを選ぼう",
    body: "下に並んでいる政策カードから 1 つ選びます。選んだ内容によって、各メーターの値が変化します。",
  },
  3: {
    title: "Step 3：メーターの見方",
    body: "画面上部の 4 本のメーター（物価・失業率・生活・国庫）のバランスを整えることが目標です。",
  },
  4: {
    title: "Step 4：CFO 行動フェーズ",
    body: "ETF 投資・外交・市民調査・産業育成などの追加アクションを選ぶことで、メーターを細かくコントロールできます。",
  },
  5: {
    title: "Step 5：ターンを進める",
    body: "「ターン終了」ボタンを押すと 1 ターン進み、次のイベントが発生します。数ターン後の結果画面までプレイしてみましょう。",
  },
};

const GuideOverlay: React.FC = () => {
  const tutorialStep = useGameStore((state) => state.tutorialStep);
  const nextTutorialStep = useGameStore((state) => state.nextTutorialStep);
  const endTutorial = useGameStore((state) => state.endTutorial);

  // チュートリアル表示中は背景のスクロールをロックする
  useEffect(() => {
    if (tutorialStep) {
      // スクロールをロック
      document.body.style.overflow = 'hidden';
    } else {
      // スクロールを解除
      document.body.style.overflow = '';
    }
    
    // クリーンアップ：コンポーネントがアンマウントされたときにスクロールを解除
    return () => {
      document.body.style.overflow = '';
    };
  }, [tutorialStep]);

  // tutorialStep が null のときは何も表示しない
  if (!tutorialStep) return null;

  const step = tutorialStep as GuideStep;
  const { title, body } = stepTexts[step];

  const handleNext = () => {
    if (step >= 5) {
      endTutorial();
    } else {
      nextTutorialStep();
    }
  };

  const nextLabel = step >= 5 ? "理解した！ゲームを始める" : "次へ →";

  return (
    <AnimatePresence>
      <motion.div
        key={step}
        className="fixed inset-0 z-[100] flex items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        // チュートリアル表示中は背景のスクロールを防ぐ
        onClick={(e) => {
          // backdropをクリックしても閉じないようにする（意図しない操作を防ぐ）
          e.stopPropagation();
        }}
      >
        {/* 半透明のbackdrop（背景を暗くする） */}
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
        
        {/* チュートリアルカード本体 */}
        <motion.div
          className="relative bg-slate-800/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8 max-w-lg w-[90vw] space-y-4 border border-slate-600/50"
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => {
            // カード内のクリックイベントが伝播しないようにする
            e.stopPropagation();
          }}
        >
          {/* チュートリアル番号 */}
          <div className="text-xs font-mono text-sky-300/80 mb-2">
            チュートリアル {step} / 5
          </div>
          
          {/* タイトル */}
          <h2 className="text-xl md:text-2xl font-bold text-slate-50 leading-tight">
            {title}
          </h2>
          
          {/* 本文 */}
          <p className="text-sm md:text-base leading-relaxed text-slate-200">
            {body}
          </p>

          {/* ボタンエリア */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
            <button
              type="button"
              className="text-sm text-slate-400 hover:text-slate-200 underline transition-colors px-2 py-1"
              onClick={endTutorial}
            >
              スキップ
            </button>
            <button
              type="button"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm md:text-base font-semibold text-slate-900 hover:bg-emerald-400 transition-colors shadow-lg hover:shadow-emerald-500/50"
              onClick={handleNext}
            >
              {nextLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GuideOverlay;
