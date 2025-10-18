'use client';

import React from 'react';
import { useAlert } from '@/components/ui/alerts';

/**
 * Demo component showing how to use the custom alert system
 * This can be used as a reference for implementing alerts throughout the admin
 */
export const AlertDemo: React.FC = () => {
  const { showSuccess, showError, showWarning, showInfo } = useAlert();

  const handleShowSuccess = () => {
    showSuccess('تم حفظ البيانات بنجاح!', {
      title: 'نجح العمل',
      duration: 3000,
    });
  };

  const handleShowError = () => {
    showError('حدث خطأ أثناء حفظ البيانات', {
      title: 'خطأ في العملية',
      duration: 5000,
    });
  };

  const handleShowWarning = () => {
    showWarning('تحذير: هذه العملية لا يمكن التراجع عنها', {
      title: 'تحذير مهم',
      duration: 4000,
    });
  };

  const handleShowInfo = () => {
    showInfo('معلومات إضافية حول هذه العملية', {
      title: 'معلومات',
      duration: 3000,
    });
  };

  return (
    <div className="admin-card p-6">
      <h3 className="text-lg font-semibold mb-4">تجربة نظام التنبيهات</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={handleShowSuccess}
          className="admin-button bg-green-500 hover:bg-green-600 text-white"
        >
          تنبيه نجاح
        </button>
        <button
          onClick={handleShowError}
          className="admin-button bg-red-500 hover:bg-red-600 text-white"
        >
          تنبيه خطأ
        </button>
        <button
          onClick={handleShowWarning}
          className="admin-button bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          تنبيه تحذير
        </button>
        <button
          onClick={handleShowInfo}
          className="admin-button bg-blue-500 hover:bg-blue-600 text-white"
        >
          تنبيه معلومات
        </button>
      </div>
    </div>
  );
};

export default AlertDemo;

