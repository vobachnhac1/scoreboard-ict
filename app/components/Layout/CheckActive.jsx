import React from "react";
import { useTranslation } from "react-i18next";
import Input from "../Input";
import Button from "../Button";
import Modal from "../Modal";

export default function CheckActive({ checkActive }) {
  const { t } = useTranslation();
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
          <h1 className="text-3xl">{t("license.welcome_message")}</h1>
          <p className="text-base mt-2">
            {t("license.thank_you_message")}
          </p>
          <p className="text-base mt-2">- {t("license.technical_support")}: 0902.336.837 (Võ Bách Nhạc).</p>
          <p className="text-base mt-2">- {t("license.business_department")}: 0902.336.837 (Võ Bách Nhạc).</p>
          <p className="text-base mt-2">{t("license.or_send_to")}</p>
          <p className="text-base mt-2">- Email: vobachnhac@gmail.com</p>
          <p className="text-base mt-2 ">
            - Website:{" "}
            <a href="http://mvvn.com.vn/" className="text-blue-600 dark:text-blue-500 hover:underline cursor-pointer">
              mvvn.com.vn
            </a>
          </p>
        </div>
        <div className="flex flex-col items-center justify-center w-full mt-10">
          <div className="uppercase">{t("license.please_connect_internet")}</div>
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
              {t("license.activate")}
            </Button>
          </div>
          <div className="mt-2">
            {isActive ? (
              <div className="uppercase text-xs text-green-600 font-bold">{t("license.valid")}</div>
            ) : (
              <div className="uppercase text-xs text-red-600 font-bold">{t("license.not_activated")}</div>
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
