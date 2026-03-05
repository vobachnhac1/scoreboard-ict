import React, { Fragment, useState } from "react";
import Button from "../../../../components/Button";
import { emitSocketEvent } from "../../../../config/hooks/useSocketEvents";

export default function DisconnectForm({ data, onAgree, onGoBack }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    pauseScoring: false,
    removeInspectorRole: false,
    disconnectSystem: false,
    deactivateDevice: false,
  });

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = () => {
    console.log("Dữ liệu gửi đi:", formData, "Với thiết bị:", data);

    // Gửi socket event DISCONNECT_CLIENT
    if (data?.socket_id && data?.room_id) {
      setLoading(true);

      emitSocketEvent("DISCONNECT_CLIENT", {
        socket_id: data.socket_id,
        room_id: data.room_id
      });

      // Đợi một chút để server xử lý
      setTimeout(() => {
        setLoading(false);
        onAgree(formData);
      }, 1000);
    } else {
      console.error("Thiếu thông tin socket_id hoặc room_id");
    }
  };

  return (
    <div className="p-2 pt-4">
      <div className="bg-blue-50/30 dark:bg-blue-900/10 rounded-3xl p-6 border border-blue-50 dark:border-blue-900/30 mb-8 shadow-inner">
        <p className="text-[10px] font-black text-blue-900 dark:text-blue-300 uppercase tracking-widest mb-6 px-1 opacity-60"> Tùy chọn ngắt kết nối </p>
        <div className="space-y-4">
          {[
            { name: "pauseScoring", label: "Tạm ngưng chấm điểm" },
            { name: "removeInspectorRole", label: "Ngắt quyền giám định" },
            { name: "disconnectSystem", label: "Ngắt kết nối hệ thống" },
            { name: "deactivateDevice", label: "Huỷ kích hoạt thiết bị" },
          ].map((item, idx) => (
            <label className="flex items-center group cursor-pointer select-none" key={item.name}>
              <div className="relative flex items-center justify-center">
                <input
                  id={`checkbox${idx + 1}`}
                  disabled={loading}
                  name={item.name}
                  type="checkbox"
                  checked={formData[item.name]}
                  onChange={handleChange}
                  className="peer appearance-none w-6 h-6 border-2 border-blue-200 dark:border-blue-800 rounded-lg bg-white dark:bg-gray-800 checked:bg-blue-600 checked:border-blue-600 transition-all duration-300 hover:border-blue-400"
                />
                <svg className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-300 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="ms-4 text-sm font-black text-blue-900 dark:text-blue-100 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                {item.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-blue-50 dark:border-blue-900/30">
        <Button disabled={loading} className="min-w-32 py-3.5 !rounded-2xl" variant="secondary" onClick={() => onGoBack()}>
          <span className="text-[10px] font-black uppercase tracking-widest">Quay lại</span>
        </Button>
        <Button loading={loading} className="min-w-48 py-3.5 !rounded-2xl shadow-xl shadow-blue-500/20" variant="primary" onClick={handleSubmit}>
          <span className="text-[10px] font-black uppercase tracking-widest">Xác nhận ngắt</span>
        </Button>
      </div>
    </div>
  );
}
