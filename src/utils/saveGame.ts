/**
 * ゲームセーブ/ロード用ユーティリティ
 */
import { SavedGameState } from '../types/game';

const STORAGE_KEY = 'nova_nation_game_v1';

export function saveGame(state: SavedGameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // エラーは静かに処理（localStorageが無効な場合など）
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to save game', e);
    }
  }
}

export function loadGame(): SavedGameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SavedGameState;
    // 必要なら version チェックなど
    // 将来的にバージョン互換性チェックを追加可能
    if (data.version !== 1) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Unsupported save version:', data.version);
      }
      return null;
    }
    return data;
  } catch (e) {
    // エラーは静かに処理
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to load game', e);
    }
    return null;
  }
}

export function clearSavedGame(): void {
  localStorage.removeItem(STORAGE_KEY);
}

