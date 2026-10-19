import React from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldCheck } from 'lucide-react';

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
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[RK STUDY CENTRE ErrorBoundary] Uncaught UI error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.hash = '';
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.hash = 'home';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 text-slate-900 font-sans">
          <div className="max-w-lg w-full bg-white rounded-3xl border-2 border-slate-200 shadow-xl p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
              <AlertTriangle className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-900 text-xs font-black border border-blue-200">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>RK STUDY CENTRE • सुरक्षा तंत्र</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                पेज लोड करने में रुकावट आई
              </h2>
              <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                चिंता न करें, आपका कोई भी अध्ययन डेटा या नोट्स प्रभावित नहीं हुए हैं। कृपया मुख्य पृष्ठ पर वापस जाएं या पेज रीलोड करें।
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
              <button
                type="button"
                onClick={this.handleGoHome}
                className="py-3.5 px-6 rounded-xl font-black text-sm bg-blue-700 hover:bg-blue-800 text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>मुख्य पृष्ठ (Home)</span>
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="py-3.5 px-6 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>पेज रीलोड करें</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
