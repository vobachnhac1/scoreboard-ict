import React, { useMemo } from 'react';
import CustomTable from '../../components/Table';
import { useTranslation } from 'react-i18next';

const Fist = ({ sheetOptions }) => {
  const { t } = useTranslation();
  const data = [
    {
      match: 1,
      type: 'Đồng đội',
      unit: 'Đơn vị',
      score_1: 100,
      score_2: 100,
      score_3: 100,
      score_4: 100,
      score_5: 100,
      total: 100,
      rank: 1
    },
    {
      match: 2,
      type: 'Đồng đội',
      unit: 'Đơn vị',
      score_1: 100,
      score_2: 100,
      score_3: 100,
      score_4: 100,
      score_5: 100,
      total: 100,
      rank: 2
    }
  ];
  const columns = useMemo(
    () => [
      {
        key: 'index',
        title: 'common_index',
        renderRow: (_, index = 0) => (
          <td className="px-3 text-center text-sm font-medium sm:w-auto sm:max-w-none border">{index + 1}.</td>
        )
      },
      {
        key: 'match',
        title: 'match',
        className: 'max-w-0 py-4 pl-4 pr-3 text-sm font-medium sm:w-auto sm:max-w-none'
      },
      {
        key: 'type',
        title: 'match_type'
      },
      {
        key: 'unit',
        title: 'unit'
      },
      {
        key: 'score_1',
        title: 'score_1'
      },
      {
        key: 'score_2',
        title: 'score_2'
      },
      {
        key: 'score_3',
        title: 'score_3'
      },
      {
        key: 'score_4',
        title: 'score_4'
      },
      {
        key: 'score_5',
        title: 'score_5'
      },
      {
        key: 'total',
        title: 'total_score'
      },
      {
        key: 'rank',
        title: 'rank'
      },
      {
        key: 'actions',
        renderRow: () => (
          <td className="px-3 py-4 text-center text-sm font-medium sm:w-auto sm:max-w-none flex gap-3 items-center justify-center">
            <button className="bg-blue-500 text-white hover:bg-blue-400 py-1 px-3 rounded-md text-base">Sửa</button>
            <button className="bg-red-500 text-white hover:bg-red-400 py-1 px-3 rounded-md text-base">Xóa</button>
          </td>
        )
      }
    ],
    []
  );

  const unitData = [
    {
      id: 1,
      fullname: 'Nguyễn Văn A',
      unit: 'Đơn vị'
    },
    {
      id: 2,
      fullname: 'Nguyễn Văn A',
      unit: 'Đơn vị'
    }
  ];

  const unitColumns = useMemo(
    () => [
      {
        key: 'index',
        title: 'common_index',
        renderRow: (_, index = 0) => (
          <td className="px-3 text-center text-sm font-medium sm:w-auto sm:max-w-none border">{index + 1}.</td>
        )
      },
      {
        key: 'fullname',
        title: 'fullname'
      },
      {
        key: 'unit',
        title: 'unit'
      },
      {
        key: 'actions',
        renderRow: () => (
          <td className="px-3 py-4 text-center text-sm font-medium sm:w-auto sm:max-w-none flex gap-3 items-center justify-center">
            <button className="bg-blue-500 text-white hover:bg-blue-400 py-1 px-3 rounded-md text-base">Sửa</button>
            <button className="bg-red-500 text-white hover:bg-red-400 py-1 px-3 rounded-md text-base">Xóa</button>
          </td>
        )
      }
    ],
    []
  );

  console.log(sheetOptions);

  return (
    <div className="border border-gray-500 p-6">
      <div className="w-full flex justify-between">
        <div className="flex gap-2">
          {sheetOptions.map((item, index) => (
            <button key={index} className="px-2 py-1 rounded-md bg-gray-300">
              {item}
            </button>
          ))}
        </div>

        <button className="text-white font-semibold bg-green-500 px-8 py-2 hover:bg-green-400">
          {t('export_file')}
        </button>
      </div>

      <div className="flex w-full justify-between gap-8">
        <div className="mt-4 w-1/2">
          <CustomTable rows={data} rowKey="match" columns={columns} />
        </div>

        <div className="mt-4 w-1/2">
          <div className="w-full bg-[#F7F7F7] border py-2 text-center">Danh sách đơn vị</div>
          <CustomTable rows={unitData} rowKey="id" columns={unitColumns} />
        </div>
      </div>
    </div>
  );
};

export default Fist;
