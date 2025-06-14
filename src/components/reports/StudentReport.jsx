import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, TrendingUp, Printer } from 'lucide-react';
import SortableTable from '@/components/SortableTable';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const StudentReport = ({ reportData }) => {
  const { t, i18n } = useTranslation();

  if (!reportData || reportData.type !== 'student') return null;

  const { student, classInfo, payments, totalPayments, paymentCount } = reportData;

  const paymentColumns = [
    { header: t('reportAmount'), key: 'amount', sortable: true, render: (item) => `${item.amount} ${t('currencyEGP')}` },
    { header: t('reportDate'), key: 'date', sortable: true, render: (item) => new Date(item.date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US') },
    { header: t('reportReceiver'), key: 'receiver', sortable: true, accessor: 'receiver' },
  ];
  
  const handlePrint = () => {
    const printDate = new Date().toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${t('reportStudentTitle', { name: student.name })}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: ${i18n.language === 'ar' ? 'rtl' : 'ltr'}; margin: 20px; }
            .report-card-print { border: 1px solid #eee; padding: 10px; margin-bottom: 10px; border-radius: 5px; }
            .grid-print { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 20px; }
            h1, h2, h3 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: ${i18n.language === 'ar' ? 'right' : 'left'}; }
            th { background-color: #f2f2f2; }
            .print-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px;}
            .print-date { font-size: 0.9em; color: #555; }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>${t('reportStudentTitle', { name: student.name })}</h1>
            <div class="print-date">${t('printDate', { date: printDate })}</div>
          </div>
          
          <h2>${t('student')}: ${student.name}</h2>
          <div class="grid-print">
            <div class="report-card-print">
              <p><strong>${t('class')}:</strong> ${classInfo.name}</p>
            </div>
            <div class="report-card-print">
              <p><strong>${t('totalPayments')}:</strong> ${totalPayments} ${t('currencyEGP')}</p>
            </div>
            <div class="report-card-print">
              <p><strong>${t('paymentCount')}:</strong> ${paymentCount}</p>
            </div>
          </div>
          
          ${payments.length > 0 ? `
            <h3>${t('paymentDetails')}</h3>
            <table>
              <thead>
                <tr>
                  <th>${t('reportAmount')}</th>
                  <th>${t('reportDate')}</th>
                  <th>${t('reportReceiver')}</th>
                </tr>
              </thead>
              <tbody>
                ${payments.map(p => `
                  <tr>
                    <td>${p.amount} ${t('currencyEGP')}</td>
                    <td>${new Date(p.date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}</td>
                    <td>${p.receiver}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : `<p>${t('noPaymentsRegistered')}</p>`}
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
          {t('reportStudentTitle', { name: student.name })}
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
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('class')}</span>
            </div>
            <p className="text-lg font-semibold dark:text-white">{classInfo.name}</p>
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

        {payments.length > 0 && (
          <SortableTable
            data={payments}
            columns={paymentColumns}
            caption={t('paymentDetails')}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default StudentReport;