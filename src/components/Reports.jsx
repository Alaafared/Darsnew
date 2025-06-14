
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { BarChart3, FileText } from 'lucide-react';
import StudentReport from '@/components/reports/StudentReport';
import ClassReport from '@/components/reports/ClassReport';
import PaymentReport from '@/components/reports/PaymentReport';
import { useTranslation } from 'react-i18next';

const CLASSES_DATA = (t) => [
  { id: 'class1', name: t('class1Name'), fee: 100 },
  { id: 'class2', name: t('class2Name'), fee: 150 },
  { id: 'class3', name: t('class3Name'), fee: 200 }
];

const RECEIVERS_DATA = (t) => [t('receiver1Name'), t('receiver2Name')];

export default function Reports({ students, payments }) {
  const { t } = useTranslation();
  const CLASSES = useMemo(() => CLASSES_DATA(t), [t]);
  const RECEIVERS = useMemo(() => RECEIVERS_DATA(t), [t]);

  const [reportType, setReportType] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedReceiver, setSelectedReceiver] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);

  const classStudents = students.filter(s => s.classId === selectedClass);

  const generateStudentReport = () => {
    if (!selectedClass || !selectedStudent) {
      toast({ title: t('error'), description: t('fillAllFieldsError', { fields: `${t('class')}, ${t('student')}` }), variant: "destructive" });
      return;
    }
    const student = students.find(s => s.id === selectedStudent);
    if (!student) {
       toast({ title: t('error'), description: t('studentNotFoundError'), variant: "destructive" });
       return;
    }
    const studentPayments = payments.filter(p => p.studentId === selectedStudent);
    const totalPayments = studentPayments.reduce((sum, p) => sum + p.amount, 0);
    const classInfo = CLASSES.find(c => c.id === student.classId);
    setReportData({ type: 'student', student, classInfo, payments: studentPayments, totalPayments, paymentCount: studentPayments.length });
  };

  const generateClassReport = () => {
    if (!selectedClass) {
      toast({ title: t('error'), description: t('fillAllFieldsError', { fields: t('class') }), variant: "destructive" });
      return;
    }
    const classInfo = CLASSES.find(c => c.id === selectedClass);
    const classStudents = students.filter(s => s.classId === selectedClass);
    let classPayments = payments.filter(p => p.classId === selectedClass);
    if (startDate && endDate) {
      classPayments = classPayments.filter(p => new Date(p.date) >= new Date(startDate) && new Date(p.date) <= new Date(endDate));
    }
    const totalPayments = classPayments.reduce((sum, p) => sum + p.amount, 0);
    const studentsWithPayments = classStudents.map(student => {
      const studentPayments = classPayments.filter(p => p.studentId === student.id);
      return { ...student, payments: studentPayments, totalPayments: studentPayments.reduce((sum, p) => sum + p.amount, 0), paymentCount: studentPayments.length };
    });
    setReportData({ type: 'class', classInfo, students: studentsWithPayments, totalStudents: classStudents.length, totalPayments, paymentCount: classPayments.length, dateRange: startDate && endDate ? { start: startDate, end: endDate } : null });
  };

  const generatePaymentReport = () => {
    if (!startDate || !endDate) {
      toast({ title: t('error'), description: t('fillAllFieldsError', { fields: `${t('fromDate')}, ${t('toDate')}` }), variant: "destructive" });
      return;
    }
    let filteredPayments = payments.filter(p => new Date(p.date) >= new Date(startDate) && new Date(p.date) <= new Date(endDate));
    if (selectedReceiver) {
      filteredPayments = filteredPayments.filter(p => p.receiver === selectedReceiver);
    }
    const totalPayments = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
    const paymentsByReceiver = RECEIVERS.map(receiver => {
      const receiverPayments = filteredPayments.filter(p => p.receiver === receiver);
      return { receiver, payments: receiverPayments, total: receiverPayments.reduce((sum, p) => sum + p.amount, 0), count: receiverPayments.length };
    });
    const paymentsByClass = CLASSES.map(cls => {
      const classPayments = filteredPayments.filter(p => p.classId === cls.id);
      return { class: cls, payments: classPayments, total: classPayments.reduce((sum, p) => sum + p.amount, 0), count: classPayments.length };
    });
    setReportData({ type: 'payment', payments: filteredPayments, totalPayments, paymentCount: filteredPayments.length, dateRange: { start: startDate, end: endDate }, receiver: selectedReceiver, paymentsByReceiver, paymentsByClass });
  };

  const generateReport = () => {
    switch (reportType) {
      case 'student': generateStudentReport(); break;
      case 'class': generateClassReport(); break;
      case 'payment': generatePaymentReport(); break;
      default: toast({ title: t('error'), description: t('selectReportType'), variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="card-gradient dark:bg-gray-800">
          <CardHeader className="gradient-bg text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2"><BarChart3 className="h-6 w-6" />{t('generateReportsTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="report-type">{t('reportType')}</Label>
                <Select id="report-type" value={reportType} onChange={(e) => setReportType(e.target.value)} className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                  <option value="">{t('selectReportType')}</option>
                  <option value="student">{t('studentReport')}</option>
                  <option value="class">{t('classReport')}</option>
                  <option value="payment">{t('paymentReport')}</option>
                </Select>
              </div>

              {(reportType === 'student' || reportType === 'class') && (
                <div>
                  <Label htmlFor="report-class">{t('class')}</Label>
                  <Select id="report-class" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    <option value="">{t('selectClass')}</option>
                    {CLASSES.map(cls => (<option key={cls.id} value={cls.id}>{cls.name}</option>))}
                  </Select>
                </div>
              )}

              {reportType === 'student' && selectedClass && (
                <div>
                  <Label htmlFor="report-student">{t('student')}</Label>
                  <Select id="report-student" value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    <option value="">{t('selectStudent')}</option>
                    {classStudents.map(student => (<option key={student.id} value={student.id}>{student.name}</option>))}
                  </Select>
                </div>
              )}

              {(reportType === 'class' || reportType === 'payment') && (
                <>
                  <div>
                    <Label htmlFor="start-date">{t('fromDate')}</Label>
                    <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="dark:bg-gray-700 dark:text-white dark:border-gray-600"/>
                  </div>
                  <div>
                    <Label htmlFor="end-date">{t('toDate')}</Label>
                    <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="dark:bg-gray-700 dark:text-white dark:border-gray-600"/>
                  </div>
                </>
              )}

              {reportType === 'payment' && (
                <div>
                  <Label htmlFor="report-receiver">{t('optionalReceiver')}</Label>
                  <Select id="report-receiver" value={selectedReceiver} onChange={(e) => setSelectedReceiver(e.target.value)} className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    <option value="">{t('allReceivers')}</option>
                    {RECEIVERS.map(rec => (<option key={rec} value={rec}>{rec}</option>))}
                  </Select>
                </div>
              )}

              <div className="flex items-end">
                <Button onClick={generateReport} className="w-full gradient-bg">
                  <FileText className="h-4 w-4 ml-2" />{t('generateReportButton')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {reportData && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {reportData.type === 'student' && <StudentReport reportData={reportData} />}
          {reportData.type === 'class' && <ClassReport reportData={reportData} />}
          {reportData.type === 'payment' && <PaymentReport reportData={reportData} />}
        </motion.div>
      )}
    </div>
  );
}
