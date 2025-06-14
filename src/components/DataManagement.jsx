
import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Download, Upload, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function DataManagement({ students, payments, setStudents, setPayments }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  const handleBackup = () => {
    const data = {
      students,
      payments,
      backupDate: new Date().toISOString(),
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const link = document.createElement('a');
    link.href = jsonString;
    const date = new Date().toISOString().slice(0, 10);
    link.download = `study-group-backup-${date}.json`;
    link.click();
    toast({
      title: t('success'),
      description: t('backupSuccess'),
    });
  };

  const handleRestoreClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const restoredData = JSON.parse(e.target.result);
        if (Array.isArray(restoredData.students) && Array.isArray(restoredData.payments)) {
          setStudents(restoredData.students);
          setPayments(restoredData.payments);
          toast({
            title: t('success'),
            description: t('restoreSuccess'),
          });
        } else {
          throw new Error('Invalid file structure');
        }
      } catch (error) {
        toast({
          title: t('error'),
          description: t('restoreErrorInvalidFile'),
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
    event.target.value = null;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="card-gradient dark:bg-gray-800">
        <CardHeader className="gradient-bg text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Save className="h-6 w-6" />
            {t('dataManagementTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          
          <div className="p-4 border rounded-lg dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 dark:text-white">
              <Download className="text-blue-500" /> {t('backupTitle')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('backupDescription')}
            </p>
            <Button onClick={handleBackup}>
              <Download className="mr-2 h-4 w-4" /> {t('backupButton')}
            </Button>
          </div>

          <div className="p-4 border rounded-lg dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 dark:text-white">
              <Upload className="text-green-500" /> {t('restoreTitle')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('restoreDescription')}
            </p>
            <Button onClick={handleRestoreClick}>
              <Upload className="mr-2 h-4 w-4" /> {t('restoreButton')}
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>

        </CardContent>
      </Card>
    </motion.div>
  );
}
