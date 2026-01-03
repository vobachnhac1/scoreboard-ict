import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ErrorPage({ error }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Error Icon */}
        <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-red-500 to-orange-600 rounded-full shadow-2xl mb-8 animate-pulse">
          <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* Error Title */}
        <h1 className="text-6xl font-black text-gray-900 mb-4 tracking-tight">
          Oops!
        </h1>
        
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Đã xảy ra lỗi
        </h2>

        {/* Error Message */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-red-200">
          <p className="text-gray-600 text-lg mb-4">
            Rất tiếc, hệ thống đã gặp sự cố không mong muốn.
          </p>
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-left">
              <p className="text-sm font-mono text-red-800 break-all">
                {error.toString()}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200 w-full sm:w-auto"
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Về trang chủ
            </div>
          </button>

          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-white text-gray-900 font-bold rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200 border-2 border-gray-200 w-full sm:w-auto"
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Tải lại trang
            </div>
          </button>
        </div>

        {/* Help Text */}
        <p className="text-gray-500 text-sm mt-8">
          Nếu lỗi vẫn tiếp tục, vui lòng liên hệ với quản trị viên hệ thống.
        </p>
      </div>
    </div>
  );
}

