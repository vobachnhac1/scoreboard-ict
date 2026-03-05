/**
 * Cấu hình hiển thị columns cho từng bảng
 * @param {string} tableName - Tên bảng
 * @returns {Object} columnConfig - {columnNameMap, visibleColumns, hiddenColumns}
 */
export const getColumnConfig = (tableName) => {
  // Mapping tên cột tiếng Việt
  const columnNameMap = {
    id: "Mã",
    file_name: "Tên file",
    sheet_name: "Sheet Excel",
    data: "Xem dữ liệu",
    created_at: "Thời gian tạo",
    updated_at: "Thời gian cập nhật",
    blue_name: "Giáp Xanh",
    competition_dk_id: "Mã trận ĐK",
    config_system: "Cấu hình trận đấu",
    match_name: "Tên Trận",
    match_no: "Trận số",
    match_status: "Trạng thái trận",
    match_type: "Loại trận",
    red_name: "Giáp đỏ",
    row_index: "Thứ tự trong dữ liệu",
    team_name: "Đơn vị",
    winner: "VĐV Thắng",
    athlete_name: "Tên VĐV",
    score: "Điểm số",
    rank: "Xếp hạng",
    athlete_id: "Mã VĐV",
    team_id: "Mã đội",
    competition_match_id: "Mã trận đấu",
    competition_match_team_id: "Mã đội thi",
    round: "Vòng thi",
    result: "Kết quả",
    notes: "Ghi chú",
    config_key: "Khóa cấu hình",
    config_value: "Giá trị cấu hình",
    description: "Mô tả",
  };

  // Cấu hình hiển thị riêng cho từng bảng
  const tableConfigs = {
    competition_dk: {
      visibleColumns: [
        "id",
        "file_name",
        "sheet_name",
        "data",
        "created_at",
        "updated_at",
      ],
      hiddenColumns: [], // Hiển thị cột data dạng table preview
    },
    competition_match: {
      visibleColumns: [
        "id",
        "competition_dk_id",
        "match_no",
        "match_name",
        "match_type",
        "red_name",
        "blue_name",
        "winner",
        "match_status",
        "created_at",
      ],
      hiddenColumns: ["config_system", "row_index"],
    },
    competition_match_history: {
      visibleColumns: [
        "id",
        "competition_match_id",
        "round",
        "red_name",
        "blue_name",
        "winner",
        "result",
        "created_at",
      ],
      hiddenColumns: [],
    },
    competition_match_team: {
      visibleColumns: [
        "id",
        "team_name",
        "match_type",
        "match_status",
        "created_at",
      ],
      hiddenColumns: ["row_index"],
    },
    competition_match_team_athlete: {
      visibleColumns: [
        "id",
        "competition_match_team_id",
        "athlete_name",
        "athlete_id",
        "score",
        "rank",
      ],
      hiddenColumns: [],
    },
    config_values: {
      visibleColumns: [
        "id",
        "config_key",
        "config_value",
        "description",
        "updated_at",
      ],
      hiddenColumns: [],
    },
  };

  const config = tableConfigs[tableName] || {
    visibleColumns: null,
    hiddenColumns: [],
  }; // Mặc định hiện tất cả

  return {
    columnNameMap,
    ...config,
  };
};

/**
 * Build column config object cho UI
 * @param {Array} displayColumns - Danh sách cột hiển thị
 * @param {Object}columnNameMap - Map tên cột
 * @returns {Object}Column config object
 */
export const buildColumnConfig = (displayColumns, columnNameMap, t) => {
  const colConfig = {};
  displayColumns.forEach((col) => {
    colConfig[col] = {
      visible: true,
      displayName: t ? t(`data_sync.meta_labels.${col}`, { defaultValue: columnNameMap[col] || col }) : (columnNameMap[col] || col),
    };
  });
  return colConfig;
};

/**
 * Filter columns theo config
 * @param {Array} allColumns - Tất cả columns
 * @param {Array}visibleColumns - Columns cho phép hiển thị
 * @param {Array}hiddenColumns - Columns bị ẩn
 * @returns {Array}Filtered columns
 */
export const filterColumns = (allColumns, visibleColumns, hiddenColumns) => {
  if (visibleColumns && visibleColumns.length > 0) {
    // Nếu có visibleColumns -> chỉ hiển thị các cột trong list
    return visibleColumns.filter((col) => allColumns.includes(col));
  } else {
    // Nếu không có visibleColumns -> loại bỏ hiddenColumns
    return allColumns.filter((col) => !hiddenColumns.includes(col));
  }
};

