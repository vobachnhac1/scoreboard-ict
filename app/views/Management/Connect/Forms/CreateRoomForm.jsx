import React, { useState, useEffect } from "react";
import Button from "../../../../components/Button";
import QRCode from "qrcode";
import axios from "axios";

export default function CreateRoomForm({ onSubmit, onClose, existingRoom }) {
  const [roomId, setRoomId] = useState("");
  const [uuidDesktop, setUuidDesktop] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [serverUrl, setServerUrl] = useState("http://localhost:6789");

  // Generate random ID (10 characters, uppercase letters and numbers)
  const generateRandomId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Initialize with existing room or generate new
  useEffect(() => {
    if (existingRoom) {
      setRoomId(existingRoom.room_id);
      setUuidDesktop(existingRoom.uuid_desktop);
      setServerUrl(existingRoom.server_url || "http://localhost:6789");
    } else {
      setRoomId(generateRandomId());
      setUuidDesktop(generateRandomId());
    }
  }, [existingRoom]);

  // Generate QR code whenever room info changes
  useEffect(() => {
    if (roomId) {
      generateQRCode();
    }
  }, [roomId, uuidDesktop, serverUrl]);

  const generateQRCode = async () => {
    try {
      // gọi API  get-qr-active
      let config = {
        method: "get",
        maxBodyLength: Infinity,
        baseURL: "http://localhost:6789/api/config/get-qr-active",
        params: {
          room_id: roomId,
        },
      };
      const response = await axios.request(config);
      if (response.status == 200) {
        setQrCodeUrl(response.data.data.base64QR);
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!roomId || !uuidDesktop) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const roomData = {
      room_id: roomId,
      uuid_desktop: uuidDesktop,
      server_url: serverUrl,
      permission: 9,
      created_at: new Date().toISOString(),
    };

    onSubmit(roomData);
  };

  const handleGenerateNew = () => {
    setRoomId(generateRandomId());
    setUuidDesktop(generateRandomId());
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    alert("Đã copy Room ID!");
  };

  const handleCopyUuid = () => {
    navigator.clipboard.writeText(uuidDesktop);
    alert("Đã copy UUID Desktop!");
  };

  const handleDownloadQR = () => {
    const link = document.createElement("a");
    link.download = `room_${roomId}_qr.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  return (
    <div className="p-2 pt-4">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Grid 2 Columns Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left Column - Form Inputs */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2 px-1">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white shadow-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-black text-blue-900 dark:text-blue-100 uppercase tracking-widest">
                Thông tin kết nối
              </h3>
            </div>

            {/* Room ID */}
            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-blue-900 dark:text-blue-300 uppercase tracking-widest block px-1 opacity-60">
                Mã kết nối (Room ID) <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="relative">
                <input
                  disabled
                  type="text"
                  value={roomId}
                  className="w-full px-5 py-4 bg-blue-50/50 dark:bg-blue-900/10 border-2 border-blue-100 dark:border-blue-800 rounded text-lg font-black tracking-[0.2em] text-blue-900 dark:text-blue-100 shadow-inner disabled:bg-blue-100/30 dark:disabled:bg-blue-950/20"
                  placeholder="Mã kết nối"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Auto</div>
                </div>
              </div>
              <p className="text-[10px] text-blue-500/60 dark:text-blue-400/60 font-bold italic px-1">
                * Mã này dùng để xác định phòng thi đấu trên hệ thống
              </p>
            </div>

            {/* UUID Desktop */}
            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-blue-900 dark:text-blue-300 uppercase tracking-widest block px-1 opacity-60">
                Mã thiết bị Admin <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="relative">
                <input
                  disabled
                  type="text"
                  value={uuidDesktop}
                  className="w-full px-5 py-4 bg-blue-50/50 dark:bg-blue-900/10 border-2 border-blue-100 dark:border-blue-800 rounded text-lg font-black tracking-[0.2em] text-blue-900 dark:text-blue-100 shadow-inner disabled:bg-blue-100/30 dark:disabled:bg-blue-950/20"
                  placeholder="Mã thiết bị"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <div className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 rounded text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Admin</div>
                </div>
              </div>
              <p className="text-[10px] text-blue-500/60 dark:text-blue-400/60 font-bold italic px-1">
                * Định danh duy nhất cho máy trạm điều khiển
              </p>
            </div>

            <div className="mt-4 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded border border-blue-100 dark:border-blue-900/30 border-dashed">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-white dark:bg-gray-800 rounded flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm border border-blue-50 dark:border-blue-900/50">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-blue-900 dark:text-blue-100 uppercase tracking-widest mb-1">Kết nối nhanh</h4>
                  <p className="text-[10px] font-bold text-blue-500 dark:text-blue-400 opacity-80 leading-relaxed italic">
                    Sử dụng các mã này để cấu hình thủ công nếu chức năng quét QR không hoạt động trên thiết bị di động.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - QR Code Section */}
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-2 px-1">
              <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white shadow-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="text-sm font-black text-blue-900 dark:text-blue-100 uppercase tracking-widest">
                QR Code Connection
              </h3>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded border-2 border-blue-50 dark:border-blue-900/30 shadow-xl shadow-blue-500/5 relative overflow-hidden group">
              {/* Decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>

              {qrCodeUrl ? (
                <div className="relative z-10 flex flex-col items-center">
                  <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl shadow-blue-500/20 mb-6 border-4 border-blue-50 transition-transform duration-500 hover:scale-105">
                    <img src={qrCodeUrl} alt="QR Code" className="w-[18rem] h-[18rem] rounded" />
                  </div>
                  <div className="px-6 py-2.5 bg-blue-900 dark:bg-blue-600 rounded-full shadow-lg">
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Scan to connect system</span>
                  </div>
                </div>
              ) : (
                <div className="relative z-10 text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-l-4 border-blue-600 dark:border-blue-400 mx-auto mb-6 shadow-xl"></div>
                  <p className="text-[10px] font-black text-blue-900 dark:text-blue-100 uppercase tracking-widest opacity-60">
                    Đang tạo mã định danh...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons - Redesigned Toolbar */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-8 border-t border-blue-50 dark:border-blue-900/30">
          <div className="flex items-center gap-3 mr-auto">
            <button
              type="button"
              onClick={handleGenerateNew}
              className="px-6 py-3.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/10 dark:hover:bg-amber-900/20 text-amber-600 border border-amber-200 dark:border-amber-800 rounded text-[10px] font-black uppercase tracking-widest shadow-sm transition-all active:scale-95"
            >
              Làm mới mã
            </button>
            <button
              type="button"
              onClick={handleDownloadQR}
              className="px-6 py-3.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/10 dark:hover:bg-blue-900/20 text-blue-600 border border-blue-100 dark:border-blue-800 rounded text-[10px] font-black uppercase tracking-widest shadow-sm transition-all active:scale-95"
            >
              Tải QR Code
            </button>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="min-w-32 py-3.5 !rounded"
          >
            <span className="text-[10px] font-black uppercase tracking-widest">Đóng</span>
          </Button>

          <Button
            type="submit"
            variant="primary"
            className="min-w-64 py-3.5 !rounded shadow-2xl shadow-blue-500/30"
          >
            <span className="text-[10px] font-black uppercase tracking-widest">
              {existingRoom ? "Xác nhận sử dụng" : "Kích hoạt hệ thống"}
            </span>
          </Button>
        </div>
      </form>
    </div>
  );
}
