import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import CustomTable from '../../../components/CustomTable';
import Button from '../../../components/Button';
import Modal from '../../../components/Modal';
import SearchInput from '../../../components/SearchInput';
import { Constants } from '../../../common/Constants';
import { useAppDispatch, useAppSelector } from "../../../config/redux/store";
import { fetchConfigSystem, updateConfigSystem } from "../../../config/redux/controller/configSystemSlice";
import * as XLSX from 'xlsx';

// Component RoundHistoryCard - Không dùng cho format DOL/SOL/TUV/DAL
// (Component này dành cho format DK với Giáp Đỏ/Xanh)

export default function CompetitionDataDetailOrther() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [sheetData, setSheetData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  // State cho modal actions
  const [openActions, setOpenActions] = useState(null);

  // Ref để lưu hàm exportToExcel từ HistoryView
  const exportToExcelRef = React.useRef(null);

  // Load dữ liệu khi component mount 
  const configSystem = useAppSelector((state) => state.configSystem);  

  useEffect(() => {
    dispatch(fetchConfigSystem());
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:6789/api/competition-dk/${id}`);
      if (response?.data?.success && response?.data?.data) {
        const data = response.data.data;
        setSheetData(data);

        if (data.data && data.data.length > 0) {
          // Phát hiện format từ cell đầu tiên
          const formatType = data.data[0][0]; // 'DK', 'DOL', 'SOL', 'TUV', 'DAL'
          console.log('📋 Format detected:', formatType);

          // Lấy danh sách matches/teams từ database
          let matchesResponse = await axios.get(`http://localhost:6789/api/competition-match-team/by-dk/${id}`);
          let matches = matchesResponse.data.success ? matchesResponse.data.data : [];
          console.log('matches: ', matches);

          // Xử lý theo format
          setHeaders(data.data[0]);
          setRows(matches);          
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

  // File này chỉ xử lý format DOL/SOL/TUV/DAL
  // Phát hiện format từ sheetData
  const formatType = sheetData?.data?.[0]?.[0] || 'DOL';

  // List actions cho format DOL/SOL/TUV/DAL
  const listActions = [
    {
      key: Constants.ACTION_MATCH_START,
      btnText: 'Thi',
      color: 'bg-blue-500 text-white hover:bg-blue-600',
      description: 'Bắt đầu thi',
      callback: (row) => {
        handleMatchStart(row);
      },
    },
    {
      key: Constants.ACTION_MATCH_RESULT,
      btnText: 'Kết quả',
      color: 'bg-yellow-500 text-white hover:bg-yellow-600',
      description: 'Kết quả',
      callback: (row) => {
        setOpenActions({ isOpen: true, key: Constants.ACTION_MATCH_RESULT, row: row });
      },
    },
    {
      key: Constants.ACTION_UPDATE,
      btnText: 'Cập nhật',
      color: 'bg-green-500 text-white hover:bg-green-600',
      description: 'Cập nhật dữ liệu',
      callback: (row) => {
        setOpenActions({ isOpen: true, key: Constants.ACTION_UPDATE, row: row });
      },
    },
    {
      key: Constants.ACTION_DELETE,
      btnText: 'Xóa',
      color: 'bg-red-500 text-white hover:bg-red-600',
      description: 'Xác nhận xóa',
      callback: (row) => {
        setOpenActions({ isOpen: true, key: Constants.ACTION_DELETE, row: row });
      },
    },
  ];

  // Lấy actions theo status cho format DOL/SOL/TUV/DAL
  const getActionsByStatus = (status) => {
    switch (status) {
      case "FIN": // Kết thúc
        return [Constants.ACTION_MATCH_RESULT];
      case "IN": // Đang diễn ra
        return [Constants.ACTION_MATCH_START, Constants.ACTION_MATCH_RESULT];
      case "WAI": // Chờ
        return [Constants.ACTION_MATCH_START, Constants.ACTION_MATCH_RESULT, Constants.ACTION_UPDATE, Constants.ACTION_DELETE];
      default:
        return [Constants.ACTION_UPDATE, Constants.ACTION_DELETE];
    }
  };
  // Tạo columns cho format DOL/SOL/TUV/DAL
  const columns = [
    {
      title: 'STT',
      key: 'match_no',
      align: 'center',
      width: '80px',
      render: (row) => <span className="font-semibold text-lg">{row.match_no || '-'}</span>,
    },
    {
      title: 'VĐV tham gia',
      key: 'athletes',
      render: (row) => {
        if (!row.athletes || row.athletes.length === 0) {
          return <span className="text-gray-400">-</span>;
        }

        return (
          <div className="space-y-1">
            {row.athletes.map((athlete, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                  {idx + 1}
                </span>
                <span className="font-semibold text-blue-600">{athlete.athlete_name || '-'}</span>
                {/* {athlete.athlete_unit && (
                  <span className="text-gray-500 text-sm">({athlete.athlete_unit})</span>
                )} */}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      title: 'Đơn vị',
      key: 'team_name',
      align: 'center',
      width: '150px',
      render: (row) => {
        const typeColors = {
          'DOL': 'bg-purple-100 text-purple-700',
          'SOL': 'bg-green-100 text-green-700',
          'TUV': 'bg-orange-100 text-orange-700',
          'DAL': 'bg-pink-100 text-pink-700'
        };
        const color = typeColors[row.match_type] || 'bg-gray-100 text-gray-700';

        return (
          <span className={`px-3 py-1 !rounded text-sm font-bold ${color}`}>
            {row.team_name || '-'}
          </span>
        );
      },
    },
    {
      title: 'Nội dung thi',
      key: 'match_type',
      align: 'center',
      width: '150px',
      render: (row) => {
        const typeColors = {
          'DOL': 'bg-purple-100 text-purple-700',
          'SOL': 'bg-green-100 text-green-700',
          'TUV': 'bg-orange-100 text-orange-700',
          'DAL': 'bg-pink-100 text-pink-700'
        };
        const color = typeColors[row.match_type] || 'bg-gray-100 text-gray-700';

        return (
          <span className={`px-3 py-1 !rounded  text-sm font-bold ${color}`}>
            {row.match_name || '-'}
          </span>
        );
      },
    },
    {
      title: 'Trạng thái',
      key: 'match_status',
      align: 'center',
      width: '120px',
      render: (row) => {
        const status = row.match_status || 'WAI';
        const statusLabel = {
          'WAI': 'Chờ',
          'IN': 'Đang diễn ra',
          'FIN': 'Kết thúc',
          'CAN': 'Hủy'
        }[status] || 'Chờ';

        const statusColor = {
          'WAI': 'bg-yellow-100 text-yellow-800 border-yellow-300',
          'IN': 'bg-blue-100 text-blue-800 border-blue-300',
          'FIN': 'bg-green-100 text-green-800 border-green-300',
          'CAN': 'bg-red-100 text-red-800 border-red-300'
        }[status] || 'bg-gray-100 text-gray-800 border-gray-300';

        return (
          <span className={`px-3 py-1 !rounded text-xs font-semibold border-2 ${statusColor}`}>
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
                  className={`!rounded !px-3 !py-2 !text-sm !font-medium ${action.color} transition-colors whitespace-nowrap`}
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

  // Chuyển đổi rows thành data cho CustomTable - Chỉ cho format DOL/SOL/TUV/DAL
  const tableData = rows.map((row, index) => {
    return {
      key: index,
      id: index,
      ...row
    };
  });

  // Xử lý thêm mới - Format DOL/SOL/TUV/DAL
  const handleInsert = async (formData) => {
    try {
      const athletes = formData.athletes || [];
      const matchType = formData.match_type || formatType;

      // Tính row_index bắt đầu (tổng số rows hiện tại trong Excel)
      const currentExcelRowCount = rows.reduce((sum, r) => sum + (r.raw_data?.length || r.athletes?.length || 1), 0);

      // Tạo các rows cho Excel (mỗi VĐV là 1 row)
      const excelRows = athletes.map((athlete, idx) => [
        formatType,
        formData.match_no || '',
        athlete.name || '',
        athlete.unit || '',
        matchType
      ]);

      const newTeamObject = {
        match_no: formData.match_no || '',
        athletes: athletes,
        match_name: athletes.map(a => a.name).filter(n => n).join(', '),
        team_name: athletes.map(a => a.unit).filter(u => u).join(', '),
        match_type: matchType,
        match_status: formData.match_status || 'WAI',
        match_id: null,
        row_index: currentExcelRowCount, // Row index của VĐV đầu tiên
        team_row_indices: excelRows.map((_, idx) => currentExcelRowCount + idx),
        raw_data: excelRows
      };

      // Cập nhật Excel - Flatten tất cả raw_data
      const newRows = [...rows, newTeamObject];
      const allExcelRows = newRows.flatMap(r => r.raw_data || []);
      const excelData = [headers, ...allExcelRows];

      await saveDataToServer(excelData);
      setRows(newRows);
      setOpenActions({ ...openActions, isOpen: false });
      alert('Thêm mới thành công!');
    } catch (error) {
      console.error('Error inserting:', error);
      alert('Lỗi khi thêm mới: ' + (error.response?.data?.message || error.message));
    }
  };

  // Xử lý cập nhật - Format DOL/SOL/TUV/DAL
  const handleUpdate = async (formData) => {
    try {
      const row = openActions.row;
      console.log('row: ', row, formData);

      const athletes = formData.athletes || [];
      const matchType = formData.match_type || row.match_type;

      // 1. Tạo các rows cho Excel (mỗi VĐV là 1 row)
      const excelRows = athletes.map((athlete, idx) => [
        formatType,
        formData.match_no || row.match_no,
        athlete.name || '',
        athlete.unit || '',
        matchType
      ]);

      // 2. Cập nhật tất cả rows của team trong Excel
      // Cần cập nhật từng row một
      for (let i = 0; i < excelRows.length; i++) {
        const rowIndex = row.row_index + i;
        await axios.put(`http://localhost:6789/api/competition-dk/${id}/row/${rowIndex}`, {
          data: excelRows[i]
        });
      }

      // Nếu số VĐV giảm, xóa các rows thừa
      const oldNumRows = row.raw_data?.length || row.athletes?.length || 1;
      if (excelRows.length < oldNumRows) {
        for (let i = excelRows.length; i < oldNumRows; i++) {
          const rowIndex = row.row_index + i;
          await axios.delete(`http://localhost:6789/api/competition-dk/${id}/row/${rowIndex}`);
        }
      }

      // 3. Nếu có match_id, cập nhật match_status vào database
      if (row.match_id) {
        await axios.put(`http://localhost:6789/api/competition-match/${row.match_id}/status`, {
          status: formData.match_status
        });
      }

      // 4. Reload data để đồng bộ
      await fetchData();

      setOpenActions({ ...openActions, isOpen: false });
      alert('Cập nhật thành công!');
    } catch (error) {
      console.error('Error updating:', error);
      alert('Lỗi khi cập nhật: ' + (error.response?.data?.message || error.message));
    }
  };

  // Xử lý xóa - Format DOL/SOL/TUV/DAL
  const handleDelete = async () => {
    try {
      const teamToDelete = openActions.row;

      // Xóa team khỏi danh sách
      const teamIndex = rows.findIndex(r => r.row_index === teamToDelete.row_index);
      const newRows = rows.filter((_, index) => index !== teamIndex);

      // Tính lại row_index cho các team
      let currentExcelRow = 0;
      const updatedRows = newRows.map((team, index) => {
        const numRows = team.raw_data?.length || team.athletes?.length || 1;
        const updatedTeam = {
          ...team,
          row_index: currentExcelRow,
          team_row_indices: Array.from({ length: numRows }, (_, i) => currentExcelRow + i)
        };
        currentExcelRow += numRows;
        return updatedTeam;
      });

      // Tạo lại Excel data
      const allExcelRows = updatedRows.flatMap(r => r.raw_data || []);
      const newData = [headers, ...allExcelRows];

      await saveDataToServer(newData);
      setRows(updatedRows);
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

  // Xử lý vào trận - Chỉ cho format DOL/SOL/TUV/DAL
  const handleMatchStart = async (row) => {
    try {
      console.log('🚀 CompetitionDataDetailOrther - handleMatchStart - row:', row)
      console.log('🚀 CompetitionDataDetailOrther - handleMatchStart - configSystem:', configSystem);

      // Nếu chưa có match_id, tạo team mới
      if (!row.match_id) {
        const createPayload = {
          competition_dk_id: id,
          match_no: row?.match_no,
          row_index: row?.row_index,
          match_name: row?.match_name,
          team_name: row?.team_name,
          match_type: row?.match_type,
          athletes: row?.athletes || [],
          config_system: configSystem?.data || {}
        };

        const createResponse = await axios.post('http://localhost:6789/api/competition-match-team', createPayload);
        row.match_id = createResponse.data.data.id;
      }

      // Cập nhật status thành 'IN'
      await axios.put(`http://localhost:6789/api/competition-match-team/${row.match_id}/status`, {
        status: 'IN'
      });

      // Chuẩn bị dữ liệu trận đấu
      const matchData = {
        match_id: row?.match_id,
        match_no: row?.match_no,
        match_name: row?.match_name,
        team_name: row?.team_name,
        match_type: row?.match_type,
        athletes: row?.athletes || [],
        match_status: 'IN',
        ten_giai_dau: configSystem?.data?.ten_giai_dau || '',
        ten_mon_thi: configSystem?.data?.bo_mon || '',
        config_system: configSystem?.data || {},
        competition_dk_id: id,
        row_index: row?.row_index,
      };

      console.log('🚀 CompetitionDataDetailOrther - Navigating with matchData:', matchData);

      // Chuyển sang màn hình thi đấu với state
      navigate('/scoreboard/vovinam', {
        state: {
          matchData,
          returnUrl: `/management/competition-data-other/${id}`
        }
      });

    } catch (error) {
      console.error('Error starting match:', error);
      alert('Lỗi khi bắt đầu trận: ' + (error.response?.data?.message || error.message));
    }
  };

  // Xử lý kết quả - Format DOL/SOL/TUV/DAL
  const handleResult = async (formData) => {
    try {
      const row = openActions.row;

      // 1. Lưu kết quả vào history
      const historyData = {
        score: formData.score || 0,
        rank: formData.rank,
        time_result: formData.time_result,
        notes: formData.notes || '',
        status: 'FIN'
      };

      // Nếu có match_id, thêm vào history
      if (row.match_id) {
        await axios.post(`http://localhost:6789/api/competition-match-team/${row.match_id}/history`, historyData);
      }

      // 2. Cập nhật status thành FIN
      if (row.match_id) {
        await axios.put(`http://localhost:6789/api/competition-match-team/${row.match_id}/status`, {
          status: 'FIN'
        });
      }

      // 3. Đóng modal
      setOpenActions({ ...openActions, isOpen: false });

      // 4. Reload data để hiển thị cập nhật
      await fetchData();

      // 5. Thông báo thành công
      alert('Lưu kết quả thành công!');
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
        await axios.put(`http://localhost:6789/api/competition-match-team/${row.match_id}/config`, {
          config_system: configData
        });

        alert('Lưu cấu hình thành công!');
        setOpenActions({ ...openActions, isOpen: false });
        fetchData(); // Reload data
      } else {
        alert('Chưa có match_id. Vui lòng tạo team trước!');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Lỗi khi lưu cấu hình: ' + (error.response?.data?.message || error.message));
    }
  };

  // Render nội dung modal - Format DOL/SOL/TUV/DAL
  const renderContentModal = (openActions) => {
    switch (openActions?.key) {
      case Constants.ACTION_MATCH_START:
        return <ActionConfirm message={`Bắt đầu trận ${openActions.row?.match_no}?`} onConfirm={() => handleMatchStart(openActions.row)} onCancel={() => setOpenActions({ ...openActions, isOpen: false })} />;
      case Constants.ACTION_MATCH_RESULT:
        return <ResultForm row={openActions.row} onSubmit={handleResult} onCancel={() => setOpenActions({ ...openActions, isOpen: false })} />;
      case Constants.ACTION_UPDATE:
        return <DataFormOther headers={headers} row={openActions.row} onSubmit={handleUpdate} onCancel={() => setOpenActions({ ...openActions, isOpen: false })} />;
      case Constants.ACTION_DELETE:
        return <DeleteConfirm onConfirm={handleDelete} onCancel={() => setOpenActions({ ...openActions, isOpen: false })} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white  shadow">
        <div className="text-center py-8">
          <div className="inline-block animate-spin  h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!sheetData) {
    return (
      <div className="p-6 bg-white  shadow">
        <div className="text-center py-12 bg-gray-50 ">
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
    <div className="p-6 bg-white  shadow">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/management/general-setting/competition-management')}
          className="mb-4 flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại
        </button>

        <h2 className="text-2xl font-bold mb-4">{sheetData?.sheet_name || "Đang tải..."}</h2>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">
            File: {sheetData?.file_name || "-"} | Tổng số dòng: {rows.length}
          </span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <SearchInput value={search} onChange={setSearch} onSearch={handleSearch} placeholder="Tìm kiếm..." />
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="overflow-x-auto overflow-y-visible shadow-sm border border-gray-200 ">
        <div className="min-w-max">
          <CustomTable
            columns={columns}
            data={tableData}
            loading={loading}
            page={page}
            onPageChange={setPage}
            onRowDoubleClick={(row) => {
              setOpenActions({ isOpen: true, key: Constants.ACTION_UPDATE, row: row });
            }}
          />
        </div>
      </div>

      {/* Modal Kết quả */}
      {openActions?.isOpen && openActions?.key === Constants.ACTION_MATCH_RESULT && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-2xl shadow-2xl w-[900px] max-h-[95vh] overflow-hidden flex flex-col">
            {/* Header - Căn giữa */}
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-4 flex justify-center items-center relative flex-shrink-0">
              <h2 className="text-2xl font-bold text-white">
                KẾT QUẢ TRẬN ĐẤU
              </h2>
              <button
                onClick={() => setOpenActions({ ...openActions, isOpen: false })}
                className="text-white hover:text-gray-300 transition-colors absolute right-6"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {renderContentModal(openActions)}
            </div>
          </div>
        </div>
      )}

      {/* Modal Cập nhật */}
      {openActions?.isOpen && openActions?.key === Constants.ACTION_UPDATE && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-2xl shadow-2xl w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header - Căn giữa */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex justify-center items-center relative flex-shrink-0">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                CẬP NHẬT TRẬN ĐẤU
              </h2>
              <button
                onClick={() => setOpenActions({ ...openActions, isOpen: false })}
                className="text-white hover:text-gray-300 transition-colors absolute right-6"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {renderContentModal(openActions)}
            </div>
          </div>
        </div>
      )}

      {/* Modal Xoá */}
      {openActions?.isOpen && openActions?.key === Constants.ACTION_DELETE && (
        <Modal
          isOpen={true}
          onClose={() => setOpenActions({ ...openActions, isOpen: false })}
          title="Xác nhận xóa"
          headerClass="bg-red-500"
        >
          {renderContentModal(openActions)}
        </Modal>
      )}

      {/* Modal Vào trận */}
      {openActions?.isOpen && openActions?.key === Constants.ACTION_MATCH_START && (
        <Modal
          isOpen={true}
          onClose={() => setOpenActions({ ...openActions, isOpen: false })}
          title="Xác nhận vào trận"
          headerClass="bg-blue-500"
        >
          {renderContentModal(openActions)}
        </Modal>
      )}
    </div>
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

// Component Form cho format DOL/SOL/TUV/DAL
function DataFormOther({ headers, row = null, onSubmit, onCancel }) {
  // Xác định số VĐV từ row hiện tại hoặc match_type
  const getNumAthletesByType = (type) => {
    if (type === 'DOL') return 1;
    if (type === 'SOL' || type === 'TUV') return 2;
    if (type === 'DAL') return 4;
    return 1;
  };

  const initialMatchType = row?.match_type || 'DOL';
  const initialNumAthletes = row?.athletes?.length || getNumAthletesByType(initialMatchType);

  const [numAthletes, setNumAthletes] = React.useState(initialNumAthletes);
  const [formData, setFormData] = React.useState({
    match_no: row?.match_no || '',
    match_type: initialMatchType,
    match_status: row?.match_status || 'WAI',
    athletes: row?.athletes || Array(initialNumAthletes).fill(null).map(() => ({ name: '', unit: '' }))
  });

  // Cập nhật số VĐV khi thay đổi loại nội dung
  const handleMatchTypeChange = (type) => {
    const num = getNumAthletesByType(type);
    setNumAthletes(num);
    const newAthletes = Array(num).fill(null).map((_, idx) =>
      formData.athletes[idx] || { name: '', unit: '' }
    );
    setFormData({ ...formData, match_type: type, athletes: newAthletes });
  };

  const handleAthleteChange = (index, field, value) => {
    const newAthletes = [...formData.athletes];
    newAthletes[index] = { ...newAthletes[index], [field]: value };
    setFormData({ ...formData, athletes: newAthletes });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.match_no) {
      alert('Vui lòng điền Mã số!');
      return;
    }

    // Kiểm tra ít nhất 1 VĐV có tên
    const hasAthlete = formData.athletes.some(a => a.name && a.name.trim());
    if (!hasAthlete) {
      alert('Vui lòng điền ít nhất 1 VĐV!');
      return;
    }

    onSubmit(formData);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'WAI': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'IN': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'FIN': return 'bg-green-100 text-green-800 border-green-300';
      case 'CAN': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Trường trạng thái */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          Trạng thái trận đấu
        </label>
        <select
          value={formData.match_status}
          onChange={(e) => setFormData({ ...formData, match_status: e.target.value })}
          className={`w-full px-4 py-3 border-2 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${getStatusColor(formData.match_status)}`}
        >
          <option value="WAI">⏳ Chờ thi đấu</option>
          <option value="IN">▶️ Đang diễn ra</option>
          <option value="FIN">✅ Kết thúc</option>
          <option value="CAN">❌ Hủy bỏ</option>
        </select>
      </div>

      {/* Thông tin trận đấu */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã số <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.match_no}
              onChange={(e) => setFormData({ ...formData, match_no: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập mã số"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại nội dung <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.match_type}
              onChange={(e) => handleMatchTypeChange(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-semibold"
            >
              <option value="DOL">DOL - Đối luyện (1 VĐV)</option>
              <option value="SOL">SOL - Song luyện (2 VĐV)</option>
              <option value="TUV">TUV - Tự vệ (2 VĐV)</option>
              <option value="DAL">DAL - Đả luyện (4 VĐV)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Số VĐV sẽ tự động thay đổi theo loại nội dung
            </p>
          </div>
        </div>

        {/* Hiển thị số VĐV */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700">
              Số lượng VĐV tham gia
            </label>
            <span className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-lg">
              {numAthletes} VĐV
            </span>
          </div>
        </div>

        {/* Danh sách VĐV */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">
            Thông tin VĐV <span className="text-red-500">*</span>
          </label>
          {formData.athletes.map((athlete, idx) => (
            <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold">
                  {idx + 1}
                </span>
                <span className="font-semibold text-gray-700">VĐV {idx + 1}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Họ tên
                  </label>
                  <input
                    type="text"
                    value={athlete.name}
                    onChange={(e) => handleAthleteChange(idx, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập họ tên VĐV"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Đơn vị
                  </label>
                  <input
                    type="text"
                    value={athlete.unit}
                    onChange={(e) => handleAthleteChange(idx, 'unit', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập đơn vị"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button variant="primary" type="submit">
          {row ? 'Cập nhật' : 'Thêm mới'}
        </Button>
      </div>
    </form>
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

// Component form kết quả cho format DOL/SOL/TUV/DAL
function ResultForm({ row, onSubmit, onCancel }) {
  const [formData, setFormData] = React.useState({
    score: 0,
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Nhập kết quả</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Điểm số
            </label>
            <input
              type="number"
              value={formData.score}
              onChange={(e) => setFormData({ ...formData, score: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập ghi chú (nếu có)"
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button variant="primary" type="submit">
          Lưu kết quả
        </Button>
      </div>
    </form>
  );
}
