import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import CustomTable from '../../../components/CustomTable';
import Button from '../../../components/Button';
import Modal from '../../../components/Modal';
import SearchInput from '../../../components/SearchInput';
import { Constants } from '../../../common/Constants';
import { useAppDispatch, useAppSelector } from "../../../config/redux/store";
import { fetchConfigSystem, updateConfigSystem } from "../../../config/redux/controller/configSystemSlice";
import * as XLSX from 'xlsx';

// Component hiển thị chi tiết từng hiệp
function RoundHistoryCard({ round, roundIndex, logs }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white  border border-gray-200 overflow-hidden">
      {/* Header - Tóm tắt hiệp */}
      <div
        className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 transition-transform text-gray-400 ${expanded ? 'rotate-90' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <div className="text-sm font-semibold text-gray-700">
              Hiệp {round.round}
              {round.roundType && round.roundType !== 'NORMAL' && (
                <span className="ml-2 text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                  {round.roundType === 'EXTRA' ? 'Hiệp phụ' : round.roundType}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Điểm số */}
            <div className="flex items-center gap-2">
              <div className="text-center">
                <div className="text-xs text-gray-500">Đỏ</div>
                <div className="text-lg font-bold text-red-600">{round.red?.match?.score || 0}</div>
              </div>
              <div className="text-gray-400">-</div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Xanh</div>
                <div className="text-lg font-bold text-blue-600">{round.blue?.match?.score || 0}</div>
              </div>
            </div>

            {/* Số lượng logs */}
            {logs.length > 0 && (
              <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {logs.length} hành động
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded - Chi tiết logs */}
      {expanded && logs.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 p-3">
          <div className="text-xs font-semibold text-gray-600 mb-2">📋 Chi tiết hành động</div>
          <div className="max-h-60 overflow-y-auto bg-white rounded border border-gray-200">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-2 py-1.5 text-left font-medium text-gray-600">Thời gian</th>
                  <th className="px-2 py-1.5 text-left font-medium text-gray-600">Loại</th>
                  <th className="px-2 py-1.5 text-left font-medium text-gray-600">Đội</th>
                  <th className="px-2 py-1.5 text-left font-medium text-gray-600">Mô tả</th>
                  <th className="px-2 py-1.5 text-center font-medium text-gray-600">Điểm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log, logIndex) => (
                  <tr key={logIndex} className="hover:bg-gray-50">
                    <td className="px-2 py-1.5 text-gray-600">{log.time || '-'}</td>
                    <td className="px-2 py-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                        log.actionType === 'score' ? 'bg-green-100 text-green-800' :
                        log.actionType === 'warn' ? 'bg-yellow-100 text-yellow-800' :
                        log.actionType === 'remind' ? 'bg-blue-100 text-blue-800' :
                        log.actionType === 'medical' ? 'bg-red-100 text-red-800' :
                        log.actionType === 'fall' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.actionType}
                      </span>
                    </td>
                    <td className="px-2 py-1.5">
                      {log.team === 'red' ? (
                        <span className="text-red-600 font-medium">🔴 Đỏ</span>
                      ) : log.team === 'blue' ? (
                        <span className="text-blue-600 font-medium">🔵 Xanh</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-2 py-1.5 text-gray-700">{log.description || '-'}</td>
                    <td className="px-2 py-1.5 text-center">
                      <span className="font-mono text-gray-900 font-medium">
                        {log.redScore || 0} - {log.blueScore || 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Thống kê hiệp */}
          {round.red && round.blue && (
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-red-50 rounded p-2">
                <div className="font-semibold text-red-700 mb-1">🔴 Giáp Đỏ</div>
                <div className="space-y-0.5 text-gray-600">
                  <div>Điểm: <span className="font-bold text-red-600">{round.red.match?.score || 0}</span></div>
                  <div>Nhắc nhở: {round.red.match?.remind || 0}</div>
                  <div>Cảnh cáo: {round.red.match?.warn || 0}</div>
                  <div>Ngã: {round.red.match?.fall || 0}</div>
                </div>
              </div>
              <div className="bg-blue-50 rounded p-2">
                <div className="font-semibold text-blue-700 mb-1">🔵 Giáp Xanh</div>
                <div className="space-y-0.5 text-gray-600">
                  <div>Điểm: <span className="font-bold text-blue-600">{round.blue.match?.score || 0}</span></div>
                  <div>Nhắc nhở: {round.blue.match?.remind || 0}</div>
                  <div>Cảnh cáo: {round.blue.match?.warn || 0}</div>
                  <div>Ngã: {round.blue.match?.fall || 0}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Thông báo khi không có logs */}
      {expanded && logs.length === 0 && (
        <div className="border-t border-gray-200 bg-gray-50 p-3 text-center text-xs text-gray-500">
          Không có hành động nào trong hiệp này
        </div>
      )}
    </div>
  );
}

// Component Card cho mỗi trận đấu
function MatchCard({ row, listActions, getActionsByStatus, onDoubleClick, viewMode = 'grid' }) {
  const status = row.match_status || 'WAI';
  const statusConfig = {
    'WAI': {
      label: 'Chờ',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      )
    },
    'IN': {
      label: 'Đang diễn ra',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
      )
    },
    'FIN': {
      label: 'Kết thúc',
      color: 'bg-green-100 text-green-800 border-green-300',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    },
    'CAN': {
      label: 'Hủy',
      color: 'bg-red-100 text-red-800 border-red-300',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )
    }
  };

  const currentStatus = statusConfig[status] || statusConfig['WAI'];
  const availableActions = getActionsByStatus(status);

  // Xác định màu nổi bật theo VĐV thắng
  const winner = row.winner?.toUpperCase();
  let cardBorderClass = 'border-gray-200';
  let cardBgClass = 'bg-white';
  let cardGlowClass = '';

  if (status === 'FIN' && winner) {
    if (winner === 'RED') {
      cardBorderClass = 'border-red-400 border-2';
      cardBgClass = 'bg-gradient-to-br from-red-50 via-white to-red-50';
      cardGlowClass = 'shadow-red-200 shadow-lg';
    } else if (winner === 'BLUE') {
      cardBorderClass = 'border-blue-400 border-2';
      cardBgClass = 'bg-gradient-to-br from-blue-50 via-white to-blue-50';
      cardGlowClass = 'shadow-blue-200 shadow-lg';
    }
  }

  // List View - Compact horizontal layout
  if (viewMode === 'list') {
    return (
      <div
        className={`${cardBgClass} rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border ${cardBorderClass} ${cardGlowClass} overflow-hidden group relative`}
        onDoubleClick={() => onDoubleClick(row)}
      >
        {/* Winner Badge cho List View */}
        {status === 'FIN' && winner && (
          <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold shadow-md ${
            winner === 'RED'
              ? 'bg-red-500 text-white'
              : 'bg-blue-500 text-white'
          }`}>
            🏆 {winner === 'RED' ? 'ĐỎ THẮNG' : 'XANH THẮNG'}
          </div>
        )}
        <div className="flex items-center gap-4 p-4">
          {/* Trận số */}
          <div className="flex-shrink-0">
            <div className="bg-blue-600 text-white rounded-lg px-4 py-2 font-bold text-base shadow-md min-w-[80px] text-center">
              Trận {row.data[0]}
            </div>
          </div>

          {/* Giáp Đỏ */}
          <div className={`flex-1 min-w-0 transition-all duration-300 ${
            status === 'FIN' && winner === 'RED' ? 'scale-105' : ''
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 bg-red-600 rounded-full ${status === 'FIN' && winner === 'RED' ? 'animate-pulse' : ''}`}></div>
              <span className="text-xs font-semibold text-red-700 uppercase">Đỏ</span>
              {status === 'FIN' && winner === 'RED' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              )}
            </div>
            <div className={`font-bold truncate ${
              status === 'FIN' && winner === 'RED' ? 'text-red-700 text-lg' : 'text-red-900'
            }`}>
              {row.data[3] || '-'}
            </div>
            <div className="text-sm text-red-700 truncate">{row.data[4] || '-'}</div>
          </div>

          {/* VS */}
          <div className="flex-shrink-0 text-gray-400 font-bold text-lg">VS</div>

          {/* Giáp Xanh */}
          <div className={`flex-1 min-w-0 transition-all duration-300 ${
            status === 'FIN' && winner === 'BLUE' ? 'scale-105' : ''
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 bg-blue-600 rounded-full ${status === 'FIN' && winner === 'BLUE' ? 'animate-pulse' : ''}`}></div>
              <span className="text-xs font-semibold text-blue-700 uppercase">Xanh</span>
              {status === 'FIN' && winner === 'BLUE' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              )}
            </div>
            <div className={`font-bold truncate ${
              status === 'FIN' && winner === 'BLUE' ? 'text-blue-700 text-lg' : 'text-blue-900'
            }`}>
              {row.data[6] || '-'}
            </div>
            <div className="text-sm text-blue-700 truncate">{row.data[7] || '-'}</div>
          </div>

          {/* Trạng thái */}
          <div className="flex-shrink-0">
            <div className={`px-3 py-1.5 rounded-lg font-semibold text-xs border-2 ${currentStatus.color} flex items-center gap-1.5 whitespace-nowrap`}>
              <span>{currentStatus.icon}</span>
              <span>{currentStatus.label}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {listActions
              .filter((action) => availableActions.includes(action.key))
              .map((action) => (
                <button
                  onClick={() => action.callback(row)}
                  key={action.key}
                  className={`
                    flex items-center gap-1.5
                    px-2.5 py-1.5
                    rounded-lg
                    text-xs font-semibold
                    shadow-sm hover:shadow-md
                    transform hover:scale-105
                    transition-all duration-200
                    whitespace-nowrap
                    ${action.color}
                  `}
                >
                  {action.icon}
                  <span className="hidden xl:inline">{action.btnText}</span>
                </button>
              ))}
          </div>
        </div>
      </div>
    );
  }

  // Grid View - Original card layout
  return (
    <div
      className={`${cardBgClass} rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border ${cardBorderClass} ${cardGlowClass} overflow-hidden group relative`}
      onDoubleClick={() => onDoubleClick(row)}
    >
      {/* Winner Badge cho Grid View */}
      {status === 'FIN' && winner && (
        <div className={`absolute top-3 right-3 z-10 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 ${
          winner === 'RED'
            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
            : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
        }`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span>{winner === 'RED' ? 'ĐỎ THẮNG' : 'XANH THẮNG'}</span>
        </div>
      )}

      {/* Header - Trận số và Trạng thái */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white rounded-lg px-3 py-1.5 font-bold text-sm shadow-md">
              Trận {row.data[0]}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">{row.data[1]}</span>
              {row.data[2] && <span className="ml-2 text-gray-400">• {row.data[2]}</span>}
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-lg font-semibold text-xs border-2 ${currentStatus.color} flex items-center gap-1.5`}>
            <span>{currentStatus.icon}</span>
            <span>{currentStatus.label}</span>
          </div>
        </div>
      </div>

      {/* Body - Thông tin VĐV */}
      <div className="p-5">
        <div className="grid grid-cols-2 gap-6 mb-5">
          {/* Giáp Đỏ */}
          <div className={`bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border-2 shadow-sm transition-all duration-300 ${
            status === 'FIN' && winner === 'RED'
              ? 'border-red-500 ring-4 ring-red-200 scale-105'
              : 'border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-3 h-3 bg-red-600 rounded-full ${status === 'FIN' && winner === 'RED' ? 'animate-pulse' : ''}`}></div>
              <h3 className="text-sm font-bold text-red-700 uppercase tracking-wide">Giáp Đỏ</h3>
              {status === 'FIN' && winner === 'RED' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 ml-auto" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              )}
            </div>
            <div className="space-y-2">
              <div className={`font-bold text-lg leading-tight ${
                status === 'FIN' && winner === 'RED' ? 'text-red-700 text-xl' : 'text-red-900'
              }`}>
                {row.data[3] || '-'}
              </div>
              <div className="text-sm text-red-700 font-medium">
                {row.data[4] || '-'}
              </div>
              {row.data[5] && (
                <div className="text-xs text-red-600 bg-red-200 rounded px-2 py-1 inline-block">
                  {row.data[5]}
                </div>
              )}
            </div>
          </div>

          {/* Giáp Xanh */}
          <div className={`bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 shadow-sm transition-all duration-300 ${
            status === 'FIN' && winner === 'BLUE'
              ? 'border-blue-500 ring-4 ring-blue-200 scale-105'
              : 'border-blue-200'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-3 h-3 bg-blue-600 rounded-full ${status === 'FIN' && winner === 'BLUE' ? 'animate-pulse' : ''}`}></div>
              <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wide">Giáp Xanh</h3>
              {status === 'FIN' && winner === 'BLUE' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 ml-auto" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              )}
            </div>
            <div className="space-y-2">
              <div className={`font-bold text-lg leading-tight ${
                status === 'FIN' && winner === 'BLUE' ? 'text-blue-700 text-xl' : 'text-blue-900'
              }`}>
                {row.data[6] || '-'}
              </div>
              <div className="text-sm text-blue-700 font-medium">
                {row.data[7] || '-'}
              </div>
              {row.data[8] && (
                <div className="text-xs text-blue-600 bg-blue-200 rounded px-2 py-1 inline-block">
                  {row.data[8]}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* VĐV thắng */}
        {row.winner_text && (
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-semibold text-yellow-800">Người thắng:</span>
              <span className="text-sm font-bold text-yellow-900">{row.winner_text}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-2 flex-wrap pt-3 border-t border-gray-200">
          {listActions
            .filter((action) => availableActions.includes(action.key))
            .map((action) => (
              <button
                onClick={() => action.callback(row)}
                key={action.key}
                className={`
                  flex items-center gap-1.5
                  px-3 py-2
                  rounded-lg
                  text-xs font-semibold
                  shadow-md hover:shadow-lg
                  transform hover:scale-105
                  transition-all duration-200
                  whitespace-nowrap
                  ${action.color}
                `}
              >
                {action.icon}
                <span>{action.btnText}</span>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

export default function CompetitionDataDetail() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [sheetData, setSheetData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  // State cho modal actions
  const [openActions, setOpenActions] = useState(null);

  // State cho filter và view
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, WAI, IN, FIN, CAN
  const [sortBy, setSortBy] = useState('match_no'); // match_no, status, name
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Scroll to top handler
  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Ref để lưu hàm exportToExcel từ HistoryView
  const exportToExcelRef = React.useRef(null);

  // Load dữ liệu khi component mount
  const configSystem = useAppSelector((state) => state.configSystem);  

  useEffect(() => {
    dispatch(fetchConfigSystem());
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:6789/api/competition-dk/${id}`);
      if (response?.data?.success && response?.data?.data) {
        const data = response.data.data;
        setSheetData(data);

        if (data.data && data.data.length > 0) {
          data.data[0][0] = 'Trận số';

          // Thêm cột "VĐV thắng" vào headers
          const headersWithWinner = [...data.data[0], 'VĐV thắng'];
          console.log('headersWithWinner: ', headersWithWinner);
          setHeaders(headersWithWinner);

          // Lấy danh sách matches từ database
          const matchesResponse = await axios.get(`http://localhost:6789/api/competition-match/by-dk/${id}`);
          const matches = matchesResponse.data.success ? matchesResponse.data.data : [];

          // Map matches với rows
          const rowsData = data.data.slice(1).map((row, index) => {
            const match = matches.find(m => m.row_index === index);

            // Tạo text VĐV thắng (Tên - Đơn vị)
            let winnerText = '';
            if (match?.winner) {
              if (match.winner?.toUpperCase() === 'RED') {
                // Giả sử cột 3 là tên Giáp Đỏ, cột 4 là đơn vị Giáp Đỏ
                winnerText = `${row[3] || ''} - ${row[4] || ''}`;
              } else if (match.winner?.toUpperCase() === 'BLUE') {
                // Giả sử cột 6 là tên Giáp Xanh, cột 7 là đơn vị Giáp Xanh
                winnerText = `${row[6] || ''} - ${row[7] || ''}`;
              }
            }

            return {
              data: row, // Lưu array gốc vào property data
              match_id: match?.id,
              match_status: match?.match_status || 'WAI',
              config_system: match?.config_system || {},
              winner: match?.winner || null,
              winner_text: winnerText
            };
          });

          setRows(rowsData);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Lỗi khi tải dữ liệu: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Tìm kiếm
  const handleSearch = (text) => {
    console.log('Tìm kiếm:', text);
    fetchData()
    // TODO: Implement search logic
  };

  // List actions - Tương tự MatchAthlete
  const listActions = [
    {
      key: Constants.ACTION_MATCH_START,
      btnText: 'Vào trận',
      color: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
      ),
      description: 'Vào trận',
      callback: (row) => {
        setOpenActions({ isOpen: true, key: Constants.ACTION_MATCH_START, row: row });
      },
    },
    {
      key: Constants.ACTION_MATCH_RESULT,
      btnText: 'Kết quả',
      color: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ),
      description: 'Kết quả',
      callback: (row) => {
        setOpenActions({ isOpen: true, key: Constants.ACTION_MATCH_RESULT, row: row });
      },
    },
    {
      key: Constants.ACTION_MATCH_CONFIG,
      btnText: 'Cấu hình',
      color: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      ),
      description: 'Cấu hình hệ thống',
      callback: (row) => {
        setOpenActions({ isOpen: true, key: Constants.ACTION_MATCH_CONFIG, row: row });
      },
    },
    {
      key: Constants.ACTION_MATCH_HISTORY,
      btnText: 'Lịch sử',
      color: 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      ),
      description: 'Lịch sử thi đấu',
      callback: (row) => {
        setOpenActions({ isOpen: true, key: Constants.ACTION_MATCH_HISTORY, row: row });
      },
    },
    {
      key: Constants.ACTION_UPDATE,
      btnText: 'Cập nhật',
      color: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      ),
      description: 'Cập nhật dữ liệu',
      callback: (row) => {
        setOpenActions({ isOpen: true, key: Constants.ACTION_UPDATE, row: row });
      },
    },
    {
      key: Constants.ACTION_DELETE,
      btnText: 'Xóa',
      color: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
      description: 'Xác nhận xóa',
      callback: (row) => {
        setOpenActions({ isOpen: true, key: Constants.ACTION_DELETE, row: row });
      },
    },
  ];

  // Lấy actions theo status - Tương tự MatchAthlete
  const getActionsByStatus = (status) => {
    switch (status) {
      case "FIN": // Kết thúc
        return [Constants.ACTION_MATCH_RESULT, Constants.ACTION_MATCH_HISTORY];
      case "IN": // Đang diễn ra
        return [Constants.ACTION_MATCH_START, Constants.ACTION_MATCH_RESULT, Constants.ACTION_MATCH_HISTORY];
      case "WAI": // Chờ
        return [Constants.ACTION_MATCH_START, Constants.ACTION_MATCH_RESULT, Constants.ACTION_UPDATE, Constants.ACTION_DELETE];
      default:
        return [Constants.ACTION_UPDATE, Constants.ACTION_DELETE];
    }
  };

  // Tạo columns động từ headers
  const columns = [
    // {
    //   title: 'STT',
    //   key: 'order',
    //   align: 'center',
    // },
    ...headers?.map((header, index) => {
      // Xác định style cho các cột
      let cellClassName = '';
      let customRender = null;

      // Cột 3 là Tên Giáp Đỏ - Nhập với cột 4 (Đơn vị) - Chữ đỏ bold
      if (index === 3) {
        cellClassName = 'font-bold whitespace-pre-line min-w-[200px]';
        customRender = (row) => {
          const name = row.data[3] || '';
          const unit = row.data[4] || '';
          return (
            <div className="font-bold text-red-600 whitespace-pre-line min-w-[200px]">
              {name}
              {unit && `\n${unit}`}
            </div>
          );
        };
        return {
          title: 'GIÁP ĐỎ', // Header mới
          key: `col_${index}`,
          className: cellClassName,
          render: customRender,
        };
      }
      // Cột 4 (Đơn vị Đỏ) - Ẩn vì đã nhập vào cột 3
      else if (index === 4 || index === 5) {
        return null; // Sẽ bị filter ra
      }
      // Cột 5 là Quốc kỳ Đỏ - Chữ đỏ bold
      // else if (index === 5) {
      //   cellClassName = 'font-bold text-red-600';
      //   customRender = (row) => (
      //     <span className="font-bold text-red-600">{row.data[index] || '-'}</span>
      //   );
      // }
      // Cột 6 là Tên Giáp Xanh - Nhập với cột 7 (Đơn vị) - Chữ xanh bold
      else if (index === 6) {
        cellClassName = 'font-bold text-blue-600 whitespace-pre-line min-w-[200px]';
        customRender = (row) => {
          const name = row.data[6] || '';
          const unit = row.data[7] || '';
          return (
            <div className="font-bold text-blue-600 whitespace-pre-line min-w-[200px]">
              {name}
              {unit && `\n${unit}`}
            </div>
          );
        };
        return {
          title: 'GIÁP XANH', // Header mới
          key: `col_${index}`,
          className: cellClassName,
          render: customRender,
        };
      }
      // Cột 7 (Đơn vị Xanh) - Ẩn vì đã nhập vào cột 6
      else if (index === 7 || index === 8 || index === 9) {
        return null; // Sẽ bị filter ra
      }
      // Cột 8 là Quốc kỳ Xanh - Chữ xanh bold
      // else if (index === 8) {
      //   cellClassName = 'font-bold text-blue-600';
      //   customRender = (row) => (
      //     <span className="font-bold text-blue-600">{row.data[index] || '-'}</span>
      //   );
      // }
      // Cột cuối cùng là VĐV thắng - Chữ vàng bold (không nền)
      else if (index === headers.length - 1) {
        cellClassName = '';
        customRender = (row) => (
          <span className="font-bold text-yellow-600">{row.data[index] || '-'}</span>
        );
      }

      return {
        title: header || `Cột ${index + 1}`,
        key: `col_${index}`,
        className: cellClassName,
        render: customRender || ((row) => row.data[index] || '-'),
      };
    }).filter(col => col !== null), // Loại bỏ các cột null (đã ẩn)
    {
      title: 'Trạng thái',
      key: 'match_status',
      align: 'center',
      render: (row) => {
        const status = row.match_status || 'WAI';
        const statusLabel = {
          'WAI': 'Chờ',
          'IN': 'Đang diễn ra',
          'FIN': 'Kết thúc',
          'CAN': 'Hủy'
        }[status] || 'Chờ';

        const statusColor = {
          'WAI': 'bg-gray-200 text-gray-800',
          'IN': 'bg-blue-200 text-blue-800',
          'FIN': 'bg-green-200 text-green-800',
          'CAN': 'bg-red-200 text-red-800'
        }[status] || 'bg-gray-200 text-gray-800';

        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor}`}>
            {statusLabel}
          </span>
        );
      },
    },
    {
      title: 'Hành động',
      align: 'center',
      key: 'action',
      width: 'auto',
      render: (row) => {
        const availableActions = getActionsByStatus(row.match_status || 'WAI');
        return (
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {listActions
              .filter((action) => availableActions.includes(action.key))
              .map((action) => (
                <button
                  onClick={() => action.callback(row)}
                  key={action.key}
                  className={`
                    flex items-center gap-1.5
                    px-3 py-1.5
                    rounded-lg
                    text-xs font-semibold
                    shadow-md hover:shadow-lg
                    transform hover:scale-105
                    transition-all duration-200
                    whitespace-nowrap
                    ${action.color}
                  `}
                >
                  {action.icon}
                  <span>{action.btnText}</span>
                </button>
              ))}
          </div>
        );
      },
    },
  ];

  // Chuyển đổi rows thành data cho CustomTable với match_status
  const tableData = rows.map((row, index) => {
    // Nếu row là object (đã có match_status)
    if (typeof row === 'object' && !Array.isArray(row)) {
      // Lấy data gốc
      const rowData = Array.isArray(row) ? row : (row.data || row);

      // Thêm cột VĐV thắng vào cuối
      const dataWithWinner = [...rowData, row.winner_text || ''];

      return {
        key: index,
        id: index,
        rowIndex: index,
        data: dataWithWinner,
        match_status: row.match_status || 'WAI',
        match_id: row.match_id || null,
        config_system: row.config_system || {},
        winner: row.winner || null
      };
    }
    // Nếu row là array (chưa có match_status)
    return {
      key: index,
      id: index,
      rowIndex: index,
      data: [...row, ''], // Thêm cột trống cho VĐV thắng
      match_status: 'WAI',
      match_id: null,
      config_system: {},
      winner: null
    };
  });

  // Filter data theo status
  const filteredData = tableData.filter(row => {
    // Filter theo status
    if (filterStatus !== 'ALL' && row.match_status !== filterStatus) {
      return false;
    }

    // Filter theo search
    if (search) {
      const searchLower = search.toLowerCase();
      const matchNo = String(row.data[0] || '').toLowerCase();
      const redName = String(row.data[3] || '').toLowerCase();
      const blueName = String(row.data[6] || '').toLowerCase();
      const redUnit = String(row.data[4] || '').toLowerCase();
      const blueUnit = String(row.data[7] || '').toLowerCase();

      return matchNo.includes(searchLower) ||
             redName.includes(searchLower) ||
             blueName.includes(searchLower) ||
             redUnit.includes(searchLower) ||
             blueUnit.includes(searchLower);
    }

    return true;
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    switch (sortBy) {
      case 'match_no':
        return Number(a.data[0]) - Number(b.data[0]);
      case 'status':
        const statusOrder = { 'IN': 0, 'WAI': 1, 'FIN': 2, 'CAN': 3 };
        return (statusOrder[a.match_status] || 99) - (statusOrder[b.match_status] || 99);
      case 'red_name':
        return String(a.data[3] || '').localeCompare(String(b.data[3] || ''));
      case 'blue_name':
        return String(a.data[6] || '').localeCompare(String(b.data[6] || ''));
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  // Reset page khi filter thay đổi
  React.useEffect(() => {
    setPage(1);
  }, [filterStatus, search, sortBy]);

  // Xử lý thêm mới
  const handleInsert = async (formData) => {
    try {
      // Loại bỏ cột VĐV thắng khỏi headers khi lưu
      const headersWithoutWinner = headers.slice(0, -1);
      const rowData = headersWithoutWinner.map((_, index) => formData[`col_${index}`] || '');

      const newRowObject = {
        data: rowData,
        match_id: null,
        match_status: formData.match_status || 'WAI',
        config_system: {},
        winner: null,
        winner_text: ''
      };

      const newRows = [...rows, newRowObject];
      const newData = [headersWithoutWinner, ...newRows.map(r => r.data)];

      await saveDataToServer(newData);
      setRows(newRows);
      setOpenActions({ ...openActions, isOpen: false });
      alert('Thêm mới thành công!');
    } catch (error) {
      console.error('Error inserting:', error);
      alert('Lỗi khi thêm mới: ' + (error.response?.data?.message || error.message));
    }
  };

  // Xử lý cập nhật
  const handleUpdate = async (formData) => {
    try {
      const row = openActions.row;
      console.log('row: ', row, formData);

      // 1. Cập nhật dữ liệu Excel (các cột)
      const headersWithoutWinner = headers.slice(0, -1);
      const rowData = headersWithoutWinner.map((_, index) => formData[`col_${index}`] || '');

      // 2. Gọi API cập nhật row riêng lẻ
      await axios.put(`http://localhost:6789/api/competition-dk/${id}/row/${row.rowIndex}`, {
        data: rowData
      });

      // 3. Nếu có match_id, cập nhật match_status vào database
      if (row.match_id) {
        await axios.put(`http://localhost:6789/api/competition-match/${row.match_id}/status`, {
          status: formData.match_status
        });
      }

      // 4. Cập nhật state local
      const newRows = rows.map((r, index) => {
        if (index === row.rowIndex) {
          return {
            ...r,
            data: rowData,
            match_status: formData.match_status || r.match_status
          };
        }
        return r;
      });

      // 5. Cập nhật state và đóng modal
      setRows(newRows);
      setOpenActions({ ...openActions, isOpen: false });

      // 4. Reload data để đồng bộ
      await fetchData();

      alert('Cập nhật thành công!');
    } catch (error) {
      console.error('Error updating:', error);
      alert('Lỗi khi cập nhật: ' + (error.response?.data?.message || error.message));
    }
  };

  // Xử lý xóa
  const handleDelete = async () => {
    try {
      const newRows = rows.filter((_, index) => index !== openActions.row.rowIndex);

      // Cập nhật lại ID cho các row sau khi xóa
      const updatedRows = newRows.map((row, index) => ({
        ...row,
        data: row.data.map((cell, cellIndex) => {
          // Cột đầu tiên là ID, cập nhật lại theo index mới
          if (cellIndex === 0) {
            return index + 1;
          }
          return cell;
        })
      }));

      // Loại bỏ cột VĐV thắng khỏi headers khi lưu
      const headersWithoutWinner = headers.slice(0, -1);
      const newData = [headersWithoutWinner, ...updatedRows.map(r => r.data)];

      await saveDataToServer(newData);
      setRows(updatedRows);
      setOpenActions({ ...openActions, isOpen: false });
      alert('Xóa thành công!');
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Lỗi khi xóa: ' + (error.response?.data?.message || error.message));
    }
  };

  // Gọi API để lưu dữ liệu
  const saveDataToServer = async (newData) => {
    await axios.put(`http://localhost:6789/api/competition-dk/${id}`, {
      sheet_name: sheetData.sheet_name,
      file_name: sheetData.file_name,
      data: newData
    });
  };

  // Xử lý vào trận
  const handleMatchStart = async () => {
    try {
      const row = openActions.row;
      console.log('🚀 CompetitionDataDetail - handleMatchStart - row:', row)
      console.log('🚀 CompetitionDataDetail - handleMatchStart - configSystem:', configSystem);

      // Nếu chưa có match_id, tạo match mới
      if (!row.match_id) {
        const createResponse = await axios.post('http://localhost:6789/api/competition-match', {
          competition_dk_id: id,
          match_no: row.data[0],
          row_index: row.rowIndex,
          red_name: row.data[3] || '',
          blue_name: row.data[6] || '',
          config_system: configSystem.data || {}
        });

        row.match_id = createResponse.data.data.id;
      }

      // Cập nhật status thành 'IN'
      await axios.put(`http://localhost:6789/api/competition-match/${row.match_id}/status`, {
        status: 'IN'
      });

      // Đóng modal
      setOpenActions({ ...openActions, isOpen: false });

      // Chuẩn bị dữ liệu trận đấu

      const matchData = {
        match_id: row.match_id,
        match_no: row.data[0] || '',
        match_weight: row.data[1] || '',
        match_type: row.data[2] || '',
        match_level: row.data[9] || '',
        red: {
          name: row.data[3] || '',
          unit: row.data[4] || '',
          country: row.data[5] || ''
        },
        blue: {
          name: row.data[6] || '',
          unit: row.data[7] || '',
          country: row.data[8] || ''
        },
        match_status: 'IN',
        ten_giai_dau: configSystem.data.ten_giai_dau || '',
        ten_mon_thi: configSystem.data.bo_mon || '',
        config_system: configSystem.data || {},
        competition_dk_id: id, // Thêm competition_dk_id để dùng cho handleNextMatch
        row_index: row.match_id, // Thêm row_index để tìm trận tiếp theo
      };

      console.log('🚀 CompetitionDataDetail - Navigating with matchData:', matchData);
      console.log('🚀 CompetitionDataDetail - row.data:', row.data);
      
      // Chuyển sang màn hình thi đấu với state
      navigate('/scoreboard/vovinam', {
        state: {
          matchData,
          returnUrl: `/management/competition-data/${id}`
        }
      });

    } catch (error) {
      console.error('Error starting match:', error);
      alert('Lỗi khi bắt đầu trận: ' + (error.response?.data?.message || error.message));
    }
  };

  // Xử lý kết quả
  const handleResult = async (formData) => {
    try {
      const row = openActions.row;

      // 1. Lưu kết quả vào history
      const historyData = {
        red_score: formData.red_score,
        blue_score: formData.blue_score,
        notes: formData.notes,
        status: 'FIN'
      };
      // Nếu có match_id, thêm vào history
      if (row.match_id) {
        await axios.post(`http://localhost:6789/api/competition-match/${row.match_id}/history`, historyData);
      }

      // 2. Cập nhật winner và status thành FIN
      if (row.match_id) {
        await axios.put(`http://localhost:6789/api/competition-match/${row.match_id}/winner`, {
          winner: formData.winner
        });
      }

      // 3. Tự động cập nhật VĐV thắng vào các trận tiếp theo
      const updateCount = await updateWinnerToNextMatches(row, formData.winner);

      // 4. Đóng modal
      setOpenActions({ ...openActions, isOpen: false });

      // 5. Reload data để hiển thị cập nhật
      await fetchData();

      // 6. Thông báo thành công
      if (updateCount > 0) {
        alert(`Lưu kết quả thành công! Đã tự động cập nhật ${updateCount} trận tiếp theo.`);
      } else {
        alert('Lưu kết quả thành công!');
      }
    } catch (error) {
      console.error('Error saving result:', error);
      alert('Lỗi khi lưu kết quả: ' + (error.response?.data?.message || error.message));
    }
  };

  // Hàm tự động cập nhật VĐV thắng vào các trận tiếp theo
  const updateWinnerToNextMatches = async (currentRow, winner) => {
    try {
      // Lấy số trận hiện tại (ví dụ: "1", "2", "3"...)
      const currentMatchNumber = currentRow.data[0]; // Cột đầu tiên là "Trận số"
      console.log('🔍 Tìm kiếm pattern win.' + currentMatchNumber + ' trong danh sách...');

      // Xác định tên VĐV thắng
      let winnerName = '';
      let winnerUnit = '';
      if (winner?.toUpperCase() === 'RED') {
        winnerName = currentRow.data[3] || ''; // Tên Giáp Đỏ
        winnerUnit = currentRow.data[4] || ''; // Đơn vị Giáp Đỏ
      } else if (winner?.toUpperCase() === 'BLUE') {
        winnerName = currentRow.data[6] || ''; // Tên Giáp Xanh
        winnerUnit = currentRow.data[7] || ''; // Đơn vị Giáp Xanh
      }

      console.log('🏆 VĐV thắng:', { name: winnerName, unit: winnerUnit });

      // Nếu không có VĐV thắng, không cần cập nhật
      if (!winnerName) {
        console.log('⚠️ Không có thông tin VĐV thắng, bỏ qua cập nhật.');
        return 0;
      }

      // Pattern để tìm: "win.1", "win.2", etc.
      const winPattern = `win.${currentMatchNumber}`;
      const updateRequests = [];
      let updateCount = 0;

      // Duyệt qua tất cả các hàng để tìm pattern
      for (let i = 0; i < rows.length; i++) {
        const rowData = rows[i].data;
        let needUpdate = false;
        let updatedRow = [...rowData];

        // Kiểm tra từng cell trong row
        for (let j = 0; j < rowData.length; j++) {
          const cellValue = String(rowData[j] || '').toLowerCase().trim();

          if (cellValue === winPattern.toLowerCase()) {
            // Tìm thấy pattern, cập nhật tên VĐV thắng
            console.log(`✅ Tìm thấy "${winPattern}" tại trận ${updatedRow[0]}, cột ${j}`);

            updatedRow[j] = winnerName;
            needUpdate = true;

            // Nếu cột tiếp theo là đơn vị, cập nhật luôn
            if (j + 1 < rowData.length) {
              updatedRow[j + 1] = winnerUnit;
            }

            updateCount++;
          }
        }

        // Nếu có cập nhật, gọi API để lưu
        if (needUpdate) {
          console.log(`📝 Cập nhật backend - Trận ${updatedRow[0]}: ${winnerName} (${winnerUnit})`);

          updateRequests.push(
            axios.put(`http://localhost:6789/api/competition-dk/${id}/row/${i}`, { data: updatedRow })
              .then(() => {
                console.log(`✅ Đã cập nhật backend - Trận ${updatedRow[0]}`);
              })
              .catch(err => {
                console.error(`❌ Lỗi cập nhật backend - Trận ${updatedRow[0]}:`, err);
                throw err;
              })
          );
        }
      }

      // Chờ tất cả requests hoàn thành
      if (updateRequests.length > 0) {
        console.log(`⏳ Đang cập nhật ${updateRequests.length} trận vào backend...`);
        await Promise.all(updateRequests);
        console.log(`✅ Đã cập nhật thành công ${updateRequests.length} trận vào backend!`);
      } else {
        console.log('ℹ️ Không tìm thấy trận nào cần cập nhật.');
      }

      return updateCount;
    } catch (error) {
      console.error('❌ Error updating winner to next matches:', error);
      throw error; // Throw để handleResult có thể catch
    }
  };

  // Xử lý cấu hình
  const handleConfig = async (configData) => {
    try {
      const row = openActions.row;

      if (row.match_id) {
        await axios.put(`http://localhost:6789/api/competition-match/${row.match_id}/config`, {
          config_system: configData
        });

        alert('Lưu cấu hình thành công!');
        setOpenActions({ ...openActions, isOpen: false });
        fetchData(); // Reload data
      } else {
        alert('Chưa có match_id. Vui lòng tạo match trước!');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Lỗi khi lưu cấu hình: ' + (error.response?.data?.message || error.message));
    }
  };

  // Render nội dung modal
  const renderContentModal = (openActions) => {
    switch (openActions?.key) {
      case Constants.ACTION_MATCH_START:
        return <ActionConfirm message={`Bắt đầu trận ${openActions.row?.data[0]}?`} onConfirm={handleMatchStart} onCancel={() => setOpenActions({ ...openActions, isOpen: false })} />;
      case Constants.ACTION_MATCH_RESULT:
        return <ResultForm row={openActions.row} onSubmit={handleResult} onCancel={() => setOpenActions({ ...openActions, isOpen: false })} />;
      case Constants.ACTION_MATCH_CONFIG:
        return <ConfigForm row={openActions.row} onSubmit={handleConfig} onCancel={() => setOpenActions({ ...openActions, isOpen: false })} />;
      case Constants.ACTION_MATCH_HISTORY:
        return <HistoryView row={openActions.row} onClose={() => setOpenActions({ ...openActions, isOpen: false })} exportToExcelRef={exportToExcelRef} />;
      case Constants.ACTION_UPDATE:
        return <DataForm headers={headers} data={openActions.row?.data} row={openActions.row} onSubmit={handleUpdate} onCancel={() => setOpenActions({ ...openActions, isOpen: false })} />;
      case Constants.ACTION_DELETE:
        return <DeleteConfirm onConfirm={handleDelete} onCancel={() => setOpenActions({ ...openActions, isOpen: false })} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white  shadow">
        <div className="text-center py-8">
          <div className="inline-block animate-spin  h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!sheetData) {
    return (
      <div className="p-6 bg-white  shadow">
        <div className="text-center py-12 bg-gray-50 ">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600">Không tìm thấy dữ liệu</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white  shadow">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/management/general-setting/competition-management')}
          className="mb-4 flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại
        </button>

        <h2 className="text-2xl font-bold mb-4">{sheetData.sheet_name}</h2>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">
            File: {sheetData.file_name || "-"} | Tổng số dòng: {rows.length}
          </span>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-700" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-semibold text-yellow-700 uppercase">Chờ</span>
            </div>
            <div className="text-2xl font-bold text-yellow-900">
              {tableData.filter(r => r.match_status === 'WAI').length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-semibold text-blue-700 uppercase">Đang đấu</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {tableData.filter(r => r.match_status === 'IN').length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-700" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-semibold text-green-700 uppercase">Kết thúc</span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {tableData.filter(r => r.match_status === 'FIN').length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-700" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-semibold text-red-700 uppercase">Hủy</span>
            </div>
            <div className="text-2xl font-bold text-red-900">
              {tableData.filter(r => r.match_status === 'CAN').length}
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar - Filter, Sort, View Mode */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-6 shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Left: Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full lg:w-auto">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <SearchInput
                value={search}
                onChange={setSearch}
                onSearch={handleSearch}
                placeholder="Tìm kiếm trận, VĐV, đơn vị..."
              />
            </div>

            {/* Filter Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border min-w-[150px] border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="WAI">Chờ thi đấu</option>
              <option value="IN">Đang diễn ra</option>
              <option value="FIN">Kết thúc</option>
              <option value="CAN">Hủy bỏ</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border min-w-[150px] border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="match_no">Sắp xếp: Trận số</option>
              <option value="status">Sắp xếp: Trạng thái</option>
              {/* <option value="red_name">Sắp xếp: Giáp Đỏ</option>
              <option value="blue_name">Sắp xếp: Giáp Xanh</option> */}
            </select>
          </div>

          {/* Right: View Mode & Stats */}
          <div className="flex items-center gap-3">
            {/* Stats */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-semibold text-blue-700">
                {filteredData.length} / {tableData.length}
              </span>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-300 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Grid View"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="List View"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Cards */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="mt-4 text-lg font-medium text-gray-600">Không tìm thấy trận đấu nào</p>
            <p className="mt-1 text-sm text-gray-500">Thử thay đổi bộ lọc hoặc tìm kiếm</p>
          </div>
        ) : (
          <>
            {/* Cards Grid/List */}
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'
                : 'space-y-3'
            }>
              {paginatedData.map((row) => (
                <MatchCard
                  key={row.key}
                  row={row}
                  listActions={listActions}
                  getActionsByStatus={getActionsByStatus}
                  onDoubleClick={(row) => {
                    setOpenActions({ isOpen: true, key: Constants.ACTION_UPDATE, row: row });
                  }}
                  viewMode={viewMode}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200">
                {/* Page Info */}
                <div className="text-sm text-gray-600">
                  Hiển thị <span className="font-semibold text-gray-900">{startIndex + 1}</span> - <span className="font-semibold text-gray-900">{Math.min(endIndex, filteredData.length)}</span> trong tổng số <span className="font-semibold text-gray-900">{filteredData.length}</span> trận
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                      page === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                      // Hiển thị: 1 ... current-1 current current+1 ... last
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= page - 1 && pageNum <= page + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                              page === pageNum
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (pageNum === page - 2 || pageNum === page + 2) {
                        return <span key={pageNum} className="px-2 text-gray-400">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                      page === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                {/* Items per page */}
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="px-3 py-2 border min-w-[150px] border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value={6}>6 / trang</option>
                  <option value={12}>12 / trang</option>
                  <option value={24}>24 / trang</option>
                  <option value={48}>48 / trang</option>
                </select>
              </div>
            )}
          </>
        )}
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-full shadow-2xl hover:shadow-xl hover:scale-110 transition-all duration-300 z-40 group"
          title="Lên đầu trang"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:animate-bounce" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}

      {/* Modal Config - Custom style giống Vovinam */}
      {openActions?.isOpen && openActions?.key === Constants.ACTION_MATCH_CONFIG && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-2xl shadow-2xl w-[800px] h-[600px] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-2 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  />
                </svg>
                CẤU HÌNH TRẬN ĐẤU
              </h2>
              <button
                onClick={() => setOpenActions({ ...openActions, isOpen: false })}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            {renderContentModal(openActions)}
          </div>
        </div>
      )}

      {/* Modal Kết quả - Custom style giống Vovinam */}
      {openActions?.isOpen && openActions?.key === Constants.ACTION_MATCH_RESULT && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-2xl shadow-2xl w-[900px] max-h-[95vh] overflow-hidden flex flex-col">
            {/* Header - Căn giữa */}
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-4 flex justify-center items-center relative flex-shrink-0">
              <h2 className="text-2xl font-bold text-white">
                KẾT QUẢ TRẬN ĐẤU
              </h2>
              <button
                onClick={() => setOpenActions({ ...openActions, isOpen: false })}
                className="text-white hover:text-gray-300 transition-colors absolute right-6"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {renderContentModal(openActions)}
            </div>

            {/* Footer - Cố định */}
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center gap-3 border-t border-gray-200 flex-shrink-0">
              <button
                onClick={() => {
                  if (exportToExcelRef.current) {
                    exportToExcelRef.current();
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Xuất Excel
              </button>
              <button
                onClick={() => setOpenActions({ ...openActions, isOpen: false })}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Lịch sử - Custom style giống Vovinam */}
      {openActions?.isOpen && openActions?.key === Constants.ACTION_MATCH_HISTORY && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-2xl shadow-2xl w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header - Căn giữa */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex justify-center items-center relative flex-shrink-0">
              <h2 className="text-2xl font-bold text-white">
                LỊCH SỬ TRẬN ĐẤU
              </h2>
              <button
                onClick={() => setOpenActions({ ...openActions, isOpen: false })}
                className="text-white hover:text-gray-300 transition-colors absolute right-6"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {renderContentModal(openActions)}
            </div>

            {/* Footer - Cố định */}
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center gap-3 border-t border-gray-200 flex-shrink-0">
              <button
                onClick={() => {
                  if (exportToExcelRef.current) {
                    exportToExcelRef.current();
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Xuất Excel
              </button>
              <button
                onClick={() => setOpenActions({ ...openActions, isOpen: false })}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cập nhật - Custom style */}
      {openActions?.isOpen && openActions?.key === Constants.ACTION_UPDATE && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-2xl shadow-2xl w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header - Căn giữa */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex justify-center items-center relative flex-shrink-0">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                CẬP NHẬT TRẬN ĐẤU
              </h2>
              <button
                onClick={() => setOpenActions({ ...openActions, isOpen: false })}
                className="text-white hover:text-gray-300 transition-colors absolute right-6"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {renderContentModal(openActions)}
            </div>
          </div>
        </div>
      )}

      {/* Modal khác - Sử dụng Modal component cũ */}
      {openActions?.isOpen &&
       openActions?.key !== Constants.ACTION_MATCH_CONFIG &&
       openActions?.key !== Constants.ACTION_MATCH_RESULT &&
       openActions?.key !== Constants.ACTION_MATCH_HISTORY &&
       openActions?.key !== Constants.ACTION_UPDATE && (
        <Modal
          isOpen={true}
          onClose={() => setOpenActions({ ...openActions, isOpen: false })}
          title={listActions.find((e) => e.key === openActions?.key)?.description}
          headerClass={listActions.find((e) => e.key === openActions?.key)?.color}
        >
          {renderContentModal(openActions)}
        </Modal>
      )}
    </div>
  );
}

// Component Form để thêm/sửa dữ liệu
function DataForm({ headers, data = null, row = null, onSubmit, onCancel }) {
  // Loại bỏ cột VĐV thắng (cột cuối cùng) khỏi form
  const editableHeaders = headers.slice(0, -1);

  const [formData, setFormData] = React.useState(() => {
    const initialData = {};
    editableHeaders.forEach((_, index) => {
      initialData[`col_${index}`] = data ? (data[index] || '') : '';
    });
    initialData.match_status = row?.match_status || 'WAI';
    return initialData;
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    const requiredFields = ['col_0', 'col_1', 'col_2', 'col_3', 'col_6']; // STT, Nội dung, Hạng cân, VĐV đỏ, VĐV xanh
    const missingFields = requiredFields.filter(field => {
      const value = formData[field];
      return !value || (typeof value === 'string' && value.trim() === '');
    });

    if (missingFields.length > 0) {
      alert('Vui lòng điền đầy đủ các trường bắt buộc!');
      return;
    }

    onSubmit(formData);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'WAI': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'IN': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'FIN': return 'bg-green-100 text-green-800 border-green-300';
      case 'CAN': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Trường trạng thái - Nổi bật */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          Trạng thái trận đấu
        </label>
        <select
          value={formData.match_status}
          onChange={(e) => setFormData({ ...formData, match_status: e.target.value })}
          className={`w-full px-4 py-3 border-2 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${getStatusColor(formData.match_status)}`}
        >
          <option value="WAI">Chờ thi đấu</option>
          <option value="IN">Đang diễn ra</option>
          <option value="FIN">Kết thúc</option>
          <option value="CAN">Hủy bỏ</option>
        </select>
      </div>

      {/* Thông tin chung */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
          Thông tin chung
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* STT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {editableHeaders[0] || 'STT'}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={formData.col_0 || ''}
              onChange={(e) => setFormData({ ...formData, col_0: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              placeholder="Nhập STT (bắt buộc)"
              required
            />
          </div>

          {/* Nội dung */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {editableHeaders[1] || 'Nội dung'}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={formData.col_1 || ''}
              onChange={(e) => setFormData({ ...formData, col_1: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              placeholder="Nhập nội dung (bắt buộc)"
              required
            />
          </div>

          {/* Hạng cân */}
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {editableHeaders[2] || 'Hạng cân'}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={formData.col_2 || ''}
              onChange={(e) => setFormData({ ...formData, col_2: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              placeholder="Nhập hạng cân (bắt buộc)"
              required
            />
          </div>
        </div>
      </div>

      {/* Thông tin VĐV - 2 cột đỏ/xanh */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cột ĐỎ */}
        <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
          <h3 className="text-lg font-bold text-red-700 flex items-center gap-2 pb-3 mb-4 border-b-2 border-red-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            VĐV ĐỎ
          </h3>

          <div className="space-y-4">
            {/* Tên VĐV đỏ */}
            <div>
              <label className="block text-sm font-semibold text-red-800 mb-2">
                {editableHeaders[3] || 'Tên VĐV'}
                <span className="text-red-600 ml-1">*</span>
              </label>
              <input
                type="text"
                value={formData.col_3 || ''}
                onChange={(e) => setFormData({ ...formData, col_3: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                placeholder="Nhập tên VĐV đỏ"
                required
              />
            </div>

            {/* Đơn vị đỏ */}
            <div>
              <label className="block text-sm font-semibold text-red-800 mb-2">
                {editableHeaders[4] || 'Đơn vị'}
              </label>
              <input
                type="text"
                value={formData.col_4 || ''}
                onChange={(e) => setFormData({ ...formData, col_4: e.target.value })}
                className="w-full px-4 py-2.5 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-red-50"
                placeholder="Nhập đơn vị"
              />
            </div>

            {/* Năm sinh đỏ */}
            <div>
              <label className="block text-sm font-semibold text-red-800 mb-2">
                {editableHeaders[5] || 'Năm sinh'}
              </label>
              <input
                type="text"
                value={formData.col_5 || ''}
                onChange={(e) => setFormData({ ...formData, col_5: e.target.value })}
                className="w-full px-4 py-2.5 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-red-50"
                placeholder="Nhập năm sinh"
              />
            </div>
          </div>
        </div>

        {/* Cột XANH */}
        <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
          <h3 className="text-lg font-bold text-blue-700 flex items-center gap-2 pb-3 mb-4 border-b-2 border-blue-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            VĐV XANH
          </h3>

          <div className="space-y-4">
            {/* Tên VĐV xanh */}
            <div>
              <label className="block text-sm font-semibold text-blue-800 mb-2">
                {editableHeaders[6] || 'Tên VĐV'}
                <span className="text-blue-600 ml-1">*</span>
              </label>
              <input
                type="text"
                value={formData.col_6 || ''}
                onChange={(e) => setFormData({ ...formData, col_6: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                placeholder="Nhập tên VĐV xanh"
                required
              />
            </div>

            {/* Đơn vị xanh */}
            <div>
              <label className="block text-sm font-semibold text-blue-800 mb-2">
                {editableHeaders[7] || 'Đơn vị'}
              </label>
              <input
                type="text"
                value={formData.col_7 || ''}
                onChange={(e) => setFormData({ ...formData, col_7: e.target.value })}
                className="w-full px-4 py-2.5 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
                placeholder="Nhập đơn vị"
              />
            </div>

            {/* Năm sinh xanh */}
            <div>
              <label className="block text-sm font-semibold text-blue-800 mb-2">
                {editableHeaders[8] || 'Năm sinh'}
              </label>
              <input
                type="text"
                value={formData.col_8 || ''}
                onChange={(e) => setFormData({ ...formData, col_8: e.target.value })}
                className="w-full px-4 py-2.5 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
                placeholder="Nhập năm sinh"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
        >
          Hủy
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          {data ? 'Cập nhật' : 'Thêm mới'}
        </button>
      </div>
    </form>
  );
}

// Component xác nhận xóa
function DeleteConfirm({ onConfirm, onCancel }) {
  return (
    <div className="space-y-4">
      <p className="text-lg">Bạn có chắc chắn muốn xóa dòng này?</p>
      <p className="text-sm text-gray-600">Hành động này không thể hoàn tác.</p>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button variant="none" className="bg-red-600 text-white hover:bg-red-700" onClick={onConfirm}>
          Xóa
        </Button>
      </div>
    </div>
  );
}

// Component xác nhận action
function ActionConfirm({ message, onConfirm, onCancel }) {
  return (
    <div className="space-y-4">
      <p className="text-lg font-semibold text-center">{message}</p>

      <div className="flex justify-center gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          Đồng ý
        </Button>
      </div>
    </div>
  );
}

// Component form kết quả
function ResultForm({ row, onSubmit, onCancel }) {
  // Lấy thông tin từ row
  const redName = row?.data[3] || '-';
  const redUnit = row?.data[4] || '';
  const blueName = row?.data[6] || '-';
  const blueUnit = row?.data[7] || '';
  const existingWinner = row?.data[row?.data?.length - 1] || ''; // Cột cuối là VĐV thắng

  // Xác định winner từ dữ liệu có sẵn
  const getInitialWinner = () => {
    if (!existingWinner || existingWinner === '-') return '';
    // So sánh tên để xác định winner
    if (existingWinner.includes(redName)) return 'red';
    if (existingWinner.includes(blueName)) return 'blue';
    return '';
  };
  // thông tin khởi tạo 
  const initialData = {
    winner: getInitialWinner(),
    red_score: 0,
    blue_score: 0,
    notes: ''
  };

  const [formData, setFormData] = React.useState(initialData);

  const [isEditing, setIsEditing] = React.useState(!existingWinner || existingWinner === '-');
  const [ isUpdated, setIsUpdated] = useState(false)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.winner && !isUpdated) {
      alert('Vui lòng chọn người thắng!');
      return;
    }
    if(!isUpdated){
      onSubmit(formData);
      setIsUpdated(false);
    }

  };

  const handleSelectWinner = (winner) => {
    setIsUpdated(false);
    setFormData({ ...formData, winner });
  };

  const handleUpdate = ()=>{
    setIsUpdated(true)
    setIsEditing(true);
    setFormData({
      winner: '',
      red_score: 0,
      blue_score: 0,
      notes: '' 
    });
  }
  const handleCancel = () => {
    setIsEditing(false);
    setIsUpdated(false);
    setFormData(initialData);
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Content - Scrollable */}
      <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
        <div className="space-y-6">
          {/* Hiển thị VĐV thắng phía trên */}
          {existingWinner && existingWinner !== '-' && (
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6  text-center shadow-lg">
              <div className="text-white text-sm font-semibold mb-2 uppercase tracking-wide">🏆 VĐV THẮNG CUỘC</div>
              <div className="text-white text-3xl font-bold">{existingWinner}</div>
            </div>
          )}

          {/* Hiển thị thông tin VĐV xanh/đỏ - Luôn hiển thị, disable khi không chỉnh sửa */}
          <div className="bg-white p-6  shadow-md border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
              Thông tin VĐV và chọn người thắng
            </h3>

            <div className="grid grid-cols-2 gap-6">
              {/* Giáp Đỏ */}
              <div className={`bg-gradient-to-br from-red-50 to-red-100 border-4 p-6  transition-all ${
                formData.winner === 'red'
                  ? 'border-red-500 shadow-xl shadow-red-200 scale-105'
                  : 'border-red-200 hover:border-red-300 hover:shadow-lg'
              } ${!isEditing ? 'opacity-75' : ''}`}>
                <div className="text-center mb-6">
                  <div className="inline-block bg-red-600 text-white px-4 py-1  text-xs font-bold mb-3 uppercase tracking-wide">
                    Giáp Đỏ
                  </div>
                  <div className="text-2xl font-bold text-red-700 mb-2">{redName}</div>
                  {redUnit && <div className="text-sm text-red-600 font-medium">{redUnit}</div>}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">Điểm số</label>
                  <input
                    type="number"
                    value={formData.red_score}
                    onChange={(e) => setFormData({ ...formData, red_score: parseInt(e.target.value) || 0 })}
                    disabled={!isEditing}
                    className="w-full px-4 py-4 border-2 border-red-300  text-center text-3xl font-bold focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="0"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectWinner('red')}
                  disabled={!isEditing}
                  className={`w-full py-4  font-bold text-lg transition-all disabled:cursor-not-allowed ${
                    formData.winner === 'red'
                      ? 'bg-red-600 text-white shadow-xl transform scale-105'
                      : 'bg-white text-red-600 border-2 border-red-600 hover:bg-red-50'
                  } ${!isEditing ? 'opacity-50' : ''}`}
                >
                  {formData.winner === 'red' ? '✓ NGƯỜI THẮNG' : 'CHỌN THẮNG'}
                </button>
              </div>

              {/* Giáp Xanh */}
              <div className={`bg-gradient-to-br from-blue-50 to-blue-100 border-4 p-6  transition-all ${
                formData.winner === 'blue'
                  ? 'border-blue-500 shadow-xl shadow-blue-200 scale-105'
                  : 'border-blue-200 hover:border-blue-300 hover:shadow-lg'
              } ${!isEditing ? 'opacity-75' : ''}`}>
                <div className="text-center mb-6">
                  <div className="inline-block bg-blue-600 text-white px-4 py-1  text-xs font-bold mb-3 uppercase tracking-wide">
                    Giáp Xanh
                  </div>
                  <div className="text-2xl font-bold text-blue-700 mb-2">{blueName}</div>
                  {blueUnit && <div className="text-sm text-blue-600 font-medium">{blueUnit}</div>}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">Điểm số</label>
                  <input
                    type="number"
                    value={formData.blue_score}
                    onChange={(e) => setFormData({ ...formData, blue_score: parseInt(e.target.value) || 0 })}
                    disabled={!isEditing}
                    className="w-full px-4 py-4 border-2 border-blue-300  text-center text-3xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="0"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectWinner('blue')}
                  disabled={!isEditing}
                  className={`w-full py-4  font-bold text-lg transition-all disabled:cursor-not-allowed ${
                    formData.winner === 'blue'
                      ? 'bg-blue-600 text-white shadow-xl transform scale-105'
                      : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50'
                  } ${!isEditing ? 'opacity-50' : ''}`}
                >
                  {formData.winner === 'blue' ? '✓ NGƯỜI THẮNG' : 'CHỌN THẮNG'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Giống Vovinam */}
      <div className="bg-gray-100 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
        {!isEditing ? (
          // Khi không chỉnh sửa - Hiển thị button Cập nhật và Đóng
          <>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2  font-semibold transition-colors"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleUpdate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2  font-semibold transition-colors shadow-md"
            >
              Cập nhật
            </button>
          </>
        ) : (
          // Khi đang chỉnh sửa - Hiển thị button Hủy và Lưu
          <>
            <button
              type="button"
              onClick={() => {
                if (existingWinner && existingWinner !== '-') {
                  setIsEditing(false);
                } else {
                  onCancel();
                }
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2  font-semibold transition-colors"
            >
              {existingWinner && existingWinner !== '-' ? 'Hủy chỉnh sửa' : 'Hủy'}
            </button>
            <button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2  font-semibold transition-colors shadow-md"
            >
            Lưu
            </button>
          </>
        )}
      </div>
    </form> 
  );
}

// Component form cấu hình
function ConfigForm({ row, onSubmit, onCancel }) {
  const [configData, setConfigData] = React.useState({
    // Cài đặt chung
    so_hiep: 3,
    so_hiep_phu: 1,
    so_giam_dinh: 3,
    he_diem: '10',

    // Thời gian
    thoi_gian_tinh_diem: 1000,
    thoi_gian_thi_dau: 120,
    thoi_gian_hiep: 90,
    thoi_gian_nghi: 30,
    thoi_gian_hiep_phu: 90,
    thoi_gian_y_te: 30,

    // Điểm áp dụng
    khoang_diem_tuyet_toi: 10,

    // Chế độ áp dụng
    cau_hinh_doi_khang_diem_thap: false,
    cau_hinh_quyen_tinh_tong: false,
    cau_hinh_y_te: false,
    cau_hinh_tinh_diem_tuyet_doi: false,
    cau_hinh_xoa_nhac_nho: false,
    cau_hinh_xoa_canh_cao: false,
  });

  React.useEffect(() => {
    // Load config từ row nếu có
    if (row?.config_system) {
      setConfigData(prev => ({ ...prev, ...row.config_system }));
    }
  }, [row]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(configData);
  };

  const handleChange = (field, value) => {
    setConfigData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1">
      {/* Content - Scrollable */}
      <div className="p-6 overflow-y-auto max-h-[calc(600px-140px)] bg-gray-50">
        <div className="space-y-6">
        {/* Section: Thông tin trận đấu */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 ">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            Thông tin trận đấu
          </h3>

          <div className="grid grid-cols-3 gap-4">
            {/* Hệ điểm */}
            <div className="bg-white border border-gray-200 p-3 ">
              <label className="block text-gray-600 text-xs font-semibold mb-1">
                Hệ điểm
              </label>
              <div className="text-gray-800 text-lg font-bold">
                {configData.he_diem === '1' || configData.he_diem === 1 ? 'Hệ điểm 1' :
                 configData.he_diem === '2' || configData.he_diem === 2 ? 'Hệ điểm 2' :
                 configData.he_diem === '3' || configData.he_diem === 3 ? 'Hệ điểm 3' :
                 'Hệ điểm 2'}
              </div>
            </div>

            {/* Số giám định */}
            <div className="bg-white border border-gray-200 p-3 ">
              <label className="block text-gray-600 text-xs font-semibold mb-1">
                Số giám định
              </label>
              <div className="text-gray-800 text-lg font-bold">
                {configData.so_giam_dinh === '3' || configData.so_giam_dinh === 3 ? '3 giám định' :
                 configData.so_giam_dinh === '5' || configData.so_giam_dinh === 5 ? '5 giám định' :
                 configData.so_giam_dinh === '10' || configData.so_giam_dinh === 10 ? '10 giám định' :
                 '3 giám định'}
              </div>
            </div>

            {/* Tổng số hiệp */}
            <div className="bg-white border border-gray-200 p-3 ">
              <label className="block text-gray-600 text-xs font-semibold mb-1">
                Tổng số hiệp
              </label>
              <div className="text-gray-800 text-lg font-bold">
                {(configData.so_hiep || 3) + (configData.so_hiep_phu || 0)} hiệp
              </div>
              <div className="text-gray-500 text-xs mt-1">
                ({configData.so_hiep || 3} chính + {configData.so_hiep_phu || 0} phụ)
              </div>
            </div>
          </div>
        </div>

        {/* Section: Cấu hình hiệp */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 ">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                clipRule="evenodd"
              />
            </svg>
            Cấu hình hiệp
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Số hiệp chính */}
            <div className="bg-white border border-gray-200 p-4 ">
              <label className="block text-gray-700 font-semibold mb-2">
                Số hiệp chính
              </label>
              <select
                value={configData.so_hiep || '3'}
                onChange={(e) => handleChange('so_hiep', parseInt(e.target.value))}
                className="w-full bg-gray-100 text-gray-800 px-4 py-2  focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300"
              >
                <option value="1">1 hiệp</option>
                <option value="2">2 hiệp</option>
                <option value="3">3 hiệp</option>
              </select>
              <p className="text-gray-500 text-xs mt-2">
                Theo cấu hình hệ thống
              </p>
            </div>

            {/* Số hiệp phụ */}
            <div className="bg-white border border-gray-200 p-4 ">
              <label className="block text-gray-700 font-semibold mb-2">
                Số hiệp phụ
              </label>
              <select
                value={configData.so_hiep_phu || '0'}
                onChange={(e) => handleChange('so_hiep_phu', parseInt(e.target.value))}
                className="w-full bg-gray-100 text-gray-800 px-4 py-2  focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300"
              >
                <option value="0">Không có</option>
                <option value="1">1 hiệp phụ</option>
                <option value="2">2 hiệp phụ</option>
                <option value="3">3 hiệp phụ</option>
              </select>
              <p className="text-gray-500 text-xs mt-2">
                Theo cấu hình hệ thống
              </p>
            </div>

            {/* Hệ điểm */}
            <div className="bg-white border border-gray-200 p-4 ">
              <label className="block text-gray-700 font-semibold mb-2">
                Hệ điểm
              </label>
              <select
                value={configData.he_diem || '2'}
                onChange={(e) => handleChange('he_diem', e.target.value)}
                className="w-full bg-gray-100 text-gray-800 px-4 py-2  focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300"
              >
                <option value="1">Hệ điểm 1</option>
                <option value="2">Hệ điểm 2</option>
                <option value="3">Hệ điểm 3</option>
              </select>
              <p className="text-gray-500 text-xs mt-2">
                Theo cấu hình hệ thống
              </p>
            </div>

            {/* Số giám định */}
            <div className="bg-white border border-gray-200 p-4 ">
              <label className="block text-gray-700 font-semibold mb-2">
                Số giám định
              </label>
              <select
                value={configData.so_giam_dinh || '3'}
                onChange={(e) => handleChange('so_giam_dinh', e.target.value)}
                className="w-full bg-gray-100 text-gray-800 px-4 py-2  focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300"
              >
                <option value="3">3 giám định</option>
                <option value="5">5 giám định</option>
                <option value="10">10 giám định</option>
              </select>
              <p className="text-gray-500 text-xs mt-2">
                Theo cấu hình hệ thống
              </p>
            </div>
          </div>
        </div>

        {/* Section: Cấu hình thời gian */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 ">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            Cấu hình thời gian
          </h3>

          <div className="grid grid-cols-3 gap-4">
            {/* Thời gian tính điểm */}
            <div className="bg-white border border-gray-200 p-4 ">
              <label className="block text-gray-700 font-semibold mb-2">
                Thời gian tính điểm (ms)
              </label>
              <input
                type="number"
                value={configData.thoi_gian_tinh_diem}
                onChange={(e) => handleChange('thoi_gian_tinh_diem', parseInt(e.target.value))}
                className="w-full bg-gray-100 text-gray-800 px-4 py-2  focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300"
              />
            </div>

            {/* Thời gian thi đấu */}
            <div className="bg-white border border-gray-200 p-4 ">
              <label className="block text-gray-700 font-semibold mb-2">
                Thời gian thi đấu (giây)
              </label>
              <input
                type="number"
                value={configData.thoi_gian_thi_dau}
                onChange={(e) => handleChange('thoi_gian_thi_dau', parseInt(e.target.value))}
                className="w-full bg-gray-100 text-gray-800 px-4 py-2  focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300"
              />
            </div>

            {/* Thời gian nghỉ */}
            <div className="bg-white border border-gray-200 p-4 ">
              <label className="block text-gray-700 font-semibold mb-2">
                Thời gian nghỉ (giây)
              </label>
              <input
                type="number"
                value={configData.thoi_gian_nghi}
                onChange={(e) => handleChange('thoi_gian_nghi', parseInt(e.target.value))}
                className="w-full bg-gray-100 text-gray-800 px-4 py-2  focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300"
              />
            </div>

            {/* Thời gian hiệp phụ */}
            <div className="bg-white border border-gray-200 p-4 ">
              <label className="block text-gray-700 font-semibold mb-2">
                Thời gian hiệp phụ (giây)
              </label>
              <input
                type="number"
                value={configData.thoi_gian_hiep_phu}
                onChange={(e) => handleChange('thoi_gian_hiep_phu', parseInt(e.target.value))}
                className="w-full bg-gray-100 text-gray-800 px-4 py-2  focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300"
              />
            </div>

            {/* Thời gian y tế */}
            <div className="bg-white border border-gray-200 p-4 ">
              <label className="block text-gray-700 font-semibold mb-2">
                Thời gian y tế (giây)
              </label>
              <input
                type="number"
                value={configData.thoi_gian_y_te}
                onChange={(e) => handleChange('thoi_gian_y_te', parseInt(e.target.value))}
                className="w-full bg-gray-100 text-gray-800 px-4 py-2  focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300"
              />
            </div>
          </div>
        </div>

        {/* Section: Điểm áp dụng */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 ">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Điểm áp dụng
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 p-4 ">
              <label className="block text-gray-700 font-semibold mb-2">
                Khoảng điểm tuyệt đối
              </label>
              <input
                type="number"
                value={configData.khoang_diem_tuyet_toi}
                onChange={(e) => handleChange('khoang_diem_tuyet_toi', parseInt(e.target.value))}
                className="w-full bg-gray-100 text-gray-800 px-4 py-2  focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300"
              />
              <p className="text-gray-500 text-xs mt-2">
                Khoảng cách điểm để thắng tuyệt đối
              </p>
            </div>
          </div>
        </div>

        {/* Section: Chế độ áp dụng */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 ">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
            Chế độ áp dụng
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'cau_hinh_doi_khang_diem_thap', label: 'Đối kháng tính điểm thấp' },
              { key: 'cau_hinh_quyen_tinh_tong', label: 'Quyền tính điểm tổng' },
              { key: 'cau_hinh_y_te', label: 'Tính thời gian y tế' },
              { key: 'cau_hinh_tinh_diem_tuyet_doi', label: 'Tính điểm thắng tuyệt đối' },
              { key: 'cau_hinh_xoa_nhac_nho', label: 'Xoá nhắc nhở' },
              { key: 'cau_hinh_xoa_canh_cao', label: 'Xoá cảnh cáo' },
            ].map(({ key, label }) => (
              <div key={key} className="bg-white border border-gray-200 p-3 ">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    id={key}
                    checked={configData[key] || false}
                    onChange={(e) => handleChange(key, e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 font-medium">
                    {label}
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>

      {/* Footer - Giống Vovinam */}
      <div className="bg-gray-100 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2  font-semibold transition-colors"
        >
          Hủy
        </button>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2  font-semibold transition-colors"
        >
          Lưu thay đổi
        </button>
      </div>
    </form>
  );
}

// Component xem lịch sử - Hiển thị giống màn hình Vovinam
function HistoryView({ row, onClose, exportToExcelRef }) {
  const [history, setHistory] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [matchInfo, setMatchInfo] = React.useState(null);
  const [expandedRow, setExpandedRow] = React.useState(null);

  // Hàm xuất Excel
  const exportToExcel = () => {
    try {
      // Lấy dữ liệu
      const latestHistoryItem = history.length > 0 ? history[history.length - 1] : null;
      const allLogs = latestHistoryItem?.logs || [];
      const roundHistory = latestHistoryItem?.round_history || [];

      const redName = row.data[3] || 'VĐV ĐỎ';
      const redUnit = row.data[4] || '';
      const blueName = row.data[6] || 'VĐV XANH';
      const blueUnit = row.data[7] || '';
      const latestHistory = history.length > 0 ? history[history.length - 1] : null;
      const redScore = latestHistory?.red_score || 0;
      const blueScore = latestHistory?.blue_score || 0;
      const winner = matchInfo?.winner || row.winner;

      // Tạo workbook
      const wb = XLSX.utils.book_new();

      // Sheet 1: Thông tin tổng quan
      const summaryData = [
        ['KẾT QUẢ TRẬN ĐẤU'],
        [],
        ['Thông tin', 'Giá trị'],
        ['VĐV Đỏ', redName],
        ['Đơn vị Đỏ', redUnit],
        ['Điểm Đỏ', redScore],
        [],
        ['VĐV Xanh', blueName],
        ['Đơn vị Xanh', blueUnit],
        ['Điểm Xanh', blueScore],
        [],
        ['Người chiến thắng', winner === 'RED' ? redName : winner === 'BLUE' ? blueName : 'Hòa'],
      ];
      const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, ws1, 'Tổng quan');

      // Sheet 2: Kết quả từng hiệp
      if (roundHistory.length > 0) {
        const roundData = [
          ['KẾT QUẢ TỪNG HIỆP'],
          [],
          ['Hiệp', 'Loại hiệp', 'Điểm Đỏ', 'Điểm Xanh', 'Thắng', 'Ngã', 'Biên', 'Nhắc nhở', 'Cảnh cáo']
        ];

        roundHistory.forEach(round => {
          roundData.push([
            round.round,
            round.roundType === 'EXTRA' ? 'Hiệp phụ' : 'Hiệp',
            round.red?.match?.score || 0,
            round.blue?.match?.score || 0,
            round.red?.match?.win || 0,
            round.red?.match?.fall || 0,
            round.red?.match?.out || 0,
            round.red?.match?.warning || 0,
            round.red?.match?.penalty || 0
          ]);
        });

        const ws2 = XLSX.utils.aoa_to_sheet(roundData);
        XLSX.utils.book_append_sheet(wb, ws2, 'Kết quả hiệp');
      }

      // Sheet 3: Lịch sử chi tiết
      if (allLogs.length > 0) {
        const logData = [
          ['LỊCH SỬ CHI TIẾT HÀNH ĐỘNG'],
          [],
          ['STT', 'Thời gian', 'Hiệp', 'Hành động', 'Giáp', 'Điểm']
        ];

        allLogs.forEach((log, index) => {
          const actionMap = {
            'SCORE_1': 'Điểm 1',
            'SCORE_2': 'Điểm 2',
            'SCORE_3': 'Điểm 3',
            'SCORE_5': 'Điểm 5',
            'SCORE_10': 'Điểm 10',
            'WIN': 'Thắng',
            'FALL': 'Ngã',
            'OUT': 'Biên',
            'WARNING': 'Nhắc nhở',
            'PENALTY': 'Cảnh cáo',
            'MEDICAL': 'Y tế',
            'ROUND_END': 'Kết thúc hiệp',
            'MATCH_END': 'Kết thúc trận'
          };

          logData.push([
            index + 1,
            log.timestamp || '',
            log.round || '',
            actionMap[log.action] || log.action,
            log.side === 'RED' ? 'Đỏ' : log.side === 'BLUE' ? 'Xanh' : '',
            `${log.redScore || 0} - ${log.blueScore || 0}`
          ]);
        });

        const ws3 = XLSX.utils.aoa_to_sheet(logData);
        XLSX.utils.book_append_sheet(wb, ws3, 'Lịch sử chi tiết');
      }

      // Xuất file
      const fileName = `Ket_qua_tran_dau_${redName}_vs_${blueName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);

      console.log('Xuất Excel thành công!');
    } catch (error) {
      console.error('Lỗi khi xuất Excel:', error);
      alert('Có lỗi xảy ra khi xuất file Excel!');
    }
  };

  React.useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);

        // Lấy lịch sử từ API nếu có match_id
        if (row.match_id) {
          const response = await axios.get(`http://localhost:6789/api/competition-match/${row.match_id}/history`);
          if (response?.data?.success) {
            setHistory(response.data.data || []);
          }

          // Lấy thông tin match
          const matchResponse = await axios.get(`http://localhost:6789/api/competition-match/${row.match_id}`);
          if (matchResponse?.data?.success) {
            setMatchInfo(matchResponse.data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();

    // Gán hàm exportToExcel vào ref để component cha có thể gọi
    if (exportToExcelRef) {
      exportToExcelRef.current = exportToExcel;
    }
  }, [row]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin  h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Đang tải lịch sử...</span>
      </div>
    );
  }

  // Tính điểm cuối cùng từ history
  const latestHistory = history.length > 0 ? history[history.length - 1] : null;
  const redScore = latestHistory?.red_score || 0;
  const blueScore = latestHistory?.blue_score || 0;
  const winner = matchInfo?.winner || row.winner;

  // Thông tin VĐV
  const redName = row.data[3] || 'VĐV ĐỎ';
  const redUnit = row.data[4] || '';
  const blueName = row.data[6] || 'VĐV XANH';
  const blueUnit = row.data[7] || '';

  // Lấy round_history và logs từ history cuối cùng
  const latestHistoryItem = history.length > 0 ? history[history.length - 1] : null;
  const roundHistory = latestHistoryItem?.round_history || [];
  const allLogs = latestHistoryItem?.logs || [];

  return (
    <div className="space-y-6">
      {/* 1. KẾT QUẢ TỔNG - Bảng điểm giống Vovinam */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800  p-6 shadow-2xl">
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-4 py-2 -mx-6 -mt-6 mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            KẾT QUẢ TỔNG
          </h3>
        </div>

        <div className="flex justify-between items-center gap-6">
          {/* Giáp Đỏ */}
          <div className={`flex-1 bg-red-600  p-6 shadow-lg transition-all ${
            winner?.toUpperCase() === 'RED' ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-gray-900' : ''
          }`}>
            <div className="text-white text-center">
              <div className="text-8xl font-bold mb-4">{redScore}</div>
              <div className="border-t-2 border-white/30 pt-4">
                <p className="text-2xl font-bold">{redName}</p>
                <p className="text-lg opacity-90">{redUnit}</p>
              </div>
              {winner?.toUpperCase() === 'RED' && (
                <div className="mt-4 bg-yellow-400 text-gray-900 font-bold py-2 px-4  inline-block">
                  🏆 CHIẾN THẮNG
                </div>
              )}
            </div>
          </div>

          {/* Giữa */}
          <div className="flex flex-col items-center justify-center px-6 text-white">
            <div className="text-3xl font-bold mb-2">VS</div>
            <div className="text-xl opacity-75">Trận {row.data[0]}</div>
            <div className="mt-4 bg-yellow-400 text-gray-900 font-bold px-6 py-2 ">
              {row.match_status === 'FIN' ? 'ĐÃ KẾT THÚC' :
               row.match_status === 'IN' ? 'ĐANG THI ĐẤU' : 'CHỜ THI ĐẤU'}
            </div>
          </div>

          {/* Giáp Xanh */}
          <div className={`flex-1 bg-blue-600  p-6 shadow-lg transition-all ${
            winner?.toUpperCase() === 'BLUE' ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-gray-900' : ''
          }`}>
            <div className="text-white text-center">
              <div className="text-8xl font-bold mb-4">{blueScore}</div>
              <div className="border-t-2 border-white/30 pt-4">
                <p className="text-2xl font-bold">{blueName}</p>
                <p className="text-lg opacity-90">{blueUnit}</p>
              </div>
              {winner?.toUpperCase() === 'BLUE' && (
                <div className="mt-4 bg-yellow-400 text-gray-900 font-bold py-2 px-4  inline-block">
                  🏆 CHIẾN THẮNG
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. KẾT QUẢ TỪNG HIỆP */}
      {roundHistory.length > 0 && (
        <div className="bg-white  shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-800 px-6 py-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              KẾT QUẢ TỪNG HIỆP ({roundHistory.length})
            </h3>
          </div>

          <div className="p-6 space-y-3 bg-gray-50">
            {roundHistory.map((round, roundIndex) => {
              // Lọc logs theo hiệp
              const roundLogs = allLogs.filter(log => log.round === round.round) || [];

              return (
                <RoundHistoryCard
                  key={roundIndex}
                  round={round}
                  roundIndex={roundIndex}
                  logs={roundLogs}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* 3. LỊCH SỬ CHI TIẾT HÀNH ĐỘNG */}
      {allLogs.length > 0 && (
        <div className="bg-white  shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              LỊCH SỬ CHI TIẾT HÀNH ĐỘNG ({allLogs.length})
            </h3>
          </div>

          <div className="max-h-[500px] overflow-y-auto border border-gray-200 ">
            {allLogs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg">Chưa có lịch sử hành động</p>
              </div>
            ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-3 py-3 text-center font-semibold text-gray-700 border-b-2 border-gray-300 w-12">#</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b-2 border-gray-300">Thời gian</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 border-b-2 border-gray-300 w-20">Hiệp</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b-2 border-gray-300">Loại hành động</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 border-b-2 border-gray-300 w-24">Đội</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b-2 border-gray-300">Mô tả</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 border-b-2 border-gray-300 w-28">Tỷ số</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {allLogs.map((log, logIndex) => {
                  const getActionTypeLabel = (type) => {
                    const types = {
                      'score': 'Ghi điểm',
                      'warn': 'Cảnh cáo',
                      'remind': 'Nhắc nhở',
                      'medical': 'Y tế',
                      'fall': 'Ngã',
                      'win': 'Thắng',
                      'reset': 'Reset'
                    };
                    return types[type] || type;
                  };

                  return (
                    <tr key={logIndex} className="hover:bg-blue-50 transition-colors duration-150">
                      <td className="px-3 py-3 text-center text-gray-500 font-medium border-r border-gray-100">
                        {logIndex + 1}
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-medium">
                        {log.time || '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-1  bg-indigo-100 text-indigo-700 text-xs font-semibold">
                          {log.round || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-3 py-1.5  text-xs font-semibold ${
                          log.actionType === 'score' ? 'bg-green-100 text-green-800 border border-green-200' :
                          log.actionType === 'warn' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                          log.actionType === 'remind' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          log.actionType === 'medical' ? 'bg-red-100 text-red-800 border border-red-200' :
                          log.actionType === 'fall' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                          log.actionType === 'win' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                          'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          {getActionTypeLabel(log.actionType)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {log.team === 'red' ? (
                          <span className="inline-flex items-center px-3 py-1  bg-red-100 text-red-700 font-bold text-sm border border-red-200">
                            Đỏ
                          </span>
                        ) : log.team === 'blue' ? (
                          <span className="inline-flex items-center px-3 py-1  bg-blue-100 text-blue-700 font-bold text-sm border border-blue-200">
                            Xanh
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {log.description || '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center px-3 py-1.5  bg-gray-100 font-mono text-gray-900 font-bold text-sm border border-gray-300">
                          {log.redScore || 0} - {log.blueScore || 0}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
