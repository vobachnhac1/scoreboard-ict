export const Constants = {
  ACCTION_INSERT: "insert",
  ACCTION_UPDATE: "update",
  ACCTION_DELETE: "delete",

  ACCTION_CONNECT_KH: "KH",
  ACCTION_CONNECT_GD: "GD",
  ACCTION_CONNECT_DIS: "DIS",
  ACCTION_CONNECT_MSG: "MSG",

  ACCTION_ATHLETE_RESULT: "RESULT",
  ACCTION_ATHLETE_ADJUST: "ADJUST",
  ACCTION_ATHLETE_CONTINUE: "CONTINUE",
  ACCTION_ATHLETE_IN: "IN",
  ACCTION_ATHLETE_RE: "RE",
}

export const LIST_STATUS_ATHLETE = [
  { key: "WAI", label: "Chờ" },
  { key: "IN", label: "Đang diễn ra" },
  { key: "FIN", label: "Kết thúc" },
  { key: "CAN", label: "Huỷ" },
  { key: "OTH", label: "Khác" },
];

export const LIST_JUDGE_PRORMISSION = [
  { key: "GD1", label: "Giám định 1" },
  { key: "GD2", label: "Giám định 2" },
  { key: "GD3", label: "Giám định 3" },
  { key: "GD4", label: "Giám định 4" },
  { key: "GD5", label: "Giám định 5" },
  { key: "GD6", label: "Giám định 6" },
  { key: "GD7", label: "Giám định 7" },
];

export const LIST_STATUS = [
  { key: "active", label: "Đang kết nối" },
  { key: "inactive", label: "Ngắt kế nối" },
];

export const LIST_APPROVAL_STATUS = [
  { key: "approved", label: "Đã duyệt" },
  { key: "rejected", label: "Từ chối" },
  { key: "pending", label: "Chờ duyệt" },
];

export const LIST_CHAMPION_STATUS = [
  { key: "NEW", label: "Tạo mới" },
  { key: "PRO", label: "Chờ đăng ký" },
  { key: "COM", label: "Hoàn thiện đăng ký" },
  { key: "RAN", label: "Bốc thăm" },
  { key: "IN", label: "Đang diễn ra" },
  { key: "FIN", label: "Kết thúc" },
  { key: "CAN", label: "Hủy" },
  { key: "PEN", label: "Tạm hoãn" },
  { key: "OTH", label: "Khác" },
];

export const LIST_GENDER = [
  { key: "M", label: "Nam" },
  { key: "F", label: "Nữ" },
];
