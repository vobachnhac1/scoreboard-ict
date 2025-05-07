import React, { Fragment, useState } from "react";
import Button from "../../../../components/Button";

export default function DisconnectForm({ data, onSuccess, onGoBack }) {
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
    // TODO: xử lý formData ở đây
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess(formData);
    }, 1500);
  };

  return (
    <Fragment>
      {[
        { name: "pauseScoring", label: "Tạm ngưng chấm điểm" },
        { name: "removeInspectorRole", label: "Ngắt quyền giám định" },
        { name: "disconnectSystem", label: "Ngắt kết nối hệ thống" },
        { name: "deactivateDevice", label: "Huỷ kích hoạt thiết bị" },
      ].map((item, idx) => (
        <div className="flex items-center mb-4 select-none" key={item.name}>
          <input
            id={`checkbox${idx + 1}`}
            disabled={loading}
            name={item.name}
            type="checkbox"
            checked={formData[item.name]}
            onChange={handleChange}
            className="cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500"
          />
          <label htmlFor={`checkbox${idx + 1}`} className="cursor-pointer ms-2 text-sm font-medium text-gray-900">
            {item.label}
          </label>
        </div>
      ))}

      <div className="flex items-center justify-center mt-4">
        <Button disabled={loading} className="min-w-32 mr-2" variant="secondary" onClick={() => onGoBack()}>
          Quay lại
        </Button>
        <Button loading={loading} className="min-w-32" variant="primary" onClick={handleSubmit}>
          Đồng ý
        </Button>
      </div>
    </Fragment>
  );
}
