import React from "react";
import JudgeGroupScore from "./JudgeGroupScore";
import ChiefRefereeScore from "./ChiefRefereeScore";
import TotalScore from "./TotalScore";

/**
 * Component hiển thị điểm Võ Nhạc theo bố cục 7 giám định
 * Bố cục: Chuyên môn (GĐ1-GĐ2) | Nghệ thuật (GĐ3-GĐ4) | Thực hiện (GĐ5-GĐ6) | Trọng tài trưởng (GĐ7)
 * Công thức: Chuyên môn * 0.3 + Nghệ thuật * 0.3 + Thực hiện * 0.3 + Trọng tài trưởng * 0.1
 *
 * @param {Object} scores - Object chứa điểm của 7 giám định
 * @param {number} scores.judge1 - Điểm GĐ1 (Chuyên môn)
 * @param {number} scores.judge2 - Điểm GĐ2 (Chuyên môn)
 * @param {number} scores.judge3 - Điểm GĐ3 (Nghệ thuật)
 * @param {number} scores.judge4 - Điểm GĐ4 (Nghệ thuật)
 * @param {number} scores.judge5 - Điểm GĐ5 (Thực hiện)
 * @param {number} scores.judge6 - Điểm GĐ6 (Thực hiện)
 * @param {number} scores.judge7 - Điểm GĐ7 (Trọng tài trưởng)
 */
export default function VoNhacScoreDisplay({ scores, main = false }) {
  // Tính điểm trung bình cho từng nhóm
  const chuyenMonAvg =
    ((Number(scores.judge1) || 0) + (Number(scores.judge2) || 0)) / 2;
  const ngheThuatAvg =
    ((Number(scores.judge3) || 0) + (Number(scores.judge4) || 0)) / 2;
  const thucHienAvg =
    ((Number(scores.judge5) || 0) + (Number(scores.judge6) || 0)) / 2;
  const trongTaiTruong = Number(scores.judge7) || 0;

  // Tính điểm tổng theo công thức
  const totalScore =
    chuyenMonAvg * 0.3 +
    ngheThuatAvg * 0.3 +
    thucHienAvg * 0.3 +
    trongTaiTruong * 0.1;

  return (
    <div className="w-full max-w-7xl">
      {/* Grid 4 cột: 3 nhóm + Trọng tài trưởng */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
        {/* Chuyên môn: GĐ1 - GĐ2 */}
        <JudgeGroupScore
          title="CHUYÊN MÔN"
          judge1={1}
          judge2={2}
          score1={Number(scores.judge1) || 0}
          score2={Number(scores.judge2) || 0}
          average={chuyenMonAvg}
        />

        {/* Nghệ thuật: GĐ3 - GĐ4 */}
        <JudgeGroupScore
          title="NGHỆ THUẬT"
          judge1={3}
          judge2={4}
          score1={Number(scores.judge3) || 0}
          score2={Number(scores.judge4) || 0}
          average={ngheThuatAvg}
        />

        {/* Thực hiện: GĐ5 - GĐ6 */}
        <JudgeGroupScore
          title="THỰC HIỆN"
          judge1={5}
          judge2={6}
          score1={Number(scores.judge5) || 0}
          score2={Number(scores.judge6) || 0}
          average={thucHienAvg}
        />

        {/* Trọng tài trưởng: GĐ7 */}
        <ChiefRefereeScore judge={7} score={trongTaiTruong} />
      </div>

      {/* Điểm tổng - canh giữa màn hình */}
      <div className="flex justify-center mt-8">
        <TotalScore total={totalScore.toFixed(2)} main={main} />
      </div>
    </div>
  );
}
