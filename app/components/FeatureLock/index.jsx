import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { useTranslation } from "react-i18next";

/**
 * FeatureLock Component
 * Khóa tính năng nếu license không hợp lệ hoặc feature không được bật
 *
 * Usage:
 * <FeatureLock>
 *   <YourComponent />
 * </FeatureLock>
 *
 * Hoặc khóa feature cụ thể:
 * Hoặc khóa feature cụ thể:
 * <FeatureLock feature="scoreboard">
 *   <ScoreboardComponent />
 * </FeatureLock>
 * 
 * Hoặc khóa theo gói cước (tier):
 * <FeatureLock requiredTier={PACKAGE_TIERS.ADVANCED}>
 *   <AdvancedComponent />
 * </FeatureLock>
 */
export const PACKAGE_TIERS = {
  BASIC: 1,
  ADVANCED: 2,
  ENTERPRISE: 3
};

export const getPackageTier = (packageName) => {
  if (!packageName) return PACKAGE_TIERS.BASIC; // Mặc định là Pro/Advanced nếu không có thông tin
  const name = packageName.toLowerCase();
  if (name.includes('enterprise') || name.includes('doanh nghiệp') || name.includes('doanh nghiep')) return PACKAGE_TIERS.ENTERPRISE;
  if (name.includes('advanced') || name.includes('nâng cao') || name.includes('nang cao') || name.includes('pro')) return PACKAGE_TIERS.ADVANCED;
  if (name.includes('basic') || name.includes('cơ bản') || name.includes('co ban')) return PACKAGE_TIERS.BASIC;
  return PACKAGE_TIERS.BASIC;
};

export const usePackageAccess = () => {
  const { packageName, features } = useSelector((state) => state.license);
  const currentTier = getPackageTier(packageName);

  const hasAccess = (requireTierNumber, featureKey = null) => {
    // 1. Kiểm tra ghi đè module trực tiếp từ server
    if (featureKey && features?.module_overrides) {
      if (features.module_overrides[featureKey] === false) return false;
      if (features.module_overrides[featureKey] === true) return true;
    }

    // 2. Fallback logic thông thường
    return requireTierNumber ? currentTier >= requireTierNumber : true;
  };

  return {
    currentTier,
    hasAccess
  };
};

export default function FeatureLock({ children, feature = null, requiredTier = null }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { valid, features, requireActivation, packageName } = useSelector(
    (state) => state.license,
  );

  useEffect(() => {
    // Nếu license không hợp lệ -> redirect đến trang Dashboard để kích hoạt
    if (!valid || requireActivation) {
      console.log(" License invalid. Redirecting to Dashboard...");
      navigate("/");
      return;
    }

    // 1. Nếu module bị Server CẤM trực tiếp
    if (feature && features?.module_overrides?.[feature] === false) {
      console.log(` Feature "${feature}" is explicitly locked by online server. Redirecting...`);
      navigate("/");
      return;
    }

    // 2. Nếu server CHƯA cấm, ta check Tier thông thường
    // NHƯNG nếu server MỞ KHÓA cụ thể `module_overrides[feature] === true`, ta bỏ qua check Tier
    const isExplicitlyUnlocked = feature && features?.module_overrides?.[feature] === true;

    if (!isExplicitlyUnlocked && requiredTier && getPackageTier(packageName) < requiredTier) {
      console.log(` Requires tier ${requiredTier} but current is ${getPackageTier(packageName)}. Redirecting to Dashboard...`);
      message.warning({
        content: t("feature_lock.upgrade_required", "Vui lòng nâng cấp gói cước để sử dụng tính năng này!"),
        duration: 3
      });
      navigate("/");
      return;
    }
  }, [valid, requireActivation, feature, features, requiredTier, packageName, navigate, t]);

  // Nếu license không hợp lệ -> không render gì
  if (!valid || requireActivation) {
    return null;
  }

  // Nếu server cấm trực tiếp quyền này
  if (feature && features?.module_overrides?.[feature] === false) {
    return null;
  }

  // Nếu server MỞ đặc cách
  const isExplicitlyUnlocked = feature && features?.module_overrides?.[feature] === true;

  // Nếu không đạt yêu cầu gói mà không được mởi khoá đặc cách -> không render gì
  if (!isExplicitlyUnlocked && requiredTier && getPackageTier(packageName) < requiredTier) {
    return null;
  }

  // License hợp lệ và feature được bật -> render children
  return <>{children}</>;
}

/**
 * withFeatureLock HOC
 * Higher Order Component để wrap component với FeatureLock
 *
 * Usage:
 * export default withFeatureLock(YourComponent);
 *
 * Hoặc với feature cụ thể:
 * export default withFeatureLock(YourComponent, 'scoreboard');
 */
export function withFeatureLock(Component, feature = null) {
  return function FeatureLockedComponent(props) {
    return (
      <FeatureLock feature={feature}>
        <Component {...props} />
      </FeatureLock>
    );
  };
}
