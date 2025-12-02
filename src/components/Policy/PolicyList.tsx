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
  // 同じ政策でもターンを進める処理：同じ政策を選んでも必ずonSelectが呼ばれるようにする
  const handleSelect = useCallback((policyId: string) => {
    // 同じ政策を選んだ場合でも、必ずonSelectを呼び出す（ターンを進めるため）
    onSelect(policyId);
    // selectedIdはUI表示用なので、同じ政策でも更新する（視覚的フィードバックのため）
    setSelectedId(policyId);
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

