const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * POST /api/matches/finish
 * Kết thúc trận đấu và lưu kết quả
 */
router.post('/finish', async (req, res) => {
  try {
    const {
      match_id,
      status,
      red_score,
      blue_score,
      red_remind,
      blue_remind,
      red_warn,
      blue_warn,
      red_kick,
      blue_kick,
      winner,
      total_rounds,
      final_time,
      action_history,
      round_history,
      finished_at,
      match_no,
      weight_class,
      red_athlete_id,
      red_athlete_name,
      blue_athlete_id,
      blue_athlete_name,
      competition_id,
      category_id
    } = req.body;

    // Validate required fields
    if (!match_id) {
      return res.status(400).json({
        success: false,
        message: 'match_id is required'
      });
    }

    // Kiểm tra trận đấu có tồn tại không
    const [existingMatch] = await db.query(
      'SELECT * FROM matches WHERE match_id = ?',
      [match_id]
    );

    if (!existingMatch || existingMatch.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Kiểm tra trận đấu đã kết thúc chưa
    if (existingMatch[0].status === 'FIN') {
      return res.status(400).json({
        success: false,
        message: 'Match already finished'
      });
    }

    // Update match result
    const updateQuery = `
      UPDATE matches 
      SET 
        status = ?,
        red_score = ?,
        blue_score = ?,
        red_remind = ?,
        blue_remind = ?,
        red_warn = ?,
        blue_warn = ?,
        red_kick = ?,
        blue_kick = ?,
        winner = ?,
        total_rounds = ?,
        final_time = ?,
        action_history = ?,
        round_history = ?,
        finished_at = ?,
        updated_at = NOW()
      WHERE match_id = ?
    `;

    const updateValues = [
      status,
      red_score,
      blue_score,
      red_remind,
      blue_remind,
      red_warn,
      blue_warn,
      red_kick,
      blue_kick,
      winner,
      total_rounds,
      final_time,
      JSON.stringify(action_history),
      JSON.stringify(round_history),
      finished_at,
      match_id
    ];

    const [result] = await db.query(updateQuery, updateValues);

    if (result.affectedRows === 0) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update match'
      });
    }

    // Lưu lịch sử từng hiệp vào bảng round_results (nếu có)
    if (round_history && round_history.length > 0) {
      const roundInsertQuery = `
        INSERT INTO round_results 
        (match_id, round, red_score, blue_score, red_remind, blue_remind, 
         red_warn, blue_warn, red_mins, blue_mins, red_incr, blue_incr, 
         round_type, confirm_attack, status, created_at)
        VALUES ?
        ON DUPLICATE KEY UPDATE
          red_score = VALUES(red_score),
          blue_score = VALUES(blue_score),
          red_remind = VALUES(red_remind),
          blue_remind = VALUES(blue_remind),
          red_warn = VALUES(red_warn),
          blue_warn = VALUES(blue_warn),
          updated_at = NOW()
      `;

      const roundValues = round_history.map(round => [
        match_id,
        round.round,
        round.red_score,
        round.blue_score,
        round.red_remind,
        round.blue_remind,
        round.red_warn,
        round.blue_warn,
        round.red_mins || 0,
        round.blue_mins || 0,
        round.red_incr || 0,
        round.blue_incr || 0,
        round.round_type || 'MAIN',
        round.confirm_attack || 0,
        round.status || 'COMPLETED',
        new Date()
      ]);

      await db.query(roundInsertQuery, [roundValues]);
    }

    res.json({
      success: true,
      message: 'Đã lưu kết quả trận đấu thành công',
      data: {
        match_id,
        status,
        winner,
        red_score,
        blue_score,
        updated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error finishing match:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;

