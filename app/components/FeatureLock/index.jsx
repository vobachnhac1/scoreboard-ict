import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

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
 * <FeatureLock feature="scoreboard">
 *   <ScoreboardComponent />
 * </FeatureLock>
 */
export default function FeatureLock({ children, feature = null }) {
  const navigate = useNavigate();
  const { valid, features, requireActivation } = useSelector(
    (state) => state.license,
  );

  useEffect(() => {
    // Nếu license không hợp lệ -> redirect đến trang activation
    if (!valid || requireActivation) {
      console.log(" License invalid. Redirecting to activation page...");
      navigate("/license-activation");
      return;
    }

    // Nếu yêu cầu feature cụ thể nhưng feature không được bật
    if (feature && features && !features[feature]) {
      console.log(
        ` Feature "${feature}" not enabled. Redirecting to activation page...`,
      );
      navigate("/license-activation");
      return;
    }
  }, [valid, requireActivation, feature, features, navigate]);

  // Nếu license không hợp lệ -> không render gì
  if (!valid || requireActivation) {
    return null;
  }

  // Nếu yêu cầu feature cụ thể nhưng feature không được bật -> không render gì
  if (feature && features && !features[feature]) {
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
