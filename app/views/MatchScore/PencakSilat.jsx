import React, { useState } from "react";
import JudgeScore from "./components/JudgeScore";
import Header from "./components/Header";
import TotalScore from "./components/TotalScore";
import Modal from "../../components/Modal";
import VovinamScoreForm from "./Forms/VovinamScoreForm";
import ControlPanel from "./components/ControlPanel";

export default function PencakSilat() {
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

  const RenderContentModal = () => {
    return <VovinamScoreForm type={"other"} onAgree={() => setOpenModal(false)} onGoBack={() => setOpenModal(false)} />;
  };

  const CustomJudgeScore = ({ judge, score, reverse = false }) => (
    <div className={`w-48 bg-sky-200 rounded-lg flex items-center justify-between text-black py-1 px-2 ${reverse ? "flex-row-reverse" : "flex-row"}`}>
      <p className="font-bold">GIÁM ĐỊNH {judge}</p>
      <p className="text-4xl font-bold">{score}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black p-8 text-white flex flex-col items-center space-y-6">
      <Header title="GIẢI VÔ ĐỊCH PENCAK SILAT" desc="TOÀN QUỐC LẦN THỨ 20 NĂM 2023" />
      <div className="flex gap-4">
        <div className="flex flex-col justify-start gap-4">
          <CustomJudgeScore judge="1" score={10} />
          <CustomJudgeScore judge="2" score={10} />
          <CustomJudgeScore judge="3" score={10} />
          <CustomJudgeScore judge="4" score={10} />
          <CustomJudgeScore judge="5" score={10} />
        </div>
        <div className="w-96 flex flex-col justify-end items-center">
          <TotalScore total={300} />
          <ControlPanel buttons={buttons} />
        </div>
        <div className="flex flex-col justify-start gap-4">
          <CustomJudgeScore judge="1" score={10} reverse />
          <CustomJudgeScore judge="2" score={10} reverse />
          <CustomJudgeScore judge="3" score={10} reverse />
          <CustomJudgeScore judge="4" score={10} reverse />
          <CustomJudgeScore judge="5" score={10} reverse />
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
