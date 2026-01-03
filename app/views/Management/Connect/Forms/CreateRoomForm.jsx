import React, { useState, useEffect } from "react";
import Button from "../../../../components/Button";
import QRCode from "qrcode";

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
      const qrData = {
        room_id: roomId,
        server_url: serverUrl,
        type: "admin"
      };

      const url = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF"
        }
      });

      setQrCodeUrl(url);
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
      created_at: new Date().toISOString()
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
    <div className="p-6">
      <form onSubmit={handleSubmit}>
        {/* Grid 2 Columns Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Left Column - Form Inputs */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Thông tin kết nối
            </h3>

            {/* Room ID */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Mã kết nối <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  disabled
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mã kết nối"
                  maxLength={10}
                  required
                />
                {/* <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCopyRoomId}
                  className="min-w-20"
                >
                  📋
                </Button> */}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Mã kết nối duy nhất (10 ký tự)
              </p>
            </div>

            {/* UUID Desktop */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Mã thiết bị <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  disabled
                  type="text"
                  value={uuidDesktop}
                  onChange={(e) => setUuidDesktop(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mã thiết bị"
                  maxLength={12}
                  required
                />
                {/* <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCopyUuid}
                  className="min-w-20"
                >
                  📋
                </Button> */}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Mã định danh thiết bị admin (12 ký tự)
              </p>
            </div>

            {/* Server URL: không hiển thị */}
            {/* <div>
              <label className="block text-sm font-medium mb-2">
                Server URL <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="http://localhost:6789"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                URL của Socket.IO server
              </p>
            </div> */}
          </div>

          {/* Right Column - QR Code */}
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              QR Code
            </h3>

            <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
              {qrCodeUrl ? (
                <div className="flex flex-col items-center">
                  <div className="bg-white p-4 rounded-xl shadow-lg mb-4">
                    <img
                      src={qrCodeUrl}
                      alt="QR Code"
                      className="w-64 h-64"
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-3 text-center max-w-xs">
                    Scan mã QR này để kết nối từ thiết bị di động
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-500 text-sm font-medium">Đang tải mã QR...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons - Full Width Below */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 justify-end">
            <Button
            type="button"
            variant="warning"
            onClick={handleGenerateNew}
            className="min-w-[150px]"
          >
            Tạo mã tự động
          </Button>
          <Button
            type="button"
            variant="warning"
            onClick={handleDownloadQR}
            className="min-w-[150px]"
          >
            Tải mã QR
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="min-w-[150px]"
          >
            {existingRoom ? "Sử dụng" : "Tạo mới & Kết nối"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="min-w-[150px]"
          >
            Quay lại
          </Button>
        </div>
      </form>
    </div>
  );
}

