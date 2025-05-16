import React, { useEffect, useState } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import classNames from "classnames";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import { useAppDispatch } from "../../../config/redux/store";
import ArrangeScheduleEventsTable from "./ArrangeScheduleEventsTable";
import ArrangeSchedulePreviewTable from "./ArrangeSchedulePreviewTable";

export default function ArrangeSchedule() {
  const dispatch = useAppDispatch();
  // @ts-ignore
  // const { data: champions, loading } = useAppSelector((state) => state.champions);

  const [dataEvents, setDataEvents] = useState([]);
  const [dataPreview, setDataPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [openActions, setOpenActions] = useState(null);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const fakeEvents = Array.from({ length: 10 }, (_, i) => {
        const index = i + 1 + (page - 1) * 10;
        return {
          id: index,
          order: index,
          noi_dung: `Nội dung ${index}`,
          loai: index % 2 === 0 ? "Cá nhân" : "Đồng đội",
          thu_tu: index,
        };
      });
      const fakePrivew = Array.from({ length: 3 }, (_, i) => {
        const index = i + 1 + (page - 1) * 3;
        return {
          id: index,
          order: index,
          don_vi: `Đơn vị ${index}`,
          noi_dung: `Nội dung ${index}`,
        };
      });
      setDataEvents(fakeEvents);
      setDataPreview(fakePrivew);
      setLoading(false);
    }, 500);
  }, [page]);

  const RenderContent = () => {
    return (
      <div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 mb-2">
            {/* Chọn nhóm thi */}
            <select
              defaultValue={""}
              id="gender_commons_key"
              className="form-select col-span-2 min-w-36 px-3 py-2 border rounded-md text-sm"
              aria-placeholder="Vui lòng chọn loại"
            >
              <option value="">Nhóm thi</option>
              {[1, 2, 3].map((item, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>

            {/* Chọn giới tính */}
            <select
              defaultValue={""}
              id="gender_commons_key"
              className="form-select col-span-2 min-w-36 px-3 py-2 border rounded-md text-sm"
              aria-placeholder="Vui lòng chọn loại"
            >
              <option value="">Giới tính</option>
              {[1, 2, 3].map((item, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
            {/* Nội dung thi đấu */}
            <select
              defaultValue={""}
              id="gender_commons_key"
              className="form-select col-span-2 min-w-36 px-3 py-2 border rounded-md text-sm"
              aria-placeholder="Vui lòng chọn loại"
            >
              <option value="">Nội dung thi đấu</option>
              {[1, 2, 3].map((item, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
            <Input className="!rounded-md !border-black !p-2 !py-1.5" placeholder="Tìm kiếm" />
            <Button
              onClick={() => {
                console.log("search:");
              }}
            >
              Tìm kiếm
            </Button>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="primary"
              className="min-w-24"
              onClick={() => {
                console.log("Lưu:");
              }}
            >
              Lưu
            </Button>
            <Button
              variant="primary"
              className="min-w-24"
              onClick={() => {
                console.log("Xuất:");
              }}
            >
              Xuất
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-6 gap-4">
          <div className="col-span-2">
            <ArrangeScheduleEventsTable data={dataEvents} />
          </div>
          <div className="col-span-4">
            <div className="h-[44.5px] bg-[#CDEB8B] font-semibold flex justify-center items-center mb-0.5 rounded-t-xl">Xem trước</div>
            {[1, 2].map((e, i) => (
              <ArrangeSchedulePreviewTable data={dataPreview} order={i + 1} />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <TabGroup>
      <TabList className="flex space-x-1 rounded-lg bg-white text-white p-1">
        {["Đối kháng", "Quyền"].map((tab) => (
          <Tab
            key={tab}
            className={({ selected }) =>
              classNames(
                "min-w-32 rounded-md py-2.5 text-sm font-medium leading-5",
                "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400",
                selected ? "bg-primary shadow" : "text-black hover:bg-primary/[0.3] hover:text-white"
              )
            }
          >
            {tab}
          </Tab>
        ))}
      </TabList>
      <TabPanels className="mt-2">
        <TabPanel className="rounded-lg bg-white p-3 ring-1 ring-black/5 h-fit">
          <RenderContent />
        </TabPanel>
        <TabPanel className="rounded-lg bg-white p-3 ring-1 ring-black/5">
          <RenderContent />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
}
