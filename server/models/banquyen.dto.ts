export interface BanQuyen {
    bq_tai_khoan: string
    bq_mat_khau: string
    bq_ngay_tao: string
    bq_ngay_cap_nhat: string
    bq_danh_sach_quyen: ThongTinChitiet[] | undefined | null 
    bq_uu_tien: number // 0: bình thường || 1: Khách hàng ưu tiên
    bd_canh_bao: number // 0: bình thường || 1: cảnh báo
}

export interface ThongTinChitiet {
    bq_kenh: number
    bq_ten_he_thong: string
    bq_ngay_hieu_luc: string
    bq_ngay_het_han: string
    bq_trang_thai: number // 0: chờ đăng ký | 1: trong hạn | 2: hết hạn | 3: đã gia hạn | 4: thử nghiệm | 5: chưa hiệu lực
}

export const data_banquyen_mau: BanQuyen = {
    bq_tai_khoan: 'admin',
    bq_mat_khau: 'admin',
    bq_ngay_tao: '20240510_000000_000',
    bq_ngay_cap_nhat: '20240609_235959_999',
    bq_danh_sach_quyen: [
        {
            bq_kenh: 1,
            bq_ten_he_thong: "Phần mềm vovinam",
            bq_ngay_hieu_luc: '20240510_000000_000',
            bq_ngay_het_han: '20240609_235959_999',
            bq_trang_thai: 0,
        },{
            bq_kenh: 2,
            bq_ten_he_thong: "Phần mềm pencak silat",
            bq_ngay_hieu_luc: '20240510_000000_000',
            bq_ngay_het_han: '20240609_235959_999',
            bq_trang_thai: 0,
        },{
            bq_kenh: 3,
            bq_ten_he_thong: "Phần mềm võ gậy",
            bq_ngay_hieu_luc: '20240510_000000_000',
            bq_ngay_het_han: '20240609_235959_999',
            bq_trang_thai: 0,
        }
    ],
    bq_uu_tien: 1,
    bd_canh_bao: 0
}