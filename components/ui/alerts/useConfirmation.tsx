'use client';

import { useState, useCallback } from 'react';
import ConfirmationDialog from './ConfirmationDialog';

interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface ConfirmationState {
  isOpen: boolean;
  options: ConfirmationOptions | null;
  onConfirm: (() => void) | null;
  loading: boolean;
}

export const useConfirmation = () => {
  const [state, setState] = useState<ConfirmationState>({
    isOpen: false,
    options: null,
    onConfirm: null,
    loading: false,
  });

  const confirm = useCallback((
    options: ConfirmationOptions,
    onConfirm: () => void | Promise<void>
  ) => {
    setState({
      isOpen: true,
      options,
      onConfirm: async () => {
        setState(prev => ({ ...prev, loading: true }));
        try {
          await onConfirm();
        } finally {
          setState(prev => ({ ...prev, loading: false }));
        }
      },
      loading: false,
    });
  }, []);

  const close = useCallback(() => {
    setState({
      isOpen: false,
      options: null,
      onConfirm: null,
      loading: false,
    });
  }, []);

  const ConfirmationComponent = state.options ? (
    <ConfirmationDialog
      isOpen={state.isOpen}
      onClose={close}
      onConfirm={state.onConfirm || (() => {})}
      title={state.options.title}
      message={state.options.message}
      confirmText={state.options.confirmText}
      cancelText={state.options.cancelText}
      type={state.options.type}
      loading={state.loading}
    />
  ) : null;

  return {
    confirm,
    close,
    ConfirmationComponent,
  };
};

export default useConfirmation;

