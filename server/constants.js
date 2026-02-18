const CONSTANT = {
    REQ_MSG : 'REQ_MSG',
    REQ_MSG_ADMIN: 'REQ_MSG_ADMIN',
    RES_MSG : 'RES_MSG',
    RES_ROOM_ADMIN: 'RES_ROOM_ADMIN',
    REGISTER_ROOM_ADMIN: 'REGISTER_ROOM_ADMIN',
    REGISTER: 'REGISTER',
    ADMIN_FETCH_CONN: 'ADMIN_FETCH_CONN', // lấy danh sách đang kết nối
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    DISCONNECTED: 'DISCONNECTED',
    DISCONNECT_CLIENT: 'DISCONNECT_CLIENT',

    SCORE_RED: 'SCORE_RED',
    SCORE_BLUE: 'SCORE_BLUE',
    SCORE_QUYEN: 'SCORE_QUYEN',
    DK_INFO: 'DK_INFO',
    QUYEN_INFO: 'QUYEN_INFO',
    INFO_REF: 'INFO_REF', // gửi thông tin Giám định về cho các thiết bị khác trong cùng phòng thi đấu
    SET_PERMISSION_REF: 'SET_PERMISSION_REF',
    GET_CONFIG: 'GET_CONFIG', // lấy thông tin gửi all client
    GET_INFO_DEVICE: 'GET_INFO_DEVICE', // nhận thông tin thiết bị gửi về cập nhât vào mapConn

    // Data Sync Events
    SYNC_REQUEST: 'SYNC_REQUEST',       // Yêu cầu đồng bộ dữ liệu
    SYNC_OFFER: 'SYNC_OFFER',           // Thông báo có yêu cầu đồng bộ
    SYNC_ACCEPT: 'SYNC_ACCEPT',         // Chấp nhận đồng bộ
    SYNC_REJECT: 'SYNC_REJECT',         // Từ chối đồng bộ
    SYNC_READY: 'SYNC_READY',           // Sẵn sàng đồng bộ
    SYNC_REJECTED: 'SYNC_REJECTED',     // Đã bị từ chối
    SYNC_DATA: 'SYNC_DATA',             // Gửi dữ liệu (chunks)
    SYNC_PROGRESS: 'SYNC_PROGRESS',     // Cập nhật tiến trình
    SYNC_COMPLETE: 'SYNC_COMPLETE',     // Hoàn thành đồng bộ
    SYNC_ERROR: 'SYNC_ERROR',           // Lỗi đồng bộ
}
const DATABASE_JS = "database.json";

// trạng thái kết nối socket
const STATE_SOCKET = {
    DISCONNECT: {
        CODE: "DISCONNECT",
        NAME: "Ngắt kết nối",
    },
    CONNECTED:{
        CODE: "CONNECTED",
        NAME: "Đã kết nối",
    }
}

// Trạng thái đăng ký kết nối giám định 
const STATE_REG_CONN = {
    DISCONNECT: {
        CODE: "DISCONNECT",
        NAME: "Ngắt kết nối",
    },
    BEFORE_PROCESSING: {
        CODE: "BEFORE_PROCESSING",
        NAME: "Chưa đăng ký", // chưa đăng ký làm giám định
    },
    PROCESSING: {
        CODE: "PROCESSING",
        NAME: "Đã kết nối và chờ duyệt", // ngắt kết nối và chuyển thành trạng thái chờ duyệt
    },
    CONNECTED:{
        CODE: "CONNECTED",
        NAME: "Đã kết nối và được duyệt",
    },
    PAUSED:{
        CODE: "PAUSED",
        NAME: "Tạm ngưng kết nối",
    }
}

const RES_TYPE = {
    INIT: 'INIT',
    REGISTER: 'REGISTER',
    APPROVE_CONNECT: 'APPROVE_CONNECT',
    REJECT_CONNECT: 'REJECT_CONNECT',
}


// trạng thái kích hoạt thiết bị
const STATE_ACTIVE = {
    ACT : {
        name: 'Đã kích hoạt',
        code: 'ACT',
    },
    EXP: {
        name: 'Hết hạn',
        code: 'EXP',
    },
    NOT_ACT: {
        name: 'Chưa kích hoạt',
        code: 'NOT_ACT',           
    }
}
module.exports = {
    STATE_SOCKET,
    STATE_REG_CONN,
    CONSTANT,
    DATABASE_JS,
    RES_TYPE,
    STATE_ACTIVE
};