import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle, 
  Clock,
  Filter,
  Search
} from 'lucide-react';

interface VirtualizedListProps<T> {
  items: T[];
  height?: number;
  itemHeight?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function VirtualizedList<T>({
  items,
  height = 400,
  itemHeight = 60,
  renderItem,
  className = '',
  emptyMessage = 'داده‌ای برای نمایش وجود ندارد',
  loading = false,
  onLoadMore,
  hasMore = false
}: VirtualizedListProps<T>) {
  const [filteredItems, setFilteredItems] = useState<T[]>(items);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Filter items based on search and filter
  useEffect(() => {
    let filtered = items;

    if (searchTerm) {
      filtered = filtered.filter(item => 
        JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(item => {
        const itemStr = JSON.stringify(item).toLowerCase();
        return itemStr.includes(filterType.toLowerCase());
      });
    }

    setFilteredItems(filtered);
  }, [items, searchTerm, filterType]);

  const ItemRenderer = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = filteredItems[index];
    if (!item) return null;

    return (
      <div style={style} className="px-4 py-2">
        {renderItem(item, index)}
      </div>
    );
  }, [filteredItems, renderItem]);

  if (loading && items.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-500">{emptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-0">
        {/* Search and Filter Controls */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-2 mb-2">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="جستجو..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                dir="rtl"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">همه</option>
              <option value="error">خطا</option>
              <option value="warning">هشدار</option>
              <option value="info">اطلاعات</option>
              <option value="success">موفق</option>
            </select>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>{filteredItems.length} مورد از {items.length}</span>
            {hasMore && onLoadMore && (
              <Button onClick={onLoadMore} variant="outline" size="sm">
                بارگذاری بیشتر
              </Button>
            )}
          </div>
        </div>

        {/* Virtualized List */}
        <div style={{ height, overflowY: 'auto' }}>
          {filteredItems.map((item, index) => (
            <div key={index} style={{ height: itemHeight }}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Specialized components for different data types
export function LogItemRenderer({ item, index }: { item: any; index: number }) {
  const getLogIcon = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLogBadgeColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'success': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div className="flex-shrink-0">
        {getLogIcon(item.level)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge className={getLogBadgeColor(item.level)}>
            {item.level || 'unknown'}
          </Badge>
          <span className="text-sm text-gray-500">
            {item.category || 'system'}
          </span>
          <span className="text-xs text-gray-400">
            {new Date(item.timestamp).toLocaleString('fa-IR')}
          </span>
        </div>
        <p className="text-sm text-gray-900 dark:text-white truncate">
          {item.message}
        </p>
      </div>
    </div>
  );
}

export function ModelItemRenderer({ item, index }: { item: any; index: number }) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'training': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <span className="text-blue-600 font-semibold text-sm">
            {item.name?.charAt(0) || 'M'}
          </span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {item.name || 'نامشخص'}
          </h4>
          <Badge className={getStatusColor(item.status)}>
            {item.status || 'نامشخص'}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>نوع: {item.type || 'نامشخص'}</span>
          <span>دقت: {((item.accuracy || 0) * 100).toFixed(1)}%</span>
          <span>اپوک: {item.current_epoch || 0}/{item.epochs || 0}</span>
        </div>
      </div>
    </div>
  );
}
