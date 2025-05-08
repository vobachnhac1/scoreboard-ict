// @ts-nocheck
import React, { Fragment } from "react";
import { useForm } from "react-hook-form";
import Button from "../../../../components/Button";
import { Constants } from "../../../../common/Constants";

export default function ChampionGroupForm({ type, data = null, onAgree, onGoBack }) {
  const [loadingButton, setLoadingButton] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: data,
  });

  const onSubmit = (formData) => {
    setLoadingButton(true);
    console.log("Dữ liệu gửi đi:", formData);
    if (type === Constants.ACCTION_INSERT) {
      console.log("Thêm mới nhóm giải:", formData);
    } else if (type === Constants.ACCTION_UPDATE) {
      console.log("Cập nhật nhóm giải:", formData);
    }
    setTimeout(() => {
      setLoadingButton(false);
      onAgree(formData);
    }, 1500);
  };

  return (
    <Fragment>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Tên nhóm */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="name" className="text-sm font-medium text-gray-700">
            Tên nhóm
          </label>
          <input
            id="name"
            readOnly={loadingButton}
            {...register("name", { required: "Tên nhóm là bắt buộc" })}
            type="text"
            className="form-input col-span-2 w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Nhập tên nhóm"
          />
          {errors.name && <p className="text-red-500 text-sm col-span-2 col-start-2">{errors.name.message}</p>}
        </div>

        {/* Mô tả */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="description" className="text-sm font-medium text-gray-700">
            Mô tả
          </label>
          <textarea
            readOnly={loadingButton}
            id="description"
            {...register("description")}
            className="form-textarea col-span-2 w-full px-3 py-2 border rounded-md text-sm"
            rows={3}
            placeholder="Nhập mô tả"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-2 !mt-4">
          <Button disabled={loadingButton} type="button" className="min-w-32" variant="secondary" onClick={onGoBack}>
            Quay lại
          </Button>
          <Button loading={loadingButton} type="submit" className="min-w-32" variant="primary">
            Đồng ý
          </Button>
        </div>
      </form>
    </Fragment>
  );
}
