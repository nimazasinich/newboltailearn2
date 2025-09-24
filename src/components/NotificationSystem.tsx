import React, { useState, useEffect, createContext, useContext } from 'react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  X, 
  Bell, 
  BellOff,
  Settings,
  Zap,
  Brain,
  Database,
  Activity
} from 'lucide-react';

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  category: 'system' | 'training' | 'model' | 'dataset' | 'user';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep last 50 notifications
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAll,
      unreadCount,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className = '' }: NotificationBellProps) {
  const { unreadCount, notifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        {unreadCount > 0 ? (
          <Bell className="h-5 w-5" />
        ) : (
          <BellOff className="h-5 w-5" />
        )}
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <NotificationPanel onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
}

interface NotificationPanelProps {
  onClose: () => void;
}

function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearAll, 
    unreadCount 
  } = useNotifications();

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getCategoryIcon = (category: Notification['category']) => {
    switch (category) {
      case 'system': return <Settings className="h-3 w-3" />;
      case 'training': return <Activity className="h-3 w-3" />;
      case 'model': return <Brain className="h-3 w-3" />;
      case 'dataset': return <Database className="h-3 w-3" />;
      case 'user': return <Zap className="h-3 w-3" />;
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days} روز پیش`;
    if (hours > 0) return `${hours} ساعت پیش`;
    if (minutes > 0) return `${minutes} دقیقه پیش`;
    return 'همین الان';
  };

  return (
    <div className="max-h-96 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            اعلان‌ها
            {unreadCount > 0 && (
              <Badge variant="secondary" className="mr-2">
                {unreadCount} جدید
              </Badge>
            )}
          </h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                همه را خوانده شده علامت‌گذاری کن
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-64 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <BellOff className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">هیچ اعلانی وجود ندارد</p>
          </div>
        ) : (
          notifications.slice(0, 10).map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {notification.title}
                    </h4>
                    <div className="flex items-center gap-1">
                      {getCategoryIcon(notification.category)}
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {formatTime(notification.timestamp)}
                    </span>
                    <div className="flex items-center gap-1">
                      {notification.action && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={notification.action.onClick}
                          className="text-xs h-6 px-2"
                        >
                          {notification.action.label}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeNotification(notification.id)}
                        className="text-xs h-6 px-2 text-gray-400 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-xs text-red-500 hover:text-red-600"
            >
              پاک کردن همه
            </Button>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {notifications.length} اعلان
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for easy notification creation
export const useNotificationActions = () => {
  const { addNotification } = useNotifications();

  const notifySuccess = (title: string, message: string, category: Notification['category'] = 'system') => {
    addNotification({ type: 'success', title, message, category });
  };

  const notifyError = (title: string, message: string, category: Notification['category'] = 'system') => {
    addNotification({ type: 'error', title, message, category });
  };

  const notifyWarning = (title: string, message: string, category: Notification['category'] = 'system') => {
    addNotification({ type: 'warning', title, message, category });
  };

  const notifyInfo = (title: string, message: string, category: Notification['category'] = 'system') => {
    addNotification({ type: 'info', title, message, category });
  };

  return {
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
  };
};
