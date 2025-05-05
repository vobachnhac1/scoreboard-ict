import React, { useMemo } from 'react';
import CustomTable from '../../components/Table';

const Instruction = () => {
  const data = [
    {
      screen: 'Đối kháng',
      feature: 'Xanh: +1',
      key_combination: 'Q'
    },
    {
      screen: 'Đối kháng',
      feature: 'Xanh: +1',
      key_combination: 'W'
    },
    {
      screen: 'Đối kháng',
      feature: 'Xanh: +1',
      key_combination: 'E'
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
        key: 'screen',
        title: 'screen',
        className: 'max-w-0 py-4 pl-4 pr-3 text-sm font-medium sm:w-auto sm:max-w-none'
      },
      {
        key: 'feature',
        title: 'feature'
      },
      {
        key: 'key_combination',
        title: 'key_combination'
      }
    ],
    []
  );
  return (
    <div className="border border-gray-500 p-6">
      <div className="flex w-full justify-between gap-8">
        <div className="mt-4 w-1/2">
          <CustomTable rows={data} rowKey="match" columns={columns} />
        </div>

        <div className="mt-4 w-1/2">
          <CustomTable rows={data} rowKey="id" columns={columns} />
        </div>
      </div>
    </div>
  );
};

export default Instruction;
