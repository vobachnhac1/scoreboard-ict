import React, { useState } from "react";
import Button from "../../../components/Button";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import CustomCombobox from "../../../components/CustomCombobox";
import Utils from "../../../common/Utils";

const listCategory = [
  {
    id: 2,
    category_key: "QU",
    category_name: "Quyền",
    description: "Thi quyền",
    created_at: "2025-04-29 17:53:37",
    updated_at: "2025-04-29 17:53:37",
  },
  {
    id: 1,
    category_key: "DK",
    category_name: "Đối kháng",
    description: "Thi đối kháng",
    created_at: "2025-04-29 17:53:37",
    updated_at: "2025-04-29 17:53:37",
  },
];

const listGroupEvent = [
  {
    id: 23,
    champ_event_id: "23",
    gender_commons_key: "F",
    created_at: "2025-04-29 18:08:26",
    updated_at: "2025-04-29 18:08:26",
    champ_grp_id: "1",
  },
  {
    id: 22,
    champ_event_id: "22",
    gender_commons_key: "M",
    created_at: "2025-04-29 18:08:26",
    updated_at: "2025-04-29 18:08:26",
    champ_grp_id: "1",
  },
  {
    id: 21,
    champ_event_id: "21",
    gender_commons_key: "F",
    created_at: "2025-04-29 18:08:26",
    updated_at: "2025-04-29 18:08:26",
    champ_grp_id: "1",
  },
  {
    id: 20,
    champ_event_id: "20",
    gender_commons_key: "F",
    created_at: "2025-04-29 18:08:26",
    updated_at: "2025-04-29 18:08:26",
    champ_grp_id: "1",
  },
  {
    id: 19,
    champ_event_id: "19",
    gender_commons_key: "F",
    created_at: "2025-04-29 18:08:26",
    updated_at: "2025-04-29 18:08:26",
    champ_grp_id: "1",
  },
  {
    id: 18,
    champ_event_id: "18",
    gender_commons_key: "F",
    created_at: "2025-04-29 18:08:26",
    updated_at: "2025-04-29 18:08:26",
    champ_grp_id: "1",
  },
  {
    id: 17,
    champ_event_id: "17",
    gender_commons_key: "F",
    created_at: "2025-04-29 18:08:26",
    updated_at: "2025-04-29 18:08:26",
    champ_grp_id: "1",
  },
  {
    id: 16,
    champ_event_id: "16",
    gender_commons_key: "F",
    created_at: "2025-04-29 18:08:26",
    updated_at: "2025-04-29 18:08:26",
    champ_grp_id: "1",
  },
  {
    id: 15,
    champ_event_id: "15",
    gender_commons_key: "F",
    created_at: "2025-04-29 18:08:26",
    updated_at: "2025-04-29 18:08:26",
    champ_grp_id: "1",
  },
  {
    id: 15,
    champ_event_id: "15",
    gender_commons_key: "F",
    created_at: "2025-04-29 18:08:26",
    updated_at: "2025-04-29 18:08:26",
    champ_grp_id: "1",
  },
  {
    id: 15,
    champ_event_id: "15",
    gender_commons_key: "F",
    created_at: "2025-04-29 18:08:26",
    updated_at: "2025-04-29 18:08:26",
    champ_grp_id: "1",
  },
  {
    id: 15,
    champ_event_id: "15",
    gender_commons_key: "F",
    created_at: "2025-04-29 18:08:26",
    updated_at: "2025-04-29 18:08:26",
    champ_grp_id: "1",
  },
  {
    id: 15,
    champ_event_id: "15",
    gender_commons_key: "F",
    created_at: "2025-04-29 18:08:26",
    updated_at: "2025-04-29 18:08:26",
    champ_grp_id: "1",
  },
  {
    id: 15,
    champ_event_id: "15",
    gender_commons_key: "F",
    created_at: "2025-04-29 18:08:26",
    updated_at: "2025-04-29 18:08:26",
    champ_grp_id: "1",
  },
];

export default function ChampionGroupEvent() {
  const [selectedGroupEvent, setSelectedGroupEvent] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const togglePlan = (plan) => {
    setSelectedGroupEvent((prev) => (prev.includes(plan) ? prev.filter((p) => p !== plan) : [...prev, plan]));
  };

  return (
    <div className="bg-white rounded-lg p-3 shadow-md">
      {/* Combobox Dropdown */}
      <div className="mb-2 w-full">
        <CustomCombobox
          data={listCategory}
          selectedData={selectedCategory}
          onChange={setSelectedCategory}
          placeholder="Vui lòng chọn hình thức thi"
          keyShow={"category_name"}
        />
      </div>

      <div className="flex items-center justify-end gap-2 mb-4">
        <Button variant="primary" className="min-w-28">
          XUẤT FILE ĐĂNG KÝ MẪU
        </Button>
        <Button variant="primary" className="min-w-28">
          Lưu
        </Button>
      </div>

      <div className="w-full">
        <div className="w-full space-y-2 overflow-y-auto" style={{ height: "calc(100vh - 280px)" }}>
          {listGroupEvent.map((plan, i) => {
            const isSelected = selectedGroupEvent.includes(plan);
            return (
              <div
                key={i}
                onClick={() => togglePlan(plan)}
                className={`group relative flex items-center cursor-pointer rounded-lg border p-3 shadow-sm transition
                ${isSelected ? "border-primary bg-primary/5" : "border-gray-300 bg-white hover:bg-gray-50"}`}
              >
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-primary font-semibold mr-2">{i + 1}</div>
                <div className="flex w-full items-center justify-between">
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900">{plan.name}</p>
                    <div className="flex gap-2 text-gray-500 text-sm mt-1">
                      <span>champ_event_id: {plan.champ_event_id}</span>
                      <span aria-hidden="true">&middot;</span>
                      <span>{Utils.getGenderLabel(plan.gender_commons_key)}</span>
                    </div>
                  </div>
                  <CheckCircleIcon className={`size-6 text-primary transition ${isSelected ? "opacity-100" : "opacity-0"}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
