export const Constants = {
  ACTION_CREATE: "create",
  ACTION_INSERT: "insert",
  ACTION_UPDATE: "update",
  ACTION_DELETE: "delete",

  ACTION_CONNECT_KH: "KH",
  ACTION_CONNECT_GD: "GD",
  ACTION_CONNECT_DIS: "DIS",
  ACTION_CONNECT_MSG: "MSG",

  ACTION_ATHLETE_RESULT: "RESULT",
  ACTION_ATHLETE_ADJUST: "ADJUST",
  ACTION_ATHLETE_CONTINUE: "CONTINUE",
  ACTION_ATHLETE_IN: "IN",
  ACTION_ATHLETE_RE: "RE",

  // Competition Match Actions
  ACTION_MATCH_CONFIG: "CONFIG",
  ACTION_MATCH_HISTORY: "HISTORY",
  ACTION_MATCH_START: "START",
}

export const LIST_STATUS_ATHLETE = [
  { key: "WAI", label: "Chờ" },
  { key: "IN", label: "Đang diễn ra" },
  { key: "FIN", label: "Kết thúc" },
  { key: "CAN", label: "Huỷ" },
  { key: "OTH", label: "Khác" },
];

export const LIST_JUDGE_PRORMISSION = [
  { key: 1, label: "Giám định 1" },
  { key: 2, label: "Giám định 2" },
  { key: 3, label: "Giám định 3" },
  { key: 4, label: "Giám định 4" },
  { key: 5, label: "Giám định 5" },
  { key: 6, label: "Giám định 6" },
  { key: 7, label: "Giám định 7" },
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
