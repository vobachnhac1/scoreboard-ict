import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import JudgeScore from "./components/JudgeScore";
import Header from "./components/Header";
import TotalScore from "./components/TotalScore";
import ControlPanel from "./components/ControlPanel";
import InfoPanel from "./components/InfoPanel";
import Modal from "../../components/Modal";
import VovinamScoreForm from "./Forms/VovinamScoreForm";
import axios from "axios";
import useConfirmModal from "../../hooks/useConfirmModal";
import { useSocketEvent, emitSocketEvent } from "../../config/hooks/useSocketEvents";
import {MSG_TP_CLIENT} from '../../common/Constants'


export default function VovinamScore() {
  const { modalProps, showConfirm, showAlert, showWarning, showError, showSuccess } = useConfirmModal();

  const location = useLocation();
  const navigate = useNavigate();
  const matchData = location.state?.matchData || {};
  const configSystem = location.state?.matchData?.config_system || {};
  const returnUrl = location.state?.returnUrl || "/management/competition-data";

  const extractCompetitionIdFromUrl = (url) => {
    // URL format: /management/competition-data/:id
    const match = url.match(/\/management\/competition-data\/(\d+)/);
    return match ? match[1] : null;
  };

  // State cho logos
  const [lsLogo, setLsLogo] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [showAthletes, setShowAthletes] = useState(true);
  const [scores, setScores] = useState({});

  // Toggle hiển thị danh sách VĐV khi nhấn F5
  useEffect(() => {
    fetchLogos()
    // set score nếu no empty
    if(matchData.scores){
      setScores({...matchData.scores});
    }else {
      if(configSystem.so_giam_dinh == 3){
        setScores({
          judge1: 0,
          judge2: 0,
          judge3: 0,
          total: 0
        });
      }else if (configSystem.so_giam_dinh == 5){  
        setScores({
          judge1: 0,
          judge2: 0,
          judge3: 0,
          judge4: 0,
          judge5: 0,
          total: 0
        });
      }
    }

    emitSocketEvent('QUYEN_INFO',{
      match_id: matchData.match_id,
      ten_giai_dau: matchData.ten_giai_dau,
      ten_mon_thi: matchData.ten_mon_thi,
      match_name: matchData.match_name,
      team_name: matchData.team_name,
    });

    const handleKeyPress = (e) => {
      if (e.key === 'F5') {
        e.preventDefault();
        setShowAthletes(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    // kiểm tra empty object matchData.scores
    if(matchData.scores && Object.keys(matchData.scores).length > 0){
      setScores({...matchData.scores});
    }else {
      if(configSystem.so_giam_dinh == 3){
        setScores({
          judge1: 0,
          judge2: 0,
          judge3: 0,
          total: 0
        });
      }else if (configSystem.so_giam_dinh == 5){  
        setScores({
          judge1: 0,
          judge2: 0,
          judge3: 0,
          judge4: 0,
          judge5: 0,
          total: 0
        });
      }
    }
  }, [matchData.scores]); 

  // Fetch logos từ API
  const fetchLogos = async () => {
    try {
      const response = await axios.get(
        "http://localhost:6789/api/config/logos"
      );
      if (response.data.success) {
        setLsLogo(response.data.data || []);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách logos:", error);
      // Fallback về logos mặc định nếu API lỗi
      setLsLogo([
        {
          id: 1,
          url: "https://vovinambinhtan.com/upload/hinhanh/logovovi-1486.png",
          position: 0,
        },
      ]);
    }
  };

  const buttons = [
    {
      label: "QUAY LẠI",
      onClick: () => handleBack(),
    },
    {
      label: "TÍNH ĐIỂM",
      onClick: ()=>handleCaculator(),
    },
    {
      label: "MỞ KẾT NỐI",
      onClick: () => console.log("Callback: xử lý MỞ KẾT NỐI"),
    },
    {
      label: "TRƯỚC",
      onClick: () => previousMatch(),
    },
    {
      label: "SAU",
      onClick: () => nextMatch(),
    },
    {
      label: "NHẬP ĐIỂM TAY",
      onClick: () => handleManualInput(),
    },{
      label: "LƯU KẾT QUẢ",
      onClick: () => onSaveResult(),
    },
  ];
  // Thực hiện quay lại
  const handleBack =()=>{
      navigate(returnUrl);
  }

  // Thực hiện tính toán
  const handleCaculator =()=>{
    if(configSystem.so_giam_dinh == 3){
      delete scores.total;
      delete scores.hidden;
      const total = Number(scores.judge1) + Number(scores.judge2) + Number(scores.judge3);
      setScores({ ...scores, total });
    }else if (configSystem.so_giam_dinh == 5){
      delete scores.total;
      delete scores.hidden;
      const scoresArray = Object.values(scores).filter(score => Number(score) !== 0).sort((a, b) => Number(a) - Number(b));
      const total = scoresArray.slice(1, -1).reduce((acc, score) => Number(acc) + Number(score), 0);
      let selectedMaxIndex = -1;
      let selectedMinIndex = -1;
      const maxScore = Math.max(...scoresArray);
      const minScore = Math.min(...scoresArray);
      const hasNonZeroScores = scoresArray.some(s => s > 0);

      if (hasNonZeroScores) {
        // Tìm tất cả các index có điểm cao nhất
        const maxIndices = scoresArray
          .map((score, idx) => ({ score: Number(score), idx }))
          .filter(item => item.score === Number(maxScore))
          .map(item => item.idx);

        // Tìm tất cả các index có điểm thấp nhất
        const minIndices = scoresArray
          .map((score, idx) => ({ score: Number(score), idx }))
          .filter(item => item.score === Number(minScore) && item.score > 0)
          .map(item => item.idx);

        // Random chọn 1 index từ danh sách điểm cao nhất
        if (maxIndices.length > 0) {
          selectedMaxIndex = maxIndices.length > 1
            ? maxIndices[Math.floor(Math.random() * maxIndices.length)]
            : maxIndices[0];
        }

        // Random chọn 1 index từ danh sách điểm thấp nhất
        if (minIndices.length > 0) {
          selectedMinIndex = minIndices.length > 1
            ? minIndices[Math.floor(Math.random() * minIndices.length)]
            : minIndices[0];
        }
      }

      setScores({ ...scores, total: total, hidden: {maxIndex: selectedMaxIndex, minIndex: selectedMinIndex} });
    }
  }

  // Thực hiện đến căp thi tiếp
  const nextMatch = async () => {
    try {
      const competitionId = matchData.competition_dk_id || extractCompetitionIdFromUrl(returnUrl);
      if (!competitionId) {
        await showError("Không tìm thấy thông tin giải đấu. Quay về màn hình quản lý.");
        navigate(returnUrl);
        return;
      }
      /// LẤY DANH SÁCH TỪ competition-match-team
      const matchesResponse = await axios.get(`http://localhost:6789/api/competition-match-team/by-dk/${competitionId}`);
      const matches = matchesResponse.data.success ? matchesResponse.data.data : [];
      // Tìm trận tiếp theo: rơw_index = matchData.row_index + matchData.athletes.length
      const nextMatch = matches.find(m => m.row_index === matchData.row_index + matchData.athletes.length);
      if(!nextMatch){
        await showAlert("Đã hết trận đấu! Quay về màn hình quản lý.");
        return;
      }
      const nextMatchData = {
        ...matchData,
        match_id: nextMatch.id, // match_id của trận tiếp theo
        match_no: nextMatch.match_no,
        match_name: nextMatch.match_name,
        team_name: nextMatch.team_name,
        match_type: nextMatch.match_type,
        athletes: nextMatch.athletes,
        match_status: nextMatch.match_status,
        config_system: configSystem,
        row_index: nextMatch.row_index,
        scores: nextMatch.scores || {}  
      };
      navigate('/scoreboard/vovinam-score', {
        state: {
          matchData: nextMatchData,
          returnUrl: returnUrl
        },
        replace: true // Replace để không tạo history entry mới

      });
    } catch (error) {
      console.error("❌ Lỗi khi chuyển trận:", error);
      await showError("Lỗi khi chuyển sang trận tiếp theo: " + (error.response?.data?.message || error.message));
    }
  };

  // Thục hiện đến trận trước 
  const previousMatch = async () => {
    try {
      const competitionId = matchData.competition_dk_id || extractCompetitionIdFromUrl(returnUrl);
      if (!competitionId) {
        await showError("Không tìm thấy thông tin giải đấu. Quay về màn hình quản lý.");
        navigate(returnUrl);
        return;
      }
      const matchesResponse = await axios.get(`http://localhost:6789/api/competition-match-team/by-dk/${competitionId}`);
      const matches = matchesResponse.data.success ? matchesResponse.data.data : [];
      const previousMatch = matches.find(m => m.row_index === matchData.row_index - matchData.athletes.length);
      if(!previousMatch){
        await showAlert("Đây là trận đầu tiên!");
        return;
      }
      const previousMatchData = {
        ...matchData,
        match_id: previousMatch.id, // match_id của trận trước
        match_no: previousMatch.match_no,
        match_name: previousMatch.match_name,
        team_name: previousMatch.team_name,
        match_type: previousMatch.match_type,
        athletes: previousMatch.athletes,
        match_status: previousMatch.match_status,
        row_index: previousMatch.row_index,
        scores: previousMatch.scores || {}
      };
      navigate('/scoreboard/vovinam-score', {
        state: {
          matchData: previousMatchData,
          returnUrl: returnUrl
        },
        replace: true // Replace để không tạo history entry mới
      });
    } catch (error) { 
      console.error("❌ Lỗi khi chuyển trận:", error);
      await showError("Lỗi khi chuyển sang trận trước: " + (error.response?.data?.message || error.message));
    }
  };

  // Thực hiện nhập tay 
  const handleManualInput = () => {
    setOpenModal(true);
  };

  // thực hiện lưu kết quả: 
  const onSaveResult =async  ()=>{
    try {
      if(!matchData.match_id){
        alert('Không tìm thấy thông tin trận đấu!');
        return;
      } 
      const params = {
        match_id: matchData.match_id,
        scores: scores,
        config_system: configSystem
      }
      const result = await axios.post('http://localhost:6789/api/competition-match-team/save-score', params);
      if(result.status ==200 && result.data.success){
        alert('Lưu kết quả thành công!');
      }else{
        alert('Lưu kết quả thất bại!');
      }
    } catch (error) {
      console.error("❌ Lỗi khi lưu kết quả:", error);
      alert("Lỗi khi lưu kết quả: " + (error.response?.data?.message || error.message));
    }
  }

  // Thực hiện tạo file excel kết quả
  const RenderContentModal = () => {
    return <VovinamScoreForm type={"other"} 
      soGiamDinh={configSystem.so_giam_dinh}
      scores={matchData.scores}
      onAgree={(data) => {
        setScores(data);
        setOpenModal(false);
      }}
      onGoBack={() => setOpenModal(false)} />;
  };

  // lắng nghe điểm quyền
  useSocketEvent(MSG_TP_CLIENT.SCORE_QUYEN, (response) => {
    if(response?.data?.referrer){
       setScores({
        ...scores,
        [`judge${response?.data?.referrer}`]: response?.data?.score
      })
    }
  });



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6 text-white flex flex-col items-center">
      {/* Header Vovinam */}
      <Header
        title={matchData.ten_giai_dau || "GIẢI VÔ ĐỊCH"}
        desc={matchData.ten_mon_thi || "VÕ HIỆN ĐẠI"}
        logos={lsLogo}
      />

      {/* Match Name & Team Name */}
      <div className="w-full max-w-6xl mb-6 space-y-3">
        <div className="bg-gradient-to-r from-blue-800 to-blue-400 px-6 py-4 rounded-xl shadow-2xl border-2 border-blue-400">
          <p className="text-start text-2xl font-bold tracking-wide">
            NỘI DUNG: {matchData.match_name || matchData.match_type || "LONG HỔ QUYỀN"}
          </p>
        </div>
        <div className="bg-gradient-to-r from-green-800 to-green-400 px-6 py-4 rounded-xl shadow-2xl border-2 border-green-400">
          <p className="text-start text-2xl font-bold tracking-wide">
            ĐƠN VỊ: {matchData.team_name || "ĐOÀN HÀ NỘI"}
          </p>
        </div>
      </div>

      {/* Danh sách VĐV (Toggle với F5) */}
      {showAthletes && (
        <div className="w-full max-w-6xl mb-6 animate-fadeIn">
          <div className="bg-gradient-to-r from-purple-800 to-purple-600 px-6 py-4 rounded-xl shadow-2xl border-2 border-purple-400">
            <p className="text-lg font-bold mb-3">STT {matchData.match_no} - THÔNG TIN VĐV:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(matchData.athletes || []).map((athlete, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-yellow-500 text-black font-bold text-sm">
                    {index + 1}
                  </span>
                  <span className="font-semibold">{athlete.athlete_name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bố cục điểm: Giám định 1-5 + Tổng điểm */}
      <div className="w-full max-w-6xl mb-6 mt-6">
        <div className={`grid grid-cols-${configSystem.so_giam_dinh ?? 5} md:grid-cols-${configSystem.so_giam_dinh ?? 5} lg:grid-cols-${configSystem.so_giam_dinh ?? 5} gap-4 justify-items-center`}>
          {/* Render JudgeScores */}
          {(() => {
            // Tính toán selectedMaxIndex và selectedMinIndex một lần duy nhất

            

            // Render các JudgeScore
            return Array.from({ length: configSystem.so_giam_dinh ?? 5 }).map((_, index) => {
              const judgeNum = index + 1;
              const judgeScore = scores[`judge${judgeNum}`] || 0;

              const isHighest = configSystem.so_giam_dinh == 3 ? false : index === scores?.hidden?.maxIndex ;
              const isLowest = configSystem.so_giam_dinh == 3 ? false : index === scores?.hidden?.minIndex;

              return (
                <JudgeScore
                  key={index}
                  judge={judgeNum}
                  score={judgeScore}
                  isHighest={isHighest}
                  isLowest={isLowest}
                />
              );
            });
          })()}
        </div>
      </div>
      <TotalScore total={scores.total} />

      {/* Action Buttons */}
      <div className="w-full max-w-6xl mt-6">
        <ControlPanel buttons={buttons} />
      </div>

      <Modal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        title={"NHẬP ĐIỂM TAY"}
      >
        <RenderContentModal  matchData={matchData}   />
      </Modal>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
