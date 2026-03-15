const dbReferee = require('../services/common/db_referee');

class RefereeController {
    // Lấy tất cả trọng tài
    async getAllReferees(req, res) {
        try {
            const keyword = req.query.keyword;
            let result;
            if (keyword) {
                result = await dbReferee.searchReferees(keyword);
            } else {
                result = await dbReferee.getAllReferees();
            }
            res.status(200).json({
                success: true,
                message: "Thực hiện thành công",
                data: result
            });
        } catch (error) {
            console.error('getReferees error:', error);
            res.status(500).json({
                success: false,
                message: "Hệ thống xử lý lỗi.",
                error: error.message
            });
        }
    }

    // Thêm mới 1 trọng tài
    async createReferee(req, res) {
        try {
            const result = await dbReferee.insertReferee(req.body);
            res.status(200).json({
                success: true,
                message: "Thêm trọng tài thành công",
                data: result
            });
        } catch (error) {
            console.error('createReferee error:', error);
            res.status(500).json({
                success: false,
                message: "Hệ thống xử lý lỗi.",
                error: error.message
            });
        }
    }

    // Cập nhật trọng tài
    async updateReferee(req, res) {
        try {
            const { id } = req.params;
            const result = await dbReferee.updateReferee(id, req.body);
            res.status(200).json({
                success: true,
                message: "Cập nhật trọng tài thành công",
                data: result
            });
        } catch (error) {
            console.error('updateReferee error:', error);
            res.status(500).json({
                success: false,
                message: "Hệ thống xử lý lỗi.",
                error: error.message
            });
        }
    }

    // Xóa trọng tài
    async deleteReferee(req, res) {
        try {
            const { id } = req.params;
            const result = await dbReferee.deleteReferee(id);
            res.status(200).json({
                success: true,
                message: "Xóa trọng tài thành công",
                data: result
            });
        } catch (error) {
            console.error('deleteReferee error:', error);
            res.status(500).json({
                success: false,
                message: "Hệ thống xử lý lỗi.",
                error: error.message
            });
        }
    }

    // Xóa tất cả trọng tài
    async deleteAllReferees(req, res) {
        try {
            await dbReferee.deleteAllReferees();
            res.status(200).json({
                success: true,
                message: "Xóa toàn bộ bộ dữ liệu thành công"
            });
        } catch (error) {
            console.error('deleteAllReferees error:', error);
            res.status(500).json({
                success: false,
                message: "Hệ thống xử lý lỗi.",
                error: error.message
            });
        }
    }

    // Bulk Import từ Excel
    async bulkImportReferees(req, res) {
        try {
            const { referees } = req.body;
            if (!referees || !Array.isArray(referees)) {
                return res.status(400).json({
                    success: false,
                    message: "Dữ liệu không hợp lệ"
                });
            }
            await dbReferee.insertListReferee(referees);
            res.status(200).json({
                success: true,
                message: `Import ${referees.length} trọng tài thành công`
            });
        } catch (error) {
            console.error('bulkImport error:', error);
            res.status(500).json({
                success: false,
                message: "Hệ thống xử lý lỗi.",
                error: error.message
            });
        }
    }
}

module.exports = new RefereeController();
