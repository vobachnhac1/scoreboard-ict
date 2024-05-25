import { Empty } from 'antd';
import React from 'react';

const PlayerList = ({ playerList, isFull }) => {
  console.log(playerList);
  return (
    <div className="flex w-full justify-center p-4 flex-col items-center gap-4">
      <h2 className="font-semibold text-xl text-center">Bảng thông tin tuyển thủ</h2>
      <table className={`${isFull <= 18 ? ' w-full' : 'w-1/2'} border table_show_data`}>
        <thead>
          <tr>
            <th>STT</th>
            <th>Họ và tên</th>
            <th>Đơn vị</th>
          </tr>
        </thead>
        <tbody>
          {playerList.length ? (
            playerList.map((player, index) => (
              <tr key={index}>
                <td>{player[0]}</td>
                <td>{player[1]}</td>
                <td>{player[2]}</td>
              </tr>
            ))
          ) : (
            <tr className="border border-black">
              <td colSpan="3" className="text-center">
                <Empty description={'Không có dữ liệu'} />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerList;
