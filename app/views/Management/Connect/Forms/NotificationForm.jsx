import React, { Fragment, useState } from "react";
import Button from "../../../../components/Button";

export default function NotificationForm({ data, onAgree, onGoBack }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    message: "",
    remind: false,
    warning: false,
  });

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = () => {
    console.log("Dữ liệu gửi đi:", formData, "Với thiết bị:", data);
    // TODO: xử lý formData ở đây
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onAgree(formData);
    }, 1500);
  };

  return (
    <div className="p-2 pt-4">
      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="message" className="text-[10px] font-black text-blue-900 dark:text-blue-300 uppercase tracking-widest block px-1 opacity-60">
            Nội dung thông báo <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            maxLength={250}
            onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
            rows={4}
            className="block px-4 py-3 w-full text-sm font-bold text-blue-900 dark:text-blue-100 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border-2 border-blue-100 dark:border-blue-800 focus:border-blue-500 outline-none transition-all shadow-inner"
            placeholder="Nhập nội dung cần gửi đến giám định..."
          />
        </div>

        <div className="bg-blue-50/30 dark:bg-blue-900/10 rounded-3xl p-6 border border-blue-50 dark:border-blue-900/30 shadow-inner">
          <p className="text-[10px] font-black text-blue-900 dark:text-blue-300 uppercase tracking-widest mb-4 opacity-60"> Phân loại thông báo </p>
          <div className="flex gap-10">
            <label className="flex items-center group cursor-pointer select-none">
              <div className="relative flex items-center justify-center">
                <input
                  id="remind"
                  disabled={loading}
                  name="remind"
                  type="checkbox"
                  checked={formData.remind}
                  onChange={handleChange}
                  className="peer appearance-none w-6 h-6 border-2 border-blue-200 dark:border-blue-800 rounded-lg bg-white dark:bg-gray-800 checked:bg-amber-500 checked:border-amber-500 transition-all duration-300 hover:border-amber-400"
                />
                <svg className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-300 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="ms-3 text-[11px] font-black text-blue-900 dark:text-blue-100 uppercase tracking-widest group-hover:text-amber-500 transition-colors">
                Nhắc nhở
              </span>
            </label>

            <label className="flex items-center group cursor-pointer select-none">
              <div className="relative flex items-center justify-center">
                <input
                  id="warning"
                  disabled={loading}
                  name="warning"
                  type="checkbox"
                  checked={formData.warning}
                  onChange={handleChange}
                  className="peer appearance-none w-6 h-6 border-2 border-blue-200 dark:border-blue-800 rounded-lg bg-white dark:bg-gray-800 checked:bg-rose-500 checked:border-rose-500 transition-all duration-300 hover:border-rose-400"
                />
                <svg className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-300 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="ms-3 text-[11px] font-black text-blue-900 dark:text-blue-100 uppercase tracking-widest group-hover:text-rose-500 transition-colors">
                Cảnh cáo
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-blue-50 dark:border-blue-900/30">
        <Button disabled={loading} className="min-w-32 py-3.5 !rounded-2xl" variant="secondary" onClick={() => onGoBack()}>
          <span className="text-[10px] font-black uppercase tracking-widest">Hủy bỏ</span>
        </Button>
        <Button loading={loading} className="min-w-48 py-3.5 !rounded-2xl shadow-xl shadow-blue-500/20" variant="primary" onClick={handleSubmit}>
          <span className="text-[10px] font-black uppercase tracking-widest">Gửi thông báo</span>
        </Button>
      </div>
    </div>
  );
}
