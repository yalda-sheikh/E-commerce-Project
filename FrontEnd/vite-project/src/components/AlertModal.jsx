import React from "react";
import "./AlertModal.css";

function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
}) {
  if (!isOpen) return null;

  const typeStyles = {
    success: {
      bg: "success-bg",
      btn: "success-btn",
      icon: "✔",
    },
    error: {
      bg: "error-bg",
      btn: "error-btn",
      icon: "✖",
    },
    warning: {
      bg: "warning-bg",
      btn: "warning-btn",
      icon: "⚠",
    },
    info: {
      bg: "info-bg",
      btn: "info-btn",
      icon: "ℹ",
    },
  };

  const currentStyle = typeStyles[type] || typeStyles.info;

  return (
    <div className="modal-overlay">
      {/* کلیک روی پس‌زمینه مودال را می‌بندد */}
      <div
        className="modal-background"
        onClick={onClose}
      ></div>

      {/* باکس مودال */}
      <div className="modal-box">

        {/* آیکون */}
        <div className={`modal-icon ${currentStyle.bg}`}>
          {currentStyle.icon}
        </div>

        {/* عنوان */}
        <h2 className="modal-title">
          {title}
        </h2>

        {/* پیام */}
        <p className="modal-message">
          {message}
        </p>

        {/* دکمه */}
        <div className="modal-footer">
          <button
            className={`modal-btn ${currentStyle.btn}`}
            onClick={onClose}
          >
            متوجه شدم
          </button>
        </div>

      </div>
    </div>
  );
}

export default AlertModal;