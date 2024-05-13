import { ICaidatHethong, data_caidat_mau } from "./caidat.dto"

export interface IThongtinVDVDoikhang {
    doikhang_ho_ten: string
    doikhang_can_nang: string
    doikhang_nam_sinh: string
    doikhang_donvi: string
    doikhang_cap_bac: string
    doikhang_loai_giap: number // 0: là xanh || 1: là đỏ
    doikhang_gioi_tinh:  string   // Nam - Nữ
}

export interface IThongtinGiamdinhDoiKhang {
    gd_chinh: number // 1 -> 5
    gd_ho_ten: string
    gd_nam_sinh: string
    gd_donvi: string
    gd_cap_bac: string
    gd_noi_dung_thi: string
}


export interface IKetqua {
    kq_vdv: IThongtinVDVDoikhang | undefined | null
    kq_so_lan_nhac_nho: number 
    kq_so_lan_canh_cao: number 
    kq_so_lan_y_te: number 
    kq_diem: number
}

export interface IKetquaHiepDoiKhang { 
    kqhdk_danh_sach: IKetqua[] | undefined | null
    kqhdk_hiep: number // hiệp đang thi đấu
    kqhdk_log: any[]
}

export interface IKetquaTranDoiKhang { 
    kqdk_danh_sach: IKetquaHiepDoiKhang[] | undefined | null
    kqdk_vdv_thang: IThongtinVDVDoikhang | undefined | null
    kqdk_thang_cuoc: number // 1: là thắng 2: là thua || 0 là đang chờ thi đấu
    kqdk_ly_do_thang: string // 1: là thắng 2: là thua || 0 là đang chờ thi đấu
}

export interface IThongtinDoiKhang {
    tran_so:    number   // Trận số 01-100
    danh_sach_vdv:  IThongtinVDVDoikhang[] | undefined | null
    hang_can:   string   // VD: 57kg - 60kg
    loai_tran:  string   // VD: Vòng loại - Bán kết - Chung kết
    gioi_tinh:  string   // Nam - Nữ
    so_luong_giam_dinh: number
    danh_sach_giam_dinh: IThongtinGiamdinhDoiKhang[] | undefined | null
    cai_dat_tran_dau: ICaidatHethong | undefined | null
    ket_qua:    IKetquaTranDoiKhang | undefined | null

}

export interface IThongtinThiDau {
    ma_nhom_thi: string, 
    ten_nhom_thi: string, 
    danh_sach_tran: IThongtinDoiKhang[] | undefined | null
}

interface ILog {
    lg_danh_muc:    string
    lg_noi_dung:    string
    lg_thoi_gian:   string
    lg_hiep_dau:    string
    lg_tran_dau:    string
    lg_nguoi_thuc_hien:    string
    lg_hanhvi_thuc_hien:    string
    
}

export const data_doikhang_mau: IThongtinThiDau[] = [ 
    {
        ma_nhom_thi: "CAP1",
        ten_nhom_thi: "Cấp 1",
        danh_sach_tran: [
            {
                tran_so: 1, 
                danh_sach_vdv: [
                    {
                        doikhang_ho_ten: "Nguyễn Văn 1",
                        doikhang_can_nang: "47Kg",
                        doikhang_nam_sinh: "2000",
                        doikhang_donvi: "Bình tân",
                        doikhang_cap_bac: "",
                        doikhang_loai_giap: 1, // 0: là xanh || 1: là đỏ
                        doikhang_gioi_tinh:  "Nam" ,  // Nam - Nữ
                    },{
                        doikhang_ho_ten: "Nguyễn Văn 2",
                        doikhang_can_nang: "47Kg",
                        doikhang_nam_sinh: "2000",
                        doikhang_donvi: "Bình tân",
                        doikhang_cap_bac: "",
                        doikhang_loai_giap: 1, // 0: là xanh || 1: là đỏ
                        doikhang_gioi_tinh:  "Nam" ,  // Nam - Nữ
                    }
                ], 
                hang_can: "47Kg", 
                loai_tran: "Vòng loại", 
                gioi_tinh: "Nam", 
                ket_qua: {
                    kqdk_danh_sach:[
                        {
                            kqhdk_danh_sach: [{
                                kq_vdv: {
                                    doikhang_ho_ten: "Nguyễn Văn 1",
                                    doikhang_can_nang: "47Kg",
                                    doikhang_nam_sinh: "2000",
                                    doikhang_donvi: "Bình tân",
                                    doikhang_cap_bac: "",
                                    doikhang_loai_giap: 1, // 0: là xanh || 1: là đỏ
                                    doikhang_gioi_tinh:  "Nam" ,  // Nam - Nữ
                                },
                                kq_so_lan_nhac_nho: 1, 
                                kq_so_lan_canh_cao: 1, 
                                kq_so_lan_y_te: 1, 
                                kq_diem: 2
                            },{
                                kq_vdv: {
                                    doikhang_ho_ten: "Nguyễn Văn 2",
                                    doikhang_can_nang: "47Kg",
                                    doikhang_nam_sinh: "2000",
                                    doikhang_donvi: "Bình tân",
                                    doikhang_cap_bac: "",
                                    doikhang_loai_giap: 1, // 0: là xanh || 1: là đỏ
                                    doikhang_gioi_tinh:  "Nam" ,  // Nam - Nữ
                                },
                                kq_so_lan_nhac_nho: 1, 
                                kq_so_lan_canh_cao: 1, 
                                kq_so_lan_y_te: 1, 
                                kq_diem: 0
                            }],
                            kqhdk_hiep: 1,
                            kqhdk_log: []
                        }, {
                            kqhdk_danh_sach: [{
                                kq_vdv: {
                                    doikhang_ho_ten: "Nguyễn Văn 1",
                                    doikhang_can_nang: "47Kg",
                                    doikhang_nam_sinh: "2000",
                                    doikhang_donvi: "Bình tân",
                                    doikhang_cap_bac: "",
                                    doikhang_loai_giap: 1, // 0: là xanh || 1: là đỏ
                                    doikhang_gioi_tinh:  "Nam" ,  // Nam - Nữ
                                },
                                kq_so_lan_nhac_nho: 1, 
                                kq_so_lan_canh_cao: 1, 
                                kq_so_lan_y_te: 1, 
                                kq_diem: 2
                            },{
                                kq_vdv: {
                                    doikhang_ho_ten: "Nguyễn Văn 2",
                                    doikhang_can_nang: "47Kg",
                                    doikhang_nam_sinh: "2000",
                                    doikhang_donvi: "Bình tân",
                                    doikhang_cap_bac: "",
                                    doikhang_loai_giap: 1, // 0: là xanh || 1: là đỏ
                                    doikhang_gioi_tinh:  "Nam" ,  // Nam - Nữ
                                },
                                kq_so_lan_nhac_nho: 1, 
                                kq_so_lan_canh_cao: 1, 
                                kq_so_lan_y_te: 1, 
                                kq_diem: 0
                            }],
                            kqhdk_hiep: 2,
                            kqhdk_log: []
                        }, {
                            kqhdk_danh_sach: [{
                                kq_vdv: {
                                    doikhang_ho_ten: "Nguyễn Văn 1",
                                    doikhang_can_nang: "47Kg",
                                    doikhang_nam_sinh: "2000",
                                    doikhang_donvi: "Bình tân",
                                    doikhang_cap_bac: "",
                                    doikhang_loai_giap: 1, // 0: là xanh || 1: là đỏ
                                    doikhang_gioi_tinh:  "Nam" ,  // Nam - Nữ
                                },
                                kq_so_lan_nhac_nho: 1, 
                                kq_so_lan_canh_cao: 1, 
                                kq_so_lan_y_te: 1, 
                                kq_diem: 2
                            },{
                                kq_vdv: {
                                    doikhang_ho_ten: "Nguyễn Văn 2",
                                    doikhang_can_nang: "47Kg",
                                    doikhang_nam_sinh: "2000",
                                    doikhang_donvi: "Bình tân",
                                    doikhang_cap_bac: "",
                                    doikhang_loai_giap: 1, // 0: là xanh || 1: là đỏ
                                    doikhang_gioi_tinh:  "Nam" ,  // Nam - Nữ
                                },
                                kq_so_lan_nhac_nho: 1, 
                                kq_so_lan_canh_cao: 1, 
                                kq_so_lan_y_te: 1, 
                                kq_diem: 0
                            }],
                            kqhdk_hiep: 3,
                            kqhdk_log: []
                        }
                    ],
                    kqdk_thang_cuoc: 0,
                    kqdk_ly_do_thang:"Lý do thắng",
                    kqdk_vdv_thang:{
                        doikhang_ho_ten: "Nguyễn Văn 1",
                        doikhang_can_nang: "47Kg",
                        doikhang_nam_sinh: "2000",
                        doikhang_donvi: "Bình tân",
                        doikhang_cap_bac: "",
                        doikhang_loai_giap: 1, // 0: là xanh || 1: là đỏ
                        doikhang_gioi_tinh:  "Nam" ,  // Nam - Nữ
                    }
                }, 
                so_luong_giam_dinh: 5, 
                cai_dat_tran_dau: data_caidat_mau,  // không cần khai báo
                danh_sach_giam_dinh: [
                    {
                        gd_chinh: 1,
                        gd_ho_ten: "Trương Văn 1",
                        gd_nam_sinh: "1980",
                        gd_donvi: "HCM",
                        gd_cap_bac: "Hoàng Đai",
                        gd_noi_dung_thi: "47Kg",
                    },{
                        gd_chinh: 1,
                        gd_ho_ten: "Trương Văn 2",
                        gd_nam_sinh: "1980",
                        gd_donvi: "HCM",
                        gd_cap_bac: "Hoàng Đai",
                        gd_noi_dung_thi: "47Kg",
                    },{
                        gd_chinh: 1,
                        gd_ho_ten: "Trương Văn 3",
                        gd_nam_sinh: "1980",
                        gd_donvi: "HCM",
                        gd_cap_bac: "Hoàng Đai",
                        gd_noi_dung_thi: "47Kg",
                    },{
                        gd_chinh: 1,
                        gd_ho_ten: "Trương Văn 4",
                        gd_nam_sinh: "1980",
                        gd_donvi: "HCM",
                        gd_cap_bac: "Hoàng Đai",
                        gd_noi_dung_thi: "47Kg",
                    },{
                        gd_chinh: 1,
                        gd_ho_ten: "Trương Văn 5",
                        gd_nam_sinh: "1980",
                        gd_donvi: "HCM",
                        gd_cap_bac: "Hoàng Đai",
                        gd_noi_dung_thi: "47Kg",
                    }
                ], 
            }
        ]
    }
]