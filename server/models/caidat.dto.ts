import { BanQuyen, data_banquyen_mau } from "./banquyen.dto"

export interface ICaidatHethong  {
    thoi_gian_tran_dau: number
    thoi_gian_hiep_phu: number
    thoi_gian_giai_lao: number
    thoi_gian_y_te: number
    thoi_gian_tinh_diem: number
    so_luong_hiep: number
    so_luong_giam_dinh: number
    so_lan_yte_hiep: number
    so_lan_yte_tran: number
    am_thanh: string
    ngon_ngu: string
    diem_canh_cao: number
    diem_thang_tuyet_doi: number
    tran_dau_gioi_tinh: string
    tran_dau_san_thi_dau: string
    cai_dat_chung: ICaiDatChung | undefined | null
    banquyen: BanQuyen | undefined | null
}

export interface ICaiDatChung {
    bat_tinh_diem_canh_cao: number          // 0: tắt | 1: bật
    bat_tinh_diem_thang_tuyet_doi: number   // 0: tắt | 1: bật
    bat_hiep_phu: number                    // 0: tắt | 1: bật
    bat_y_te_hiep: number
    bat_y_te_tran: number
}

export const data_caidat_mau: ICaidatHethong ={
    thoi_gian_tran_dau: 90,
    thoi_gian_hiep_phu: 45,
    thoi_gian_giai_lao: 30,
    thoi_gian_y_te: 120,
    thoi_gian_tinh_diem: 1000,
    so_luong_hiep: 3,
    so_luong_giam_dinh: 5,
    so_lan_yte_hiep: 5,
    so_lan_yte_tran: 5,
    am_thanh: "link_am_thanh",
    ngon_ngu: "EN",
    diem_canh_cao: 2,
    diem_thang_tuyet_doi: 10,
    tran_dau_gioi_tinh: 'NAM',
    tran_dau_san_thi_dau: 'A',
    cai_dat_chung: {
        bat_tinh_diem_canh_cao: 0,
        bat_tinh_diem_thang_tuyet_doi: 0,
        bat_hiep_phu: 0,
        bat_y_te_hiep: 0,
        bat_y_te_tran: 0,
    },
    banquyen: data_banquyen_mau
}