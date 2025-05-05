
const API_DANGKY_GIAMDINH_SUCCESS = {
    PATH: null,
    TOPIC: 'REGISTER',
    REQ: {
        "referrer": 1,
        "device_id": "ID_SAMSUNG_001",
        "room_id": "IQNYUN91MW"
    },
    RES: {
        "type": "REGISTER",
        "status": 200,
        "message": "Đăng ký thành công, chờ phê duyệt",
        "data": {
            "room_id": "IQNYUN91MW",
            "client_ip": null,
            "uuid_desktop": null,
            "device_id": "ID_SAMSUNG_001",
            "device_name": null,
            "connect_status_code": "CONNECTED",
            "connect_status_name": "Đã kết nối",
            "register_status_code": "PROCESSING",
            "register_status_name": "Đã kết nối và chờ duyệt",
            "referrer": 1,
            "socket_id": "DbfkIogAgnx7H9hmAAAB",
            "permission": 0,
            "token": null,
            "permiession": 1
        }
    }
}

const API_DANGKY_GIAMDINH_FAILED = {
    PATH: null,
    TOPIC: 'REGISTER',
    REQ: {
        "referrer": 1,
        "device_id": "ID_SAMSUNG_001",
        "room_id": "5TCWC19BIE"
    },
    RES: {
        "type": "REGISTER",
        "status": 400,
        "message": "Đăng ký không thành công. Vui lòng scanQR để tíếp tục",
        "data": {
            "room_id": null,
            "client_ip": null,
            "uuid_desktop": null,
            "device_id": null,
            "device_name": null,
            "connect_status_code": null,
            "connect_status_name": null,
            "register_status_code": null,
            "register_status_name": null,
            "referrer": null,
            "socket_id": "eL11sUFmxu86Qzo8AAAB",
            "permission": 0,
            "token": null
        }
    }
}

const RES_MSG = {
    APPROVED : {}
}

// const API_DANGKY_GIAMDINH = {
//     PATH: null,
//     TOPIC: 'REGISTER',
//     REQ:{
//         referrer: 1,
//         device_id: "ID_SAMSUNG_001",
//         room_id: "5TCWC19BIE"
//     },
//     RES:{}
// }
