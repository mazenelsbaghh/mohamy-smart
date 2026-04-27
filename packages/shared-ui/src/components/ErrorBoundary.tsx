import React from'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (typeof window !=='undefined') {
      import('@sentry/react')
        .then((Sentry) => {
          Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
        })
        .catch(() => {});
    }

    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, info);
    }
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          dir="rtl"
          className="min-h-screen flex items-center justify-center p-6 app-surface-soft dark:bg-[#0f172a] font-['Tajawal']"
        >
          <div className="max-w-md w-full bg-white dark:bg-[#1e293b] rounded-3xl shadow-xl p-8 md:p-12 text-center border app-border dark:app-border-strong transition-all duration-300">
            <div className="mx-auto w-24 h-24 mb-6 bg-[var(--danger-soft)] dark:bg-red-500/10 rounded-full flex items-center justify-center animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-[var(--danger-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold mb-3 text-[var(--title-color)] tracking-tight">
              حدث خطأ غير متوقع
            </h1>

            <p className="app-text-subtle dark:app-text-subtle mb-8 leading-relaxed text-lg">
              لقد واجهنا مشكلة أثناء تحميل هذه الصفحة. الرجاء محاولة إعادة تحميل الصفحة للمتابعة.
            </p>

            <button
              onClick={this.handleReload}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              إعادة تحميل الصفحة
            </button>

            {this.state.error && (
              <div className="mt-8 p-4 app-surface-soft dark:app-surface-muted/50 rounded-xl overflow-hidden text-start opacity-60 hover:opacity-100 transition-opacity" dir="ltr">
                <p className="text-xs app-text-subtle dark:app-text-subtle font-mono truncate">
                  {this.state.error.message}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
