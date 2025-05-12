import React, { Fragment, useEffect } from "react";
import { useForm } from "react-hook-form";
import Button from "../../../../components/Button";
import { Constants } from "../../../../common/Constants";
import { useAppDispatch, useAppSelector } from "../../../../config/redux/store";
import { addChampionGroup, updateChampionGroup } from "../../../../config/redux/controller/championGroupSlice";
import { fetchChampions } from "../../../../config/redux/controller/championSlice";

export default function ChampionGroupForm({ type, data = null, onAgree, onGoBack }) {
  const dispatch = useAppDispatch();
  // @ts-ignore
  const { champions, loading: LoadingChamp } = useAppSelector((state) => state.champions);
  const [loadingButton, setLoadingButton] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();

  useEffect(() => {
    if (champions.length === 0) {
      dispatch(fetchChampions());
    }
    if (data) {
      reset(data);
      setValue("tournament_id", data.tournament_id);
    }
  }, [data, reset, setValue, champions.length, dispatch]);

  const onSubmit = (formData) => {
    formData = {
      name: formData.name,
      description: formData.description,
      tournament_id: formData.tournament_id,
    };
    setLoadingButton(true);
    if (type === Constants.ACCTION_INSERT) {
      // @ts-ignore
      dispatch(addChampionGroup({ formData }))
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
      dispatch(updateChampionGroup({ id: data.id, formData }))
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Giải đấu */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="tournament_id" className="text-sm font-medium text-gray-700">
            Giải đấu
          </label>
          <select
            // disabled
            id="tournament_id"
            {...register("tournament_id", { required: "Giải đấu là bắt buộc" })}
            className="form-select col-span-2 w-full px-3 py-2 border rounded-md text-sm"
          >
            {champions.map((item, i) => (
              <option key={i} value={item?.id}>
                {item?.tournament_name}
              </option>
            ))}
          </select>
          {errors.tournament_id && <p className="text-red-500 text-sm col-span-2 col-start-2">{String(errors.tournament_id.message)}</p>}
        </div>
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
          {errors.name && <p className="text-red-500 text-sm col-span-2 col-start-2">{String(errors.name.message)}</p>}
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
