import React, { Fragment, useState } from "react";
import Button from "../../../../components/Button";

export default function NotificationForm({ data, onSuccess, onGoBack }) {
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
      onSuccess(formData);
    }, 1500);
  };

  return (
    <Fragment>
      <div className="mb-4">
        <textarea
          id="message"
          name="message"
          value={formData.message}
          maxLength={250}
          onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
          rows={4}
          className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Nội dung..."
        />
      </div>
      <div className="flex">
        <div className="flex items-center mb-4 select-none w-1/2">
          <input
            id={`remind`}
            disabled={loading}
            name={"remind"}
            type="checkbox"
            checked={formData["remind"]}
            onChange={handleChange}
            className="cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500"
          />
          <label htmlFor="remind" className="cursor-pointer ms-2 text-sm font-medium text-gray-900">
            Nhắc nhở
          </label>
        </div>
        <div className="flex items-center mb-4 select-none w-1/2">
          <input
            id={`warning`}
            disabled={loading}
            name={"warning"}
            type="checkbox"
            checked={formData["warning"]}
            onChange={handleChange}
            className="cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500"
          />
          <label htmlFor="warning" className="cursor-pointer ms-2 text-sm font-medium text-gray-900">
            Cảnh cáo
          </label>
        </div>
      </div>
      <div className="flex items-center justify-center mt-4">
        <Button disabled={loading} className="min-w-32 mr-2" variant="secondary" onClick={() => onGoBack()}>
          Quay lại
        </Button>
        <Button loading={loading} className="min-w-32" variant="primary" onClick={handleSubmit}>
          Gửi
        </Button>
      </div>
    </Fragment>
  );
}
