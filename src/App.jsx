
import React, { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/toaster';
import StudentsManagement from '@/components/StudentsManagement';
import PaymentRegistration from '@/components/PaymentRegistration';
import Reports from '@/components/Reports';
import DataManagement from '@/components/DataManagement';
import { motion } from 'framer-motion';
import { GraduationCap, Users, CreditCard, BarChart3, Sun, Moon, Globe, Settings } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import '@/i18n';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export default function App() {
  const [students, setStudents] = useLocalStorage('students', []);
  const [payments, setPayments] = useLocalStorage('payments', []);
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useLocalStorage('language', 'ar');

  useEffect(() => {
    if (i18n.language !== currentLanguage) {
      i18n.changeLanguage(currentLanguage);
    }
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
  }, [theme, currentLanguage, i18n]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    setCurrentLanguage(lang);
  };
  
  const memoizedStudentsManagement = useMemo(() => (
    <StudentsManagement 
      students={students} 
      setStudents={setStudents} 
      payments={payments}
    />
  ), [students, payments, setStudents, t, currentLanguage]);

  const memoizedPaymentRegistration = useMemo(() => (
    <PaymentRegistration 
      students={students} 
      payments={payments} 
      setPayments={setPayments}
    />
  ), [students, payments, setPayments, t, currentLanguage]);

  const memoizedReports = useMemo(() => (
    <Reports 
      students={students} 
      payments={payments}
    />
  ), [students, payments, t, currentLanguage]);
  
  const memoizedDataManagement = useMemo(() => (
    <DataManagement
      students={students}
      payments={payments}
      setStudents={setStudents}
      setPayments={setPayments}
    />
  ), [students, payments, setStudents, setPayments, t, currentLanguage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-800 text-foreground">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex flex-col sm:flex-row justify-between items-center"
        >
          <div className="text-center sm:text-right mb-4 sm:mb-0">
            <div className="gradient-bg text-white rounded-2xl p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-2 sm:mb-4">
                <GraduationCap className="h-10 w-10 sm:h-12 sm:w-12" />
                <h1 className="text-3xl sm:text-4xl font-bold">{t('appTitle')}</h1>
              </div>
              <p className="text-lg sm:text-xl opacity-90">
                {t('appSubtitle')}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-4 p-4 bg-white dark:bg-gray-800 shadow-lg rounded-xl">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Globe className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              <Label htmlFor="language-select" className="text-gray-700 dark:text-gray-200">{t('language')}</Label>
              <Select
                id="language-select"
                value={currentLanguage}
                onValueChange={handleLanguageChange}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-[100px] dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <option value="ar">{t('arabic')}</option>
                <option value="en">{t('english')}</option>
              </Select>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              {theme === 'light' ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-indigo-400" />}
              <Label htmlFor="theme-switch" className="text-gray-700 dark:text-gray-200">{t('theme')}</Label>
              <Switch
                id="theme-switch"
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
                aria-label={t('theme')}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs defaultValue="students" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 h-14 bg-white dark:bg-gray-700 shadow-lg rounded-xl">
              <TabsTrigger 
                value="students" 
                className="flex items-center gap-2 text-lg font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white dark:text-gray-300 dark:data-[state=active]:text-white"
              >
                <Users className="h-5 w-5" />
                {t('studentsManagementTab')}
              </TabsTrigger>
              <TabsTrigger 
                value="payments" 
                className="flex items-center gap-2 text-lg font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white dark:text-gray-300 dark:data-[state=active]:text-white"
              >
                <CreditCard className="h-5 w-5" />
                {t('paymentRegistrationTab')}
              </TabsTrigger>
              <TabsTrigger 
                value="reports" 
                className="flex items-center gap-2 text-lg font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white dark:text-gray-300 dark:data-[state=active]:text-white"
              >
                <BarChart3 className="h-5 w-5" />
                {t('reportsTab')}
              </TabsTrigger>
               <TabsTrigger 
                value="data" 
                className="flex items-center gap-2 text-lg font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white dark:text-gray-300 dark:data-[state=active]:text-white"
              >
                <Settings className="h-5 w-5" />
                {t('dataManagementTab')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="students" className="animate-fade-in">
              {memoizedStudentsManagement}
            </TabsContent>
            <TabsContent value="payments" className="animate-fade-in">
              {memoizedPaymentRegistration}
            </TabsContent>
            <TabsContent value="reports" className="animate-fade-in">
              {memoizedReports}
            </TabsContent>
            <TabsContent value="data" className="animate-fade-in">
              {memoizedDataManagement}
            </TabsContent>
          </Tabs>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="glass-effect dark:bg-gray-800/30 rounded-xl p-6">
            <p className="text-gray-600 dark:text-gray-300">
              {t('footerText')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {t('footerDataStoredLocally')}
            </p>
          </div>
        </motion.div>
      </div>
      <Toaster />
    </div>
  );
}
