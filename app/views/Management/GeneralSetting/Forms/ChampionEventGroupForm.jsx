import React, { Fragment, useEffect } from "react";
import { useForm } from "react-hook-form";
import Button from "../../../../components/Button";
import { Constants } from "../../../../common/Constants";
import { addChampionEventGroup, updateChampionEventGroup } from "../../../../config/redux/controller/championEventGroupSlice";
import { getAllChampEvents, getAllChampGroups, getAllCommonCategoryKeys } from "../../../../config/apis";
import { useAppDispatch } from "../../../../config/redux/store";

export default function ChampionEventCategoryForm({ id, type, data = null, onAgree, onGoBack }) {
  const dispatch = useAppDispatch();
  const [groups, setGroups] = React.useState([]);
  const [events, setEvents] = React.useState([]);
  const [commonsKey, setCommonKey] = React.useState([]);
  const [loadingButton, setLoadingButton] = React.useState(false);
  const defaultValues = {
    champ_grp_id: id,
    champ_event_id: "",
    gender_commons_key: "",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ defaultValues });

  useEffect(() => {
    getDataSelect();
  }, []);

  const getDataSelect = async () => {
    try {
      const [resChampGroups, resChampEvents, resCommonsKey] = await Promise.all([getAllChampGroups(), getAllChampEvents(), getAllCommonCategoryKeys()]);
      setGroups(resChampGroups.data);
      setEvents(resChampEvents.data);
      setCommonKey(resCommonsKey.data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    }
  };

  // Reset form khi có đủ data và danh sách chọn
  useEffect(() => {
    if (data && groups.length && events.length && commonsKey.length) {
      reset({
        champ_grp_id: data.champ_grp_id ?? id,
        champ_event_id: data.champ_event_id,
        gender_commons_key: data.gender_commons_key,
      });
    } else if (!data && groups.length && events.length && commonsKey.length) {
      reset({
        champ_grp_id: id,
        champ_event_id: "",
        gender_commons_key: "",
      });
    }
  }, [data, id, groups, events, commonsKey]);

  const onSubmit = (formData) => {
    formData = {
      champ_event_id: formData.champ_event_id,
      champ_grp_id: formData.champ_grp_id,
      gender_commons_key: formData.gender_commons_key,
    };
    setLoadingButton(true);
    if (type === Constants.ACCTION_INSERT) {
      // @ts-ignore
      dispatch(addChampionEventGroup({ formData }))
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
      dispatch(updateChampionEventGroup({ formData, id: data.champ_grp_event_id }))
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
            <option value="">-- Vui lòng chọn --</option>
            {events.map((item, i) => (
              <option key={i} value={item?.id}>
                {item?.event_name}
              </option>
            ))}
          </select>
          {errors.champ_event_id && <p className="text-red-500 text-sm col-span-2 col-start-2">{String(errors.champ_event_id.message)}</p>}
        </div>

        {/* Loại */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="gender_commons_key" className="text-sm font-medium text-gray-700">
            Loại
          </label>
          <select
            defaultValue={""}
            disabled={loadingButton}
            id="gender_commons_key"
            {...register("gender_commons_key", { required: "Loại là bắt buộc" })}
            className="form-select col-span-2 w-full px-3 py-2 border rounded-md text-sm"
            aria-placeholder="Vui lòng chọn loại"
          >
            <option value="">-- Vui lòng chọn --</option>
            {commonsKey.map((item, i) => (
              <option key={i} value={item.key}>
                {item.value}
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
