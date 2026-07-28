import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "./Auth.css";
import AlertModal from "../components/AlertModal";

function Auth({ setUser }) {
  const { t } = useTranslation();

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CUSTOMER");
  const [wallet, setWallet] = useState("100000");
  const [message, setMessage] = useState("");
  const [isReadOnly, setIsReadOnly] = useState(true);

  const [isOpen, setIsOpen] = useState(false);

  const [modalData, setModalData] = useState({
    title: "",
    message: "",
    type: "info",
  });

  const onClose = () => {
    setIsOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");

    const userData = {
      username,
      password,
      role,
      wallet: parseFloat(wallet),
      isLogin,
    };

    fetch("http://127.0.0.1:8080/api/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify(userData),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || t("auth.serverError"));
        }
        return response.json();
      })
      .then((data) => {
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));

        setModalData({
          title: t("common.success"),
          message: isLogin
            ? t("auth.loginSuccess")
            : t("auth.registerSuccess"),
          type: "success",
        });

        setIsOpen(true);
      })
      .catch((error) => {
        console.error("خطا:", error);

        setMessage(
          error.message.includes("Fetch") ||
            error.message.includes("network")
            ? `❌ ${t("auth.connectionError")}`
            : `❌ ${error.message}`
        );
      });
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">
        {isLogin
          ? `🔑 ${t("auth.loginTitle")}`
          : `📝 ${t("auth.registerTitle")}`}
      </h2>

      {message && <p className="auth-message">{message}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>{t("auth.username")}:</label>

          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            readOnly={isReadOnly}
            onFocus={() => setIsReadOnly(false)}
          />
        </div>

        <div className="form-group">
          <label>{t("auth.password")}:</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            readOnly={isReadOnly}
            onFocus={() => setIsReadOnly(false)}
          />
        </div>

        {!isLogin && (
          <>
            <div className="form-group">
              <label>{t("auth.role")}:</label>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="CUSTOMER">
                  {t("auth.customer")}
                </option>

                <option value="SELLER">
                  {t("auth.sellerrole")}
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>{t("auth.wallet")}:</label>

              <input
                type="number"
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                min="0"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          className={`auth-submit-btn ${
            isLogin ? "login-mode" : "register-mode"
          }`}
        >
          {isLogin
            ? t("auth.login")
            : t("auth.register")}
        </button>
      </form>

      <hr className="auth-divider" />

      <button
        className="auth-toggle-btn"
        onClick={() => {
          setIsLogin(!isLogin);
          setMessage("");
        }}
      >
        {isLogin
          ? t("auth.noAccount")
          : t("auth.haveAccount")}
      </button>

      <AlertModal
        isOpen={isOpen}
        onClose={onClose}
        title={modalData.title}
        message={modalData.message}
        type={modalData.type}
      />
    </div>
  );
}

export default Auth;