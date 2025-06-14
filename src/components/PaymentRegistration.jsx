import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { CreditCard, DollarSign, User, Calendar, Edit, Trash2 } from 'lucide-react';
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

const RECEIVERS_DATA = (t) => [t('receiver1Name'), t('receiver2Name')];

export default function PaymentRegistration({ students, payments: initialPayments, setPayments: setGlobalPayments }) {
  const { t, i18n } = useTranslation();
  const CLASSES = useMemo(() => CLASSES_DATA(t), [t]);
  const RECEIVERS = useMemo(() => RECEIVERS_DATA(t), [t]);

  const [payments, setPayments] = useLocalStorage('payments', initialPayments);

  useEffect(() => {
    setGlobalPayments(payments);
  }, [payments, setGlobalPayments]);

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiver, setReceiver] = useState('');
  const [editingPayment, setEditingPayment] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const classStudents = students.filter(s => s.classId === selectedClass);
  
  useEffect(() => {
    if (editingPayment) {
      setSelectedClass(editingPayment.classId);
      setSelectedStudent(editingPayment.studentId);
      setAmount(editingPayment.amount.toString());
      setPaymentDate(editingPayment.date);
      setReceiver(editingPayment.receiver);
    } else {
      resetForm();
    }
  }, [editingPayment, CLASSES]);


  const resetForm = () => {
    const currentClassInfo = CLASSES.find(c => c.id === selectedClass);
    setSelectedStudent('');
    setAmount(currentClassInfo ? currentClassInfo.fee.toString() : '');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setReceiver('');
  };
  
  const handleClassChange = (classId) => {
    setSelectedClass(classId);
    setSelectedStudent('');
    const classInfo = CLASSES.find(c => c.id === classId);
    if (classInfo) {
      setAmount(classInfo.fee.toString());
    } else {
      setAmount('');
    }
  };

  const handleRegisterOrUpdatePayment = () => {
    if (!selectedClass || !selectedStudent || !amount || !receiver) {
      toast({ title: t('error'), description: t('fillAllPaymentFieldsError'), variant: "destructive" });
      return;
    }
    const student = students.find(s => s.id === selectedStudent);
    if (!student) {
      toast({ title: t('error'), description: t('studentNotFoundError'), variant: "destructive" });
      return;
    }
    
    const currentClassInfo = CLASSES.find(c => c.id === selectedClass);

    if (editingPayment) {
      const updatedPayment = { ...editingPayment, studentId: selectedStudent, studentName: student.name, classId: selectedClass, className: currentClassInfo?.name || '', amount: parseFloat(amount), date: paymentDate, receiver };
      setPayments(prev => prev.map(p => p.id === editingPayment.id ? updatedPayment : p));
      toast({ title: t('success'), description: t('paymentUpdatedSuccess') });
      setEditingPayment(null);
      setShowEditModal(false);
    } else {
      const newPayment = { id: Date.now().toString(), studentId: selectedStudent, studentName: student.name, classId: selectedClass, className: currentClassInfo?.name || '', amount: parseFloat(amount), date: paymentDate, receiver, createdAt: new Date().toISOString() };
      setPayments(prev => [...prev, newPayment]);
      toast({ title: t('success'), description: t('paymentRegisteredSuccess', { amount, name: student.name }) });
    }
    resetForm();
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setShowEditModal(true);
  };

  const handleDeletePayment = (paymentId) => {
    setPayments(prev => prev.filter(p => p.id !== paymentId));
    toast({ title: t('success'), description: t('paymentDeletedSuccess') });
  };

  const paymentColumns = [
    { 
      header: t('student'), 
      key: 'studentName', 
      sortable: true, 
      render: (item) => <div className="flex items-center gap-2"><User className="h-4 w-4 text-blue-600 dark:text-blue-400" />{item.studentName}</div>,
      printValue: (item) => item.studentName
    },
    { header: t('class'), key: 'className', sortable: true, accessor: 'className', printValue: (item) => item.className },
    { 
      header: t('amount'), 
      key: 'amount', 
      sortable: true, 
      render: (item) => <div className="flex items-center gap-1"><DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />{item.amount} {t('currencyEGP')}</div>,
      printValue: (item) => `${item.amount} ${t('currencyEGP')}`
    },
    { 
      header: t('date'), 
      key: 'date', 
      sortable: true, 
      render: (item) => <div className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(item.date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}</div>,
      printValue: (item) => new Date(item.date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')
    },
    { header: t('receiver'), key: 'receiver', sortable: true, accessor: 'receiver', printValue: (item) => item.receiver },
  ];
  
  const paymentTableActions = (payment) => (
    <div className="flex space-x-1 rtl:space-x-reverse">
      <Button variant="ghost" size="sm" onClick={() => handleEditPayment(payment)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
        <Edit className="h-4 w-4" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="dark:bg-gray-800 dark:text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deletePaymentConfirmationTitle')}</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-300">{t('deletePaymentConfirmationMessage')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white dark:border-gray-600">{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDeletePayment(payment.id)} className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600">
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
            <CardTitle className="flex items-center gap-2"><CreditCard className="h-6 w-6" />{t('newPaymentTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="payment-class">{t('class')}</Label>
                <Select id="payment-class" value={selectedClass} onChange={(e) => handleClassChange(e.target.value)} className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                  <option value="">{t('selectClass')}</option>
                  {CLASSES.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
                </Select>
              </div>
              <div>
                <Label htmlFor="payment-student">{t('student')}</Label>
                <Select id="payment-student" value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} disabled={!selectedClass} className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                  <option value="">{t('selectStudent')}</option>
                  {classStudents.map(student => <option key={student.id} value={student.id}>{student.name}</option>)}
                </Select>
              </div>
              <div>
                <Label htmlFor="payment-amount">{t('amountInCurrencyEGP')}</Label>
                <Input id="payment-amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={t('enterAmount')} className="dark:bg-gray-700 dark:text-white dark:border-gray-600"/>
              </div>
              <div>
                <Label htmlFor="payment-date">{t('paymentDate')}</Label>
                <Input id="payment-date" type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="dark:bg-gray-700 dark:text-white dark:border-gray-600"/>
              </div>
              <div>
                <Label htmlFor="payment-receiver">{t('receiver')}</Label>
                <Select id="payment-receiver" value={receiver} onChange={(e) => setReceiver(e.target.value)} className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                  <option value="">{t('selectReceiver')}</option>
                  {RECEIVERS.map(rec => <option key={rec} value={rec}>{rec}</option>)}
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleRegisterOrUpdatePayment} className="w-full gradient-bg">
                  <CreditCard className="h-4 w-4 ml-2" />{editingPayment ? t('updatePaymentButton') : t('registerPaymentButton')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {showEditModal && editingPayment && (
         <AlertDialog open={showEditModal} onOpenChange={setShowEditModal}>
            <AlertDialogContent className="dark:bg-gray-800 dark:text-white">
              <AlertDialogHeader>
                <AlertDialogTitle>{t('editPaymentTitle')}</AlertDialogTitle>
              </AlertDialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="edit-payment-class">{t('class')}</Label>
                  <Select id="edit-payment-class" value={selectedClass} onChange={(e) => handleClassChange(e.target.value)} className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    <option value="">{t('selectClass')}</option>
                    {CLASSES.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-payment-student">{t('student')}</Label>
                  <Select id="edit-payment-student" value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} disabled={!selectedClass} className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    <option value="">{t('selectStudent')}</option>
                    {students.filter(s => s.classId === selectedClass).map(student => <option key={student.id} value={student.id}>{student.name}</option>)}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-payment-amount">{t('amountInCurrencyEGP')}</Label>
                  <Input id="edit-payment-amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={t('enterAmount')} className="dark:bg-gray-700 dark:text-white dark:border-gray-600"/>
                </div>
                <div>
                  <Label htmlFor="edit-payment-date">{t('paymentDate')}</Label>
                  <Input id="edit-payment-date" type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="dark:bg-gray-700 dark:text-white dark:border-gray-600"/>
                </div>
                <div>
                  <Label htmlFor="edit-payment-receiver">{t('receiver')}</Label>
                  <Select id="edit-payment-receiver" value={receiver} onChange={(e) => setReceiver(e.target.value)} className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    <option value="">{t('selectReceiver')}</option>
                    {RECEIVERS.map(rec => <option key={rec} value={rec}>{rec}</option>)}
                  </Select>
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => {setShowEditModal(false); setEditingPayment(null); resetForm();}} className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white dark:border-gray-600">{t('cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleRegisterOrUpdatePayment} className="gradient-bg">{t('updatePaymentButton')}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <Card className="card-gradient dark:bg-gray-800">
          <CardHeader className="table-header rounded-t-lg">
            <CardTitle className="flex items-center gap-2"><DollarSign className="h-6 w-6" />{t('latestPaymentsTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {payments.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400"><CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>{t('noPaymentsRegistered')}</p></div>
            ) : (
              <SortableTable
                data={payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))}
                columns={paymentColumns}
                actions={paymentTableActions}
                onPrint
                caption={t('latestPaymentsTitle')}
              />
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}