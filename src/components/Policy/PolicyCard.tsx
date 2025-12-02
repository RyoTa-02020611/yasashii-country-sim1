/**
 * 1つの政策カードを表示
 */
import { memo, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Policy } from '../../types/game';

interface PolicyCardProps {
  policy: Policy;
  onSelect: (policyId: string) => void;
  isSelected?: boolean;
}

function PolicyCard({ policy, onSelect, isSelected }: PolicyCardProps) {
  // メーターラベルのマッピングを useMemo で固定
  const meterLabels = useMemo(() => ({
    price: '物価',
    unemployment: '失業率',
    life: '生活しやすさ',
    treasury: '国庫残高',
  }), []);

  // 影響範囲の文字列を useMemo で計算
  const targetMetersText = useMemo(() => {
    if (!policy.effects || !policy.targetMeters) return '';
    return policy.targetMeters.map((m) => meterLabels[m as keyof typeof meterLabels] || m).join(', ');
  }, [policy.effects, policy.targetMeters, meterLabels]);

  // クリックハンドラを useCallback で固定
  const handleClick = useCallback(() => {
    onSelect(policy.id);
  }, [policy.id, onSelect]);

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      animate={{
        scale: isSelected ? 1.05 : 1,
        borderColor: isSelected ? 'rgba(96, 165, 250, 1)' : 'rgba(255, 255, 255, 0.2)',
        boxShadow: isSelected ? '0 10px 25px rgba(59, 130, 246, 0.3)' : 'none',
      }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`
        w-full text-left p-4 md:p-5 rounded-lg border-2
        ${isSelected
          ? 'bg-blue-500/30'
          : 'bg-white/5 hover:bg-white/10'
        }
      `}
    >
      <h3 className="text-base md:text-lg font-semibold mb-2 text-white">
        {policy.name}
      </h3>
      <p className="text-xs md:text-sm text-gray-300 mb-3 leading-relaxed">
        {policy.description}
      </p>
      {policy.effects && targetMetersText && (
        <div className="mt-3 pt-3 border-t border-white/20">
          <p className="text-xs text-gray-400">
            影響範囲: {targetMetersText}
          </p>
        </div>
      )}
    </motion.button>
  );
}

// memo でラップして props が変わらない限り再レンダリングしない
export default memo(PolicyCard);

