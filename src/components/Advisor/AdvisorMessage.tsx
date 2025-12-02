/**
 * 1人のアドバイザーのメッセージを表示
 */
import { memo, useMemo } from 'react';
import { AdvisorMessage as AdvisorMessageType } from '../../types/game';
import { advisors } from '../../data/advisors';

interface AdvisorMessageProps {
  message: AdvisorMessageType;
}

function AdvisorMessage({ message }: AdvisorMessageProps) {
  // アドバイザー情報を useMemo でキャッシュ
  const advisor = useMemo(() => {
    return advisors.find((a) => a.id === message.advisorId);
  }, [message.advisorId]);

  if (!advisor) return null;

  return (
    <div className="flex items-start gap-2 md:gap-3 p-2 md:p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
      <span className="text-xl md:text-2xl flex-shrink-0">{advisor.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm md:text-base font-semibold">{advisor.name}</span>
          <span className="text-xs text-gray-400">({advisor.description})</span>
        </div>
        <p className="text-xs md:text-sm text-gray-200 leading-relaxed">
          {message.text}
        </p>
      </div>
    </div>
  );
}

// memo でラップして props が変わらない限り再レンダリングしない
export default memo(AdvisorMessage);

