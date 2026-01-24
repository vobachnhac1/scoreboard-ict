import React from "react";

const WinnerSelectionModal = ({
  showWinnerModal,
  setShowWinnerModal,
  redScore,
  blueScore,
  matchInfo,
  handleWinner,
  setIsFinishingMatch,
}) => {
  if (!showWinnerModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100]">
      <div className="bg-white rounded p-8 max-w-2xl w-full mx-4 shadow-2xl border-4 border-blue-500">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-blue-500 rounded-full p-3 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Điểm số bằng nhau!
          </h2>
          <p className="text-lg text-gray-600">
            Điểm số:{" "}
            <span className="font-bold text-blue-600">
              {redScore} - {blueScore}
            </span>
          </p>
          <p className="text-base text-gray-500 mt-2">
            Vui lòng chọn vận động viên thắng cuộc
          </p>
        </div>

        {/* Buttons chọn winner */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Button ĐỎ */}
          <button
            onClick={() => handleWinner("red", true)}
            className="group relative bg-gradient-to-br from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white p-6 rounded transition-all transform hover:scale-105 shadow-lg hover:shadow-2xl border-2 border-red-400"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="bg-white rounded-full p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-red-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="text-center">
                <div className="text-xs font-semibold text-red-200 mb-1">
                  {matchInfo?.red?.unit ?? ""}
                </div>
                <div className="text-xl font-bold">
                  {matchInfo.red.name || "ĐỎ"}
                </div>
                <div className="text-xs text-red-200 mt-1">Click để chọn</div>
              </div>
            </div>
          </button>

          {/* Button XANH */}
          <button
            onClick={() => handleWinner("blue", true)}
            className="group relative bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white p-6 rounded transition-all transform hover:scale-105 shadow-lg hover:shadow-2xl border-2 border-blue-400"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="bg-white rounded-full p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-blue-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="text-center">
                <div className="text-xs font-semibold text-blue-200 mb-1">
                  {matchInfo?.blue?.unit ?? ""}
                </div>
                <div className="text-xl font-bold">
                  {matchInfo?.blue?.name ?? "XANH"}
                </div>
                <div className="text-xs text-blue-200 mt-1">Click để chọn</div>
              </div>
            </div>
          </button>
        </div>

        {/* Button Hủy */}
        <button
          onClick={() => {
            setShowWinnerModal(false);
            setIsFinishingMatch(false); // Reset state khi hủy
          }}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 rounded font-semibold transition-colors"
        >
          Hủy
        </button>
      </div>
    </div>
  );
};

export default WinnerSelectionModal;
