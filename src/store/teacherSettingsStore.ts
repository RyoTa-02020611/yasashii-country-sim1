/**
 * 教師設定ストア
 * 教師モードで変更した設定を管理する
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { scenarios } from '../data/scenarios';

export type ChapterTurnSetting = {
  chapterId: string;      // 例: "chapter1", "chapter2"
  title: string;          // 表示用のタイトル
  defaultTurns: number;   // デフォルトターン数
  customTurns?: number;   // 教師が上書きした場合の値
};

type TeacherSettingsState = {
  chapters: ChapterTurnSetting[];
  setChapterTurns: (chapterId: string, turns: number) => void;
  resetChapterTurns: () => void; // すべてデフォルトに戻す
  getTurnsForChapter: (chapterId: string) => number | null; // 指定された章のターン数を取得（カスタム値があればそれ、なければnull）
};

// シナリオ定義から初期設定を生成
const initialChapters: ChapterTurnSetting[] = scenarios.map((scenario) => ({
  chapterId: scenario.id,
  title: scenario.title,
  defaultTurns: scenario.maxTurns,
  customTurns: undefined,
}));

export const useTeacherSettingsStore = create<TeacherSettingsState>()(
  persist(
    (set, get) => ({
      chapters: initialChapters,

      // 指定された章のターン数を設定
      setChapterTurns: (chapterId: string, turns: number) => {
        set((state) => ({
          chapters: state.chapters.map((chapter) =>
            chapter.chapterId === chapterId
              ? { ...chapter, customTurns: turns }
              : chapter
          ),
        }));
      },

      // すべての章の設定をデフォルトに戻す
      resetChapterTurns: () => {
        set({
          chapters: initialChapters.map((chapter) => ({
            ...chapter,
            customTurns: undefined,
          })),
        });
      },

      // 指定された章のターン数を取得（カスタム値があればそれ、なければnull）
      getTurnsForChapter: (chapterId: string) => {
        const state = get();
        const chapter = state.chapters.find((c) => c.chapterId === chapterId);
        if (!chapter) return null;
        return chapter.customTurns ?? null;
      },
    }),
    {
      name: 'teacher-settings-storage', // localStorageのキー名
    }
  )
);

