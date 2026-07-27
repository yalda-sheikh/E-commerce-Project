import { useTranslation } from "react-i18next";


function LanguageSwitcher() {
  const { i18n } = useTranslation();
const changeLanguage = (lang) => {
  i18n.changeLanguage(lang);
  localStorage.setItem("language", lang);
};
  return (
    <div className="language-switcher">
      <button
        className={`language-btn ${
          i18n.language === "fa" ? "active" : ""
        }`}
        onClick={() => changeLanguage("fa")}
      >
        <span>🇮🇷</span>
        فارسی
      </button>

      <button
        className={`language-btn ${
          i18n.language === "en" ? "active" : ""
        }`}
        onClick={() => changeLanguage("en")}
      >
        <span>🇬🇧</span>
        English
      </button>
    </div>
  );
}

export default LanguageSwitcher;