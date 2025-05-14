import React, { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Constants, LIST_CHAMPION_STATUS } from "../../../../common/Constants";
import { useAppDispatch } from "../../../../config/redux/store";
import Button from "../../../../components/Button";

export default function DataForm({ type, data = null, onAgree, onGoBack }) {
  const dispatch = useAppDispatch();
  const [loadingButton, setLoadingButton] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: data,
  });

  useEffect(() => {
    if (data) {
      reset(data);
    }
  }, [data, reset]);

  const onSubmit = (formData) => {
    console.log(formData);
  };

  return (
    <Fragment>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        {/* Họ tên */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
            Họ tên
          </label>
          <input
            readOnly={loadingButton}
            id="fullName"
            {...register("fullName", { required: "Họ tên là bắt buộc" })}
            type="text"
            className="form-input col-span-2 w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Nhập họ tên"
          />
          {errors.fullName && <p className="text-red-500 text-sm col-span-2 col-start-2">{String(errors.fullName.message)}</p>}
        </div>

        {/* Năm sinh */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="year" className="text-sm font-medium text-gray-700">
            Năm sinh
          </label>
          <input
            readOnly={loadingButton}
            id="year"
            {...register("year", { required: "Năm sinh là bắt buộc" })}
            type="text"
            className="form-input col-span-2 w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Nhập năm sinh"
          />
          {errors.year && <p className="text-red-500 text-sm col-span-2 col-start-2">{String(errors.year.message)}</p>}
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
