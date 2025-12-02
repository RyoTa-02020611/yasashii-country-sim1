/**
 * メーター4本をまとめて表示するパネル
 */
import { memo } from 'react';
import { MeterState } from '../../types/game';
import MeterBar from './MeterBar';

interface MeterPanelProps {
  meters: MeterState[];
}

function MeterPanel({ meters }: MeterPanelProps) {
  return (
    <div className="bg-slate-800 rounded-lg p-4 md:p-6 border border-slate-700">
      <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2 text-slate-100">
        📊 国家状況
      </h2>
      <div className="space-y-2">
        {meters.map((meter) => (
          <MeterBar key={meter.id} meter={meter} />
        ))}
      </div>
    </div>
  );
}

// memo でラップして props が変わらない限り再レンダリングしない
export default memo(MeterPanel);

