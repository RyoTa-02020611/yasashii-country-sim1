/**
 * 価格生成ユーティリティ
 */

/**
 * 価格の時系列データを生成する
 * @param length 生成する価格データの数
 * @param startPrice 開始価格（デフォルト: 100）
 * @returns 価格の配列
 */
export function generatePriceSeries(length: number, startPrice = 100): number[] {
  const prices = [startPrice];

  for (let i = 1; i < length; i++) {
    const change = (Math.random() - 0.5) * 6; // -3〜+3くらい
    prices.push(Math.max(10, prices[i - 1] + change));
  }

  return prices;
}

