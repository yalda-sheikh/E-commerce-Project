import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard.jsx'

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
    <div style={{ fontFamily: 'tahoma, sans-serif', direction: 'rtl', padding: '20px', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>

      <nav style={{ display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '2px solid #e0e0e0', paddingBottom: '15px', marginBottom: '30px', backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        
        <Link to="/" style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold', fontSize: '16px' }}>🏪 ویترین فروشگاه</Link>
        
        {user ? (
          <>
            <Link to="/dashboard" style={{ textDecoration: 'none', color: '#28a745', fontWeight: 'bold', fontSize: '16px' }}>
              👤 پنل کاربری ({user.username} - <span style={{fontSize: '12px', color: '#666'}}>{user.role === 'CUSTOMER' ? 'مشتری' : 'فروشنده'}</span>)
            </Link>
            
            <button onClick={handleLogout} style={{ marginRight: 'auto', background: '#dc3545', color: '#fff', border: 'none', padding: '6px 12px', cursor: 'pointer', borderRadius: '6px', fontWeight: 'bold' }}>
              خروج از حساب
            </button>
          </>
        ) : (
          <Link to="/auth" style={{ textDecoration: 'none', color: '#495057', fontWeight: 'bold', marginRight: 'auto', backgroundColor: '#e9ecef', padding: '6px 12px', borderRadius: '6px' }}>
            🔑 ورود / ثبت‌نام
          </Link>
        )}
      </nav>


      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/auth" element={<Auth setUser={setUser} />} />
        <Route 
          path="/dashboard" 
          element={
            user && user.role === 'CUSTOMER' ? (
              <Dashboard user={user} setUser={setUser} />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', color: '#dc3545' }}>
                <h2>🚫 عدم دسترسی</h2>
                <p>پنل شما فروشنده است. فقط خریداران (مشتریان) به این داشبورد دسترسی دارند.</p>
              </div>
            )
          } 
        />
      </Routes>
      
    </div>
  )
}

export default App