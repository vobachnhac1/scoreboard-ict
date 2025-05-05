const { CONSTANT, RES_TYPE, STATE_SOCKET, STATE_REG_CONN } = require('../constants');
const crypto = require('crypto');

InitSocket = async (io) => {
/// ---------------------- SOCKET IO ---------------------- ///
    // permission: 1: cho phép gửi tin nhắn, 9: admin | 8: view client
    let list_connect = []; // danh sách kết nối
    let list_room = []; //  danh sách phòng
    let isCounting = false; // biến kiểm tra trạng thái đếm

    // đỏ   
    let socketSetDo1 = new Set();
    let socketSetDo2 = new Set();
    let socketSetDo3 = new Set();

    // xanh   
    let socketSetXanh1 = new Set();
    let socketSetXanh2 = new Set();
    let socketSetXanh3 = new Set();

    let config = {
        cau_hinh_lay_diem_thap : true, // 3 giám định: 1 giám định cho điểm 1 và 1 giám định cho điểm 2 => lấy điểm 1
        thoi_gian_nhay_diem:        1000, // miliseconds
        thoi_gian_hiep:             90, // giây
        thoi_gian_nghi_giua_hiep:   30, // giây
        thoi_gian_y_te:             120, // giây
        so_hiep:                    3, // 1 -> 5
        so_giam_dinh:               3, // 3|5
        tran_so : 1,
        vdv_xanh: {
            diem_tong: 0,
            diem_tru: 0,
            diem_cong: 0,
            so_lan_nhac_nho: 0,
            so_lan_canh_cao: 0,
            thang_cuoc: false
        },
        vdv_do: {
            diem_tong: 0,
            diem_tru: 0,
            diem_cong: 0,
            so_lan_nhac_nho: 0,
            so_lan_canh_cao: 0,
            thang_cuoc: false
        }
    }

    // Lưu danh sách kết nối hiện tại permission = 6(Admin) | permission = 0(Client)
    let MapConn ={};

    io.on('connection', (socket) => {
        console.log('\nMột client đã kết nối:', socket.id);
        const init = { 
            room_id: null,
            client_ip: null,
            uuid_desktop: null,
            device_id: null,
            device_name: null,

            connect_status_code: null,
            connect_status_name: null,
            register_status_code: null,
            register_status_name: null,

            referrer: 0,
            socket_id: socket.id,
            permission: 0,
            token: null,
        }   
        list_connect.push(init);
        MapConn[`${socket.id}`] = init
        console.log('MapConn: ', MapConn);
        
        io.to(socket.id).emit('RES_MSG', {
            type: RES_TYPE.INIT,
            status: 200,
            message: 'Kết nối thành công',
            data: init
        })

        // 1. Admin tạo một phòng để kết nối
        socket.on(CONSTANT.REGISTER_ROOM_ADMIN, (input) => {
            if(input?.room_id){
                socket.join(input?.room_id);
                console.log(`${socket.id}(Admin) đã tham gia phòng ${input?.room_id}`);
                // cập nhật dữ liệu 
                const admin = MapConn[`${socket.id}`];
                MapConn[`${socket.id}`] = {
                    ...admin,
                    connect_status_code: STATE_SOCKET.CONNECTED.CODE, 
                    connect_status_name: STATE_SOCKET.CONNECTED.NAME, 
                    register_status_code: 'ADMIN',
                    register_status_name: 'ADMIN',
                    referrer: 6,
                    socket_id: socket.id, 
                    token: null
                }
                // Phản hồi Admin
                io.to(input?.room_id).emit('RES_ROOM_ADMIN', {
                    path: CONSTANT.REGISTER_ROOM_ADMIN,
                    status: 200,
                    message: 'Thực hiện thành công',
                    data: {
                        room_id: input?.room_id,
                        ls_conn: MapConn
                    }
                });
            }
        });

        // 2. client gửi thông tin sau khi kết nối đến phòng bước 1
        socket.on(CONSTANT.REGISTER, (input) => {
            console.log('|------ INPUT REGISTER: ', input);
            const roomExists = io.sockets.adapter.rooms.has(input.room_id);
            const client = MapConn[`${socket.id}`]
            if (!roomExists) {
                socket.emit('RES_MSG', {
                    type: RES_TYPE.REGISTER,
                    status: 400,
                    message: 'Đăng ký không thành công. Vui lòng scanQR để tíếp tục',
                    data: client
                });
                return
            }
            if(client.token){
                console.log('client.token: ', client.token);
                io.to(input?.socket_id).emit('RES_MSG', {
                    status: 200,
                    message: 'Đã phê duyệt kết nối',
                    type: RES_TYPE.APPROVE_CONNECT, 
                    data: client
                }); 
                return;
            }
            const upt_client = {
                ...client,
                room_id: input.room_id,
                referrer: input.referrer,
                device_id: input.device_id,
                socket_id: socket.id,
                permiession: 1,
                connect_status_code: STATE_SOCKET.CONNECTED.CODE, 
                connect_status_name: STATE_SOCKET.CONNECTED.NAME, 
                register_status_code: STATE_REG_CONN.PROCESSING.CODE,
                register_status_name: STATE_REG_CONN.PROCESSING.NAME,
                socket_id: socket.id, 
                token: null
            }

            socket.join(input?.room_id);
            console.log(`MOBILE ${socket.id} đã tham gia phòng ${input?.room_id}`);

            io.to(input?.room_id).emit('RES_ROOM_ADMIN', {
                status: 200,
                message: 'Thực hiện thành công',
                data: {
                    room_id: input?.room_id,
                    ls_conn: MapConn
                }
            });

            socket.emit('RES_MSG', {
                type: RES_TYPE.REGISTER,
                status: 200,
                message: 'Đăng ký thành công, chờ phê duyệt',
                data: upt_client
            });
            
        });

        // 3. Admin phê duyệt kết nối
        socket.on(CONSTANT.APPROVED, (input) => {
            console.log('|------ INPUT APPROVED: ', input);
            const token = crypto.randomBytes(32).toString('hex');
            const client = MapConn[`${input.socket_id}`]
            if(!client){
                io.to(input?.room_id).emit('RES_ROOM_ADMIN', {
                    status: 400,
                    message: 'Thực hiện lỗi',
                    data: {
                        room_id: input?.room_id,
                        ls_conn: MapConn
                    }
                });
                return;
            }else{
                if(client.token){
                    console.log('client.token: ', client.token);
                    io.to(input?.socket_id).emit('RES_MSG', {
                        status: 200,
                        message: 'Đã phê duyệt kết nối',
                        type: RES_TYPE.APPROVE_CONNECT, 
                        data: client
                    }); 
                    return;
                }
                const upt_client ={
                    ...client,
                    referrer: 0,
                    connect_status_code: STATE_SOCKET.CONNECTED.CODE, 
                    connect_status_name: STATE_SOCKET.CONNECTED.NAME, 
                    register_status_code: STATE_REG_CONN.CONNECTED.CODE,
                    register_status_name: STATE_REG_CONN.CONNECTED.NAME,
                    token: token
                }
                MapConn[`${input.socket_id}`] = upt_client
                io.to(input?.socket_id).emit('RES_MSG', {
                    status: 200,
                    message: 'Đã phê duyệt kết nối',
                    type: RES_TYPE.APPROVE_CONNECT, 
                    data: upt_client
                }); 

                io.to(input?.room_id).emit('RES_ROOM_ADMIN', {
                    status: 200,
                    message: 'Thực hiện thành công',
                    data: {
                        room_id: input?.room_id,
                        ls_conn: MapConn
                    }
                });
            }            
        });

        // 4. Admin từ chối kết nối         
        socket.on(CONSTANT.REJECTED, (input) => { 
            console.log('|------ INPUT REJECTED: ', input);
            const client = MapConn[`${input.socket_id}`];
            if(!client){
                io.to(input?.room_id).emit('RES_ROOM_ADMIN', {
                    status: 400,
                    message: 'Thực hiện lỗi',
                    data: {
                        room_id: input?.room_id,
                        ls_conn: MapConn
                    }
                });
                return;
            }
            const upt_client ={
                ...client,
                connect_status_code: STATE_SOCKET.CONNECTED.CODE, 
                connect_status_name: STATE_SOCKET.CONNECTED.NAME, 
                register_status_code: STATE_REG_CONN.PROCESSING.CODE,
                register_status_name: STATE_REG_CONN.PROCESSING.NAME,
                permission: 0,
                token: null
            }
            MapConn[`${input.socket_id}`] = upt_client
            io.to(input.socket_id).emit('RES_MSG', {
                status: 200,
                message: 'Đã từ chối kết nối',
                type: RES_TYPE.APPROVE_CONNECT,
                data: upt_client
            });
            io.to(input?.room_id).emit('RES_ROOM_ADMIN', {
                status: 200,
                message: 'Thực hiện thành công',
                data: {
                    room_id: input?.room_id,
                    ls_conn: MapConn
                }
            });        
        });

        // 5. Admin ngắt kết nối client
        socket.on(CONSTANT.DISCONNECT_CLIENT, (input) => {
            console.log('|------ INPUT DISCONNECT_CLIENT: ', input);
            const client = MapConn[`${input.socket_id}`];
            if(!client){
                io.to(input?.room_id).emit('RES_ROOM_ADMIN', {
                    status: 400,
                    message: 'Thực hiện lỗi',
                    data: {
                        room_id: input?.room_id,
                        ls_conn: MapConn
                    }
                });
                return;
            }
            const upt_client ={
                ...client,
                connect_status_code: STATE_SOCKET.DISCONNECT.CODE, 
                connect_status_name: STATE_SOCKET.DISCONNECT.NAME, 
                register_status_code: STATE_REG_CONN.DISCONNECT.CODE,
                register_status_name: STATE_REG_CONN.DISCONNECT.NAME,
                permission: 0,
                token: null
            }
            MapConn[`${input.socket_id}`] = upt_client


            // Ngắt kết nối client
            io.to(input.socket_id).emit('RES_MSG', {
                status: 200,
                message: 'Đã ngắt kết nối client',
                type: RES_TYPE.DISCONNECT_CLIENT,
                data: null
            });

            setTimeout(() => {
                disconnectBySocketId(input.socket_id);
            }, 1000);

            io.to(input?.room_id).emit('RES_ROOM_ADMIN', {
                status: 200,
                message: 'Thực hiện thành công',
                data: {
                    room_id: input?.room_id,
                        ls_conn: MapConn
                }
            });
            socket.emit('RES_MSG', {
                status: 200,
                message: 'Đã ngắt kết nối',
                data: upt_client
            });
        });

        // 7. Nhận tin nhắn từ client
        socket.on(CONSTANT.REQ_MSG, (input) => {
            // Nếu chưa đếm thì bắt đầu đếm
            const {score:{blue,red}, key} = input;
            if(!key){
                socket.emit('RES_MSG', {
                    status: 'error',
                    message: 'Thiết bị chưa được xác thực',
                });
                return
            }
            if (!isCounting) {
                isCounting = true;
                // điểm xanh
                if(blue == 1){
                    socketSetXanh1.add(socket.id);
                }else if(blue == 2){
                    socketSetXanh2.add(socket.id);
                }else if(blue == 3){
                    socketSetXanh3.add(socket.id);
                }

                // điểm đỏ  
                if(red == 1){
                    socketSetDo1.add(socket.id);

                }else if(red == 2){
                    socketSetDo2.add(socket.id);

                }else if(red == 3){
                    socketSetDo3.add(socket.id);
                }

                // Bắt đầu đếm trong 1 giây
                setTimeout(() => {
                    console.log(`Số lượng socketSetXanh1 trong 1s: ${socketSetXanh1.size}`);
                    console.log(`Số lượng socketSetXanh2 trong 1s: ${socketSetXanh2.size}`);
                    console.log(`Số lượng socketSetXanh3 trong 1s: ${socketSetXanh3.size}`);
                    console.log(`Số lượng socketSetDo1 trong 1s: ${socketSetDo1.size}`);
                    console.log(`Số lượng socketSetDo2 trong 1s: ${socketSetDo2.size}`);
                    console.log(`Số lượng socketSetDo3 trong 1s: ${socketSetDo3.size}`);
                    if(config.so_giam_dinh == 3){
                        // Nếu có 2 socket trở lên thì cộng điểm
                        // Xanh cộng 1
                        if(socketSetXanh1.size >= 2 ){
                            config.vdv_xanh.diem_cong += 1;
                            console.log(`✅ Xanh được +1 điểm! Tổng điểm: ${config.vdv_xanh.diem_cong}`);
                        }

                        // Xanh cộng 2
                        if(socketSetXanh2.size >= 2 ){
                            config.vdv_xanh.diem_cong += 2;
                            console.log(`✅ Xanh được +2 điểm! Tổng điểm: ${config.vdv_xanh.diem_cong}`);
                        }

                        // Xanh cộng 3
                        if(socketSetXanh3.size >= 2 ){
                            config.vdv_xanh.diem_cong += 3;
                            console.log(`✅ Xanh được +3 điểm! Tổng điểm: ${config.vdv_xanh.diem_cong}`);
                        }
                        // Đỏ cộng 1
                        if(socketSetDo1.size >= 2 ){
                            config.vdv_do.diem_cong += 1;
                            console.log(`✅ Đỏ được +1 điểm! Tổng điểm: ${config.vdv_do.diem_cong}`);
                        }
                        // Đỏ cộng 2
                        if(socketSetDo2.size >= 2 ){
                            config.vdv_do.diem_cong += 2;
                            console.log(`✅ Đỏ được +2 điểm! Tổng điểm: ${config.vdv_do.diem_cong}`);
                        }
                        // Đỏ cộng 3
                        if(socketSetDo3.size >= 2 ){
                            config.vdv_do.diem_cong += 3;
                            console.log(`✅ Đỏ được +3 điểm! Tổng điểm: ${config.vdv_do.diem_cong}`);
                        }

                        // thực hiện điểm thấp
                        if(config.cau_hinh_lay_diem_thap){
                            // Xanh cộng 1
                            if((socketSetXanh1.size == 1 && socketSetXanh2.size == 1 && socketSetXanh3.size == 0) 
                                || (socketSetXanh1.size == 1 && socketSetXanh2.size == 1 && socketSetXanh3.size == 1) ){
                                config.vdv_xanh.diem_cong += 1;
                                console.log(`✅ Xanh được +1 điểm! Tổng điểm: ${config.vdv_xanh.diem_cong}`);
                            }

                            // Xanh cộng 2
                            if(socketSetXanh1.size == 0 && socketSetXanh2.size == 1 && socketSetXanh3.size == 1 ){
                                config.vdv_xanh.diem_cong += 2;
                                console.log(`✅ Xanh được +2 điểm! Tổng điểm: ${config.vdv_xanh.diem_cong}`);
                            }

                            // Đỏ cộng 1
                            if((socketSetDo1.size == 1 && socketSetDo2.size == 1 && socketSetDo3.size == 0) 
                                || (socketSetDo1.size == 1 && socketSetDo2.size == 1 && socketSetDo3.size == 1) ){
                                config.vdv_do.diem_cong += 1;
                                console.log(`✅ Đỏ được +1 điểm! Tổng điểm: ${config.vdv_do.diem_cong}`);
                            }

                            // Đỏ cộng 2
                            if(socketSetDo1.size == 0 && socketSetDo2.size == 1 && socketSetDo3.size == 1 ){
                                config.vdv_do.diem_cong += 2;
                                console.log(`✅ Đỏ được +2 điểm! Tổng điểm: ${config.vdv_do.diem_cong}`);
                            }
                        }
                    }else if(config.so_giam_dinh == 5){
                        // Nếu có 3 socket trở lên thì cộng điểm
                        // Xanh cộng 1
                        if(socketSetXanh1.size >= 3 ){
                            config.vdv_xanh.diem_cong += 1;
                            console.log(`✅ Xanh được +1 điểm! Tổng điểm: ${config.vdv_xanh.diem_cong}`);
                        }

                        // Xanh cộng 2
                        if(socketSetXanh2.size >= 3 ){
                            config.vdv_xanh.diem_cong += 2;
                            console.log(`✅ Xanh được +2 điểm! Tổng điểm: ${config.vdv_xanh.diem_cong}`);
                        }

                        // Xanh cộng 3
                        if(socketSetXanh3.size >= 3 ){
                            config.vdv_xanh.diem_cong += 3;
                            console.log(`✅ Xanh được +3 điểm! Tổng điểm: ${config.vdv_xanh.diem_cong}`);
                        }
                        // Đỏ cộng 1
                        if(socketSetDo1.size >= 3 ){
                            config.vdv_do.diem_cong += 1;
                            console.log(`✅ Đỏ được +1 điểm! Tổng điểm: ${config.vdv_do.diem_cong}`);
                        }
                        // Đỏ cộng 2
                        if(socketSetDo2.size >= 3 ){
                            config.vdv_do.diem_cong += 2;
                            console.log(`✅ Đỏ được +2 điểm! Tổng điểm: ${config.vdv_do.diem_cong}`);
                        }
                        // Đỏ cộng 3
                        if(socketSetDo3.size >= 3 ){
                            config.vdv_do.diem_cong += 3;
                            console.log(`✅ Đỏ được +3 điểm! Tổng điểm: ${config.vdv_do.diem_cong}`);
                        }
                        // thực hiện điểm thấp
                        if(config.cau_hinh_lay_diem_thap){
                            // Xanh cộng 1
                            if((socketSetXanh1.size == 2 && socketSetXanh2.size == 1 && socketSetXanh3.size == 0) 
                                || (socketSetXanh1.size == 1 && socketSetXanh2.size == 1 && socketSetXanh3.size == 1)
                                ){
                                config.vdv_xanh.diem_cong += 1;
                                console.log(`✅ Xanh được +1 điểm! Tổng điểm: ${config.vdv_xanh.diem_cong}`);
                            }

                            // Xanh cộng 2
                            if((socketSetXanh1.size == 0 && socketSetXanh2.size == 2 && socketSetXanh3.size == 1) 
                                || (socketSetXanh1.size == 1 && socketSetXanh2.size == 2 && socketSetXanh3.size == 0) 
                                || (socketSetXanh1.size == 1 && socketSetXanh2.size == 1 && socketSetXanh3.size == 2) 
                            ){
                                config.vdv_xanh.diem_cong += 2;
                                console.log(`✅ Xanh được +2 điểm! Tổng điểm: ${config.vdv_xanh.diem_cong}`);
                            }

                            // Đỏ cộng 1
                            if((socketSetDo1.size == 2 && socketSetDo2.size == 1 && socketSetDo3.size == 0) 
                                || (socketSetDo1.size == 1 && socketSetDo2.size == 1 && socketSetDo3.size == 1)
                                ){
                                config.vdv_do.diem_cong += 1;
                                console.log(`✅ Đỏ được +1 điểm! Tổng điểm: ${config.vdv_do.diem_cong}`);
                            }

                            // Đỏ cộng 2
                            if((socketSetDo1.size == 0 && socketSetDo2.size == 2 && socketSetDo3.size == 1) 
                                || (socketSetDo1.size == 1 && socketSetDo2.size == 2 && socketSetDo3.size == 0) 
                                || (socketSetDo1.size == 1 && socketSetDo2.size == 1 && socketSetDo3.size == 2) 
                            ){
                                config.vdv_do.diem_cong += 2;
                                console.log(`✅ Đỏ được +2 điểm! Tổng điểm: ${config.vdv_do.diem_cong}`);
                            }
                        }
                    }
                    
                    // Reset lại vòng đếm mới
                    socketSetXanh1.clear();
                    socketSetXanh2.clear();
                    socketSetXanh3.clear();
                    socketSetDo1.clear();
                    socketSetDo2.clear();
                    socketSetDo3.clear();
                    isCounting = false;
                }, config.thoi_gian_nhay_diem);
            }else{
                // Nếu đang đếm thì chỉ thêm socket.id
                if(blue == 1){
                    socketSetXanh1.add(socket.id);

                }else if(blue == 2){
                    socketSetXanh2.add(socket.id);

                }else if(blue == 3){
                    socketSetXanh3.add(socket.id);
                }

                if(red == 1){
                    socketSetDo1.add(socket.id);

                }else if(red == 2){
                    socketSetDo2.add(socket.id);

                }else if(red == 3){
                    socketSetDo3.add(socket.id);
                }
            }
        });

        // 8. Nhận tin nhắn từ admin
        socket.on(CONSTANT.REQ_MSG_ADMIN, (input) => {
            // cập nhật thông tin
            // vị trí giám định
            const {referrer, socket_id } = input;
            const rc_socket = list_connect.find((item) => item.socket_id === socket_id);
            if(rc_socket){
                list_connect = list_connect.map((item) => {
                    if (item.socket_id === socket_id) {
                        return {...item, referrer: referrer};
                    }
                    return item;
                });
                io.to(input?.room_id).emit('RES_ROOM_ADMIN', {
                    status: 200,
                    message: 'Thực hiện thành công',
                    data: {
                        room_id: input?.room_id,
                        list_connect: list_connect
                    }
                });

                io.to(socket_id).emit('RES_MSG', {
                    status: 200,
                    message: 'Thực hiện thành công',
                    data: {
                        ...rc_socket,
                        referrer: referrer
                    }
                });
            }
        });

        // 9. Admin:  Lấy thông tin kết nối socket
        socket.on(CONSTANT.ADMIN_FETCH_CONN, ()=>{
            socket.emit('RES_ROOM_ADMIN',{
                path: CONSTANT.ADMIN_FETCH_CONN,
                status: 200,
                message: 'Thực hiện thành công',
                data: {
                    ls_conn: MapConn
                }
            })
        })

        // 6. Khi client ngắt kết nối
        socket.on('disconnect', () => {
            const client = MapConn[`${socket.id}`];
            if(!client){
                disconnectBySocketId(socket.id);
                return
            }
            if(client.register_status_code == 'ADMIN'){
                console.log('Chủ host ngắt kết nối: ', socket.id);
                disconnectRoom(client.room_id);
                MapConn = {}
            }else{
                disconnectBySocketId(socket.id)
                console.log('Mobile ngắt kết nối: ', socket.id);
                delete  MapConn[`${socket.id}`];
            }
            console.log('MapConn: ', MapConn);
        });
    
    });


    // Ngắt kết nối một socket theo socketId
    const disconnectBySocketId = (socketId) => {
        const socket = io.sockets.sockets.get(socketId);
        if (socket) {
        socket.disconnect(true); // true = ngắt hoàn toàn
        console.log(`Đã ngắt kết nối socket: ${socketId}`);
        } else {
        console.log(`Không tìm thấy socketId: ${socketId}`);
        }
    };

    // Ngắt kết nối tất cả socket trong một phòng
    const disconnectRoom = async (room_id) => {
        const sockets = await io.in(room_id).fetchSockets();
        for (const socket of sockets) {
            console.log(`Ngắt kết nối socket ${socket.id} trong phòng ${room_id}`);
            socket.disconnect(true); // hoặc socket.leave(roomName) nếu chỉ muốn rời phòng
        }
        console.log(`Đã ngắt kết nối tất cả socket trong phòng: ${room_id}`);
    };
}
module.exports = {
    InitSocket
};