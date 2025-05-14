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
        {/* Tên giải */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="tournament_name" className="text-sm font-medium text-gray-700">
            Tên giải
          </label>
          <input
            readOnly={loadingButton}
            id="tournament_name"
            {...register("tournament_name", { required: "Tên giải là bắt buộc" })}
            type="text"
            className="form-input col-span-2 w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Nhập tên giải"
          />
          {errors.tournament_name && <p className="text-red-500 text-sm col-span-2 col-start-2">{String(errors.tournament_name.message)}</p>}
        </div>

        {/* Nhóm thi */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="group_name" className="text-sm font-medium text-gray-700">
            Nhóm thi
          </label>
          <input
            readOnly={loadingButton}
            id="group_name"
            {...register("group_name", { required: "Nhóm thi là bắt buộc" })}
            type="text"
            className="form-input col-span-2 w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Nhập nhóm thi"
          />
          {errors.group_name && <p className="text-red-500 text-sm col-span-2 col-start-2">{String(errors.group_name.message)}</p>}
        </div>

        {/* Hình thức */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="format" className="text-sm font-medium text-gray-700">
            Hình thức
          </label>
          <input
            readOnly={loadingButton}
            id="format"
            {...register("format", { required: "Hình thức là bắt buộc" })}
            type="text"
            className="form-input col-span-2 w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Nhập hình thức"
          />
          {errors.format && <p className="text-red-500 text-sm col-span-2 col-start-2">{String(errors.format.message)}</p>}
        </div>

        {/* Nội dung */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="content" className="text-sm font-medium text-gray-700">
            Nội dung
          </label>
          <input
            readOnly={loadingButton}
            id="content"
            {...register("content", { required: "Nội dung là bắt buộc" })}
            type="text"
            className="form-input col-span-2 w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Nhập nội dung"
          />
          {errors.content && <p className="text-red-500 text-sm col-span-2 col-start-2">{String(errors.content.message)}</p>}
        </div>

        {/* Đơn vị */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="organization" className="text-sm font-medium text-gray-700">
            Đơn vị
          </label>
          <input
            readOnly={loadingButton}
            id="organization"
            {...register("organization", { required: "Đơn vị là bắt buộc" })}
            type="text"
            className="form-input col-span-2 w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Nhập đơn vị"
          />
          {errors.organization && <p className="text-red-500 text-sm col-span-2 col-start-2">{String(errors.organization.message)}</p>}
        </div>

        {/* Vị trí */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="position" className="text-sm font-medium text-gray-700">
            Vị trí
          </label>
          <input
            readOnly={loadingButton}
            id="position"
            {...register("position", { required: "Vị trí là bắt buộc" })}
            type="text"
            className="form-input col-span-2 w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Nhập vị trí"
          />
          {errors.position && <p className="text-red-500 text-sm col-span-2 col-start-2">{String(errors.position.message)}</p>}
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
