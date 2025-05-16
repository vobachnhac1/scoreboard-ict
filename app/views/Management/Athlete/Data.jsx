import React from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import classNames from "classnames";
import DataTotal from "./DataTotal";
import DataTotalAthleteList from "./DataTotalAthleteList";

export default function index() {
  return (
    <TabGroup>
      <TabList className="flex space-x-1 rounded-lg bg-white text-white p-1">
        {["Tổng hợp", "Bốc thăm", "Kiểm tra", "Thực hiện"].map((tab) => (
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
          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-4">
              <DataTotal />
            </div>
            <div className="col-span-2">
              <DataTotalAthleteList />
            </div>
          </div>
        </TabPanel>
        <TabPanel className="rounded-lg bg-white p-3 ring-1 ring-black/5">Bốc thăm</TabPanel>
        <TabPanel className="rounded-lg bg-white p-3 ring-1 ring-black/5">Kiểm tra</TabPanel>
        <TabPanel className="rounded-lg bg-white p-3 ring-1 ring-black/5">Thực hiện</TabPanel>
      </TabPanels>
    </TabGroup>
  );
}
