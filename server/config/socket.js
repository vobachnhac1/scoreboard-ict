const { CONSTANT, RES_TYPE, STATE_SOCKET, STATE_REG_CONN } = require('../constants');
const crypto = require('crypto');
const init_config_db = require('../services/init-config');

// Wrapper function để bọc socket handlers với try/catch
const safeSocketHandler = (handlerName, handler) => {
    return async function(...args) {
        try {
            await handler.apply(this, args);
        } catch (error) {
            console.error(`❌ Error in socket handler [${handlerName}]:`, {
                error: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });

            // Không crash server, chỉ log error
            // Có thể emit error về client nếu cần
            try {
                if (this && this.emit) {
                    this.emit('RES_MSG', {
                        status: 500,
                        message: `Lỗi server khi xử lý ${handlerName}`,
                        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
                    });
                }
            } catch (emitError) {
                console.error(`❌ Error khi emit error message:`, emitError);
            }
        }
    };
};

InitSocket = async (io) => {
/// ---------------------- SOCKET IO ---------------------- ///
    // permission: 1: cho phép gửi tin nhắn, 9: admin | 8: view client
    let list_connect = []; // danh sách kết nối
    let list_room = []; //  danh sách phòng
    let isCounting = false; // biến kiểm tra trạng thái đếm

    // đỏ (cho REQ_MSG - legacy)
    let socketSetDo1 = new Set();
    let socketSetDo2 = new Set();
    let socketSetDo3 = new Set();

    // xanh (cho REQ_MSG - legacy)
    let socketSetXanh1 = new Set();
    let socketSetXanh2 = new Set();
    let socketSetXanh3 = new Set();

    // Mới: Sets cho SCORE_RED và SCORE_BLUE
    // Structure: Map<referrer, Map<score, Set<socket_id>>>
    let redScoreSets = {
        1: new Set(), // score = 1 (vàng)
        2: new Set(), // score = 2 (xanh lá)
        3: new Set()  // score = 3 (đỏ)
    };
    let blueScoreSets = {
        1: new Set(), // score = 1 (vàng)
        2: new Set(), // score = 2 (xanh lá)
        3: new Set()  // score = 3 (đỏ)
    };
    let isCountingRed = false;
    let isCountingBlue = false;

    let config = {
        cau_hinh_lay_diem_thap : true, // 3 giám định: 1 giám định cho điểm 1 và 1 giám định cho điểm 2 => lấy điểm 1
        thoi_gian_tinh_diem:        1000, // miliseconds
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
    let MapConnAll = {}
    let connAdmin = {}
    // thực hiện gọi API lấy cấu hình admin 
    const fetchAdminConfig = async () => {
        try {
            const res_config  = await init_config_db.getAllKeyValueByKey('system');
            let config = {};
            res_config.forEach(element => {
                config[`${element.child_key}`] = element.value;
            });
            return config
        } catch (error) {
            console.log('[fetchAdminConfig] error: ', error);
            return {}
        }
    }
    // gán vào cấu hình 
    fetchAdminConfig().then((res) => {
        config = {cau_hinh_lay_diem_thap : true, ...res};
        console.log('fetchAdminConfig config: ', config);
    })

    io.on('connection', (socket) => {
        console.log('\nMột client đã kết nối:', socket.id);
        // admin
        const admin = MapConn[`${socket.id}`];        
        const init = { 
            room_id: admin?.room_id ?? null,
            client_ip: socket.handshake.address.split('::ffff:').pop(),
            uuid_desktop: null,
            device_id: null,
            device_name: null,

            connect_status_code: STATE_SOCKET.CONNECTED.CODE,
            connect_status_name: STATE_SOCKET.CONNECTED.NAME,
            register_status_code: STATE_SOCKET.DISCONNECT.CODE,
            register_status_name: STATE_SOCKET.DISCONNECT.NAME,
            referrer: 0,
            socket_id: socket.id,
            permission: 0,
            token: null,
        }   
        list_connect.push(init);
        MapConn[`${socket.id}`] = init
        connAdmin = init
        console.log('MapConn: ', MapConn);
        io.emit('RES_ROOM_ADMIN', {
            status: 200,
            message: 'Thực hiện thành công',
            path:  "ADMIN_FETCH_CONN",
            data: {
                ls_conn: MapConn
            }
        });

        io.to(socket.id).emit('RES_MSG', {
            type: RES_TYPE.INIT,
            status: 200,
            message: 'Kết nối thành công',
            data: init
        })

        // 1. Admin tạo một phòng để kết nối
        socket.on(CONSTANT.REGISTER_ROOM_ADMIN, safeSocketHandler('REGISTER_ROOM_ADMIN', (input) => {
            console.log('|------ INPUT REGISTER_ROOM_ADMIN: ', input);
            if(input?.room_id){
                socket.join(input?.room_id);
                console.log(`${socket.id}(Admin) đã tham gia phòng ${input?.room_id}`);
                // cập nhật dữ liệu
                const admin = MapConn[`${socket.id}`];
                MapConn[`${socket.id}`] = {
                    ...admin,
                    connect_status_code: getConnectStatusCode('active'),
                    connect_status_name: getConnectStatusName('active'),
                    register_status_code: 'ADMIN',
                    register_status_name: 'ADMIN',
                    referrer: 6,
                    socket_id: socket.id,
                    room_id: input?.room_id,
                    uuid_desktop: input?.uuid_desktop,
                    token: null
                }
                connAdmin = MapConn[`${socket.id}`]
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
        }));

        // 2. client gửi thông tin sau khi kết nối đến phòng bước 1
        socket.on(CONSTANT.REGISTER, safeSocketHandler('REGISTER', (input) => {
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
            if(client?.token){
                console.log('client.token: ', client?.token);
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
                client_ip: input.ip,
                room_id: input.room_id,
                referrer: input.referrer,
                device_id: input.device_id,
                socket_id: socket.id,
                permission: 1,
                connect_status_code: getConnectStatusCode('active'), 
                connect_status_name: getConnectStatusName('active'), 
                register_status_code: getRegisterStatusCode('pending'),
                register_status_name: getRegisterStatusName('pending'),
                socket_id: socket.id, 
                token: null
            }

            socket.join(input?.room_id);
            console.log(`MOBILE ${socket.id} đã tham gia phòng ${input?.room_id}`);

            MapConn[`${socket.id}`] = upt_client
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

        }));

        // 3. Admin phê duyệt kết nối
        socket.on(CONSTANT.APPROVED, safeSocketHandler('APPROVED', (input) => {
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
                if(client?.token){
                    console.log('client.token: ', client?.token);
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
                    referrer: 0, // chưa gán vị trí giám định | chờ phân công
                    connect_status_code: getConnectStatusCode('active'), 
                    connect_status_name: getConnectStatusName('active'), 
                    register_status_code: getRegisterStatusCode('approved'),
                    register_status_name: getRegisterStatusName('approved'),
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
        }));

        // 4. Admin từ chối kết nối
        socket.on(CONSTANT.REJECTED, safeSocketHandler('REJECTED', (input) => {
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
                connect_status_code: getConnectStatusCode('active'), 
                connect_status_name: getConnectStatusCode('active'), 
                register_status_code: getRegisterStatusCode('pending'),
                register_status_name: getRegisterStatusCode('pending'),
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
        }));

        // 5. Admin ngắt kết nối client
        socket.on(CONSTANT.DISCONNECT_CLIENT, safeSocketHandler('DISCONNECT_CLIENT', (input) => {
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
                connect_status_code: getConnectStatusCode('inactive'), 
                connect_status_name: getConnectStatusCode('inactive'), 
                register_status_code: getRegisterStatusCode('rejected'),
                register_status_name: getRegisterStatusName('rejected'),
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
        }));

        // 7. Nhận tin nhắn từ client
        socket.on(CONSTANT.REQ_MSG, safeSocketHandler('REQ_MSG', (input) => {
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
                }, config.thoi_gian_tinh_diem);
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
        }));

        // 8. Nhận tin nhắn từ admin
        socket.on(CONSTANT.REQ_MSG_ADMIN, safeSocketHandler('REQ_MSG_ADMIN', (input) => {
            // cập nhật thông tin | vị trí giám định
            const {referrer, socket_id, room_id } = input;
            const rc_socket = MapConn[`${socket_id}`];
            if(rc_socket){
                console.log('Cập nhật thông tin giám định');
                const token = crypto.randomBytes(32).toString('hex');
                MapConn[`${socket_id}`] = {
                    ...MapConn[`${socket_id}`],
                    referrer: referrer,
                    device_name: input.device_name ?? rc_socket.device_name,
                    register_status_code: getRegisterStatusCode(input.accepted) ?? rc_socket.register_status_code,
                    register_status_name: getRegisterStatusName(input.accepted) ?? rc_socket.register_status_name,
                    connect_status_code: getConnectStatusCode(input.status) ?? rc_socket.connect_status_code,
                    connect_status_name: getConnectStatusName(input.status) ?? rc_socket.connect_status_name,
                    token: input.accepted == 'approved' ? token : null,
                    room_id: room_id
                  }
                
                // gửi Admin
                io.to(room_id).emit('RES_ROOM_ADMIN', {
                    status: 200,
                    message: 'Thực hiện thành công',
                    data: {
                        room_id: room_id,
                        ls_conn: MapConn
                    }
                });
                // gửi Mobile
                let sendTp = null;
                if(input.accepted == 'approved'){
                    sendTp = RES_TYPE.APPROVE_CONNECT;
                }else if(input.accepted == 'rejected'){
                    sendTp = RES_TYPE.REJECT_CONNECT;
                }else if(input.accepted == 'pending'){
                    sendTp = RES_TYPE.REJECT_CONNECT;
                }

                io.to(socket_id).emit('RES_MSG', {
                    status: 200,
                    message: 'Thực hiện thành công',
                    data: MapConn[`${socket_id}`],
                    type: sendTp
                });
            }
        }));

        // 9. Admin:  Lấy thông tin kết nối socket
        socket.on(CONSTANT.ADMIN_FETCH_CONN, safeSocketHandler('ADMIN_FETCH_CONN', () => {
            socket.emit('RES_ROOM_ADMIN',{
                path: CONSTANT.ADMIN_FETCH_CONN,
                status: 200,
                message: 'Thực hiện thành công',
                data: {
                    ls_conn: MapConn
                }
            })
        }))

        // Helper function: Tính điểm dựa trên Sets
        const calculateScore = (scoreSets, soGiamDinh, cauHinhLayDiemThap) => {
            let finalScore = 0;
            let finalRowIndex = -1; // -1 = không có điểm, 0 = vàng, 1 = xanh lá, 2 = đỏ

            const size1 = scoreSets[1].size; // điểm hệ 1
            const size2 = scoreSets[2].size; // điểm hệ 2
            const size3 = scoreSets[3].size; // điểm hệ 3
            const totalReferees = size1 + size2 + size3;

            console.log(`📊 Tính điểm: size1=${size1}, size2=${size2}, size3=${size3}, soGiamDinh=${soGiamDinh}, totalReferees=${totalReferees}`);

            if (soGiamDinh == 3) {
                // Logic cơ bản: >= 2 giám định đồng ý
                if (size1 >= 2) {
                    finalScore = 1;
                    finalRowIndex = 0; // vàng
                    console.log(`✅ Đạt đa số: +1 điểm (row vàng)`);
                } else if (size2 >= 2) {
                    finalScore = 2;
                    finalRowIndex = 1; // xanh lá
                    console.log(`✅ Đạt đa số: +2 điểm (row xanh lá)`);
                } else if (size3 >= 2) {
                    finalScore = 3;
                    finalRowIndex = 2; // đỏ
                    console.log(`✅ Đạt đa số: +3 điểm (row đỏ)`);
                }
                // Logic điểm thấp: Chỉ áp dụng khi size1 = 1 VÀ size2 = 1
                if (cauHinhLayDiemThap && finalScore === 0) {
                    // 1 GĐ cho điểm hệ 1 + 1 GĐ cho điểm hệ 2 → lấy điểm hệ 1 (điểm thấp)
                    if (size1 == 1 && size2 == 1) {
                        // ⚠️ KIỂM TRA: scoreSets[1] và scoreSets[2] phải có socket_id KHÁC NHAU
                        const socket1 = Array.from(scoreSets[1])[0]; // socket_id của điểm hệ 1
                        const socket2 = Array.from(scoreSets[2])[0]; // socket_id của điểm hệ 2

                        if (socket1 !== socket2) {
                            // 2 socket_id khác nhau → OK, tính điểm thấp
                            finalScore = 1;
                            finalRowIndex = 0; // vàng
                            console.log(`✅ Điểm thấp: +1 điểm (row vàng) - size1=1, size2=1, socket khác nhau`);
                        } else {
                            // Cùng socket_id → KHÔNG tính điểm
                            console.log(`❌ Điểm thấp: Không tính - scoreSets[1] và scoreSets[2] có cùng socket_id`);
                        }
                    }
                }
            } else if (soGiamDinh == 5) {
                // Logic cơ bản: >= 3 giám định đồng ý
                if (size1 >= 3) {
                    finalScore = 1;
                    finalRowIndex = 0; // vàng
                    console.log(`✅ Đạt đa số: +1 điểm (row vàng)`);
                } else if (size2 >= 3) {
                    finalScore = 2;
                    finalRowIndex = 1; // xanh lá
                    console.log(`✅ Đạt đa số: +2 điểm (row xanh lá)`);
                } else if (size3 >= 3) {
                    finalScore = 3;
                    finalRowIndex = 2; // đỏ
                    console.log(`✅ Đạt đa số: +3 điểm (row đỏ)`);
                }
                // Logic điểm thấp: Chỉ áp dụng khi size1 = 1 VÀ size2 = 1 VÀ totalReferees >= 3
                if (cauHinhLayDiemThap && finalScore === 0) {
                    // ⚠️ KIỂM TRA: Với 5 GĐ, cần ít nhất 3 GĐ gửi điểm
                    if (totalReferees < 3) {
                        console.log(`❌ Điểm thấp (5 GĐ): Không đủ giám định - totalReferees=${totalReferees} < 3`);
                    } else if (size1 >= 1 && size2 >= 1) {
                        // ⚠️ KIỂM TRA: Loại bỏ socket trùng lặp giữa scoreSets[1] và scoreSets[2]
                        const socket1 = Array.from(scoreSets[1]); // array socket_id của điểm hệ 1
                        const socket2 = Array.from(scoreSets[2]); // array socket_id của điểm hệ 2

                        // Loại bỏ các socket trong socket2 nếu đã tồn tại trong socket1
                        const socket2Filtered = socket2.filter(s => !socket1.includes(s));
                        // Tính tổng số socket sau khi loại bỏ trùng lặp
                        const totalUniqueReferees = socket1.length + socket2Filtered.length;
                        console.log(`🔍 Kiểm tra socket: socket1=${socket1.length}, socket2=${socket2.length}, socket2_filtered=${socket2Filtered.length}, total_unique=${totalUniqueReferees}`);
                        // Nếu tổng số socket unique >= 3 → tính điểm thấp
                        if (totalUniqueReferees >= 3) {
                            finalScore = 1;
                            finalRowIndex = 0; // vàng
                            console.log(`✅ Điểm thấp (5 GĐ): +1 điểm - socket1=${socket1.length}, socket2_filtered=${socket2Filtered.length}, total_unique=${totalUniqueReferees} >= 3`);
                        } else {
                            console.log(`❌ Điểm thấp (5 GĐ): Không đủ socket unique - total_unique=${totalUniqueReferees} < 3`);
                        }
                    }
                }
            }
            return { point: finalScore, rowIndex: finalRowIndex };
        };

        // 10. RED: lắng nghe điểm đỏ
        socket.on(CONSTANT.SCORE_RED, safeSocketHandler('SCORE_RED', (input) => {
            console.log('🔴 Điểm đỏ nhận được: ', input);
            const client = MapConn[`${socket.id}`];
            if (!client || !client.token) {
                console.log('❌ Client chưa được xác thực');
                return;
            }
            const { score } = input; // score: 1, 2, hoặc 3
            const referrer = client.referrer; // 1-5
            const room_id = client.room_id ?? connAdmin?.room_id;
            console.log(`📥 RF${referrer} cho ĐỎ ${score} điểm`);
            // Emit ngay để hiển thị hiệu ứng nháy
            io.to(room_id).emit(CONSTANT.SCORE_RED, {
                type: CONSTANT.SCORE_RED,
                status: 200,
                message: 'Nhận tín hiệu từ giám định',
                data: {
                    score: score,
                    referrer: referrer,
                    point: 0 // Chưa tính điểm, chỉ hiển thị nháy
                }
            });

            // Thêm vào Set tương ứng
            if (score >= 1 && score <= 3) {
                redScoreSets[score].add(socket.id);
            }

            // Nếu chưa đếm thì bắt đầu đếm
            if (!isCountingRed) {
                isCountingRed = true;
                console.log(`⏱️ Bắt đầu đếm ĐỎ trong ${config.thoi_gian_tinh_diem}ms`);

                setTimeout(() => {
                    console.log(`\n📊 Kết thúc đếm ĐỎ:`);
                    console.log(`   - Điểm 1 (vàng): ${redScoreSets[1].size} GĐ`);
                    console.log(`   - Điểm 2 (xanh lá): ${redScoreSets[2].size} GĐ`);
                    console.log(`   - Điểm 3 (đỏ): ${redScoreSets[3].size} GĐ`);

                    // Tính điểm
                    const result = calculateScore(
                        redScoreSets,
                        config.so_giam_dinh,
                        config.cau_hinh_lay_diem_thap
                    );

                    console.log(`🎯 Kết quả: ${result.point} điểm (row ${result.rowIndex})`);

                    // Nếu có điểm thì emit kết quả
                    if (result.point > 0) {

                        // Emit SCORE_RESULT về tất cả client trong room
                        io.to(room_id).emit('SCORE_RESULT', {
                            type: 'SCORE_RESULT',
                            status: 200,
                            message: `ĐỎ được +${result.point} điểm`,
                            data: {
                                team: 'red',
                                point: result.point,
                                details: {
                                    size1: redScoreSets[1].size,
                                    size2: redScoreSets[2].size,
                                    size3: redScoreSets[3].size
                                }
                            }
                        });

                        console.log(`✅ ĐỎ: +${result.point} điểm`);
                    } else {
                        console.log(`❌ ĐỎ: Không đủ điều kiện cộng điểm`);
                    }

                    // Reset
                    redScoreSets[1].clear();
                    redScoreSets[2].clear();
                    redScoreSets[3].clear();
                    isCountingRed = false;
                    console.log(`🔄 Reset ĐỎ, sẵn sàng chu kỳ mới\n`);
                }, config.thoi_gian_tinh_diem);
            } else {
                console.log(`⏳ Đang đếm ĐỎ, thêm vào Set hiện tại`);
            }
        }))

        // 11. BLUE: lắng nghe điểm xanh
        socket.on(CONSTANT.SCORE_BLUE, safeSocketHandler('SCORE_BLUE', (input) => {
            console.log('🔵 Điểm xanh nhận được: ', input);

            const client = MapConn[`${socket.id}`];
            if (!client || !client.token) {
                console.log('❌ Client chưa được xác thực');
                return;
            }

            const { score } = input; // score: 1, 2, hoặc 3
            const referrer = client.referrer; // 1-5
            const room_id = client.room_id ?? connAdmin?.room_id;

            console.log(`📥 RF${referrer} cho XANH ${score} điểm`);

            // Emit ngay để hiển thị hiệu ứng nháy
            io.to(room_id).emit(CONSTANT.SCORE_BLUE, {
                type: CONSTANT.SCORE_BLUE,
                status: 200,
                message: 'Nhận tín hiệu từ giám định',
                data: {
                    score: score,
                    referrer: referrer,
                    point: 0 // Chưa tính điểm, chỉ hiển thị nháy
                }
            });

            // Thêm vào Set tương ứng
            if (score >= 1 && score <= 3) {
                blueScoreSets[score].add(socket.id);
            }

            // Nếu chưa đếm thì bắt đầu đếm
            if (!isCountingBlue) {
                isCountingBlue = true;
                console.log(`⏱️ Bắt đầu đếm XANH trong ${config.thoi_gian_tinh_diem}ms`);

                setTimeout(() => {
                    console.log(`\n📊 Kết thúc đếm XANH:`);
                    console.log(`   - Điểm 1 (vàng): ${blueScoreSets[1].size} GĐ`);
                    console.log(`   - Điểm 2 (xanh lá): ${blueScoreSets[2].size} GĐ`);
                    console.log(`   - Điểm 3 (đỏ): ${blueScoreSets[3].size} GĐ`);

                    // Tính điểm
                    const result = calculateScore(
                        blueScoreSets,
                        config.so_giam_dinh,
                        config.cau_hinh_lay_diem_thap
                    );

                    console.log(`🎯 Kết quả: ${result.point} điểm (row ${result.rowIndex})`);

                    // Nếu có điểm thì emit kết quả
                    if (result.point > 0) {
                        // Emit SCORE_RESULT về tất cả client trong room
                        io.to(room_id).emit('SCORE_RESULT', {
                            type: 'SCORE_RESULT',
                            status: 200,
                            message: `XANH được +${result.point} điểm`,
                            data: {
                                team: 'blue',
                                point: result.point,
                                details: {
                                    size1: blueScoreSets[1].size,
                                    size2: blueScoreSets[2].size,
                                    size3: blueScoreSets[3].size
                                }
                            }
                        });
                        console.log(`✅ XANH: +${result.point} điểm.`);
                    } else {
                        console.log(`❌ XANH: Không đủ điều kiện cộng điểm`);
                    }

                    // Reset
                    blueScoreSets[1].clear();
                    blueScoreSets[2].clear();
                    blueScoreSets[3].clear();
                    isCountingBlue = false;
                    console.log(`🔄 Reset XANH, sẵn sàng chu kỳ mới\n`);
                }, config.thoi_gian_tinh_diem);
            } else {
                console.log(`⏳ Đang đếm XANH, thêm vào Set hiện tại`);
            }
        }))

        // 12. QUYEN: lắng nghe điểm quyền
        socket.on(CONSTANT.SCORE_QUYEN, safeSocketHandler('SCORE_QUYEN', (input) => {
            console.log('Điểm quyền: ', input);
            // io.to(client.room_id).emit(CONSTANT.SCORE_QUYEN, input);
            const client = MapConn[`${socket.id}`];
            // gửi Admin
            io.to(client?.room_id ?? connAdmin?.room_id).emit(CONSTANT.SCORE_QUYEN, {
                type: CONSTANT.SCORE_QUYEN,
                status: 200,
                message: 'Thực hiện thành công',
                data: {
                    score: input.score, 
                    referrer: client.referrer,
                }
            })
        }))

        // 13. DK_INFO: lắng nghe thông tin đk
        socket.on(CONSTANT.DK_INFO, safeSocketHandler('DK_INFO', (input) => {
            console.log('DK_INFO: ', input);
            // io.to(client.room_id).emit(CONSTANT.DK_INFO, input);
            const client = MapConn[`${socket.id}`];
            // gửi Admin
            io.to(client?.room_id).emit(CONSTANT.DK_INFO, {
                type: CONSTANT.DK_INFO,
                status: 200,
                message: 'Thực hiện thành công',
                data: input
            });

            // gửi cho từng client
            Object.values(MapConn).forEach((item) => {
                if(item.room_id == client.room_id){
                    io.to(item.socket_id).emit(CONSTANT.INFO_REF, {
                        type: CONSTANT.INFO_REF,
                        status: 200,
                        message: 'Thực hiện thành công',
                        data: {
                            referrer: item.referrer,
                        }
                    });
                }
            })
        }))

        // 14. QUYEN_INFO: lắng nghe thông tin quyền
        socket.on(CONSTANT.QUYEN_INFO, safeSocketHandler('QUYEN_INFO', (input) => {
            console.log('QUYEN_INFO: ', input);
            // io.to(client.room_id).emit(CONSTANT.QUYEN_INFO, input);
            const client = MapConn[`${socket.id}`];
            // gửi Admin
            io.to(client?.room_id).emit(CONSTANT.QUYEN_INFO, {
                type: CONSTANT.QUYEN_INFO,
                status: 200,
                message: 'Thực hiện thành công',
                data: input
            });
            
            // gửi cho từng client
            Object.values(MapConn).forEach((item) => {
                if(item.room_id == client.room_id){
                    io.to(item.socket_id).emit(CONSTANT.INFO_REF, {
                        type: CONSTANT.INFO_REF,
                        status: 200,
                        message: 'Thực hiện thành công',
                        data: {
                            referrer: item.referrer,
                        }
                    });
                }
            })

        }))

        // 15. SET_PERMISSION_REF: cấp quyền chấm điểm, và phân luôn giám định
        socket.on(CONSTANT.SET_PERMISSION_REF, safeSocketHandler('SET_PERMISSION_REF', (input) => {
            fetchAdminConfig().then((res) => {
                config = {cau_hinh_lay_diem_thap : true, ...res};
                console.log('fetchAdminConfig config: ', config);
            })
            console.log('SET_PERMISSION_REF: ', input);
            const {room_id, socket_id, referrer, accepted, status} = input;
            const client = MapConn[`${input.socket_id}`];
            const admin = MapConn[`${socket.id}`];
            const __room_id = room_id ?? admin.room_id ?? client.room_id;


            // // kiểm tra room_id trong socket 
            // const token = crypto.randomBytes(32).toString('hex');
            // const client = MapConn[`${input.socket_id}`]
            socket.join(__room_id);
            
            // kiểm tra admin có join room hay chưa
            if(admin.room_id != room_id){
                admin.room_id = room_id;
                admin.register_status_code = 'ADMIN';
                admin.register_status_name = 'ADMIN';
                admin.connect_status_code = 'CONNECTED';
                admin.connect_status_name = 'Đã kết nối';
                admin.referrer = 6;
                admin.permission = 9;
                admin.token = null;
                socket.join(room_id);
                MapConn[`${socket.id}`] = admin
                console.log(`[SET_PERMISSION_REF] - ADMIN ${socket.id} đã tham gia phòng ${room_id}`);
            }
            if(!client){
                io.to(__room_id).emit('RES_ROOM_ADMIN', {
                    status: 400,
                    message: 'Thực hiện lỗi',
                    data: {
                        room_id: __room_id,
                        ls_conn: MapConn
                    }
                });
                return;
            }
            console.log('Cập nhật thông tin giám định');
            const token = crypto.randomBytes(32).toString('hex');
            const upt_client ={
                ...client,
                referrer: referrer,
                permission: 1,
                register_status_code: getRegisterStatusCode(accepted),
                register_status_name: getRegisterStatusName(accepted),
                connect_status_code: getConnectStatusCode(status), 
                connect_status_name: getConnectStatusName(status),
                token: token,
                room_id: __room_id
            }
            MapConn[`${socket_id}`] = upt_client

            // gửi admin
            io.to(__room_id).emit('RES_ROOM_ADMIN', {
                path: CONSTANT.ADMIN_FETCH_CONN,
                status: 200,
                message: 'Thực hiện thành công',
                data: {
                    room_id: __room_id,
                    ls_conn: MapConn
                }
            });   

            // gửi client
            io.to(socket_id).emit('RES_MSG', {
                status: 200,
                message: 'Đã phê duyệt kết nối',
                type: RES_TYPE.APPROVE_CONNECT, 
                data: upt_client
            });
        }));

        // 16. lấy thông tin cấu hình: gửi all client
        socket.on(CONSTANT.GET_CONFIG, safeSocketHandler('GET_CONFIG', (input) => {
            fetchAdminConfig().then((res) => {
                config = {cau_hinh_lay_diem_thap : true, ...res};
                console.log('fetchAdminConfig config: ', config);
            })
            socket.join(connAdmin?.room_id);
            io.to(connAdmin.room_id).emit(CONSTANT.GET_CONFIG, {
                type: CONSTANT.GET_CONFIG,
                status: 200,
                message: 'Thực hiện thành công',
                data: {
                    he_diem: Number(config.he_diem),
                    room_id: connAdmin.room_id,
                    thoi_gian_tinh_diem: Number(config.thoi_gian_tinh_diem),
                    cau_hinh_hinh_thuc_quyen: Number(config.cau_hinh_hinh_thuc_quyen),
                    cau_hinh_hinh_thuc_doikhang: Number(config.cau_hinh_hinh_thuc_doikhang),
                    ten_giai_dau: config.ten_giai_dau,
                    mo_ta_giai_dau: config.mo_ta_giai_dau,
                }
            });
        }))


        // 6. Khi client ngắt kết nối
        socket.on('disconnect', safeSocketHandler('disconnect', () => {
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
        }));

    });
    // hàm common register_status_code
    const getRegisterStatusCode = (code) => {
        switch (code) {
            case 'approved':
                return STATE_REG_CONN.CONNECTED.CODE;
            case 'pending':
                return STATE_REG_CONN.PROCESSING.CODE;
            case 'rejected':
                return STATE_REG_CONN.DISCONNECT.CODE;
            default:
                return STATE_REG_CONN.PAUSED.CODE;
        }
    }

    const getRegisterStatusName = (code) => {
        switch (code) { 
            case 'approved':
                return STATE_REG_CONN.CONNECTED.NAME;
            case 'pending':
                return STATE_REG_CONN.PROCESSING.NAME;
            case 'rejected':
                return STATE_REG_CONN.DISCONNECT.NAME;
            default:
                return STATE_REG_CONN.PAUSED.NAME;
        }
    }

    // hàm common connect_status_code
    const getConnectStatusCode = (code) => {
        switch (code) {
            case 'active':
                return STATE_SOCKET.CONNECTED.CODE;
            case 'inactive':
                return STATE_SOCKET.DISCONNECT.CODE;
            default:
                return STATE_SOCKET.DISCONNECT.CODE;
        }
    }

    const getConnectStatusName = (code) => {
        switch (code) { 
            case 'active':
                return STATE_SOCKET.CONNECTED.NAME;
            case 'inactive':
                return STATE_SOCKET.DISCONNECT.NAME;
            default:
                return STATE_SOCKET.DISCONNECT.NAME;
        }
    }

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