/**
 * 複数のアドバイザーメッセージを表示するパネル
 */
import { memo } from 'react';
import { AdvisorMessage } from '../../types/game';
import AdvisorMessageComponent from './AdvisorMessage';

interface AdvisorPanelProps {
  messages: AdvisorMessage[];
}

function AdvisorPanel({ messages }: AdvisorPanelProps) {
  if (messages.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-sm">政策を選択すると、アドバイザーの意見が表示されます</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {messages.map((message, index) => (
        <AdvisorMessageComponent key={`${message.advisorId}-${index}`} message={message} />
      ))}
    </div>
  );
}

// memo でラップして props が変わらない限り再レンダリングしない
export default memo(AdvisorPanel);

