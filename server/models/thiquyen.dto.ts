export interface IThongtinNoidung {
    noi_dung_thi: string,
    danh_sach_thi: IThiQuyen[],
    link_nhac: string,
    link_logo: string,
}

export interface IThiQuyen {
    so_luong_giam_dinh: number
    danh_sach_giam_dinh?: IThongtinGiamdinh[]
    danh_sach_van_dong_vien?: IThongtinVDV[]
    quyen_ket_qua?: IKetquaThiquyen
    quyen_noi_dung_thi?: string,
    xep_hang?: number
}

export interface IThongtinVDV {
    quyen_sothutu: number
    quyen_ho_ten: string
    quyen_nam_sinh: string
    quyen_donvi: string
    quyen_cap_bac: string
}


export interface IThongtinGiamdinh {
    gd_chinh: number // 1 -> 5
    gd_ho_ten: string
    gd_nam_sinh: string
    gd_donvi: string
    gd_cap_bac: string
    gd_noi_dung_thi: string
    gd_ket_qua: number
}


export interface IKetquaThiquyen {
    diem_gd?: IThongtinGiamdinh[]
    diem_tong: number
    diem_cao_nhat: number
    diem_thap_nhat: number
    xep_hang: number
}


export const data_thiquyen_mau: IThongtinNoidung = {
    noi_dung_thi: "Long Hổ Quyền",
    link_nhac: "link_nhac",
    link_logo: "link_logo",
    danh_sach_thi: [
        {
            so_luong_giam_dinh: 5,
            danh_sach_giam_dinh: [
                {
                    gd_chinh: 1, // 1 -> 5
                    gd_ho_ten: "Nguyễn Văn A1",
                    gd_nam_sinh: "1978",
                    gd_donvi: "TP.HCM",
                    gd_cap_bac: "Hồng Đai Nhị",
                    gd_noi_dung_thi: "Long Hổ Quyền",
                    gd_ket_qua: 100
                },{
                    gd_chinh: 2, // 1 -> 5
                    gd_ho_ten: "Nguyễn Văn A2",
                    gd_nam_sinh: "1978",
                    gd_donvi: "TP.HCM",
                    gd_cap_bac: "Hồng Đai Nhị",
                    gd_noi_dung_thi: "Long Hổ Quyền",
                    gd_ket_qua: 100
                },{
                    gd_chinh: 3, // 1 -> 5
                    gd_ho_ten: "Nguyễn Văn A3",
                    gd_nam_sinh: "1978",
                    gd_donvi: "TP.HCM",
                    gd_cap_bac: "Hồng Đai Nhị",
                    gd_noi_dung_thi: "Long Hổ Quyền",
                    gd_ket_qua: 100
                },{
                    gd_chinh: 4, // 1 -> 5
                    gd_ho_ten: "Nguyễn Văn A4",
                    gd_nam_sinh: "1978",
                    gd_donvi: "TP.HCM",
                    gd_cap_bac: "Hồng Đai Nhị",
                    gd_noi_dung_thi: "Long Hổ Quyền",
                    gd_ket_qua: 100
                },{
                    gd_chinh: 5, // 1 -> 5
                    gd_ho_ten: "Nguyễn Văn A5",
                    gd_nam_sinh: "1978",
                    gd_donvi: "TP.HCM",
                    gd_cap_bac: "Hồng Đai Nhị",
                    gd_noi_dung_thi: "Long Hổ Quyền",
                    gd_ket_qua: 100
                }
            ],
            danh_sach_van_dong_vien: [
                {
                    quyen_sothutu: 1,
                    quyen_ho_ten: "Nguyễn Văn B1",
                    quyen_nam_sinh: "1999",
                    quyen_donvi: "Quận Bình Tân",
                    quyen_cap_bac: "Lam Đai"
                },{
                    quyen_sothutu: 2,
                    quyen_ho_ten: "Nguyễn Văn B2",
                    quyen_nam_sinh: "1999",
                    quyen_donvi: "Quận Bình Tân",
                    quyen_cap_bac: "Lam Đai"
                },{
                    quyen_sothutu: 3,
                    quyen_ho_ten: "Nguyễn Văn B3",
                    quyen_nam_sinh: "1999",
                    quyen_donvi: "Quận Bình Tân",
                    quyen_cap_bac: "Lam Đai"
                },{
                    quyen_sothutu: 4,
                    quyen_ho_ten: "Nguyễn Văn B4",
                    quyen_nam_sinh: "1999",
                    quyen_donvi: "Quận Bình Tân",
                    quyen_cap_bac: "Lam Đai"
                },{
                    quyen_sothutu: 5,
                    quyen_ho_ten: "Nguyễn Văn B5",
                    quyen_nam_sinh: "1999",
                    quyen_donvi: "Quận Bình Tân",
                    quyen_cap_bac: "Lam Đai"
                }
            ],
            quyen_ket_qua: {
                diem_gd: [
                    {
                        gd_chinh: 1, // 1 -> 5 
                        gd_ho_ten: "Nguyễn Văn A1",
                        gd_nam_sinh: "1978",
                        gd_donvi: "TP.HCM",
                        gd_cap_bac: "Hồng Đai Nhị",
                        gd_noi_dung_thi: "Long Hổ Quyền",
                        gd_ket_qua: 100
                    },{
                        gd_chinh: 2, // 1 -> 5
                        gd_ho_ten: "Nguyễn Văn A2",
                        gd_nam_sinh: "1978",
                        gd_donvi: "TP.HCM",
                        gd_cap_bac: "Hồng Đai Nhị",
                        gd_noi_dung_thi: "Long Hổ Quyền",
                        gd_ket_qua: 100
                    },{
                        gd_chinh: 3, // 1 -> 5
                        gd_ho_ten: "Nguyễn Văn A3",
                        gd_nam_sinh: "1978",
                        gd_donvi: "TP.HCM",
                        gd_cap_bac: "Hồng Đai Nhị",
                        gd_noi_dung_thi: "Long Hổ Quyền",
                        gd_ket_qua: 100
                    },{
                        gd_chinh: 4, // 1 -> 5
                        gd_ho_ten: "Nguyễn Văn A4",
                        gd_nam_sinh: "1978",
                        gd_donvi: "TP.HCM",
                        gd_cap_bac: "Hồng Đai Nhị",
                        gd_noi_dung_thi: "Long Hổ Quyền",
                        gd_ket_qua: 100
                    },{
                        gd_chinh: 5, // 1 -> 5
                        gd_ho_ten: "Nguyễn Văn A5",
                        gd_nam_sinh: "1978",
                        gd_donvi: "TP.HCM",
                        gd_cap_bac: "Hồng Đai Nhị",
                        gd_noi_dung_thi: "Long Hổ Quyền",
                        gd_ket_qua: 100
                    }
                ],
                diem_tong: 100,
                diem_cao_nhat: 100,
                diem_thap_nhat: 100,
                xep_hang: 100,
            },
            quyen_noi_dung_thi: "Long Hổ Quyền",
        }
    ],
}
