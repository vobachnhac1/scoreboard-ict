import React, { Fragment, useEffect } from "react";
import { useForm } from "react-hook-form";
import Button from "../../../../components/Button";
import { Constants, LIST_GENDER } from "../../../../common/Constants";
import { useAppDispatch, useAppSelector } from "../../../../config/redux/store";
import { fetchChampionEvents } from "../../../../config/redux/controller/championEventSlice";
import { fetchChampionGroups } from "../../../../config/redux/controller/championGroupSlice";
import { addAndRefreshChampionEventGroup, updateAndRefreshChampionEventGroups } from "../../../../config/redux/controller/championEventGroupSlice";

export default function ChampionEventCategoryForm({ id, type, data = null, onAgree, onGoBack }) {
  const dispatch = useAppDispatch();
  // @ts-ignore
  const { groups, loading: loadingGroups } = useAppSelector((state) => state.championGroups);
  // @ts-ignore
  const { events, loading: loadingEvents } = useAppSelector((state) => state.championEvents);
  const [loadingButton, setLoadingButton] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    if (events.length === 0) {
      dispatch(fetchChampionEvents());
    }
  }, [events.length]);

  // useEffect(() => {
  //   if (groups.length === 0) {
  //     dispatch(fetchChampionGroups());
  //   }
  // }, [groups.length]);

  useEffect(() => {
    if (data) {
      reset(data);
    }
  }, [data, reset]);

  const onSubmit = (formData) => {
    formData = {
      champ_event_id: formData.champ_event_id,
      champ_grp_id: formData.champ_grp_id,
      gender_commons_key: formData.gender_commons_key,
    };
    setLoadingButton(true);
    if (type === Constants.ACCTION_INSERT) {
      // @ts-ignore
      dispatch(addAndRefreshChampionEventGroup({ formData }))
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
      dispatch(updateAndRefreshChampionEventGroups({ formData, id: data.champ_grp_event_id }))
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
        {/* Nhóm thi */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="champ_grp_id" className="text-sm font-medium text-gray-700">
            Nhóm thi
          </label>
          <select
            disabled
            value={id}
            id="champ_grp_id"
            {...register("champ_grp_id", { required: "Nhóm thi là bắt buộc" })}
            className="form-select col-span-2 w-full px-3 py-2 border rounded-md text-sm"
          >
            {groups.map((item, i) => (
              <option key={i} value={item?.id}>
                {item?.name}
              </option>
            ))}
          </select>
          {errors.champ_grp_id && <p className="text-red-500 text-sm col-span-2 col-start-2">{String(errors.champ_grp_id.message)}</p>}
        </div>

        {/* Nội dung thi */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="champ_event_id" className="text-sm font-medium text-gray-700">
            Nội dung thi
          </label>
          <select
            disabled={loadingButton}
            id="champ_event_id"
            {...register("champ_event_id", { required: "Nội dung thi là bắt buộc" })}
            className="form-select col-span-2 w-full px-3 py-2 border rounded-md text-sm"
          >
            {events.map((item, i) => (
              <option key={i} value={item?.id}>
                {item?.event_name}
              </option>
            ))}
          </select>
          {errors.champ_event_id && <p className="text-red-500 text-sm col-span-2 col-start-2">{String(errors.champ_event_id.message)}</p>}
        </div>

        {/* Giới tính */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="gender_commons_key" className="text-sm font-medium text-gray-700">
            Giới tính
          </label>
          <select
            disabled={loadingButton}
            id="gender_commons_key"
            {...register("gender_commons_key", { required: "Giới tính là bắt buộc" })}
            className="form-select col-span-2 w-full px-3 py-2 border rounded-md text-sm"
          >
            {LIST_GENDER.map((item, i) => (
              <option key={i} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
          {errors.gender_commons_key && <p className="text-red-500 text-sm col-span-2 col-start-2">{String(errors.gender_commons_key.message)}</p>}
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
