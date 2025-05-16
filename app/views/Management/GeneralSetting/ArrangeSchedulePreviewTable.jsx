import React, { useEffect, useState } from "react";
import CustomTable from "../../../components/CustomTable";
import Button from "../../../components/Button";
import { useAppDispatch, useAppSelector } from "../../../config/redux/store";

export default function ArrangeSchedulePreviewTable({ data, order }) {
  const dispatch = useAppDispatch();
  // @ts-ignore
  // const { data: champions, loading } = useAppSelector((state) => state.champions);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const columnGroups = [
    {
      title: `Thập tự - Thứ tự ${order}`,
      colSpan: 3, // số lượng cột con
      children: [
        {
          title: "STT",
          key: "order",
          align: "center",
        },
        { title: "Nội dung thi", key: "don_vi", className: "text-nowrap" },
        { title: "Nội dung thi", key: "noi_dung", className: "text-nowrap" },
      ],
    },
  ];

  return (
    <div className="w-full h-auto overflow-auto">
      {/* <div style={{ marginTop: 42 }} /> */}
      <CustomTable rounded="rounded-none" columnGroups={columnGroups} data={data} loading={loading} onPageChange={setPage} page={null} />
    </div>
  );
}
