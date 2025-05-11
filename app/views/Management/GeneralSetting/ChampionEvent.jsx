import React from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import ChampionEventCategory from "./ChampionEventCategory";
import ChampionEventGroup from "./ChampionEventGroup";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ChampionEvent() {
  return (
    <TabGroup>
      <TabList className="flex space-x-1 rounded-lg bg-white text-white p-1">
        {["Nội dung theo hình thức", "Nội dung theo nhóm thi"].map((tab) => (
          <Tab
            key={tab}
            className={({ selected }) =>
              classNames(
                "min-w-52 rounded-md py-2.5 text-sm font-medium leading-5",
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
          <ChampionEventCategory />
        </TabPanel>
        <TabPanel className="rounded-lg bg-white p-3 ring-1 ring-black/5">
          <ChampionEventGroup />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
}
