import React, { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch } from "../../../config/redux/store";
import Button from "../../../components/Button";

export default function VovinamScoreForm({ type, data = null, onAgree, onGoBack }) {
  const dispatch = useAppDispatch();
  const [loadingButton, setLoadingButton] = useState(false);
  const defaultValues = data;
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: defaultValues,
  });

  useEffect(() => {
    if (data) {
      reset(data);
    }
  }, [data, reset]);

  const onSubmit = (formData) => {
    console.log("formData", formData);
    onAgree(formData);
  };

  return (
    <Fragment>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        {/*  Giám định 1 */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="referees_1" className="text-sm font-medium text-gray-700">
            Giám định 1
          </label>
          <input
            readOnly={loadingButton}
            id="referees_1"
            {...register("referees_1", { required: " Giám định là bắt buộc" })}
            type="text"
            className="form-input col-span-2 w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Nhập giám định"
          />
          {errors.referees_1 && <p className="text-red-500 text-sm col-span-2 col-start-2">{String(errors.referees_1.message)}</p>}
        </div>

        {/*  Giám định 2 */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="referees_2" className="text-sm font-medium text-gray-700">
            Giám định 2
          </label>
          <input
            readOnly={loadingButton}
            id="referees_2"
            {...register("referees_2", { required: " Giám định là bắt buộc" })}
            type="text"
            className="form-input col-span-2 w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Nhập giám định"
          />
          {errors.referees_2 && <p className="text-red-500 text-sm col-span-2 col-start-2">{String(errors.referees_2.message)}</p>}
        </div>

        {/*  Giám định 3 */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="referees_3" className="text-sm font-medium text-gray-700">
            Giám định 3
          </label>
          <input
            readOnly={loadingButton}
            id="referees_3"
            {...register("referees_3", { required: " Giám định là bắt buộc" })}
            type="text"
            className="form-input col-span-2 w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Nhập giám định"
          />
          {errors.referees_3 && <p className="text-red-500 text-sm col-span-2 col-start-2">{String(errors.referees_3.message)}</p>}
        </div>
        {/*  Giám định 4 */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="referees_4" className="text-sm font-medium text-gray-700">
            Giám định 4
          </label>
          <input
            readOnly={loadingButton}
            id="referees_4"
            {...register("referees_4", { required: " Giám định là bắt buộc" })}
            type="text"
            className="form-input col-span-2 w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Nhập giám định"
          />
          {errors.referees_4 && <p className="text-red-500 text-sm col-span-2 col-start-2">{String(errors.referees_4.message)}</p>}
        </div>
        {/*  Giám định 5 */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="referees_5" className="text-sm font-medium text-gray-700">
            Giám định 5
          </label>
          <input
            readOnly={loadingButton}
            id="referees_5"
            {...register("referees_5", { required: " Giám định là bắt buộc" })}
            type="text"
            className="form-input col-span-2 w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Nhập giám định"
          />
          {errors.referees_5 && <p className="text-red-500 text-sm col-span-2 col-start-2">{String(errors.referees_5.message)}</p>}
        </div>
        {/*  Giám định 6 */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="referees_6" className="text-sm font-medium text-gray-700">
            Giám định 6
          </label>
          <input
            readOnly={loadingButton}
            id="referees_6"
            {...register("referees_6", { required: " Giám định là bắt buộc" })}
            type="text"
            className="form-input col-span-2 w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Nhập giám định"
          />
          {errors.referees_6 && <p className="text-red-500 text-sm col-span-2 col-start-2">{String(errors.referees_6.message)}</p>}
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
