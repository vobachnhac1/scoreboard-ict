-- -- Migration: Thêm cấu hình button "Trận tiếp theo"
-- -- Date: 2025-12-26
-- -- Description: Thêm trường cấu hình quyền hiển thị button "Trận tiếp theo" trên màn hình Vovinam

-- -- Thêm trường quyền hiển thị button Trận tiếp theo
-- ALTER TABLE config_system 
-- ADD COLUMN IF NOT EXISTS hien_thi_button_tran_tiep_theo BOOLEAN DEFAULT TRUE COMMENT 'Hiển thị button Trận tiếp theo';

-- -- Cập nhật giá trị mặc định cho bản ghi hiện có (nếu có)
-- UPDATE config_system 
-- SET hien_thi_button_tran_tiep_theo = COALESCE(hien_thi_button_tran_tiep_theo, TRUE)
-- WHERE id IS NOT NULL;

-- -- Kiểm tra kết quả
-- SELECT 
--   'Button Trận tiếp theo' as category,
--   hien_thi_button_tran_tiep_theo
-- FROM config_system
-- LIMIT 1;

