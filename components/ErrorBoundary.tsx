'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <div className="glass-effect rounded-3xl p-8 text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-white text-xl font-bold mb-4">حدث خطأ في التحميل</h2>
          <p className="text-white/70 mb-6">
            نعتذر، حدث خطأ أثناء تحميل هذا القسم. يرجى المحاولة مرة أخرى.
          </p>
          <button
            onClick={this.resetError}
            className="glass-green-button px-6 py-3 rounded-full text-white font-semibold hover:bg-coffee-green/80 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Pre-built fallback components for specific use cases
export const SignatureDrinksErrorFallback: React.FC<{ error?: Error; resetError: () => void }> = ({ resetError }) => (
  <div className="glass-effect rounded-3xl p-8 text-center">
    <div className="text-red-400 text-4xl mb-4">☕</div>
    <h3 className="text-white text-lg font-bold mb-4">لا يمكن تحميل المشروبات المميزة</h3>
    <p className="text-white/70 mb-6">
      حدث خطأ أثناء تحميل قائمة المشروبات المميزة
    </p>
    <button
      onClick={resetError}
      className="glass-green-button px-4 py-2 rounded-full text-white font-semibold hover:bg-coffee-green/80 transition-colors"
    >
      إعادة المحاولة
    </button>
  </div>
);

export const OffersErrorFallback: React.FC<{ error?: Error; resetError: () => void }> = ({ resetError }) => (
  <div className="glass-effect rounded-3xl p-6 text-center">
    <div className="text-red-400 text-3xl mb-3">🎯</div>
    <h3 className="text-white text-lg font-bold mb-3">لا يمكن تحميل العروض</h3>
    <p className="text-white/70 mb-4">
      حدث خطأ أثناء تحميل العروض الخاصة
    </p>
    <button
      onClick={resetError}
      className="glass-green-button px-4 py-2 rounded-full text-white font-semibold hover:bg-coffee-green/80 transition-colors"
    >
      إعادة المحاولة
    </button>
  </div>
);

export const JourneyErrorFallback: React.FC<{ error?: Error; resetError: () => void }> = ({ resetError }) => (
  <div className="glass-effect rounded-3xl p-8 text-center">
    <div className="text-red-400 text-4xl mb-4">📖</div>
    <h3 className="text-white text-lg font-bold mb-4">لا يمكن تحميل قصتنا</h3>
    <p className="text-white/70 mb-6">
      حدث خطأ أثناء تحميل قسم قصتنا
    </p>
    <button
      onClick={resetError}
      className="glass-green-button px-4 py-2 rounded-full text-white font-semibold hover:bg-coffee-green/80 transition-colors"
    >
      إعادة المحاولة
    </button>
  </div>
);

export default ErrorBoundary;
