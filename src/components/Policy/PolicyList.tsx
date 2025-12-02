/**
 * 政策カードのリストを表示
 */
import { Policy } from '../../types/game';
import PolicyCard from './PolicyCard';
import { useState, useCallback } from 'react';

interface PolicyListProps {
  policies: Policy[];
  onSelect: (policyId: string) => void;
}

export default function PolicyList({ policies, onSelect }: PolicyListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // コールバック関数を useCallback で最適化
  const handleSelect = useCallback((policyId: string) => {
    setSelectedId(policyId);
    onSelect(policyId);
  }, [onSelect]);

  if (policies.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-sm">利用可能な政策がありません</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
      {policies.map((policy) => (
        <PolicyCard
          key={policy.id}
          policy={policy}
          onSelect={handleSelect}
          isSelected={selectedId === policy.id}
        />
      ))}
    </div>
  );
}

