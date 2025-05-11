import React, { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Constants, LIST_CHAMPION_STATUS } from "../../../../common/Constants";
import { useAppDispatch } from "../../../../config/redux/store";
import Button from "../../../../components/Button";
import { addChampion, updateAndRefreshChampion } from "../../../../config/redux/controller/championSlice";

export default function ChampionForm({ type, data = null, onAgree, onGoBack }) {
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
    setLoadingButton(true);
    if (type === Constants.ACCTION_INSERT) {
      dispatch(addChampion(formData))
        .unwrap()
        .then(() => {
          setLoadingButton(false);
          onAgree(formData);
        })
        .catch((error) => {
          setLoadingButton(false);
          console.error("Lỗi khi thêm mới:", error);
        });
    } else if (type === Constants.ACCTION_UPDATE) {
      // @ts-ignore
      dispatch(updateAndRefreshChampion({ id: data.id, formData }))
        .unwrap()
        .then(() => {
          setLoadingButton(false);
          onAgree(formData);
        })
        .catch((error) => {
          setLoadingButton(false);
          console.error("Lỗi khi cập nhật:", error);
        });
    }
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

        {/* Ngày bắt đầu */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="start_date" className="text-sm font-medium text-gray-700">
            Ngày bắt đầu
          </label>
          <input
            readOnly={loadingButton}
            id="start_date"
            {...register("start_date", { required: "Ngày bắt đầu là bắt buộc" })}
            type="date"
            className="form-input col-span-2 w-full px-3 py-2 border rounded-md text-sm"
          />
          {errors.start_date && <p className="text-red-500 text-sm col-span-2 col-start-2">{String(errors.start_date.message)}</p>}
        </div>

        {/* Ngày kết thúc */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="end_date" className="text-sm font-medium text-gray-700">
            Ngày kết thúc
          </label>
          <input
            readOnly={loadingButton}
            id="end_date"
            {...register("end_date", { required: "Ngày kết thúc là bắt buộc" })}
            type="date"
            className="form-input col-span-2 w-full px-3 py-2 border rounded-md text-sm"
          />
          {errors.end_date && <p className="text-red-500 text-sm col-span-2 col-start-2">{String(errors.end_date.message)}</p>}
        </div>

        {/* Địa điểm */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="location" className="text-sm font-medium text-gray-700">
            Địa điểm
          </label>
          <input
            readOnly={loadingButton}
            id="location"
            {...register("location", { required: "Địa điểm là bắt buộc" })}
            type="text"
            className="form-input col-span-2 w-full px-3 py-2 border rounded-md text-sm"
          />
          {errors.location && <p className="text-red-500 text-sm col-span-2 col-start-2">{String(errors.location.message)}</p>}
        </div>

        {/* Số lượng trọng tài */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="num_judges" className="text-sm font-medium text-gray-700">
            Số lượng trọng tài
          </label>
          <input
            readOnly={loadingButton}
            id="num_judges"
            {...register("num_judges", { required: "Bắt buộc", valueAsNumber: true })}
            type="number"
            className="form-input col-span-2 w-full px-3 py-2 border rounded-md text-sm"
          />
          {errors.num_judges && <p className="text-red-500 text-sm col-span-2 col-start-2">{String(errors.num_judges.message)}</p>}
        </div>

        {/* Số lượng vận động viên */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="num_athletes" className="text-sm font-medium text-gray-700">
            Số lượng VĐV
          </label>
          <input
            readOnly={loadingButton}
            id="num_athletes"
            {...register("num_athletes", { required: "Bắt buộc", valueAsNumber: true })}
            type="number"
            className="form-input col-span-2 w-full px-3 py-2 border rounded-md text-sm"
          />
          {errors.num_athletes && <p className="text-red-500 text-sm col-span-2 col-start-2">{String(errors.num_athletes.message)}</p>}
        </div>

        {/* Trạng thái */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="status" className="text-sm font-medium text-gray-700">
            Trạng thái
          </label>
          <select
            disabled={loadingButton}
            id="status"
            {...register("status", { required: "Trạng thái là bắt buộc" })}
            className="form-select col-span-2 w-full px-3 py-2 border rounded-md text-sm"
          >
            {LIST_CHAMPION_STATUS.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
          {errors.status && <p className="text-red-500 text-sm col-span-2 col-start-2">{String(errors.status.message)}</p>}
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
