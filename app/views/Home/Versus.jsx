import React, { useMemo } from 'react';
import CustomTable from '../../components/Table';
import { useTranslation } from 'react-i18next';

const Versus = ({ listImages }) => {
  const { t } = useTranslation();
  const data = [
    {
      match: 1,
      type: 'Vòng loại',
      redArmor: 'Nguyen Van A',
      redUnit: 'Đơn vị',
      blueArmor: 'Nguyen Van B',
      blueUnit: 'Đơn vị',
      whoWin: 'Nguyen Van A',
      isWin: true
    },
    {
      match: 2,
      type: 'Vòng loại',
      redArmor: 'Nguyen Van A',
      redUnit: 'Đơn vị',
      blueArmor: 'Nguyen Van B',
      blueUnit: 'Đơn vị',
      whoWin: 'Nguyen Van B',
      isWin: false
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
        key: 'redArmor',
        title: 'red_armor_name'
      },
      {
        key: 'redUnit',
        title: 'red_unit'
      },
      {
        key: 'blueArmor',
        title: 'blue_armor_name'
      },
      {
        key: 'blueUnit',
        title: 'blue_unit'
      },
      {
        key: 'isWin',
        title: 'is_win'
      }
    ],
    []
  );

  console.log(listImages);

  const handleDownload = () => {
    // Đường dẫn đến file mẫu trong thư mục public
    const fileUrl = '../../assets/sample.xlsx';

    // Tạo một thẻ <a> tạm thời để tải file
    const link = document.createElement('a');
    link.href = fileUrl;
    link.setAttribute('download', 'sample.xlsx'); // Tên file sẽ lưu về máy

    // Tự động click vào thẻ <a> để tải file
    document.body.appendChild(link);
    link.click();

    // Sau khi tải xong, xóa thẻ <a> để dọn dẹp
    document.body.removeChild(link);
  };

  return (
    <div className="border border-gray-500 p-6">
      <div className="w-full flex justify-between">
        <div className="flex gap-2">
          {['Nhóm 1 Nam', 'Nhóm 2 Nam', 'Nhóm 1 Nữ', 'Nhóm 2 Nữ'].map((item, index) => (
            <button key={index} className="px-2 py-1 rounded-md bg-gray-300">
              {item}
            </button>
          ))}
        </div>

        <button className="text-white font-semibold bg-green-500 px-8 py-2 hover:bg-green-400" onClick={handleDownload}>
          {t('export_file')}
        </button>
      </div>

      <div className="flex w-full justify-between gap-8">
        <div className="mt-4 w-1/2">
          <CustomTable rows={data} rowKey="match" columns={columns} />
        </div>

        <div className="mt-4 w-1/2">
          <div className="flex justify-center">
            {/* Hình A */}
            <div className="w-1/3">
              <div className="border border-gray-400 border-r-0">
                <img src={listImages[0]} className="w-full max-h-[117px] object-cover" alt="Hình A" />
              </div>
            </div>

            {/* Content */}
            <div className="w-1/3">
              <table>
                <thead>
                  <tr>
                    <td className="px-4 py-2 border border-red-500 bg-red-500 text-white" colSpan={2}>
                      Giáp đỏ
                    </td>
                    <td className="px-4 py-2 border border-blue-500 bg-blue-500 text-white" colSpan={2}>
                      Giáp xanh
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border border-gray-400" colSpan={2}>
                      Họ tên
                    </td>
                    <td className="px-4 py-2 border border-gray-400" colSpan={2}>
                      Họ tên
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border border-gray-400" colSpan={2}>
                      Đơn vị
                    </td>
                    <td className="px-4 py-2 border border-gray-400" colSpan={2}>
                      Đơn vị
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border border-gray-400 text-center" colSpan={4}>
                      Kết quả
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border border-gray-400">Đơn vị</td>
                    <td className="px-4 py-2 border border-gray-400" colSpan={2}>
                      H1
                    </td>
                    <td className="px-4 py-2 border border-gray-400">Đơn vị</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border border-gray-400">Đơn vị</td>
                    <td className="px-4 py-2 border border-gray-400" colSpan={2}>
                      H2
                    </td>
                    <td className="px-4 py-2 border border-gray-400">Đơn vị</td>
                  </tr>

                  <tr>
                    <td className="px-4 py-2 border border-gray-400">Đơn vị</td>
                    <td className="px-4 py-2 border border-gray-400" colSpan={2}>
                      H3
                    </td>
                    <td className="px-4 py-2 border border-gray-400">Đơn vị</td>
                  </tr>
                </thead>
              </table>
            </div>

            {/* Hình B */}
            <div className="w-1/3">
              <div className="border border-gray-400 border-l-0">
                <img src={listImages[1]} className="w-full max-h-[117px] object-cover" alt="Hình A" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Versus;
