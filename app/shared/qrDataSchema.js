export const qrDataSchema = {
  STT: {
    prop: 'index',
    type: String,
    required: true
  },
  'Họ và tên': {
    prop: 'fullname',
    type: String,
    required: true
  },
  'Năm sinh': {
    prop: 'birthdate',
    type: String,
    required: true
  },
  'Giới tính': {
    prop: 'sex',
    type: String,
    required: true
  },
  'Cấp bậc': {
    prop: 'level',
    type: String,
    required: true
  },
  'Phân cấp': {
    prop: 'desc',
    type: String,
    required: true
  },
  'Đơn vị': {
    prop: 'unit',
    type: String,
    required: true
  },
  'Mã số thẻ': {
    prop: 'cardCode',
    type: String,
    required: true
  },
  'Ngày cấp thẻ': {
    prop: 'cardDate',
    type: String,
    required: true
  },
  'Ghi chú': {
    prop: 'note',
    type: String,
    required: true
  }
};

export const exportSchema = [
  {
    column: 'STT',
    type: String,
    value: (item) => item.index
  },
  {
    column: 'Họ và tên',
    type: String,
    value: (item) => item.fullname
  },
  {
    column: 'Năm sinh',
    type: String,
    value: (item) => item.birthdate
  },
  {
    column: 'Giới tính',
    type: String,
    value: (item) => item.sex
  },
  {
    column: 'Cấp bậc',
    type: String,
    value: (item) => item.level
  },
  {
    column: 'Phân cấp',
    type: String,
    value: (item) => item.desc
  },
  {
    column: 'Đơn vị',
    type: String,
    value: (item) => item.unit
  },
  {
    column: 'Mã số thẻ',
    type: String,
    value: (item) => item.cardCode
  },
  {
    column: 'Ngày cấp thẻ',
    type: String,
    value: (item) => item.cardDate
  },
  {
    column: 'Ghi chú',
    type: String,
    value: (item) => item.note
  }
];

export const playerListSchema = {
  ID: {
    prop: 'id',
    type: String,
    required: true
  },
  TT: {
    prop: 'stt',
    type: String,
    required: true
  },
  'HỌ TÊN': {
    prop: 'hoten',
    type: String,
    required: true
  },
  'ĐƠN VỊ': {
    prop: 'donvi',
    type: String,
    required: true
  },
  'NĂM SINH': {
    prop: 'namsinh',
    type: String,
    required: true
  },
  'CÂN NẶNG': {
    prop: 'cannang',
    type: String,
    required: true
  },
  'GHI CHÚ': {
    prop: 'ghichu',
    type: String,
    required: true
  },
  'KẾT QUẢ BỐC THĂM': {
    prop: 'ketquaboctham',
    type: String,
    required: true
  }
};
