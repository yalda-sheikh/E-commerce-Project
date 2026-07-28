import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard.jsx'
import SellerDashboard from './pages/SellerDashboard.jsx'
import './App.css'
import ProductDetail from './pages/ProductِDetail.jsx'
import { useTheme } from './components/ThemeContext'
import LanguageSwitcher from "./components/LanguageSwitcher.jsx";
import { useTranslation } from "react-i18next";

function App() {

  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const isPersian = i18n.language === "fa";
  
    document.documentElement.lang = isPersian ? "fa" : "en";
    document.documentElement.dir = isPersian ? "rtl" : "ltr";
  
    document.body.classList.remove("rtl", "ltr");
    document.body.classList.add(isPersian ? "rtl" : "ltr");
  }, [i18n.language]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    navigate('/auth')
  }

  return (
    <div className="app-container">

      <nav className="navbar">
        <Link to="/" className="nav-brand">
          🏪 {t("storeName")}
        </Link>

        <div className="nav-menu">

          <button onClick={toggleTheme} className="theme-toggle-btn">
            {theme === "light"
              ? `🌙 ${t("darkMode")}`
              : `☀️ ${t("lightMode")}`}
          </button>

          <LanguageSwitcher />

          {user ? (
            <>
              <Link to="/dashboard" className="nav-link dashboard-link">
                👤 {t("Maindashboard")}
                <span className="user-tag">
                  ({user.username} - {user.role === "CUSTOMER"
                    ? t("customer")
                    : t("sellerrole")})
                </span>
              </Link>

              <button onClick={handleLogout} className="btn btn-logout">
                {t("logout")}
              </button>
            </>
          ) : (
            <Link to="/auth" className="btn btn-auth">
              🔑 {t("loginRegister")}
            </Link>
          )}
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/auth" element={<Auth setUser={setUser} />} />
          <Route
            path="/dashboard"
            element={
              user && user.role === 'CUSTOMER' ? (
                <Dashboard user={user} setUser={setUser} />
              ) : (
                <SellerDashboard user={user} setUser={setUser} />
              )
            }
          />
          <Route path="/product/:id" element={<ProductDetail user={user} />} />
        </Routes>
      </main>
    </div>
  )
}

export default App