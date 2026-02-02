import React from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import Champion from "./Champion";
import ChampionGroup from "./ChampionGroup";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Index() {
  return (
    <TabGroup>
      <TabList className="flex space-x-1 rounded-lg bg-white dark:bg-gray-800 text-white p-1">
        {["Tên giải đấu", "Nhóm dự thi"].map((tab) => (
          <Tab
            key={tab}
            className={({ selected }) =>
              classNames(
                "min-w-52 rounded-md py-2.5 text-sm font-medium leading-5",
                "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400",
                selected
                  ? "bg-primary shadow"
                  : "text-black dark:text-white hover:bg-primary/[0.3] hover:text-white",
              )
            }
          >
            {tab}
          </Tab>
        ))}
      </TabList>
      <TabPanels className="mt-2">
        <TabPanel className="rounded-lg bg-white dark:bg-gray-800 p-3 ring-1 ring-black/5 dark:ring-gray-700 h-fit">
          <Champion />
        </TabPanel>
        <TabPanel className="rounded-lg bg-white dark:bg-gray-800 p-3 ring-1 ring-black/5 dark:ring-gray-700">
          <ChampionGroup />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
}
