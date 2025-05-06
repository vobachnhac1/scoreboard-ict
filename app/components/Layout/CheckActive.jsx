import React from "react";
import Input from "../Input";
import Button from "../Button";
import Modal from "../Modal";

export default function CheckActive({ checkActive }) {
  const [licenseKey, setLicenseKey] = React.useState("");
  const [loadingButton, setLoadingButton] = React.useState(false);
  const [isActive, setIsActive] = React.useState(false);
  const [openModal, setOpenModal] = React.useState(false);

  const handleCheckActive = (key) => {
    setLoadingButton(true);
    // Simulate an API call to check the license key
    setTimeout(() => {
      setOpenModal(true);
      setLoadingButton(false);
      setIsActive(true);
    }, 1000);
  };

  return (
    <React.Fragment>
      <div className="h-screen bg-gray-100 p-6 overflow-auto">
        <div className="">
          <h1 className="text-3xl">Chào mừng quý khách hàng,</h1>
          <p className="text-base mt-2">
            Đầu tiên phía công ty gửi lời cảm ơn chân thành đến quý khách hàng đã tin tưởng sử dụng dịch vụ của công ty. Trong suốt quá trình triển nghiệm dịch
            vụ nếu gặp khó khăn xin đừng ngại hãy liên hệ đến bộ phận hỗ trợ khách hàng:
          </p>
          <p className="text-base mt-2">- Bộ phận hỗ trợ kỹ thuật: 0902.336.837 (Võ Bách Nhạc).</p>
          <p className="text-base mt-2">- Bộ phận kinh doanh: 0902.336.837 (Võ Bách Nhạc).</p>
          <p className="text-base mt-2">Hoặc gửi thông tin đến hộp thư:</p>
          <p className="text-base mt-2">- Email: vobachnhac@gmail.com</p>
          <p className="text-base mt-2 ">
            - Website:{" "}
            <a href="http://mvvn.com.vn/" className="text-blue-600 dark:text-blue-500 hover:underline cursor-pointer">
              mvvn.com.vn
            </a>
          </p>
        </div>
        <div className="flex flex-col items-center justify-center w-full mt-10">
          <div className="uppercase">Vui lòng kết nối Internet để tiếp tục</div>
          <div className="flex items-center justify-center mt-4">
            <Input
              onChange={(e) => {
                const formattedKey = e.target.value
                  .replace(/[^A-Za-z0-9]/g, "")
                  .replace(/(.{4})/g, "$1-")
                  .slice(0, 19)
                  .toUpperCase();
                setLicenseKey(formattedKey);
              }}
              disabled={loadingButton}
              value={licenseKey}
              onKeyDown={(e) => e.key === "Enter" && handleCheckActive(licenseKey)}
              className="!rounded-none !w-64"
              placeholder="XXXX-XXXX-XXXX-XXXX"
            />
            <Button
              disabled={licenseKey?.length < 19}
              loading={loadingButton}
              onClick={() => handleCheckActive(licenseKey)}
              variant="danger"
              className="!rounded-none border-red-600 border-2"
            >
              Kích hoạt
            </Button>
          </div>
          <div className="mt-2">
            {isActive ? (
              <div className="uppercase text-xs text-green-600 font-bold">Mã kích hoạt hợp lệ</div>
            ) : (
              <div className="uppercase text-xs text-red-600 font-bold">Trạng thái chưa kết nối</div>
            )}
          </div>
        </div>
      </div>
      <Modal isOpen={openModal} onClose={() => setOpenModal(false)} title="Thông báo" status="success">
        <div className="text-gray-700">
          <p>Kính chào "XXXX" đã kích hoạt thành công</p>
          <p>- Ngày kích hoạt: 01.01.2025</p>
          <p>- Ngày hết hạn: 31.12.2025</p>
          <p>- Gói cước: 12 tháng(1 Sân thi đấu).</p>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setOpenModal(false);
              checkActive(licenseKey);
            }}
          >
            Đóng
          </Button>
        </div>
      </Modal>
    </React.Fragment>
  );
}
