const dbCompetitionMatchTeamService = require('../services/common/db_competition_match_team');

class CompetitionMatchTeamController {
    
    // POST /api/competition-match-team - Tạo team mới
    async createTeam(req, res) {
        try {
            const { competition_dk_id, match_no, row_index, match_name, team_name, match_type, config_system, athletes } = req.body;

            if (!competition_dk_id || !match_type || row_index === undefined) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu thông tin bắt buộc."
                });
            }

            const id = await dbCompetitionMatchTeamService.createTeam({
                competition_dk_id,
                match_no,
                row_index,
                match_name,
                team_name,
                match_type,
                config_system,
                athletes
            });

            res.json({
                success: true,
                message: "Tạo team thành công.",
                data: { id }
            });
        } catch (error) {
            console.error('Error createTeam:', error);
            res.status(500).json({
                success: false,
                message: "Hệ thống xử lý lỗi.",
                error: error.message
            });
        }
    }

    // POST /api/competition-match-team/bulk - Tạo nhiều teams cùng lúc
    async bulkCreateTeams(req, res) {
        try {
            const { teams } = req.body;

            if (!teams || !Array.isArray(teams) || teams.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu thông tin teams hoặc teams không hợp lệ."
                });
            }

            // Validate từng team
            for (const team of teams) {
                if (!team.competition_dk_id || !team.match_type || team.row_index === undefined) {
                    return res.status(400).json({
                        success: false,
                        message: "Mỗi team phải có competition_dk_id, match_type và row_index."
                    });
                }
            }

            const result = await dbCompetitionMatchTeamService.bulkCreateTeams(teams);

            res.json({
                success: true,
                message: `Tạo ${result.count} teams thành công.`,
                data: result
            });
        } catch (error) {
            console.error('Error bulkCreateTeams:', error);
            res.status(500).json({
                success: false,
                message: "Hệ thống xử lý lỗi.",
                error: error.message
            });
        }
    }

    // GET /api/competition-match-team/:id - Lấy team theo id
    async getTeamById(req, res) {
        try {
            const { id } = req.params;
            const team = await dbCompetitionMatchTeamService.getTeamById(id);

            if (!team) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy team."
                });
            }

            res.json({
                success: true,
                message: "Lấy dữ liệu thành công.",
                data: team
            });
        } catch (error) {
            console.error('Error getTeamById:', error);
            res.status(500).json({
                success: false,
                message: "Hệ thống xử lý lỗi.",
                error: error.message
            });
        }
    }

    // GET /api/competition-match-team/by-dk/:competition_dk_id - Lấy tất cả teams của competition_dk
    async getTeamsByCompetitionDKId(req, res) {
        try {
            const { competition_dk_id } = req.params;
            const teams = await dbCompetitionMatchTeamService.getTeamsByCompetitionDKId(competition_dk_id);

            res.json({
                success: true,
                message: "Lấy dữ liệu thành công.",
                data: teams
            });
        } catch (error) {
            console.error('Error getTeamsByCompetitionDKId:', error);
            res.status(500).json({
                success: false,
                message: "Hệ thống xử lý lỗi.",
                error: error.message
            });
        }
    }

    // PUT /api/competition-match-team/:id/status - Cập nhật status
    async updateTeamStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!status) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu thông tin status."
                });
            }

            const result = await dbCompetitionMatchTeamService.updateTeamStatus(id, status);

            res.json({
                success: true,
                message: "Cập nhật status thành công.",
                data: result
            });
        } catch (error) {
            console.error('Error updateTeamStatus:', error);
            res.status(500).json({
                success: false,
                message: "Hệ thống xử lý lỗi.",
                error: error.message
            });
        }
    }

    // PUT /api/competition-match-team/:id/config - Cập nhật config_system
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

            const result = await dbCompetitionMatchTeamService.updateConfigSystem(id, config_system);

            res.json({
                success: true,
                message: "Cập nhật config_system thành công.",
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

    // POST /api/competition-match-team/:id/history - Thêm history
    async addHistory(req, res) {
        try {
            const { id } = req.params;
            const historyData = { ...req.body, team_id: id };

            const historyId = await dbCompetitionMatchTeamService.addHistory(historyData);

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

    // GET /api/competition-match-team/:id/history - Lấy history
    async getHistory(req, res) {
        try {
            const { id } = req.params;
            const history = await dbCompetitionMatchTeamService.getHistoryByTeamId(id);

            res.json({
                success: true,
                message: "Lấy dữ liệu thành công.",
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

    // DELETE /api/competition-match-team/:id - Xóa team
    async deleteTeam(req, res) {
        try {
            const { id } = req.params;
            const result = await dbCompetitionMatchTeamService.deleteTeam(id);

            res.json({
                success: true,
                message: "Xóa team thành công.",
                data: result
            });
        } catch (error) {
            console.error('Error deleteTeam:', error);
            res.status(500).json({
                success: false,
                message: "Hệ thống xử lý lỗi.",
                error: error.message
            });
        }
    }

    // DELETE /api/competition-match-team/by-dk/:competition_dk_id - Xóa tất cả teams
    async deleteTeamsByCompetitionDKId(req, res) {
        try {
            const { competition_dk_id } = req.params;
            const result = await dbCompetitionMatchTeamService.deleteTeamsByCompetitionDKId(competition_dk_id);

            res.json({
                success: true,
                message: "Xóa teams thành công.",
                data: result
            });
        } catch (error) {
            console.error('Error deleteTeamsByCompetitionDKId:', error);
            res.status(500).json({
                success: false,
                message: "Hệ thống xử lý lỗi.",
                error: error.message
            });
        }
    }
}

const instance = new CompetitionMatchTeamController();
module.exports = instance;

