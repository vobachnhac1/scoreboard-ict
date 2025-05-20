import React, { useEffect, useState } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import classNames from "classnames";
import Button from "../../../components/Button";
import { useAppDispatch } from "../../../config/redux/store";
import ArrangeScheduleEventsTable from "./ArrangeScheduleEventsTable";
import ArrangeSchedulePreviewTable from "./ArrangeSchedulePreviewTable";
import { getAllChampGroups, getCommonCategoryByKey } from "../../../config/apis";

export default function ArrangeSchedule() {
  const dispatch = useAppDispatch();
  // @ts-ignore
  // const { data: champions, loading } = useAppSelector((state) => state.champions);

  const [dataEvents, setDataEvents] = useState([]);
  const [dataPreview, setDataPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [openActions, setOpenActions] = useState(null);

  const [groups, setGroups] = useState([]);
  const [commonsGender, setCommonGender] = useState([]);
  const [eventOptions, setEventOptions] = useState([]);
  const [search, setSearch] = useState({
    group: "",
    gender: "",
    event: "",
  });

  // Fetch group and gender options
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resChampGroups, resCommonsGender] = await Promise.all([getAllChampGroups(), getCommonCategoryByKey("gender")]);
        setGroups(resChampGroups.data);
        setCommonGender(resCommonsGender.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    };
    fetchData();
  }, []);

  // useEffect(() => {
  //   const fetchEvents = async () => {
  //     if (search.group && search.gender) {
  //       try {
  //         const res = await getAllChampEventsByChamp({ groupId: search.group, gender: search.gender });
  //         setEventOptions(res.data || []);
  //       } catch (error) {
  //         setEventOptions([]);
  //       }
  //     } else {
  //       setEventOptions([]);
  //     }
  //   };
  //   fetchEvents();
  // }, [search.group, search.gender]);

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

  const handleSelectChange = (e) => {
    const { id, value } = e.target;
    setSearch((prev) => ({ ...prev, [id]: value }));
    if (id === "group" || id === "gender") {
      setSearch((prev) => ({ ...prev, event: "" }));
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    // Replace with real API call if available
    // Example: const res = await getEvents({ group: search.group, gender: search.gender, event: search.event });
    setTimeout(() => {
      const filteredEvents = Array.from({ length: 10 }, (_, i) => {
        const index = i + 1 + (page - 1) * 10;
        return {
          id: index,
          order: index,
          noi_dung: `Nội dung ${index}`,
          loai: index % 2 === 0 ? "Cá nhân" : "Đồng đội",
          thu_tu: index,
        };
      });
      setDataEvents(filteredEvents);
      setLoading(false);
    }, 500);
  };

  const RenderContent = () => {
    return (
      <div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 mb-2">
            {/* Chọn nhóm thi */}
            <select
              id="group"
              value={search.group}
              onChange={handleSelectChange}
              className="form-select col-span-2 min-w-36 px-3 py-2 border rounded-md text-sm"
              aria-placeholder="Vui lòng chọn loại"
            >
              <option value="">Nhóm thi</option>
              {groups.map((item, i) => (
                <option key={i} value={item?.id}>
                  {item?.name}
                </option>
              ))}
            </select>

            {/* Chọn giới tính */}
            <select
              id="gender"
              value={search.gender}
              onChange={handleSelectChange}
              className="form-select col-span-2 min-w-36 px-3 py-2 border rounded-md text-sm"
              aria-placeholder="Vui lòng chọn loại"
            >
              <option value="">Giới tính</option>
              {commonsGender.map((item, i) => (
                <option key={i} value={item?.key}>
                  {item?.value}
                </option>
              ))}
            </select>

            {/* Chọn nội dung theo giải đấu */}
            <select
              id="event"
              value={search.event}
              onChange={handleSelectChange}
              className="form-select col-span-2 min-w-48 px-3 py-2 border rounded-md text-sm"
              aria-placeholder="Vui lòng chọn loại"
              disabled={!search.group || !search.gender || eventOptions.length === 0}
            >
              <option value="">Nội dung theo giải đấu</option>
              {eventOptions.map((item, i) => (
                <option key={i} value={item?.id}>
                  {item?.category_name}
                </option>
              ))}
            </select>
            <Button onClick={handleSearch}>Tìm kiếm</Button>
          </div>
          <div className="flex justify-end items-center gap-2">
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
