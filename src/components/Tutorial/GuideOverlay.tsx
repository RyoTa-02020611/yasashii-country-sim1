// src/components/Tutorial/GuideOverlay.tsx
import React from "react";
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
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="max-w-md w-full rounded-2xl bg-slate-900 text-slate-50 shadow-xl p-4 space-y-3 border border-slate-700"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
        >
          <div className="text-xs font-mono text-sky-300">チュートリアル {step} / 5</div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm leading-relaxed">{body}</p>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="text-xs text-slate-400 hover:text-slate-200 underline"
              onClick={endTutorial}
            >
              スキップ
            </button>
            <button
              type="button"
              className="rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-slate-900 hover:bg-emerald-400"
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
