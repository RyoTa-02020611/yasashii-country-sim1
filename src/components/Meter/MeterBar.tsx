/**
 * 単一のメーターをバー形式で表示
 */
import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MeterState } from '../../types/game';

interface MeterBarProps {
  meter: MeterState;
}

function MeterBar({ meter }: MeterBarProps) {
  // パーセンテージ計算を useMemo で最適化
  const percentage = useMemo(() => {
    return ((meter.value - meter.min) / (meter.max - meter.min)) * 100;
  }, [meter.value, meter.min, meter.max]);
  
  // メータータイプに応じた色とアイコンを useMemo で固定
  const config = useMemo(() => {
    switch (meter.id) {
      case 'price':
        return {
          colorClass: 'from-yellow-500 to-amber-500',
          icon: '💰',
          textColor: 'text-yellow-400',
        };
      case 'unemployment':
        return {
          colorClass: 'from-red-500 to-rose-500',
          icon: '👥',
          textColor: 'text-red-400',
        };
      case 'life':
        return {
          colorClass: 'from-green-500 to-emerald-500',
          icon: '🏠',
          textColor: 'text-green-400',
        };
      case 'treasury':
        return {
          colorClass: 'from-blue-500 to-cyan-500',
          icon: '💎',
          textColor: 'text-blue-400',
        };
      default:
        return {
          colorClass: 'from-gray-500 to-gray-600',
          icon: '📊',
          textColor: 'text-gray-400',
        };
    }
  }, [meter.id]);

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">{config.icon}</span>
          <span className={`text-sm md:text-base font-medium ${config.textColor}`}>
            {meter.label}
          </span>
        </div>
        <span className="text-xs md:text-sm text-slate-300">
          {meter.value}/{meter.max}
        </span>
      </div>
      <div className="w-full bg-slate-700/50 rounded-full h-3 md:h-4 overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${config.colorClass}`}
          initial={false}
          animate={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      {meter.description && (
        <p className="text-xs text-slate-400 mt-1">{meter.description}</p>
      )}
    </div>
  );
}

// memo でラップして props が変わらない限り再レンダリングしない
export default memo(MeterBar);

