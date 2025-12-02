/**
 * イベントカード表示
 */
import { memo } from 'react';
import { GameEvent } from '../../types/game';

interface EventCardProps {
  event: GameEvent;
}

function EventCard({ event }: EventCardProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-base md:text-lg font-semibold text-yellow-300">
        {event.title}
      </h3>
      <p className="text-sm md:text-base text-gray-200 leading-relaxed">
        {event.description}
      </p>
      {event.effects && (
        <div className="mt-3 pt-3 border-t border-white/20">
          <p className="text-xs text-gray-400">※ このイベントにより状況が変化します</p>
        </div>
      )}
    </div>
  );
}

// memo でラップして props が変わらない限り再レンダリングしない
export default memo(EventCard);

