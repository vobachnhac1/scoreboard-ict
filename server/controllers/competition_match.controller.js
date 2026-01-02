const dbCompetitionMatchService = require('../services/common/db_competition_match');

class CompetitionMatchController {
    
    // POST /api/competition-match - Tạo match mới
    async createMatch(req, res) {
        try {
            const {
                competition_dk_id,
                match_no,
                row_index,
                red_name,
                blue_name,
                match_name,
                team_name,
                match_type,
                config_system
            } = req.body;

            if (!competition_dk_id || match_no === undefined || row_index === undefined) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu thông tin bắt buộc."
                });
            }

            const id = await dbCompetitionMatchService.createMatch({
                competition_dk_id,
                match_no,
                row_index,
                red_name,
                blue_name,
                match_name,
                team_name,
                match_type,
                config_system
            });

            res.json({
                success: true,
                message: "Tạo match thành công.",
                data: { id }
            });
        } catch (error) {
            console.error('Error createMatch:', error);
            res.status(500).json({
                success: false,
                message: "Hệ thống xử lý lỗi.",
                error: error.message
            });
        }
    }

    // POST /api/competition-match/bulk - Tạo nhiều matches cùng lúc
    async bulkCreateMatches(req, res) {
        try {
            const { matches } = req.body;

            if (!matches || !Array.isArray(matches) || matches.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu thông tin matches hoặc matches không hợp lệ."
                });
            }

            // Validate từng match
            for (const match of matches) {
                if (!match.competition_dk_id || match.row_index === undefined) {
                    return res.status(400).json({
                        success: false,
                        message: "Mỗi match phải có competition_dk_id và row_index."
                    });
                }
            }

            const result = await dbCompetitionMatchService.bulkCreateMatches(matches);

            res.json({
                success: true,
                message: `Tạo ${result.count} matches thành công.`,
                data: result
            });
        } catch (error) {
            console.error('Error bulkCreateMatches:', error);
            res.status(500).json({
                success: false,
                message: "Hệ thống xử lý lỗi.",
                error: error.message
            });
        }
    }

    // GET /api/competition-match/:id - Lấy match theo id
    async getMatchById(req, res) {
        try {
            const { id } = req.params;
            const match = await dbCompetitionMatchService.getMatchById(id);

            if (!match) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy match."
                });
            }

            res.json({
                success: true,
                message: "Lấy dữ liệu thành công.",
                data: match
            });
        } catch (error) {
            console.error('Error getMatchById:', error);
            res.status(500).json({
                success: false,
                message: "Hệ thống xử lý lỗi.",
                error: error.message
            });
        }
    }

    // GET /api/competition-match/by-dk/:competition_dk_id - Lấy tất cả match của competition_dk
    async getMatchesByCompetitionDKId(req, res) {
        try {
            const { competition_dk_id } = req.params;
            const matches = await dbCompetitionMatchService.getMatchesByCompetitionDKId(competition_dk_id);

            res.json({
                success: true,
                message: "Lấy dữ liệu thành công.",
                data: matches
            });
        } catch (error) {
            console.error('Error getMatchesByCompetitionDKId:', error);
            res.status(500).json({
                success: false,
                message: "Hệ thống xử lý lỗi.",
                error: error.message
            });
        }
    }

    // PUT /api/competition-match/:id/status - Cập nhật status
    async updateMatchStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, winner } = req.body;

            if (!status) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu thông tin status."
                });
            }

            const result = await dbCompetitionMatchService.updateMatchStatus(id, status, winner);

            res.json({
                success: true,
                message: "Cập nhật status thành công.",
                data: result
            });
        } catch (error) {
            console.error('Error updateMatchStatus:', error);
            res.status(500).json({
                success: false,
                message: "Hệ thống xử lý lỗi.",
                error: error.message
            });
        }
    }

    // PUT /api/competition-match/:id/winner - Cập nhật winner
    async updateWinner(req, res) {
        try {
            const { id } = req.params;
            const { winner } = req.body;

            if (!winner) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu thông tin winner."
                });
            }

            const result = await dbCompetitionMatchService.updateWinner(id, winner);

            res.json({
                success: true,
                message: "Cập nhật winner thành công.",
                data: result
            });
        } catch (error) {
            console.error('Error updateWinner:', error);
            res.status(500).json({
                success: false,
                message: "Hệ thống xử lý lỗi.",
                error: error.message
            });
        }
    }

    // PUT /api/competition-match/:id/config - Cập nhật config system
    async updateConfigSystem(req, res) {
        try {
            const { id } = req.params;
            const { config_system } = req.body;

            if (!config_system) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu thông tin config_system."
                });
            }

            const result = await dbCompetitionMatchService.updateConfigSystem(id, config_system);

            res.json({
                success: true,
                message: "Cập nhật config system thành công.",
                data: result
            });
        } catch (error) {
            console.error('Error updateConfigSystem:', error);
            res.status(500).json({
                success: false,
                message: "Hệ thống xử lý lỗi.",
                error: error.message
            });
        }
    }

    // POST /api/competition-match/:id/history - Thêm history
    async addHistory(req, res) {
        try {
            const { id } = req.params;
            const historyData = { ...req.body, match_id: id };

            const historyId = await dbCompetitionMatchService.addHistory(historyData);

            res.json({
                success: true,
                message: "Thêm history thành công.",
                data: { id: historyId }
            });
        } catch (error) {
            console.error('Error addHistory:', error);
            res.status(500).json({
                success: false,
                message: "Hệ thống xử lý lỗi.",
                error: error.message
            });
        }
    }

    // GET /api/competition-match/:id/history - Lấy history
    async getHistory(req, res) {
        try {
            const { id } = req.params;
            const history = await dbCompetitionMatchService.getHistoryByMatchId(id);

            res.json({
                success: true,
                message: "Lấy history thành công.",
                data: history
            });
        } catch (error) {
            console.error('Error getHistory:', error);
            res.status(500).json({
                success: false,
                message: "Hệ thống xử lý lỗi.",
                error: error.message
            });
        }
    }

    // DELETE /api/competition-match/:id - Xóa match
    async deleteMatch(req, res) {
        try {
            const { id } = req.params;
            const result = await dbCompetitionMatchService.deleteMatch(id);

            res.json({
                success: true,
                message: "Xóa match thành công.",
                data: result
            });
        } catch (error) {
            console.error('Error deleteMatch:', error);
            res.status(500).json({
                success: false,
                message: "Hệ thống xử lý lỗi.",
                error: error.message
            });
        }
    }
}

const instance = new CompetitionMatchController();
module.exports = instance;

