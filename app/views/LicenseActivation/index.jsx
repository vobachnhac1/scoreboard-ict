import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  activateLicense,
  checkLicenseStatus,
  setLicenseStatus,
  clearErrors,
} from "../../config/redux/controller/licenseSlice";
import LicenseStatus from "../../components/LicenseStatus";

export default function LicenseActivation() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    valid,
    activating,
    activationError,
    daysRemaining,
    expirationDate,
    packageName,
    revoked,
    licenseKey: currentLicenseKey,
    activationDate,
    online,
  } = useSelector((state) => state.license);

  const [licenseKey, setLicenseKey] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showActivationForm, setShowActivationForm] = useState(!valid);

  // Listen to license status from Electron
  useEffect(() => {
    if (window.electron && window.electron.onLicenseStatus) {
      window.electron.onLicenseStatus((data) => {
        console.log("License status from Electron:", data);
        dispatch(setLicenseStatus(data));
      });
    }

    // Cleanup
    return () => {
      if (window.electron && window.electron.removeLicenseListeners) {
        window.electron.removeLicenseListeners();
      }
    };
  }, [dispatch]);

  // Update form visibility based on license status
  useEffect(() => {
    setShowActivationForm(!valid || revoked);
  }, [valid, revoked]);

  const handleActivate = async () => {
    if (!licenseKey.trim()) {
      return;
    }

    dispatch(clearErrors());
    const result = await dispatch(activateLicense(licenseKey));

    if (result.type === "license/activate/fulfilled") {
      setShowSuccess(true);
      setShowActivationForm(false);
      setLicenseKey("");
      
      // Tự động chuyển về trang chủ sau 2 giây
      setTimeout(() => {
        navigate("/");
      }, 2000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleActivate();
    }
  };

  const handleChangeKey = () => {
    setShowActivationForm(true);
    setShowSuccess(false);
    dispatch(clearErrors());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-4">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t("license_activation.title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {valid && !revoked
              ? t("license_activation.manage_your_license")
              : t("license_activation.enter_license_key")}
          </p>
        </div>

        {/* License Status - Hiển thị khi có thông tin */}
        {valid && !revoked && currentLicenseKey && (
          <div className="mb-6">
            <LicenseStatus />
            <div className="mt-4 flex justify-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded  font-medium transition-colors"
              >
                ← {t("license_activation.back_to_dashboard")}
              </button>
              <button
                onClick={handleChangeKey}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded  font-medium transition-colors"
              >
                {t("license_activation.change_license_key")}
              </button>
            </div>
          </div>
        )}

        {/* Activation Card - Hiển thị khi cần activate hoặc user muốn đổi key */}
        {showActivationForm && (
          <div className="bg-white dark:bg-gray-800 rounded  shadow-xl p-8">
            {/* Success Message */}
            {showSuccess && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded  ">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-green-700 dark:text-green-300 font-medium">
                      {t("license_activation.activation_success")}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      {t("license_activation.loading")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Revoked Warning */}
            {revoked && (
              <div className="mb-6">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded  p-4">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <div>
                      <p className="text-red-700 dark:text-red-300 font-semibold mb-1">
                        {t("license_activation.license_revoked")}
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {t("license_activation.license_revoked_message")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {activationError && !revoked && !showSuccess && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded  ">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-red-700 dark:text-red-300 font-medium">
                    {activationError}
                  </p>
                </div>
              </div>
            )}

            {/* License Key Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("license_activation.enter_license_code")}
              </label>
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t("license_activation.license_key_placeholder")}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded  focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                disabled={activating || showSuccess}
              />
            </div>

            {/* Activate Button */}
            <button
              onClick={handleActivate}
              disabled={activating || showSuccess || !licenseKey.trim()}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded  font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {activating ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {t("license_activation.activating")}
                </>
              ) : (
                t("license_activation.activate")
              )}
            </button>

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("license_activation.no_license_key")}{" "}
                <a
                  href="https://digisports.com.vn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {t("license_activation.contact_purchase_license")}
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
