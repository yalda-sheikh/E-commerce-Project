import React, { useState } from 'react'
import './Auth.css'; // متصل کردن فایل استایل اختصاصی فرم‌ها

function Auth({ setUser }) {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('CUSTOMER')
  const [wallet, setWallet] = useState('100000') 
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setMessage('')

    const userData = {
      username: username,
      password: password,
      role: role,
      wallet: parseFloat(wallet),
      isLogin: isLogin 
    }

    const url = 'http://127.0.0.1:8080/api/auth'; 

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify(userData),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errData = await response.json()
            throw new Error(errData.error || 'خطایی از سمت سرور رخ داد')
        }
        return response.json();
      })
      .then((data) => {
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        alert(isLogin ? '🟢 با موفقیت وارد شدید!' : '🎉 ثبت‌نام با موفقیت انجام و در فایل متنی ذخیره شد!');
      })
      .catch((error) => {
        console.error('خطا:', error);
        setMessage(error.message.includes('Fetch') || error.message.includes('network')
          ? '❌ خطا در اتصال به سرور جاوا! مطمئن شوید MainServer روشن است.'
          : `❌ ${error.message}`);
      });
  }

  return (
    <div className="auth-container">
      <h2 className="auth-title">
        {isLogin ? '🔑 ورود به حساب کاربری' : '📝 ثبت‌نام در سیستم'}
      </h2>

      {message && <p className="auth-message">{message}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>نام کاربری:</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>رمز عبور:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        {!isLogin && (
          <>
            <div className="form-group">
              <label>نقش کاربری:</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="CUSTOMER">خریدار (Customer)</option>
                <option value="SELLER">فروشنده (Seller)</option>
              </select>
            </div>

            <div className="form-group">
              <label>موجودی اولیه کیف پول (تومان):</label>
              <input type="number" value={wallet} onChange={(e) => setWallet(e.target.value)} min="0" />
            </div>
          </>
        )}
          
        <button type="submit" className={`auth-submit-btn ${isLogin ? 'login-mode' : 'register-mode'}`}>
          {isLogin ? 'ورود' : 'ثبت‌نام'}
        </button>
      </form>
  
      <hr className="auth-divider" />
  
      <button onClick={() => { setIsLogin(!isLogin); setMessage(''); }} className="auth-toggle-btn">
        {isLogin ? 'حساب کاربری ندارید؟ ثبت‌نام کنید' : 'قبلاً ثبت‌نام کرده‌اید؟ وارد شوید'}
      </button>
    </div>
  )
}

export default Auth;