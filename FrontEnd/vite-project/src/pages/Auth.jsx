import React, { useState } from 'react'

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
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', direction: 'rtl', fontFamily: 'tahoma' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
        {isLogin ? '🔑 ورود به حساب کاربری' : '📝 ثبت‌نام در سیستم'}
      </h2>

      {message && <p style={{ textAlign: 'center', fontWeight: 'bold', color: 'red' }}>{message}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>نام کاربری:</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} required />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>رمز عبور:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} required />
        </div>

        {!isLogin && (
          <>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>نقش کاربری:</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}>
                <option value="CUSTOMER">خریدار (Customer)</option>
                <option value="SELLER">فروشنده (Seller)</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>موجودی اولیه کیف پول (تومان):</label>
              <input type="number" value={wallet} onChange={(e) => setWallet(e.target.
              value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} min="0" />
              </div>
            </>
          )}
          
          <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: isLogin ? '#007bff' : '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', marginTop: '10px' }}>
            {isLogin ? 'ورود' : 'ثبت‌نام'}
          </button>
        </form>
  
        <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #eee' }} />
  
        <button onClick={() => { setIsLogin(!isLogin); setMessage(''); }} style={{ width: '100%', background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}>
          {isLogin ? 'حساب کاربری ندارید؟ ثبت‌نام کنید' : 'قبلاً ثبت‌نام کرده‌اید؟ وارد شوید'}
        </button>
      </div>
    )
  }
  
  export default Auth;