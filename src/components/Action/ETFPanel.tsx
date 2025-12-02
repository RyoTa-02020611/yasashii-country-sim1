/**
 * ETFミニゲームパネル
 */
import { useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';

export default function ETFPanel() {
  const {
    etfPrices,
    etfHolding,
    meters,
    initializeETF,
    buyETF,
    sellETF,
    closeETFPanel,
  } = useGameStore();

  // コンポーネントマウント時にETFを初期化
  useEffect(() => {
    initializeETF();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentPrice = etfPrices.length > 0 ? etfPrices[etfPrices.length - 1] : 0;
  const treasuryMeter = meters.find((m) => m.id === 'treasury');
  const treasuryValue = treasuryMeter?.value || 0;

  // チャート用のデータを準備（価格を正規化）
  const maxPrice = Math.max(...etfPrices, 1);
  const minPrice = Math.min(...etfPrices, 1);
  const priceRange = maxPrice - minPrice || 1;

  // SVG用のポイントを生成
  const chartWidth = 400;
  const chartHeight = 150;
  const points = etfPrices
    .map((price, index) => {
      const x = (index / (etfPrices.length - 1 || 1)) * chartWidth;
      const normalizedPrice = (price - minPrice) / priceRange;
      const y = chartHeight - normalizedPrice * chartHeight;
      return `${x},${y}`;
    })
    .join(' ');

  const canBuy = treasuryValue >= currentPrice;
  const canSell = etfHolding > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-white/20">
          {/* タイトル */}
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">💎 光の石ETFミニゲーム</h2>
            <p className="text-sm md:text-base text-gray-300">
              光の石の価格変動を利用して財政を調整します
            </p>
          </div>

          {/* 現在価格と保有量 */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">現在価格</p>
              <p className="text-2xl font-bold text-yellow-300">{currentPrice.toFixed(1)}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">保有量</p>
              <p className="text-2xl font-bold text-green-300">{etfHolding}</p>
            </div>
          </div>

          {/* チャート */}
          <div className="bg-white/5 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-400 mb-2">価格チャート（過去20ターン）</p>
            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-40"
                preserveAspectRatio="none"
              >
                {/* グリッド線 */}
                <line
                  x1="0"
                  y1={chartHeight / 2}
                  x2={chartWidth}
                  y2={chartHeight / 2}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                />
                {/* 価格ライン */}
                <polyline
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2"
                  points={points}
                />
                {/* 現在価格のマーカー */}
                {etfPrices.length > 0 && (
                  <circle
                    cx={(etfPrices.length - 1) / (etfPrices.length - 1 || 1) * chartWidth}
                    cy={
                      chartHeight -
                      ((currentPrice - minPrice) / priceRange) * chartHeight
                    }
                    r="4"
                    fill="#fbbf24"
                  />
                )}
              </svg>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>最低: {minPrice.toFixed(1)}</span>
              <span>最高: {maxPrice.toFixed(1)}</span>
            </div>
          </div>

          {/* 国庫残高表示 */}
          <div className="bg-white/5 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-400 mb-1">国庫残高</p>
            <p className="text-xl font-bold">{treasuryValue.toFixed(0)}</p>
          </div>

          {/* 操作ボタン */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={buyETF}
              disabled={!canBuy}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-bold text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
            >
              買う
              <br />
              <span className="text-xs font-normal">
                ({currentPrice.toFixed(1)}で購入)
              </span>
            </button>
            <button
              onClick={sellETF}
              disabled={!canSell}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg font-bold text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-red-600 hover:to-orange-600 transition-all shadow-lg"
            >
              売る
              <br />
              <span className="text-xs font-normal">
                ({currentPrice.toFixed(1)}で売却)
              </span>
            </button>
          </div>

          {/* 行動を終えるボタン */}
          <div className="flex justify-center">
            <button
              onClick={closeETFPanel}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-bold text-base md:text-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg"
            >
              行動を終える
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

