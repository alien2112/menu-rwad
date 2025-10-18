'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomAlert, { AlertType } from './CustomAlert';

export interface Alert {
  id: string;
  type: AlertType;
  title?: string;
  message: string;
  duration?: number;
  showProgress?: boolean;
}

interface AlertContainerProps {
  alerts: Alert[];
  onRemoveAlert: (id: string) => void;
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

export const AlertContainer: React.FC<AlertContainerProps> = ({
  alerts,
  onRemoveAlert,
  position = 'top-right',
}) => {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'fixed top-4 right-4 z-50';
      case 'top-center':
        return 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50';
      case 'bottom-right':
        return 'fixed bottom-4 right-4 z-50';
      case 'bottom-center':
        return 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50';
      default:
        return 'fixed top-4 right-4 z-50';
    }
  };

  return (
    <div className={getPositionClasses()}>
      <AnimatePresence mode="popLayout">
        {alerts.map((alert) => (
          <CustomAlert
            key={alert.id}
            {...alert}
            onClose={onRemoveAlert}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AlertContainer;

