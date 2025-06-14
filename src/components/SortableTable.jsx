import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, Printer } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const SortableTable = ({ data, columns, caption, onPrint, printStyles, actions }) => {
  const { t, i18n } = useTranslation();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  const sortedData = useMemo(() => {
    let sortableData = [...data];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return null;
    }
    if (sortConfig.direction === 'ascending') {
      return <ChevronUp className="h-4 w-4 text-blue-500" />;
    }
    return <ChevronDown className="h-4 w-4 text-blue-500" />;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const printDate = new Date().toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${caption || t('print')}</title>
          <style>
            @media print {
              @page { size: A4; margin: 20mm; }
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: ${i18n.language === 'ar' ? 'rtl' : 'ltr'}; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: ${i18n.language === 'ar' ? 'right' : 'left'}; }
              th { background-color: #f2f2f2; }
              caption { font-size: 1.5em; margin-bottom: 10px; font-weight: bold; }
              .print-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
              .print-date { font-size: 0.9em; color: #555; }
              .no-print { display: none; }
            }
            ${printStyles || ''}
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>${caption || t('print')}</h1>
            <div class="print-date">${t('printDate', { date: printDate })}</div>
          </div>
          <table>
            <thead>
              <tr>
                ${columns.map(col => `<th>${col.header}</th>`).join('')}
                ${actions ? '<th class="no-print"></th>' : ''}
              </tr>
            </thead>
            <tbody>
              ${sortedData.map(item => `
                <tr>
                  ${columns.map(col => `<td>${col.printValue ? col.printValue(item) : (col.accessor ? item[col.accessor] : '')}</td>`).join('')}
                  ${actions ? '<td class="no-print"></td>' : ''}
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
    <div className="overflow-x-auto">
      {onPrint && (
        <div className="mb-4 flex justify-end">
          <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            {t('print')}
          </Button>
        </div>
      )}
      <table className="w-full">
        {caption && <caption className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">{caption}</caption>}
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable && requestSort(col.key)}
                className={`px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${col.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span>{col.header}</span>
                  {col.sortable && getSortIcon(col.key)}
                </div>
              </th>
            ))}
            {actions && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('actions')}</th>}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {sortedData.map((item, index) => (
            <motion.tr
              key={item.id || index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {col.accessor ? item[col.accessor] : (col.render ? col.render(item) : '')}
                </td>
              ))}
              {actions && (
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {actions(item)}
                </td>
              )}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SortableTable;