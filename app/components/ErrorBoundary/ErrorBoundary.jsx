import React from 'react';
import { useNavigate } from 'react-router-dom';

class ErrorBoundaryClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Log to error reporting service (e.g., Sentry)
    // logErrorToService(error, errorInfo);
  }

  resetError = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorCount={this.state.errorCount}
          resetError={this.resetError}
          navigate={this.props.navigate}
        />
      );
    }

    return this.props.children;
  }
}

// Error Fallback UI Component
const ErrorFallback = ({ error, errorInfo, errorCount, resetError, navigate }) => {
  const handleGoBack = () => {
    resetError();
    navigate(-1);
  };

  const handleGoHome = () => {
    resetError();
    navigate('/');
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Error Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with Animation */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
            
            <div className="relative z-10">
              {/* Error Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm animate-pulse">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>

              <h1 className="text-3xl font-black text-center mb-2">Oops! Có lỗi xảy ra</h1>
              <p className="text-center text-white/90 text-lg">Ứng dụng gặp sự cố không mong muốn</p>
            </div>
          </div>

          {/* Error Details */}
          <div className="p-8">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <h2 className="text-lg font-bold text-gray-900">Chi tiết lỗi:</h2>
              </div>
              
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                <p className="text-red-800 font-semibold mb-1">
                  {error?.message || 'Unknown error occurred'}
                </p>
                {errorCount > 1 && (
                  <p className="text-red-600 text-sm">
                    Lỗi đã xảy ra {errorCount} lần
                  </p>
                )}
              </div>
            </div>

            {/* Stack Trace (Collapsible) */}
            {process.env.NODE_ENV === 'development' && errorInfo && (
              <details className="mb-6">
                <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900 mb-2">
                  🔍 Xem chi tiết kỹ thuật (Developer Mode)
                </summary>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-64 text-xs font-mono">
                  <pre>{errorInfo.componentStack}</pre>
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={handleGoBack}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Quay lại
              </button>

              <button
                onClick={handleGoHome}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Trang chủ
              </button>

              <button
                onClick={handleReload}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Tải lại
              </button>
            </div>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex gap-3">
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Cần trợ giúp?</h3>
                  <p className="text-sm text-blue-800">
                    Nếu lỗi vẫn tiếp tục xảy ra, vui lòng liên hệ bộ phận hỗ trợ kỹ thuật hoặc thử lại sau.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrapper component to use hooks
const ErrorBoundary = ({ children }) => {
  const navigate = useNavigate();
  return <ErrorBoundaryClass navigate={navigate}>{children}</ErrorBoundaryClass>;
};

export default ErrorBoundary;

