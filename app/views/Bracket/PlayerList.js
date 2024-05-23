import { Empty } from 'antd';
import React from 'react';

const PlayerList = ({ playerList }) => {
  console.log(playerList);
  return (
    <div className="p-4">
      <table className="w-full border table_show_data">
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
