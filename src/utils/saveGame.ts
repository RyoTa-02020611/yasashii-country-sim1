/**
 * ゲームセーブ/ロード用ユーティリティ
 */
import { SavedGameState } from '../types/game';

const STORAGE_KEY = 'nova_nation_game_v1';

// Vercel build fix: セーブデータのバージョン管理用定数（process.envを使わない実装）
const SAVE_VERSION = 1;

// Vercel build fix: 開発環境判定をViteの環境変数から取得（フロントエンド向けの安全な実装）
const isDevelopment = import.meta.env.DEV;

export function saveGame(state: SavedGameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // エラーは静かに処理（localStorageが無効な場合など）
    if (isDevelopment) {
      console.error('Failed to save game', e);
    }
  }
}

export function loadGame(): SavedGameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SavedGameState;
    // Vercel build fix: バージョンチェック（定数を使用）
    if (data.version !== SAVE_VERSION) {
      if (isDevelopment) {
        console.warn('Unsupported save version:', data.version);
      }
      return null;
    }
    return data;
  } catch (e) {
    // エラーは静かに処理
    if (isDevelopment) {
      console.error('Failed to load game', e);
    }
    return null;
  }
}

export function clearSavedGame(): void {
  localStorage.removeItem(STORAGE_KEY);
}

