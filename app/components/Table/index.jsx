import { Empty } from "antd";
import React from "react";
import { useTranslation } from "react-i18next";

const CustomTable = ({ columns, rows, isLoading = false, rowKey }) => {
  const { t } = useTranslation("");

  const renderType = {
    empty: (
      <tr>
        <th colSpan={columns.length}>
          <Empty className="text-white" description={t("no_data_found")} />
        </th>
      </tr>
    ),

    data: (
      <>
        {rows.map((row, index) => (
          <tr key={`${row[rowKey]}_${index}`}>
            {columns.map((col) =>
              col.renderRow ? (
                col.renderRow(row, index)
              ) : (
                <td key={col.key} className={`${col.className || ""} px-3 py-4 border text-sm`}>
                  {row[col.key]}
                </td>
              )
            )}
          </tr>
        ))}
      </>
    ),
  };

  const renderTable = () => {
    if (isLoading) {
      return renderType.loading;
    }
    if (!rows?.length) {
      return renderType.empty;
    }
    return renderType.data;
  };

  return (
    <>
      <table className="border-tools-table-outline w-full min-w-full table-auto border-spacing-0 rounded-xl border-1 border-transparent bg-[#F7F7F7] text-left">
        <thead className=" bg-[#F7F7F7]">
          <tr className="rounded-xl px-4">
            {columns.map((col) => (
              <td
                key={col.key}
                className={`${col.headerCenter && "text-center"} px-3 py-3.5 text-sm font-semibold text-header-row first-of-type:text-center border`}
              >
                {t(col.title)}
              </td>
            ))}
          </tr>
        </thead>
        <tbody className="!border !border-[#F1F1F1] bg-white pb-4 pt-2 dark">{renderTable()}</tbody>
      </table>
    </>
  );
};

export default CustomTable;
