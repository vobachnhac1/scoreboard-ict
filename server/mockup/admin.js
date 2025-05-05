const API_DANGKY_ADMIN = {
    PATH: null,
    TOPIC: 'REGISTER_ROOM_ADMIN',
    REQ: {
        uuid_desktop: "CO2GJ74NMD6M",
        room_id: "IQNYUN91MW",
        permission: 9
    },
    RES: {
        path: "REGISTER_ROOM_ADMIN",
        status: 200,
        message: "Thực hiện thành công",
        data: {
            room_id: "IQNYUN91MW",
            ls_conn:  {
                BzAF772ieAJN7V6tAAAB: {
                    room_id: null,
                    client_ip: null,
                    uuid_desktop: null,
                    device_id: null,
                    device_name: null,
                    connect_status_code: null,
                    connect_status_name: null,
                    register_status_code: null,
                    register_status_name: null,
                    referrer: null,
                    socket_id: 'BzAF772ieAJN7V6tAAAB',
                    permission: 0,
                    token: null
                }
            }
        }
    }
};

const API_DONGY_GIAMDINH ={
    PATH: null,
    TOPIC: 'APPROVED',
    REQ:{
        socket_id: "BAQztSoAFKnBi5M_AAAH", 
        room_id: "5TCWC19BIE"
    },
    RES: {
        "status": 200,
        "message": "Thực hiện thành công",
        "data": {
            "room_id": "1AZJM9JL8D",
            "ls_conn": {
                "ot_-BDESbZjPoSjEAAAN": {
                    "room_id": null,
                    "client_ip": null,
                    "uuid_desktop": null,
                    "device_id": null,
                    "device_name": null,
                    "connect_status_code": "CONNECTED",
                    "connect_status_name": "Đã kết nối",
                    "register_status_code": "ADMIN",
                    "register_status_name": "ADMIN",
                    "referrer": 6,
                    "socket_id": "ot_-BDESbZjPoSjEAAAN",
                    "permission": 0,
                    "token": null
                },
                "1gfhGJiLnpE-8d2cAAAP": {
                    "room_id": null,
                    "client_ip": null,
                    "uuid_desktop": null,
                    "device_id": null,
                    "device_name": null,
                    "connect_status_code": "CONNECTED",
                    "connect_status_name": "Đã kết nối",
                    "register_status_code": "CONNECTED",
                    "register_status_name": "Đã kết nối và được duyệt",
                    "referrer": null,
                    "socket_id": "1gfhGJiLnpE-8d2cAAAP",
                    "permission": 0,
                    "token": "eb014ff8e1a70bfc16693ec507d05a367dd9d92af952de7aaaefbce8572105b9"
                }
            }
        }
    }
}

