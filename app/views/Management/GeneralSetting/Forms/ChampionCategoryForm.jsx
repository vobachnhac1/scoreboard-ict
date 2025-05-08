// @ts-nocheck
import React, { Fragment } from "react";
import { useForm } from "react-hook-form";
import Button from "../../../../components/Button";
import { Constants } from "../../../../common/Constants";

export default function ChampionCategoryFrom({ type, data = null, onAgree, onGoBack }) {
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
        {/* Mã hình thức thi */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="category_key" className="text-sm font-medium text-gray-700">
            Mã hình thức thi
          </label>
          <input
            id="category_key"
            readOnly={loadingButton}
            {...register("category_key", { required: "Mã hình thức thi là bắt buộc" })}
            type="text"
            className="form-input col-span-2 w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Nhập mã hình thức thi"
          />
          {errors.category_key && <p className="text-red-500 text-sm col-span-2 col-start-2">{errors.category_key.message}</p>}
        </div>

        {/* Tên hình thưc thi */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="category_name" className="text-sm font-medium text-gray-700">
            Hình thức thi
          </label>
          <input
            id="category_name"
            readOnly={loadingButton}
            {...register("category_name", { required: "Hình thức thi là bắt buộc" })}
            type="text"
            className="form-input col-span-2 w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Nhập hình thức thi"
          />
          {errors.category_name && <p className="text-red-500 text-sm col-span-2 col-start-2">{errors.category_name.message}</p>}
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
