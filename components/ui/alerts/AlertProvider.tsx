'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import AlertContainer, { Alert } from './AlertContainer';

interface AlertContextType {
  showAlert: (type: AlertType, message: string, options?: AlertOptions) => void;
  showSuccess: (message: string, options?: AlertOptions) => void;
  showError: (message: string, options?: AlertOptions) => void;
  showWarning: (message: string, options?: AlertOptions) => void;
  showInfo: (message: string, options?: AlertOptions) => void;
  removeAlert: (id: string) => void;
  clearAllAlerts: () => void;
}

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertOptions {
  title?: string;
  duration?: number;
  showProgress?: boolean;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

interface AlertProviderProps {
  children: ReactNode;
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
  maxAlerts?: number;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({
  children,
  position = 'top-right',
  maxAlerts = 5,
}) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const generateId = () => {
    return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const addAlert = useCallback((alert: Omit<Alert, 'id'>) => {
    const id = generateId();
    const newAlert: Alert = { ...alert, id };

    setAlerts((prev) => {
      const updated = [newAlert, ...prev];
      // Keep only the most recent alerts if we exceed maxAlerts
      return updated.slice(0, maxAlerts);
    });

    return id;
  }, [maxAlerts]);

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const showAlert = useCallback((
    type: AlertType,
    message: string,
    options: AlertOptions = {}
  ) => {
    const { title, duration = 4000, showProgress = true } = options;
    addAlert({
      type,
      message,
      title,
      duration,
      showProgress,
    });
  }, [addAlert]);

  const showSuccess = useCallback((message: string, options?: AlertOptions) => {
    showAlert('success', message, options);
  }, [showAlert]);

  const showError = useCallback((message: string, options?: AlertOptions) => {
    showAlert('error', message, options);
  }, [showAlert]);

  const showWarning = useCallback((message: string, options?: AlertOptions) => {
    showAlert('warning', message, options);
  }, [showAlert]);

  const showInfo = useCallback((message: string, options?: AlertOptions) => {
    showAlert('info', message, options);
  }, [showAlert]);

  const value: AlertContextType = {
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeAlert,
    clearAllAlerts,
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
      <AlertContainer
        alerts={alerts}
        onRemoveAlert={removeAlert}
        position={position}
      />
    </AlertContext.Provider>
  );
};

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export default AlertProvider;
