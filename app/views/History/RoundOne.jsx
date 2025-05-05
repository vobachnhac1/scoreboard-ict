import React from 'react';

const RoundOne = () => {
  const data = [
    {
      id: 1,
      time: '01:30',
      name: 'ADMIN',
      type: 'ĐƠN VỊ',
      gd1: '-',
      gd2: '-',
      gd3: '-',
      gd4: '-',
      gd5: '-',
      reminder: '1',
      warning: '-',
      score: '1-0',
      bgd1: '-',
      bgd2: '-',
      bgd3: '-',
      bgd4: '-',
      bgd5: '-',
      breminder: '1',
      bwarning: '-'
    },
    {
      id: 2,
      time: '01:30',
      name: 'GD1',
      type: 'ĐƠN VỊ',
      gd1: '1',
      gd2: '-',
      gd3: '-',
      gd4: '-',
      gd5: '-',
      reminder: '-',
      warning: '-',
      score: '1-0',
      bgd1: '1',
      bgd2: '-',
      bgd3: '-',
      bgd4: '-',
      bgd5: '-',
      breminder: '-',
      bwarning: '-'
    }
    // Thêm dữ liệu khác tương tự
  ];

  return (
    <div className="p-4">
      <div className="border rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th colSpan={4} className="border bg-green-100 p-2">
                XUẤT FILE
              </th>
              <th colSpan={8} className="border bg-red-100 p-2">
                GIÁP ĐỎ
              </th>
              <th colSpan={8} className="border bg-blue-100 p-2">
                GIÁP XANH
              </th>
            </tr>
            <tr>
              <th colSpan={4} className="border"></th>
              <th colSpan={4} className="border p-2">
                NGUYỄN VĂN A
              </th>
              <th colSpan={4} className="border p-2">
                ĐƠN VỊ
              </th>
              <th colSpan={4} className="border p-2">
                NGUYỄN VĂN B
              </th>
              <th colSpan={4} className="border p-2">
                ĐƠN VỊ
              </th>
            </tr>
            <tr className="bg-gray-50">
              <th className="border p-2">STT</th>
              <th className="border p-2">THỜI GIAN</th>
              <th className="border p-2">TÊN</th>
              <th className="border p-2">LOẠI</th>
              <th className="border p-2">GD1</th>
              <th className="border p-2">GD2</th>
              <th className="border p-2">GD3</th>
              <th className="border p-2">GD4</th>
              <th className="border p-2">GD5</th>
              <th className="border p-2">NHẮC NHỞ</th>
              <th className="border p-2">CẢNH CÁO</th>
              <th className="border p-2">ĐIỂM</th>
              <th className="border p-2">GD1</th>
              <th className="border p-2">GD2</th>
              <th className="border p-2">GD3</th>
              <th className="border p-2">GD4</th>
              <th className="border p-2">GD5</th>
              <th className="border p-2">NHẮC NHỞ</th>
              <th className="border p-2">CẢNH CÁO</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="border p-2 text-center">{row.id}</td>
                <td className="border p-2 text-center">{row.time}</td>
                <td className="border p-2">{row.name}</td>
                <td className="border p-2">{row.type}</td>
                <td className="border p-2 text-center">{row.gd1}</td>
                <td className="border p-2 text-center">{row.gd2}</td>
                <td className="border p-2 text-center">{row.gd3}</td>
                <td className="border p-2 text-center">{row.gd4}</td>
                <td className="border p-2 text-center">{row.gd5}</td>
                <td className="border p-2 text-center">{row.reminder}</td>
                <td className="border p-2 text-center">{row.warning}</td>
                <td className="border p-2 text-center font-bold">{row.score}</td>
                <td className="border p-2 text-center">{row.bgd1}</td>
                <td className="border p-2 text-center">{row.bgd2}</td>
                <td className="border p-2 text-center">{row.bgd3}</td>
                <td className="border p-2 text-center">{row.bgd4}</td>
                <td className="border p-2 text-center">{row.bgd5}</td>
                <td className="border p-2 text-center">{row.breminder}</td>
                <td className="border p-2 text-center">{row.bwarning}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoundOne;
