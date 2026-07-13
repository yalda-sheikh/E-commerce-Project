import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard.jsx'
import SellerDashboard from './pages/SellerDashboard.jsx'
import './App.css' // متصل کردن فایل استایل جدید
import ProductDetail from './pages/ProductِDetail.jsx'

function App() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

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
      {/* هدر و نوار ناوبری */}
      <nav className="navbar">
        <Link to="/" className="nav-brand">🏪 ویترین فروشگاه</Link>
        
        <div className="nav-menu">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link dashboard-link">
                👤 پنل کاربری <span className="user-tag">({user.username} - {user.role === 'CUSTOMER' ? 'مشتری' : 'فروشنده'})</span>
              </Link>
              
              <button onClick={handleLogout} className="btn btn-logout">
                خروج از حساب
              </button>
            </>
          ) : (
            <Link to="/auth" className="btn btn-auth">
              🔑 ورود / ثبت‌نام
            </Link>
          )}
        </div>
      </nav>

      {/* بخش محتوای صفحات */}
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
                <SellerDashboard user={user} setUser={setUser}/>
              )
            } 
          />
           <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </main>
    </div>
  )
}

export default App