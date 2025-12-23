import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import CustomTable from '../../../components/CustomTable';
import Button from '../../../components/Button';
import Modal from '../../../components/Modal';
import SearchInput from '../../../components/SearchInput';
import { Constants } from '../../../common/Constants';

export default function CompetitionDataDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [sheetData, setSheetData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  // State cho modal actions
  const [openActions, setOpenActions] = useState(null);

  // Load dữ liệu khi component mount
  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:6789/api/competition-dk/${id}`);
      console.log('response: ', response);

      if (response?.data?.success && response?.data?.data) {
        const data = response.data.data;
        setSheetData(data);

        if (data.data && data.data.length > 0) {
          data.data[0][0] = 'Trận số';

          // Thêm cột "VĐV thắng" vào headers
          const headersWithWinner = [...data.data[0], 'VĐV thắng'];
          console.log('headersWithWinner: ', headersWithWinner);
          setHeaders(headersWithWinner);

          // Lấy danh sách matches từ database
          const matchesResponse = await axios.get(`http://localhost:6789/api/competition-match/by-dk/${id}`);
          const matches = matchesResponse.data.success ? matchesResponse.data.data : [];

          // Map matches với rows
          const rowsData = data.data.slice(1).map((row, index) => {
            const match = matches.find(m => m.row_index === index);

            // Tạo text VĐV thắng (Tên - Đơn vị)
            let winnerText = '';
            if (match?.winner) {
              if (match.winner?.toUpperCase() === 'RED') {
                // Giả sử cột 3 là tên Giáp Đỏ, cột 4 là đơn vị Giáp Đỏ
                winnerText = `${row[3] || ''} - ${row[4] || ''}`;
              } else if (match.winner?.toUpperCase() === 'BLUE') {
                // Giả sử cột 6 là tên Giáp Xanh, cột 7 là đơn vị Giáp Xanh
                winnerText = `${row[6] || ''} - ${row[7] || ''}`;
              }
            }

            return {
              data: row, // Lưu array gốc vào property data
              match_id: match?.id,
              match_status: match?.match_status || 'WAI',
              config_system: match?.config_system || {},
              winner: match?.winner || null,
              winner_text: winnerText
            };
          });

          setRows(rowsData);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Lỗi khi tải dữ liệu: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Tìm kiếm
  const handleSearch = (text) => {
    console.log('Tìm kiếm:', text);
    fetchData()
    // TODO: Implement search logic
  };

  // List actions - Tương tự MatchAthlete
  const listActions = [
    {
      key: Constants.ACCTION_MATCH_START,
      btnText: 'Vào trận',
      color: 'bg-[#CCE5FF]',
      description: 'Vào trận',
      callback: (row) => {
        setOpenActions({ isOpen: true, key: Constants.ACCTION_MATCH_START, row: row });
      },
    },
    {
      key: Constants.ACCTION_ATHLETE_RESULT,
      btnText: 'Kết quả',
      color: 'bg-[#FAD7AC]',
      description: 'Kết quả',
      callback: (row) => {
        setOpenActions({ isOpen: true, key: Constants.ACCTION_ATHLETE_RESULT, row: row });
      },
    },
    {
      key: Constants.ACCTION_MATCH_CONFIG,
      btnText: 'Cấu hình',
      color: 'bg-[#FFFF88]',
      description: 'Cấu hình hệ thống',
      callback: (row) => {
        setOpenActions({ isOpen: true, key: Constants.ACCTION_MATCH_CONFIG, row: row });
      },
    },
    {
      key: Constants.ACCTION_MATCH_HISTORY,
      btnText: 'Lịch sử',
      color: 'bg-[#CDEB8B]',
      description: 'Lịch sử thi đấu',
      callback: (row) => {
        setOpenActions({ isOpen: true, key: Constants.ACCTION_MATCH_HISTORY, row: row });
      },
    },
    {
      key: Constants.ACCTION_UPDATE,
      btnText: 'Cập nhật',
      color: 'bg-[#E0E0E0]',
      description: 'Cập nhật dữ liệu',
      callback: (row) => {
        setOpenActions({ isOpen: true, key: Constants.ACCTION_UPDATE, row: row });
      },
    },
    {
      key: Constants.ACCTION_DELETE,
      btnText: 'Xóa',
      color: 'bg-[#FFCCCC]',
      description: 'Xác nhận xóa',
      callback: (row) => {
        setOpenActions({ isOpen: true, key: Constants.ACCTION_DELETE, row: row });
      },
    },
  ];

  // Lấy actions theo status - Tương tự MatchAthlete
  const getActionsByStatus = (status) => {
    switch (status) {
      case "FIN": // Kết thúc
        return [Constants.ACCTION_ATHLETE_RESULT, Constants.ACCTION_MATCH_HISTORY, Constants.ACCTION_MATCH_CONFIG];
      case "IN": // Đang diễn ra
        return [Constants.ACCTION_MATCH_START, Constants.ACCTION_ATHLETE_RESULT, Constants.ACCTION_MATCH_HISTORY, Constants.ACCTION_MATCH_CONFIG];
      case "WAI": // Chờ
        return [Constants.ACCTION_MATCH_START, Constants.ACCTION_ATHLETE_RESULT, Constants.ACCTION_MATCH_CONFIG, Constants.ACCTION_UPDATE, Constants.ACCTION_DELETE];
      default:
        return [Constants.ACCTION_UPDATE, Constants.ACCTION_DELETE];
    }
  };

  // Tạo columns động từ headers
  const columns = [
    // {
    //   title: 'STT',
    //   key: 'order',
    //   align: 'center',
    // },
    ...headers?.map((header, index) => {
      // Xác định style cho các cột
      let cellClassName = '';
      let customRender = null;

      // Cột 3 là Tên Giáp Đỏ - Nhập với cột 4 (Đơn vị) - Chữ đỏ bold
      if (index === 3) {
        cellClassName = 'font-bold whitespace-pre-line min-w-[200px]';
        customRender = (row) => {
          const name = row.data[3] || '';
          const unit = row.data[4] || '';
          return (
            <div className="font-bold text-red-600 whitespace-pre-line min-w-[200px]">
              {name}
              {unit && `\n${unit}`}
            </div>
          );
        };
        return {
          title: 'GIÁP ĐỎ', // Header mới
          key: `col_${index}`,
          className: cellClassName,
          render: customRender,
        };
      }
      // Cột 4 (Đơn vị Đỏ) - Ẩn vì đã nhập vào cột 3
      else if (index === 4 || index === 5) {
        return null; // Sẽ bị filter ra
      }
      // Cột 5 là Quốc kỳ Đỏ - Chữ đỏ bold
      // else if (index === 5) {
      //   cellClassName = 'font-bold text-red-600';
      //   customRender = (row) => (
      //     <span className="font-bold text-red-600">{row.data[index] || '-'}</span>
      //   );
      // }
      // Cột 6 là Tên Giáp Xanh - Nhập với cột 7 (Đơn vị) - Chữ xanh bold
      else if (index === 6) {
        cellClassName = 'font-bold text-blue-600 whitespace-pre-line min-w-[200px]';
        customRender = (row) => {
          const name = row.data[6] || '';
          const unit = row.data[7] || '';
          return (
            <div className="font-bold text-blue-600 whitespace-pre-line min-w-[200px]">
              {name}
              {unit && `\n${unit}`}
            </div>
          );
        };
        return {
          title: 'GIÁP XANH', // Header mới
          key: `col_${index}`,
          className: cellClassName,
          render: customRender,
        };
      }
      // Cột 7 (Đơn vị Xanh) - Ẩn vì đã nhập vào cột 6
      else if (index === 7 || index === 8 || index === 9) {
        return null; // Sẽ bị filter ra
      }
      // Cột 8 là Quốc kỳ Xanh - Chữ xanh bold
      // else if (index === 8) {
      //   cellClassName = 'font-bold text-blue-600';
      //   customRender = (row) => (
      //     <span className="font-bold text-blue-600">{row.data[index] || '-'}</span>
      //   );
      // }
      // Cột cuối cùng là VĐV thắng - Chữ vàng bold (không nền)
      else if (index === headers.length - 1) {
        cellClassName = '';
        customRender = (row) => (
          <span className="font-bold text-yellow-600">{row.data[index] || '-'}</span>
        );
      }

      return {
        title: header || `Cột ${index + 1}`,
        key: `col_${index}`,
        className: cellClassName,
        render: customRender || ((row) => row.data[index] || '-'),
      };
    }).filter(col => col !== null), // Loại bỏ các cột null (đã ẩn)
    {
      title: 'Trạng thái',
      key: 'match_status',
      align: 'center',
      render: (row) => {
        const status = row.match_status || 'WAI';
        const statusLabel = {
          'WAI': 'Chờ',
          'IN': 'Đang diễn ra',
          'FIN': 'Kết thúc',
          'CAN': 'Hủy'
        }[status] || 'Chờ';

        const statusColor = {
          'WAI': 'bg-gray-200 text-gray-800',
          'IN': 'bg-blue-200 text-blue-800',
          'FIN': 'bg-green-200 text-green-800',
          'CAN': 'bg-red-200 text-red-800'
        }[status] || 'bg-gray-200 text-gray-800';

        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor}`}>
            {statusLabel}
          </span>
        );
      },
    },
    {
      title: 'Hành động',
      align: 'center',
      key: 'action',
      width: 'auto',
      render: (row) => {
        const availableActions = getActionsByStatus(row.match_status || 'WAI');
        return (
          <div className="flex items-center justify-center gap-1.5">
            {listActions
              .filter((action) => availableActions.includes(action.key))
              .map((action) => (
                <Button
                  variant="none"
                  className={`!rounded !px-2 !py-1 !text-xs !font-medium ${action.color} hover:opacity-80 transition-opacity whitespace-nowrap`}
                  onClick={() => action.callback(row)}
                  key={action.key}
                >
                  {action.btnText}
                </Button>
              ))}
          </div>
        );
      },
    },
  ];

  // Chuyển đổi rows thành data cho CustomTable với match_status
  const tableData = rows.map((row, index) => {
    // Nếu row là object (đã có match_status)
    if (typeof row === 'object' && !Array.isArray(row)) {
      // Lấy data gốc
      const rowData = Array.isArray(row) ? row : (row.data || row);

      // Thêm cột VĐV thắng vào cuối
      const dataWithWinner = [...rowData, row.winner_text || ''];

      return {
        id: index,
        rowIndex: index,
        data: dataWithWinner,
        match_status: row.match_status || 'WAI',
        match_id: row.match_id || null,
        config_system: row.config_system || {},
        winner: row.winner || null
      };
    }
    // Nếu row là array (chưa có match_status)
    return {
      id: index,
      rowIndex: index,
      data: [...row, ''], // Thêm cột trống cho VĐV thắng
      match_status: 'WAI',
      match_id: null,
      config_system: {},
      winner: null
    };
  });

  // Xử lý thêm mới
  const handleInsert = async (formData) => {
    try {
      // Loại bỏ cột VĐV thắng khỏi headers khi lưu
      const headersWithoutWinner = headers.slice(0, -1);
      const rowData = headersWithoutWinner.map((_, index) => formData[`col_${index}`] || '');

      const newRowObject = {
        data: rowData,
        match_id: null,
        match_status: formData.match_status || 'WAI',
        config_system: {},
        winner: null,
        winner_text: ''
      };

      const newRows = [...rows, newRowObject];
      const newData = [headersWithoutWinner, ...newRows.map(r => r.data)];

      await saveDataToServer(newData);
      setRows(newRows);
      setOpenActions({ ...openActions, isOpen: false });
      alert('Thêm mới thành công!');
    } catch (error) {
      console.error('Error inserting:', error);
      alert('Lỗi khi thêm mới: ' + (error.response?.data?.message || error.message));
    }
  };

  // Xử lý cập nhật
  const handleUpdate = async (formData) => {
    try {
      // Loại bỏ cột VĐV thắng khỏi headers khi lưu
      const headersWithoutWinner = headers.slice(0, -1);
      const rowData = headersWithoutWinner.map((_, index) => formData[`col_${index}`] || '');

      const newRows = rows.map((row, index) => {
        if (index === openActions.row.rowIndex) {
          return {
            ...row,
            data: rowData,
            match_status: formData.match_status || row.match_status
          };
        }
        return row;
      });

      const newData = [headersWithoutWinner, ...newRows.map(r => r.data)];

      await saveDataToServer(newData);
      setRows(newRows);
      setOpenActions({ ...openActions, isOpen: false });
      alert('Cập nhật thành công!');
    } catch (error) {
      console.error('Error updating:', error);
      alert('Lỗi khi cập nhật: ' + (error.response?.data?.message || error.message));
    }
  };

  // Xử lý xóa
  const handleDelete = async () => {
    try {
      const newRows = rows.filter((_, index) => index !== openActions.row.rowIndex);

      // Loại bỏ cột VĐV thắng khỏi headers khi lưu
      const headersWithoutWinner = headers.slice(0, -1);
      const newData = [headersWithoutWinner, ...newRows.map(r => r.data)];

      await saveDataToServer(newData);
      setRows(newRows);
      setOpenActions({ ...openActions, isOpen: false });
      alert('Xóa thành công!');
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Lỗi khi xóa: ' + (error.response?.data?.message || error.message));
    }
  };

  // Gọi API để lưu dữ liệu
  const saveDataToServer = async (newData) => {
    await axios.put(`http://localhost:6789/api/competition-dk/${id}`, {
      sheet_name: sheetData.sheet_name,
      file_name: sheetData.file_name,
      data: newData
    });
  };

  // Xử lý vào trận
  const handleMatchStart = async () => {
    try {
      const row = openActions.row;

      // Nếu chưa có match_id, tạo match mới
      if (!row.match_id) {
        const createResponse = await axios.post('http://localhost:6789/api/competition-match', {
          competition_dk_id: id,
          match_no: row.data[0],
          row_index: row.rowIndex,
          red_name: row.data[3] || '',
          blue_name: row.data[6] || '',
          config_system: row.config_system || {}
        });

        row.match_id = createResponse.data.data.id;
      }

      // Cập nhật status thành 'IN'
      await axios.put(`http://localhost:6789/api/competition-match/${row.match_id}/status`, {
        status: 'IN'
      });

      // Đóng modal
      setOpenActions({ ...openActions, isOpen: false });

      // Chuẩn bị dữ liệu trận đấu
      const matchData = {
        match_id: row.match_id,
        match_no: row.data[0] || '',
        weight_class: row.data[2] || '',
        red: {
          name: row.data[3] || '',
          unit: row.data[4] || '',
          country: row.data[5] || ''
        },
        blue: {
          name: row.data[6] || '',
          unit: row.data[7] || '',
          country: row.data[8] || ''
        },
        config_system: row.config_system || {},
        competition_name: sheetData?.sheet_name || 'GIẢI VÔ ĐỊCH VOVINAM'
      };

      console.log('🚀 CompetitionDataDetail - Navigating with matchData:', matchData);
      console.log('🚀 CompetitionDataDetail - row.data:', row.data);

      // Chuyển sang màn hình thi đấu với state
      navigate('/match-score/sparring/vovinam', {
        state: {
          matchData,
          returnUrl: `/management/competition-data/${id}`
        }
      });

    } catch (error) {
      console.error('Error starting match:', error);
      alert('Lỗi khi bắt đầu trận: ' + (error.response?.data?.message || error.message));
    }
  };

  // Xử lý kết quả
  const handleResult = async (formData) => {
    try {
      const row = openActions.row;

      // 1. Lưu kết quả vào history
      const historyData = {
        red_score: formData.red_score,
        blue_score: formData.blue_score,
        notes: formData.notes,
        status: 'FIN'
      };
      console.log('row.match_id: ', row.match_id);

      // Nếu có match_id, thêm vào history
      if (row.match_id) {
        await axios.post(`http://localhost:6789/api/competition-match/${row.match_id}/history`, historyData);
      }

      // 2. Cập nhật winner và status thành FIN
      if (row.match_id) {
        await axios.put(`http://localhost:6789/api/competition-match/${row.match_id}/winner`, {
          winner: formData.winner
        });
      }

      alert('Lưu kết quả thành công!');
      setOpenActions({ ...openActions, isOpen: false });
      fetchData(); // Reload data
    } catch (error) {
      console.error('Error saving result:', error);
      alert('Lỗi khi lưu kết quả: ' + (error.response?.data?.message || error.message));
    }
  };

  // Xử lý cấu hình
  const handleConfig = async (configData) => {
    try {
      const row = openActions.row;

      if (row.match_id) {
        await axios.put(`http://localhost:6789/api/competition-match/${row.match_id}/config`, {
          config_system: configData
        });

        alert('Lưu cấu hình thành công!');
        setOpenActions({ ...openActions, isOpen: false });
        fetchData(); // Reload data
      } else {
        alert('Chưa có match_id. Vui lòng tạo match trước!');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Lỗi khi lưu cấu hình: ' + (error.response?.data?.message || error.message));
    }
  };

  // Render nội dung modal
  const renderContentModal = (openActions) => {
    switch (openActions?.key) {
      case Constants.ACCTION_MATCH_START:
        return <ActionConfirm message={`Bắt đầu trận ${openActions.row?.data[0]}?`} onConfirm={handleMatchStart} onCancel={() => setOpenActions({ ...openActions, isOpen: false })} />;
      case Constants.ACCTION_ATHLETE_RESULT:
        return <ResultForm row={openActions.row} onSubmit={handleResult} onCancel={() => setOpenActions({ ...openActions, isOpen: false })} />;
      case Constants.ACCTION_MATCH_CONFIG:
        return <ConfigForm row={openActions.row} onSubmit={handleConfig} onCancel={() => setOpenActions({ ...openActions, isOpen: false })} />;
      case Constants.ACCTION_MATCH_HISTORY:
        return <HistoryView row={openActions.row} onClose={() => setOpenActions({ ...openActions, isOpen: false })} />;
      case Constants.ACCTION_UPDATE:
        return <DataForm headers={headers} data={openActions.row?.data} row={openActions.row} onSubmit={handleUpdate} onCancel={() => setOpenActions({ ...openActions, isOpen: false })} />;
      case Constants.ACCTION_DELETE:
        return <DeleteConfirm onConfirm={handleDelete} onCancel={() => setOpenActions({ ...openActions, isOpen: false })} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!sheetData) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600">Không tìm thấy dữ liệu</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại
        </button>

        <h2 className="text-2xl font-bold mb-4">{sheetData.sheet_name}</h2>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">
            File: {sheetData.file_name || "-"} | Tổng số dòng: {rows.length}
          </span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <SearchInput value={search} onChange={setSearch} onSearch={handleSearch} placeholder="Tìm kiếm..." />
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="overflow-x-auto overflow-y-visible shadow-sm border border-gray-200 rounded-lg">
        <div className="min-w-max">
          <CustomTable
            columns={columns}
            data={tableData}
            loading={loading}
            page={page}
            onPageChange={setPage}
            onRowDoubleClick={(row) => {
              setOpenActions({ isOpen: true, key: Constants.ACCTION_UPDATE, row: row });
            }}
          />
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={openActions?.isOpen || false}
        onClose={() => setOpenActions({ ...openActions, isOpen: false })}
        title={listActions.find((e) => e.key === openActions?.key)?.description}
        headerClass={listActions.find((e) => e.key === openActions?.key)?.color}
      >
        {renderContentModal(openActions)}
      </Modal>
    </div>
  );
}

// Component Form để thêm/sửa dữ liệu
function DataForm({ headers, data = null, row = null, onSubmit, onCancel }) {
  // Loại bỏ cột VĐV thắng (cột cuối cùng) khỏi form
  const editableHeaders = headers.slice(0, -1);

  const [formData, setFormData] = React.useState(() => {
    const initialData = {};
    editableHeaders.forEach((_, index) => {
      initialData[`col_${index}`] = data ? (data[index] || '') : '';
    });
    initialData.match_status = row?.match_status || 'WAI';
    return initialData;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Trường trạng thái */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Trạng thái
        </label>
        <select
          value={formData.match_status}
          onChange={(e) => setFormData({ ...formData, match_status: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="WAI">Chờ</option>
          <option value="IN">Đang diễn ra</option>
          <option value="FIN">Kết thúc</option>
          <option value="CAN">Hủy</option>
        </select>
      </div>

      {/* Các trường dữ liệu */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {editableHeaders.map((header, index) => (
          <div key={index}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {header || `Cột ${index + 1}`}
            </label>
            <input
              type="text"
              value={formData[`col_${index}`] || ''}
              onChange={(e) => setFormData({ ...formData, [`col_${index}`]: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Nhập ${header || `cột ${index + 1}`}`}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel} type="button">
          Hủy
        </Button>
        <Button variant="primary" type="submit">
          {data ? 'Cập nhật' : 'Thêm mới'}
        </Button>
      </div>
    </form>
  );
}

// Component xác nhận xóa
function DeleteConfirm({ onConfirm, onCancel }) {
  return (
    <div className="space-y-4">
      <p className="text-lg">Bạn có chắc chắn muốn xóa dòng này?</p>
      <p className="text-sm text-gray-600">Hành động này không thể hoàn tác.</p>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button variant="none" className="bg-red-600 text-white hover:bg-red-700" onClick={onConfirm}>
          Xóa
        </Button>
      </div>
    </div>
  );
}

// Component xác nhận action
function ActionConfirm({ message, onConfirm, onCancel }) {
  return (
    <div className="space-y-4">
      <p className="text-lg font-semibold text-center">{message}</p>

      <div className="flex justify-center gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          Đồng ý
        </Button>
      </div>
    </div>
  );
}

// Component form kết quả
function ResultForm({ row, onSubmit, onCancel }) {
  const [formData, setFormData] = React.useState({
    winner: '',
    red_score: 0,
    blue_score: 0,
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.winner) {
      alert('Vui lòng chọn người thắng!');
      return;
    }
    onSubmit(formData);
  };

  const handleSelectWinner = (winner) => {
    setFormData({ ...formData, winner });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className={`p-4 rounded-lg border-2 ${formData.winner === 'red' ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Giáp Đỏ</label>
          <p className="text-lg font-semibold text-red-600 mb-3">{row?.data[3] || '-'}</p>
          <input
            type="number"
            value={formData.red_score}
            onChange={(e) => setFormData({ ...formData, red_score: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3"
            placeholder="Điểm"
          />
          <Button
            type="button"
            variant="none"
            className={`w-full ${formData.winner === 'red' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
            onClick={() => handleSelectWinner('red')}
          >
            {formData.winner === 'red' ? '✓ Người thắng' : 'Chọn thắng'}
          </Button>
        </div>
        <div className={`p-4 rounded-lg border-2 ${formData.winner === 'blue' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Giáp Xanh</label>
          <p className="text-lg font-semibold text-blue-600 mb-3">{row?.data[6] || '-'}</p>
          <input
            type="number"
            value={formData.blue_score}
            onChange={(e) => setFormData({ ...formData, blue_score: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3"
            placeholder="Điểm"
          />
          <Button
            type="button"
            variant="none"
            className={`w-full ${formData.winner === 'blue' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
            onClick={() => handleSelectWinner('blue')}
          >
            {formData.winner === 'blue' ? '✓ Người thắng' : 'Chọn thắng'}
          </Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows="3"
          placeholder="Ghi chú..."
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel} type="button">
          Hủy
        </Button>
        <Button variant="primary" type="submit">
          Lưu kết quả
        </Button>
      </div>
    </form>
  );
}

// Component form cấu hình
function ConfigForm({ row, onSubmit, onCancel }) {
  const [configData, setConfigData] = React.useState({
    // Cài đặt chung
    so_hiep: 3,
    so_hiep_phu: 1,
    so_giam_dinh: 3,
    he_diem: '10',

    // Thời gian
    thoi_gian_tinh_diem: 1000,
    thoi_gian_thi_dau: 120,
    thoi_gian_hiep: 90,
    thoi_gian_nghi: 30,
    thoi_gian_hiep_phu: 90,
    thoi_gian_y_te: 30,

    // Điểm áp dụng
    khoang_diem_tuyet_toi: 10,

    // Chế độ áp dụng
    cau_hinh_doi_khang_diem_thap: false,
    cau_hinh_quyen_tinh_tong: false,
    cau_hinh_y_te: false,
    cau_hinh_tinh_diem_tuyet_doi: false,
    cau_hinh_xoa_nhac_nho: false,
    cau_hinh_xoa_canh_cao: false,
  });

  React.useEffect(() => {
    // Load config từ row nếu có
    if (row?.config_system) {
      setConfigData(prev => ({ ...prev, ...row.config_system }));
    }
  }, [row]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(configData);
  };

  const handleChange = (field, value) => {
    setConfigData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto">
      {/* Cài đặt số lượng */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Cài đặt số lượng</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Số hiệp</label>
            <select
              value={configData.so_hiep}
              onChange={(e) => handleChange('so_hiep', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="1">1 hiệp</option>
              <option value="2">2 hiệp</option>
              <option value="3">3 hiệp</option>
              <option value="5">5 hiệp</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Số hiệp phụ</label>
            <select
              value={configData.so_hiep_phu}
              onChange={(e) => handleChange('so_hiep_phu', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="0">Không có</option>
              <option value="1">1 hiệp phụ</option>
              <option value="2">2 hiệp phụ</option>
              <option value="3">3 hiệp phụ</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Số giám định</label>
            <select
              value={configData.so_giam_dinh}
              onChange={(e) => handleChange('so_giam_dinh', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="3">3 giám định</option>
              <option value="5">5 giám định</option>
              <option value="10">10 giám định</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hệ điểm</label>
            <select
              value={configData.he_diem}
              onChange={(e) => handleChange('he_diem', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="1">Hệ điểm 1</option>
              <option value="2">Hệ điểm 2</option>
              <option value="3">Hệ điểm 3</option>
              <option value="10">Hệ điểm 10</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cài đặt thời gian */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Cài đặt thời gian</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian tính điểm (ms)</label>
            <input
              type="number"
              value={configData.thoi_gian_tinh_diem}
              onChange={(e) => handleChange('thoi_gian_tinh_diem', parseInt(e.target.value) || 1000)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian thi đấu (giây)</label>
            <input
              type="number"
              value={configData.thoi_gian_thi_dau}
              onChange={(e) => handleChange('thoi_gian_thi_dau', parseInt(e.target.value) || 120)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian hiệp (giây)</label>
            <input
              type="number"
              value={configData.thoi_gian_hiep}
              onChange={(e) => handleChange('thoi_gian_hiep', parseInt(e.target.value) || 90)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian nghỉ (giây)</label>
            <input
              type="number"
              value={configData.thoi_gian_nghi}
              onChange={(e) => handleChange('thoi_gian_nghi', parseInt(e.target.value) || 30)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian hiệp phụ (giây)</label>
            <input
              type="number"
              value={configData.thoi_gian_hiep_phu}
              onChange={(e) => handleChange('thoi_gian_hiep_phu', parseInt(e.target.value) || 90)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian y tế (giây)</label>
            <input
              type="number"
              value={configData.thoi_gian_y_te}
              onChange={(e) => handleChange('thoi_gian_y_te', parseInt(e.target.value) || 30)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Điểm áp dụng */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Điểm áp dụng</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Khoảng điểm tuyệt đối</label>
            <input
              type="number"
              value={configData.khoang_diem_tuyet_toi}
              onChange={(e) => handleChange('khoang_diem_tuyet_toi', parseInt(e.target.value) || 10)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Chế độ áp dụng */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Chế độ áp dụng</h3>
        <div className="space-y-3">
          {[
            { key: 'cau_hinh_doi_khang_diem_thap', label: 'Đối kháng tính điểm thấp' },
            { key: 'cau_hinh_quyen_tinh_tong', label: 'Quyền tính điểm tổng' },
            { key: 'cau_hinh_y_te', label: 'Tính thời gian y tế' },
            { key: 'cau_hinh_tinh_diem_tuyet_doi', label: 'Tính điểm thắng tuyệt đối' },
            { key: 'cau_hinh_xoa_nhac_nho', label: 'Xoá nhắc nhở' },
            { key: 'cau_hinh_xoa_canh_cao', label: 'Xoá cảnh cáo' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center">
              <input
                type="checkbox"
                id={key}
                checked={configData[key] || false}
                onChange={(e) => handleChange(key, e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={key} className="ml-2 text-sm text-gray-700">
                {label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t sticky bottom-0 bg-white">
        <Button variant="outline" onClick={onCancel} type="button">
          Hủy
        </Button>
        <Button variant="primary" type="submit">
          Lưu cấu hình
        </Button>
      </div>
    </form>
  );
}

// Component xem lịch sử
function HistoryView({ row, onClose }) {
  const [history, setHistory] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // TODO: Gọi API để lấy lịch sử
    setTimeout(() => {
      setHistory([
        { id: 1, action: 'Bắt đầu trận', time: '2025-12-23 10:00:00', user: 'Admin' },
        { id: 2, action: 'Cập nhật điểm', time: '2025-12-23 10:15:00', user: 'Giám định 1' },
        { id: 3, action: 'Kết thúc trận', time: '2025-12-23 10:30:00', user: 'Admin' },
      ]);
      setLoading(false);
    }, 500);
  }, [row]);

  if (loading) {
    return <div className="text-center py-4">Đang tải...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="max-h-96 overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Người thực hiện</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {history.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-2 text-sm text-gray-900">{item.time}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{item.action}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{item.user}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end pt-4">
        <Button variant="outline" onClick={onClose}>
          Đóng
        </Button>
      </div>
    </div>
  );
}

