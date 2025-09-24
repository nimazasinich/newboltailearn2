import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Progress } from './ui/Progress';
import { Brain, CheckCircle, AlertTriangle } from 'lucide-react';

export default function TestPage() {
  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">تست کامپوننت‌های UI</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          این صفحه برای تست عملکرد کامپوننت‌های UI طراحی شده است
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              تست کارت
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              این یک کارت تست است که عملکرد کامپوننت Card را بررسی می‌کند.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>تست دکمه‌ها</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button>دکمه اصلی</Button>
            <Button variant="outline">دکمه خطی</Button>
            <Button variant="ghost">دکمه شفاف</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>تست نشان‌ها</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge>پیش‌فرض</Badge>
              <Badge variant="secondary">ثانویه</Badge>
              <Badge variant="outline">خطی</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                موفق
              </Badge>
              <Badge className="bg-red-100 text-red-800">
                <AlertTriangle className="h-3 w-3 mr-1" />
                خطا
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تست نوار پیشرفت</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>پیشرفت پروژه</span>
              <span>75%</span>
            </div>
            <Progress value={75} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>آپلود فایل</span>
              <span>45%</span>
            </div>
            <Progress value={45} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>آموزش مدل</span>
              <span>90%</span>
            </div>
            <Progress value={90} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>وضعیت سیستم</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-lg font-semibold text-green-600">آنلاین</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">سیستم فعال</div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Brain className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-lg font-semibold text-blue-600">15</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">مدل‌های فعال</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-lg font-semibold text-purple-600">3</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">هشدارها</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
