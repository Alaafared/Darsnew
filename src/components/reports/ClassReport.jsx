import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, TrendingUp, Printer, Calendar } from 'lucide-react';
import SortableTable from '@/components/SortableTable';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const ClassReport = ({ reportData }) => {
  const { t, i18n } = useTranslation();

  if (!reportData || reportData.type !== 'class') return null;

  const { classInfo, students, totalStudents, totalPayments, paymentCount, dateRange } = reportData;

  const studentColumns = [
    { header: t('studentName'), key: 'name', sortable: true, accessor: 'name' },
    { header: t('registrationDate'), key: 'registrationDate', sortable: true, render: (item) => new Date(item.registrationDate).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US') },
    { header: t('paymentCount'), key: 'paymentCount', sortable: true },
    { header: t('totalPayments'), key: 'totalPayments', sortable: true, render: (item) => `${item.totalPayments} ${t('currencyEGP')}` },
  ];

  const handlePrint = () => {
     const printDate = new Date().toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${t('reportClassTitle', { name: classInfo.name })}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: ${i18n.language === 'ar' ? 'rtl' : 'ltr'}; margin: 20px; }
            .report-card-print { border: 1px solid #eee; padding: 10px; margin-bottom: 10px; border-radius: 5px; }
            .grid-print { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 20px; }
            h1, h2, h3 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: ${i18n.language === 'ar' ? 'right' : 'left'}; }
            th { background-color: #f2f2f2; }
            .date-range-print { font-size: 0.9em; color: #555; margin-bottom: 15px; }
            .print-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px;}
            .print-date { font-size: 0.9em; color: #555; }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>${t('reportClassTitle', { name: classInfo.name })}</h1>
            <div class="print-date">${t('printDate', { date: printDate })}</div>
          </div>
          ${dateRange ? `<div class="date-range-print">${t('dateRangeFromTo', { start: new Date(dateRange.start).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US'), end: new Date(dateRange.end).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US') })}</div>` : ''}
          
          <div class="grid-print">
            <div class="report-card-print">
              <p><strong>${t('totalStudents')}:</strong> ${totalStudents}</p>
            </div>
            <div class="report-card-print">
              <p><strong>${t('totalPayments')}:</strong> ${totalPayments} ${t('currencyEGP')}</p>
            </div>
            <div class="report-card-print">
              <p><strong>${t('paymentCount')}:</strong> ${paymentCount}</p>
            </div>
          </div>
          
          <h3>${t('studentsCount', { count: students.length })}</h3>
          <table>
            <thead>
              <tr>
                <th>${t('studentName')}</th>
                <th>${t('registrationDate')}</th>
                <th>${t('paymentCount')}</th>
                <th>${t('totalPayments')}</th>
              </tr>
            </thead>
            <tbody>
              ${students.map(s => `
                <tr>
                  <td>${s.name}</td>
                  <td>${new Date(s.registrationDate).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}</td>
                  <td>${s.paymentCount}</td>
                  <td>${s.totalPayments} ${t('currencyEGP')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Card className="card-gradient dark:bg-gray-800">
      <CardHeader className="table-header rounded-t-lg flex justify-between items-center">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          {t('reportClassTitle', { name: classInfo.name })}
          {dateRange && (
            <span className="text-sm bg-white/20 px-2 py-1 rounded">
              {t('dateRangeFromTo', { start: new Date(dateRange.start).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US'), end: new Date(dateRange.end).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US') })}
            </span>
          )}
        </CardTitle>
         <Button onClick={handlePrint} variant="outline" size="sm" className="bg-white/20 hover:bg-white/30 text-white">
          <Printer className="h-4 w-4 mr-2" />
          {t('print')}
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="report-card dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('totalStudents')}</span>
            </div>
            <p className="text-lg font-semibold dark:text-white">{totalStudents}</p>
          </div>
          <div className="report-card dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('totalPayments')}</span>
            </div>
            <p className="text-lg font-semibold dark:text-white">{totalPayments} {t('currencyEGP')}</p>
          </div>
          <div className="report-card dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('paymentCount')}</span>
            </div>
            <p className="text-lg font-semibold dark:text-white">{paymentCount}</p>
          </div>
        </div>

        <SortableTable
          data={students}
          columns={studentColumns}
          caption={t('studentsCount', { count: students.length })}
        />
      </CardContent>
    </Card>
  );
};

export default ClassReport;