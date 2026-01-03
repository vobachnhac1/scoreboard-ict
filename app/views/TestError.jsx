import React, { useState } from 'react';

const TestError = () => {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error('This is a test error to demonstrate Error Boundary!');
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Test Error Boundary</h1>
          <p className="text-gray-600 mb-6">
            Click vào nút bên dưới để test tính năng Error Boundary. Khi lỗi xảy ra, bạn sẽ thấy màn hình error đẹp với các nút điều hướng.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Trigger Error Button */}
            <button
              onClick={() => setShouldThrow(true)}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Trigger Error
            </button>

            {/* Async Error Button */}
            <button
              onClick={() => {
                setTimeout(() => {
                  setShouldThrow(true);
                }, 1000);
              }}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Trigger Error (Delayed)
            </button>
          </div>

          {/* Info Box */}
          <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex gap-3">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Tính năng Error Boundary</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✅ Bắt lỗi UI crash trong React components</li>
                  <li>✅ Hiển thị màn hình error đẹp thay vì blank screen</li>
                  <li>✅ Cung cấp 3 nút: Quay lại, Trang chủ, Tải lại</li>
                  <li>✅ Hiển thị chi tiết lỗi (development mode)</li>
                  <li>✅ Đếm số lần lỗi xảy ra</li>
                  <li>✅ Smooth animations và gradient design</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Example Scenarios */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2">Scenario 1</h4>
              <p className="text-sm text-purple-800">Component render error</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">Scenario 2</h4>
              <p className="text-sm text-green-800">Async operation error</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg border border-pink-200">
              <h4 className="font-semibold text-pink-900 mb-2">Scenario 3</h4>
              <p className="text-sm text-pink-800">State update error</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestError;

