/* ARCHIVED: INCOMPLETE_OR_LEGACY
   Reason: superseded by unified routing & data layer on port 5137 / API 3001
   Moved: 2025-09-14
*/

import React from 'react';
import { FileText, Upload, Search, Filter } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

export function DocumentsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2" tabIndex={-1}>
          مدیریت اسناد
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          آپلود، مدیریت و پردازش اسناد حقوقی برای آموزش مدل‌ها
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Button className="flex items-center gap-2">
          <Upload className="w-4 h-4" />
          آپلود اسناد جدید
        </Button>
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="جستجو در اسناد..."
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button variant="outline" size="default" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            فیلتر
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">کل اسناد</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">۱,۲۳۴</div>
            <p className="text-xs text-gray-500">+۱۲ این هفته</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">پردازش شده</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">۹۸۷</div>
            <p className="text-xs text-gray-500">۸۰٪ کل اسناد</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">در انتظار</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">۲۴۷</div>
            <p className="text-xs text-gray-500">۲۰٪ کل اسناد</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">حجم کل</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">۲.۳ گیگابایت</div>
            <p className="text-xs text-gray-500">+۵۰ مگابایت</p>
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>اسناد اخیر</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'قانون مدنی - فصل اول', type: 'PDF', size: '2.1 MB', status: 'پردازش شده', date: '۱۴۰۳/۰۶/۱۵' },
              { name: 'قانون تجارت - ماده ۱۰۰-۲۰۰', type: 'DOCX', size: '1.8 MB', status: 'در حال پردازش', date: '۱۴۰۳/۰۶/۱۴' },
              { name: 'آیین دادرسی کیفری', type: 'PDF', size: '3.2 MB', status: 'پردازش شده', date: '۱۴۰۳/۰۶/۱۳' },
              { name: 'قانون کار - بخش دوم', type: 'PDF', size: '1.5 MB', status: 'در انتظار', date: '۱۴۰۳/۰۶/۱۲' },
              { name: 'قوانین مالیاتی', type: 'DOCX', size: '2.7 MB', status: 'پردازش شده', date: '۱۴۰۳/۰۶/۱۱' }
            ].map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-500" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{doc.name}</h3>
                    <p className="text-sm text-gray-500">{doc.type} • {doc.size} • {doc.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    doc.status === 'پردازش شده' 
                      ? 'bg-green-100 text-green-800' 
                      : doc.status === 'در حال پردازش'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {doc.status}
                  </span>
                  <Button variant="ghost" size="sm">
                    مشاهده
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}