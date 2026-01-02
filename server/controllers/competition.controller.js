const dbCompetitionDKService = require('../services/common/db_competition_dk');

class CompetitionController {
    
    // GET /api/competition-dk - Lấy tất cả
    async getAllCompetitionDK(req, res) {
        try {
            const data = await dbCompetitionDKService.getAllCompetitionDK();
            res.json({
                success: true,
                message: "Lấy dữ liệu thành công.",
                data: data
            });
        } catch (error) {
            console.error('Error getAllCompetitionDK:', error);
            res.status(500).json({
                success: false,
                message: "Hệ thống xử lý lỗi.",
                error: error.message
            });
        }
    }

    // GET /api/competition-dk/:id - Lấy theo ID
    async getCompetitionDKById(req, res) {
        try {
            const { id } = req.params;
            const data = await dbCompetitionDKService.getCompetitionDKById(id);
            
            if (!data) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy dữ liệu."
                });
            }

            res.json({
                success: true,
                message: "Lấy dữ liệu thành công.",
                data: data
            });
        } catch (error) {
            console.error('Error getCompetitionDKById:', error);
            res.status(500).json({
                success: false,
                message: "Hệ thống xử lý lỗi.",
                error: error.message
            });
        }
    }

    // POST /api/competition-dk - Thêm mới
    async insertCompetitionDK(req, res) {
        try {
            const { sheet_name, file_name, data } = req.body;

            if (!sheet_name || !data) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu thông tin bắt buộc (sheet_name, data)."
                });
            }

            // Kiểm tra sheet_name đã tồn tại chưa
            const exists = await dbCompetitionDKService.checkSheetNameExists(sheet_name);
            if (exists) {
                // Lấy id của competition_dk cũ
                const oldCompetition = await dbCompetitionDKService.getBySheetName(sheet_name);

                // Xóa tất cả matches liên quan trước
                const dbCompetitionMatchService = require('../services/common/db_competition_match');
                await dbCompetitionMatchService.deleteMatchesByCompetitionDKId(oldCompetition.id);

                // Sau đó xóa competition_dk cũ
                await dbCompetitionDKService.deleteBySheetName(sheet_name);
            }

            const result = await dbCompetitionDKService.insertCompetitionDK({
                sheet_name,
                file_name,
                data
            });

            res.json({
                success: true,
                message: "Thêm dữ liệu thành công.",
                data: result
            });
        } catch (error) {
            console.error('Error insertCompetitionDK:', error);
            res.status(500).json({
                success: false,
                message: "Hệ thống xử lý lỗi.",
                error: error.message
            });
        }
    }

    // PUT /api/competition-dk/:id - Cập nhật
    async updateCompetitionDK(req, res) {
        try {
            const { id } = req.params;
            const { sheet_name, file_name, data } = req.body;

            if (!sheet_name || !data) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu thông tin bắt buộc (sheet_name, data)."
                });
            }

            const result = await dbCompetitionDKService.updateCompetitionDK(id, {
                sheet_name,
                file_name,
                data
            });

            res.json({
                success: true,
                message: "Cập nhật dữ liệu thành công.",
                data: result
            });
        } catch (error) {
            console.error('Error updateCompetitionDK:', error);
            res.status(500).json({
                success: false,
                message: "Hệ thống xử lý lỗi.",
                error: error.message
            });
        }
    }

    // PUT /api/competition-dk/:id/row/:rowIndex - Cập nhật một row cụ thể
    async updateCompetitionDKRow(req, res) {
        try {
            const { id, rowIndex } = req.params;
            const { data: rowData } = req.body;

            if (!rowData || !Array.isArray(rowData)) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu thông tin row data hoặc data không đúng định dạng array."
                });
            }

            // Lấy dữ liệu hiện tại
            const competition = await dbCompetitionDKService.getCompetitionDKById(id);

            if (!competition) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy competition."
                });
            }

            // Parse data nếu là string
            let currentData = competition.data;
            if (typeof currentData === 'string') {
                currentData = JSON.parse(currentData);
            }

            // Cập nhật row (rowIndex + 1 vì row 0 là header)
            const actualRowIndex = parseInt(rowIndex) + 1;

            if (actualRowIndex < 1 || actualRowIndex >= currentData.length) {
                return res.status(400).json({
                    success: false,
                    message: `Row index ${rowIndex} không hợp lệ.`
                });
            }

            // Cập nhật row
            currentData[actualRowIndex] = rowData;

            // Lưu lại toàn bộ data
            const result = await dbCompetitionDKService.updateCompetitionDK(id, {
                sheet_name: competition.sheet_name,
                file_name: competition.file_name,
                data: currentData
            });

            res.json({
                success: true,
                message: `Cập nhật row ${rowIndex} thành công.`,
                data: result
            });
        } catch (error) {
            console.error('Error updateCompetitionDKRow:', error);
            res.status(500).json({
                success: false,
                message: "Hệ thống xử lý lỗi.",
                error: error.message
            });
        }
    }

    // DELETE /api/competition-dk/:id - Xóa
    async deleteCompetitionDK(req, res) {
        try {
            const { id } = req.params;

            // Xóa tất cả matches liên quan trước
            const dbCompetitionMatchService = require('../services/common/db_competition_match');
            await dbCompetitionMatchService.deleteMatchesByCompetitionDKId(id);

            // Sau đó xóa competition_dk
            const result = await dbCompetitionDKService.deleteCompetitionDK(id);

            res.json({
                success: true,
                message: "Xóa dữ liệu và matches liên quan thành công.",
                data: result
            });
        } catch (error) {
            console.error('Error deleteCompetitionDK:', error);
            res.status(500).json({
                success: false,
                message: "Hệ thống xử lý lỗi.",
                error: error.message
            });
        }
    }
}

const instance = new CompetitionController();
module.exports = instance;

