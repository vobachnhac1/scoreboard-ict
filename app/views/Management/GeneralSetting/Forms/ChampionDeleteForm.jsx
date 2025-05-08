import React from "react";
import Button from "../../../../components/Button";

export default function TournamentDeleteForm({ onGoBack, onAgree }) {
  return (
    <div className="flex flex-col items-center">
      <p className="text-lg font-semibold">Bạn có muốn xoá giải đấu này không?</p>
      <div className="flex items-center justify-center gap-2 mt-6">
        <Button type="button" className="min-w-32" variant="secondary" onClick={onGoBack}>
          Quay lại
        </Button>
        <Button type="submit" className="min-w-32" variant="primary" onClick={onAgree}>
          Đồng ý
        </Button>
      </div>
    </div>
  );
}
