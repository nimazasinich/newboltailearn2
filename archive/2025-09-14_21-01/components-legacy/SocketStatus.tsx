/* ARCHIVED: INCOMPLETE_OR_LEGACY
   Reason: superseded by unified routing & data layer on port 5137 / API 3001
   Moved: 2025-09-14
*/

import React from 'react';
import { useSocketConnection } from '../hooks/useSocketConnection';

/**
 * Socket connection status component
 */
export const SocketStatus: React.FC = () => {
  const { connected, connecting, error, reconnectAttempt } = useSocketConnection();

  if (connected) {
    return (
      <div className="flex items-center space-x-2 text-green-600">
        <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
        <span className="text-sm">متصل</span>
      </div>
    );
  }

  if (connecting || reconnectAttempt > 0) {
    return (
      <div className="flex items-center space-x-2 text-yellow-600">
        <div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse"></div>
        <span className="text-sm">
          {reconnectAttempt > 0 ? `اتصال مجدد (${reconnectAttempt})...` : 'در حال اتصال...'}
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-red-600">
        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
        <span className="text-sm">قطع اتصال</span>
      </div>
    );
  }

  return null;
};