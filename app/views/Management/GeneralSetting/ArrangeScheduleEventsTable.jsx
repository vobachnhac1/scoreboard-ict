import React, { useEffect, useState } from "react";
import CustomTable from "../../../components/CustomTable";
import Button from "../../../components/Button";
import { useAppDispatch, useAppSelector } from "../../../config/redux/store";

export default function ArrangeScheduleEventsTable({ data }) {
  const dispatch = useAppDispatch();
  // @ts-ignore
  // const { data: champions, loading } = useAppSelector((state) => state.champions);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const columns = [
    {
      title: "STT",
      key: "order",
      align: "center",
    },
    { title: "Nội dung thi", key: "noi_dung", className: "text-nowrap" },
    { title: "Loại", key: "loai" },
    { title: "Thứ tự", key: "thu_tu" },
  ];

  return (
    <div className="w-full h-auto overflow-auto">
      {/* <div style={{ marginTop: 42 }} /> */}
      <CustomTable columns={columns} data={data} loading={loading} page={page} onPageChange={setPage} />
    </div>
  );
}
