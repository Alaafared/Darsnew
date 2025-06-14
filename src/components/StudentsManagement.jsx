import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { UserPlus, Users, Calendar, DollarSign, Edit, Trash2 } from 'lucide-react';
import SortableTable from '@/components/SortableTable';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTranslation } from 'react-i18next';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const CLASSES_DATA = (t) => [
  { id: 'class1', name: t('class1Name'), fee: 100 },
  { id: 'class2', name: t('class2Name'), fee: 150 },
  { id: 'class3', name: t('class3Name'), fee: 200 }
];


export default function StudentsManagement({ students: initialStudents, setStudents: setGlobalStudents, payments }) {
  const { t, i18n } = useTranslation();
  const CLASSES = useMemo(() => CLASSES_DATA(t), [t]);
  
  const [students, setStudents] = useLocalStorage('students', initialStudents);

  useEffect(() => {
    setGlobalStudents(students);
  }, [students, setGlobalStudents]);

  const [selectedClass, setSelectedClass] = useState('');
  const [studentName, setStudentName] = useState('');
  const [registrationDate, setRegistrationDate] = useState(new Date().toISOString().split('T')[0]);

  const [editingStudent, setEditingStudent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const addStudent = () => {
    if (!selectedClass || !studentName.trim()) {
      toast({ title: t('error'), description: t('fillAllFieldsError'), variant: "destructive" });
      return;
    }
    const newStudent = { id: Date.now().toString(), name: studentName.trim(), classId: selectedClass, registrationDate, createdAt: new Date().toISOString() };
    setStudents(prev => [...prev, newStudent]);
    setStudentName('');
    toast({ title: t('success'), description: t('studentAddedSuccess', { name: studentName }) });
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setSelectedClass(student.classId);
    setStudentName(student.name);
    setRegistrationDate(student.registrationDate);
    setShowEditModal(true);
  };

  const saveEditedStudent = () => {
    if (!selectedClass || !studentName.trim()) {
      toast({ title: t('error'), description: t('fillAllFieldsError'), variant: "destructive" });
      return;
    }
    setStudents(prevStudents => prevStudents.map(s => 
      s.id === editingStudent.id 
      ? { ...s, name: studentName.trim(), classId: selectedClass, registrationDate } 
      : s
    ));
    setShowEditModal(false);
    setEditingStudent(null);
    toast({ title: t('success'), description: t('studentUpdatedSuccess', { name: studentName }) }); 
  };

  const deleteStudent = (studentId, studentName) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
    toast({ title: t('success'), description: t('studentDeletedSuccess', { name: studentName }) });
  };

  const getStudentPaymentStatus = (studentId) => {
    const studentPayments = payments.filter(p => p.studentId === studentId);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const hasCurrentMonthPayment = studentPayments.some(p => {
      const paymentDate = new Date(p.date);
      return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
    });
    return hasCurrentMonthPayment ? t('paid') : t('unpaid');
  };

  const getLastPaymentInfo = (studentId) => {
    const studentPayments = payments.filter(p => p.studentId === studentId).sort((a, b) => new Date(b.date) - new Date(a.date));
    if (studentPayments.length === 0) return { date: t('noData'), receiver: t('noData') };
    const lastPayment = studentPayments[0];
    return { date: new Date(lastPayment.date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US'), receiver: lastPayment.receiver };
  };

  const getTotalPayments = (studentId) => payments.filter(p => p.studentId === studentId).reduce((total, payment) => total + payment.amount, 0);

  const studentTableColumns = (cls) => [
    { header: t('studentName'), key: 'name', sortable: true, accessor: 'name', printValue: (item) => item.name },
    { 
      header: t('registrationDate'), 
      key: 'registrationDate', 
      sortable: true, 
      render: (item) => <div className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(item.registrationDate).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}</div>,
      printValue: (item) => new Date(item.registrationDate).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')
    },
    { 
      header: t('paymentStatus'), 
      key: 'paymentStatus', 
      sortable: true, 
      render: (item) => {
        const status = getStudentPaymentStatus(item.id);
        return <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status === t('paid') ? 'status-paid' : 'status-unpaid'}`}>{status}</span>;
      },
      printValue: (item) => getStudentPaymentStatus(item.id)
    },
    { 
      header: t('lastPayment'), 
      key: 'lastPaymentDate', 
      sortable: true, 
      render: (item) => getLastPaymentInfo(item.id).date,
      printValue: (item) => getLastPaymentInfo(item.id).date
    },
    { 
      header: t('receiver'), 
      key: 'lastPaymentReceiver', 
      sortable: true, 
      render: (item) => getLastPaymentInfo(item.id).receiver,
      printValue: (item) => getLastPaymentInfo(item.id).receiver
    },
    { 
      header: t('totalPayments'), 
      key: 'totalPayments', 
      sortable: true, 
      render: (item) => <div className="flex items-center gap-1"><DollarSign className="h-4 w-4 text-green-600" />{getTotalPayments(item.id)} {t('currencyEGP')}</div>,
      printValue: (item) => `${getTotalPayments(item.id)} ${t('currencyEGP')}`
    },
  ];

  const studentTableActions = (student) => (
    <div className="flex space-x-1 rtl:space-x-reverse">
      <Button variant="ghost" size="sm" onClick={() => handleEditStudent(student)} className="text-blue-600 hover:text-blue-800">
        <Edit className="h-4 w-4" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="dark:bg-gray-800 dark:text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteStudentConfirmationTitle')}</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-300">
              {t('deleteStudentConfirmationMessage', { name: student.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white dark:border-gray-600">{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteStudent(student.id, student.name)} className="bg-red-600 hover:bg-red-700">
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
  
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="card-gradient dark:bg-gray-800">
          <CardHeader className="gradient-bg text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2"><UserPlus className="h-6 w-6" />{t('addStudentTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="class-select">{t('class')}</Label>
                <Select id="class-select" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                  <option value="">{t('selectClass')}</option>
                  {CLASSES.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
                </Select>
              </div>
              <div>
                <Label htmlFor="student-name">{t('studentName')}</Label>
                <Input id="student-name" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder={t('enterStudentName')} className="dark:bg-gray-700 dark:text-white dark:border-gray-600"/>
              </div>
              <div>
                <Label htmlFor="registration-date">{t('registrationDate')}</Label>
                <Input id="registration-date" type="date" value={registrationDate} onChange={(e) => setRegistrationDate(e.target.value)} className="dark:bg-gray-700 dark:text-white dark:border-gray-600"/>
              </div>
              <div className="flex items-end">
                <Button onClick={addStudent} className="w-full gradient-bg"><UserPlus className="h-4 w-4 ml-2" />{t('addStudentButton')}</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {showEditModal && editingStudent && (
        <AlertDialog open={showEditModal} onOpenChange={setShowEditModal}>
          <AlertDialogContent className="dark:bg-gray-800 dark:text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>{t('edit')} {editingStudent.name}</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
               <div>
                <Label htmlFor="edit-class-select">{t('class')}</Label>
                <Select id="edit-class-select" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                  <option value="">{t('selectClass')}</option>
                  {CLASSES.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-student-name">{t('studentName')}</Label>
                <Input id="edit-student-name" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder={t('enterStudentName')} className="dark:bg-gray-700 dark:text-white dark:border-gray-600"/>
              </div>
              <div>
                <Label htmlFor="edit-registration-date">{t('registrationDate')}</Label>
                <Input id="edit-registration-date" type="date" value={registrationDate} onChange={(e) => setRegistrationDate(e.target.value)} className="dark:bg-gray-700 dark:text-white dark:border-gray-600"/>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {setShowEditModal(false); setEditingStudent(null);}} className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white dark:border-gray-600">{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={saveEditedStudent} className="gradient-bg">{t('confirm')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {CLASSES.map(cls => {
        const classStudents = students.filter(s => s.classId === cls.id);
        return (
          <motion.div key={cls.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <Card className="card-gradient dark:bg-gray-800">
              <CardHeader className="table-header rounded-t-lg">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Users className="h-6 w-6" />{cls.name}</div>
                  <span className="text-sm bg-white/20 px-3 py-1 rounded-full">{t('studentsCount', { count: classStudents.length })}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {classStudents.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400"><Users className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>{t('noStudentsInClass')}</p></div>
                ) : (
                  <SortableTable 
                    data={classStudents} 
                    columns={studentTableColumns(cls)}
                    actions={studentTableActions}
                    onPrint 
                    caption={`${t('class')}: ${cls.name}`} 
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}