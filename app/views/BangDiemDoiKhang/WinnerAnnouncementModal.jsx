import React from "react";

const WinnerAnnouncementModal = ({
  showWinnerAnnouncementModal,
  announcedWinner,
  btnReturnWinner,
  btnConfirmWinner,
}) => {
  if (!showWinnerAnnouncementModal || !announcedWinner) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100]">
      <div className="bg-white dark:bg-gray-800 rounded p-8 max-w-2xl w-full mx-4 shadow-2xl border-4 border-yellow-500 dark:border-yellow-600">
        {/* Header với icon trophy */}
        <div className="text-center mb-6">
          <div className="inline-block bg-yellow-500 dark:bg-yellow-600 rounded-full p-4 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            🏆 VẬN ĐỘNG VIÊN THẮNG
          </h2>
        </div>

        {/* Thông tin vận động viên */}
        <div
          className={`p-6 rounded mb-6 ${
            announcedWinner.team === "red"
              ? "bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800 border-4 border-red-500 dark:border-red-600"
              : "bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 border-4 border-blue-500 dark:border-blue-600"
          }`}
        >
          <div className="text-center space-y-4">
            {/* Tên vận động viên */}
            <div>
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">
                TÊN VẬN ĐỘNG VIÊN
              </div>
              <div
                className={`text-4xl font-bold ${
                  announcedWinner.team === "red"
                    ? "text-red-700 dark:text-red-300"
                    : "text-blue-700 dark:text-blue-300"
                }`}
              >
                {announcedWinner.name}
              </div>
            </div>

            {/* Đội */}
            <div>
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">
                ĐỘI
              </div>
              <div
                className={`inline-block px-6 py-2 rounded-full text-2xl font-bold text-white ${
                  announcedWinner.team === "red"
                    ? "bg-red-600 dark:bg-red-700"
                    : "bg-blue-600 dark:bg-blue-700"
                }`}
              >
                {announcedWinner.teamName}
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            {/* Button Quay lại */}
            <button
              onClick={btnReturnWinner}
              className="bg-gray-500 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-700 text-white py-4 rounded font-bold text-lg transition-all shadow-lg hover:shadow-xl"
            >
              Quay lại
            </button>
            {/* Button Xác nhận */}
            <button
              onClick={btnConfirmWinner}
              className="bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-800 text-white py-4 rounded font-bold text-lg transition-all shadow-lg hover:shadow-xl"
            >
              Xác nhận & Kết thúc
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WinnerAnnouncementModal;
