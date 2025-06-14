import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Users, Printer } from 'lucide-react';
import SortableTable from '@/components/SortableTable';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const PaymentReport = ({ reportData }) => {
  const { t, i18n } = useTranslation();

  if (!reportData || reportData.type !== 'payment') return null;

  const { payments, totalPayments, paymentCount, dateRange, receiver, paymentsByReceiver, paymentsByClass } = reportData;

  const paymentColumns = [
    { header: t('student'), key: 'studentName', sortable: true, accessor: 'studentName' },
    { header: t('class'), key: 'className', sortable: true },
    { header: t('amount'), key: 'amount', sortable: true, render: (item) => `${item.amount} ${t('currencyEGP')}` },
    { header: t('date'), key: 'date', sortable: true, render: (item) => new Date(item.date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US') },
    { header: t('receiver'), key: 'receiver', sortable: true },
  ];
  
  const handlePrint = () => {
    const printDate = new Date().toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${t('reportPaymentTitle')}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: ${i18n.language === 'ar' ? 'rtl' : 'ltr'}; margin: 20px; }
            .report-card-print { border: 1px solid #eee; padding: 10px; margin-bottom: 10px; border-radius: 5px; }
            .grid-print { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 20px; }
            h1, h2, h3 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: ${i18n.language === 'ar' ? 'right' : 'left'}; }
            th { background-color: #f2f2f2; }
            .date-range-print { font-size: 0.9em; color: #555; margin-bottom: 10px; }
            .receiver-filter-print { font-size: 0.9em; color: #555; margin-bottom: 15px; }
            .section-title-print { margin-top: 20px; margin-bottom: 10px; font-size: 1.2em; border-bottom: 1px solid #eee; padding-bottom: 5px;}
            .print-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px;}
            .print-date { font-size: 0.9em; color: #555; }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>${t('reportPaymentTitle')}</h1>
            <div class="print-date">${t('printDate', { date: printDate })}</div>
          </div>
          <div class="date-range-print">${t('dateRangeFromTo', { start: new Date(dateRange.start).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US'), end: new Date(dateRange.end).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US') })}</div>
          ${receiver ? `<div class="receiver-filter-print">${t('receiver')}: ${receiver}</div>` : ''}

          <div class="grid-print">
            <div class="report-card-print">
              <p><strong>${t('totalPayments')}:</strong> ${totalPayments} ${t('currencyEGP')}</p>
            </div>
            <div class="report-card-print">
              <p><strong>${t('paymentCount')}:</strong> ${paymentCount}</p>
            </div>
          </div>

          <h3 class="section-title-print">${t('paymentsByReceiver')}</h3>
          <div class="grid-print">
            ${paymentsByReceiver.map(item => `
              <div class="report-card-print">
                <h4>${item.receiver}</h4>
                <p>${t('paymentCount')}: ${item.count}</p>
                <p><strong>${t('totalPayments')}:</strong> ${item.total} ${t('currencyEGP')}</p>
              </div>
            `).join('')}
          </div>

          <h3 class="section-title-print">${t('paymentsByClass')}</h3>
          <div class="grid-print">
            ${paymentsByClass.map(item => `
              <div class="report-card-print">
                <h4>${item.class.name}</h4>
                <p>${t('paymentCount')}: ${item.count}</p>
                <p><strong>${t('totalPayments')}:</strong> ${item.total} ${t('currencyEGP')}</p>
              </div>
            `).join('')}
          </div>
          
          ${payments.length > 0 ? `
            <h3 class="section-title-print">${t('paymentDetails')}</h3>
            <table>
              <thead>
                <tr>
                  <th>${t('student')}</th>
                  <th>${t('class')}</th>
                  <th>${t('amount')}</th>
                  <th>${t('date')}</th>
                  <th>${t('receiver')}</th>
                </tr>
              </thead>
              <tbody>
                ${payments.map(p => `
                  <tr>
                    <td>${p.studentName}</td>
                    <td>${p.className}</td>
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
          <DollarSign className="h-6 w-6" />
          {t('reportPaymentTitle')}
          <span className="text-sm bg-white/20 px-2 py-1 rounded">
            {t('dateRangeFromTo', { start: new Date(dateRange.start).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US'), end: new Date(dateRange.end).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US') })}
          </span>
          {receiver && (
            <span className="text-sm bg-white/20 px-2 py-1 rounded">
              {receiver}
            </span>
          )}
        </CardTitle>
         <Button onClick={handlePrint} variant="outline" size="sm" className="bg-white/20 hover:bg-white/30 text-white">
          <Printer className="h-4 w-4 mr-2" />
          {t('print')}
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">{t('paymentsByReceiver')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentsByReceiver.map(item => (
              <div key={item.receiver} className="report-card dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium dark:text-white">{item.receiver}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('paymentCount')}: {item.count}</p>
                <p className="text-lg font-semibold text-green-600">{item.total} {t('currencyEGP')}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">{t('paymentsByClass')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {paymentsByClass.map(item => (
              <div key={item.class.id} className="report-card dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium dark:text-white">{item.class.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('paymentCount')}: {item.count}</p>
                <p className="text-lg font-semibold text-green-600">{item.total} {t('currencyEGP')}</p>
              </div>
            ))}
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

export default PaymentReport;