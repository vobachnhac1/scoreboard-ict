import React, { useState } from "react";
import JudgeScore from "./components/JudgeScore";
import Header from "./components/Header";
import TotalScore from "./components/TotalScore";
import ControlPanel from "./components/ControlPanel";
import InfoPanel from "./components/InfoPanel";
import Modal from "../../components/Modal";
import VovinamScoreForm from "./Forms/VovinamScoreForm";

export default function VovinamScore() {
  const [openModal, setOpenModal] = useState(false);
  const buttons = [
    {
      label: "TÍNH ĐIỂM",
      onClick: () => console.log("Callback: xử lý TÍNH ĐIỂM"),
    },
    {
      label: "MỞ KẾT NỐI",
      onClick: () => console.log("Callback: xử lý MỞ KẾT NỐI"),
    },
    {
      label: "TRƯỚC",
      onClick: () => console.log("Callback: xử lý TRƯỚC"),
    },
    {
      label: "SAU",
      onClick: () => console.log("Callback: xử lý SAU"),
    },
    {
      label: "NHẬP ĐIỂM TAY",
      onClick: () => {
        setOpenModal(true);
        console.log("Callback: xử lý NHẬP ĐIỂM TAY");
      },
    },
  ];

  const CustomJudgeScore = ({ judge, score }) => (
    <div className="w-full flex justify-center">
      <JudgeScore judge={judge} score={score} />
    </div>
  );

  const RenderContentModal = () => {
    return <VovinamScoreForm type={"other"} onAgree={() => setOpenModal(false)} onGoBack={() => setOpenModal(false)} />;
  };

  return (
    <div className="min-h-screen bg-black p-8 text-white flex flex-col items-center space-y-6">
      <Header title="GIẢI VÔ ĐỊCH VOVINAM" desc="TOÀN QUỐC LẦN THỨ 20 NĂM 2023" />
      <div className="flex flex-col items-start md:flex-row gap-6">
        <div className="w-96">
          <InfoPanel
            content="LONG HỔ QUYỀN"
            unit="LONG HỔ QUYỀN"
            athletes={["NGUYỄN VĂN A", "NGUYỄN VĂN B", "NGUYỄN VĂN C", "NGUYỄN VĂN A", "NGUYỄN VĂN B", "NGUYỄN VĂN C"]}
          />
          <ControlPanel buttons={buttons} />
        </div>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <CustomJudgeScore judge={1} score={10} />
            <CustomJudgeScore judge={2} score={10} />
            <CustomJudgeScore judge={3} score={10} />
            <CustomJudgeScore judge={4} score={10} />
            <TotalScore total={300} />
            <CustomJudgeScore judge={5} score={10} />
          </div>
        </div>
      </div>
      <Modal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        title={"NHẬP ĐIỂM TAY"}
        // headerClass={listActions.find((e) => e.key === openActions?.key)?.color}
      >
        <RenderContentModal />
      </Modal>
    </div>
  );
}
