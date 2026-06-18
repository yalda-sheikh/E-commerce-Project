import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Dashboard({ user, setUser }) {
  const navigate = useNavigate()
  
  const [discountCode, setDiscountCode] = useState('')
  const [chargeAmount, setChargeAmount] = useState('')
  const [message, setMessage] = useState('')

  const [cartItems, setCartItems] = useState([])
  const [totalCartPrice, setTotalCartPrice] = useState(0)
  const [purchaseHistory, setPurchaseHistory] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = () => {
    if (!user) return

    // ۱. دریافت اطلاعات سبد خرید و آخرین وضعیت موجودی کیف پول از جاوا
    fetch(`http://localhost:8080/api/cart?userId=${user.userId}`)
      .then((res) => {
        if (!res.ok) throw new Error('خطا در دریافت اطلاعات سبد خرید')
        return res.json()
      })
      .then((data) => {
        setCartItems(data.cartItems || [])
        setTotalCartPrice(data.totalPrice || 0)
        
        // اگر موجودی ولت در بک‌اِند با فرانت یکی نبود، آپدیتش کن
        if (data.wallet !== undefined && user.wallet !== data.wallet) {
          const updatedUser = { ...user, wallet: data.wallet }
          setUser(updatedUser)
          localStorage.setItem('user', JSON.stringify(updatedUser))
        }
      })
      .catch((err) => {
        console.error('Cart Fetch Error:', err)
      })

    // ۲. دریافت تاریخچه خریدهای واقعی و فاکتورها از بک‌اِند جاوا
    fetch(`http://localhost:8080/api/purchase-history?userId=${user.userId}`)
      .then((res) => {
        if (!res.ok) throw new Error('خطا در دریافت تاریخچه خرید')
        return res.json()
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setPurchaseHistory(data)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error('History Fetch Error:', err)
        setLoading(false)
      })
  }

  useEffect(() => {
    if (!user) {
      alert('❌ ابتدا باید وارد حساب کاربری خود شوید!')
      navigate('/auth') 
      return
    }
    fetchDashboardData()
  }, [user])

  const handleChargeWallet = (e) => {
    e.preventDefault()
    const amount = parseFloat(chargeAmount)
    if (isNaN(amount) || amount < 1000) {
      setMessage('❌ مبلغ وارد شده باید حداقل ۱۰۰۰ تومان باشد.')
      return
    }

    // ارسال درخواست افزایش موجودی به کانتکست جاوای MainServer
    fetch('http://localhost:8080/api/wallet/charge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify({ userId: user.userId, amount: amount })
    })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'خطا در شارژ حساب')
        return data
      })
      .then((data) => {
        // به‌روزرسانی استیت سراسری یوزر با موجودی جدید برگردانده شده از جاوا
        const updatedUser = { ...user, wallet: data.newWallet }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setChargeAmount('')
        setMessage(data.message)
      })
      .catch((err) => {
        setMessage(`❌ ${err.message}`)
      })
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      setMessage('❌ سبد خرید شما خالی است و محصولی برای تسویه وجود ندارد.')
      return
    }

    fetch(`http://localhost:8080/api/cart/checkout?userId=${user.userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify({ discountCode: discountCode })
    })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'تسویه حساب ناموفق بود')
        return data
      })
      .then((data) => {
        setMessage(data.message || '✅ تسویه حساب با موفقیت انجام شد.')
        setDiscountCode('')
        fetchDashboardData() // لود مجدد کل دیتای داشبورد برای خالی شدن سبد و آپدیت انبار و فاکتورها
      })
      .catch((err) => {
        setMessage(`❌ ${err.message}`)
      })
  }

  if (loading && user) {
    return <h3 style={{ textAlign: 'center', marginTop: '50px' }}>⏳ در حال بارگذاری اطلاعات داشبورد...</h3>
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '30px', direction: 'rtl', fontFamily: 'tahoma', padding: '20px' }}>
      
      {/* پیام‌های وضعیت سیستم */}
      {message && (
        <div style={{ padding: '15px', borderRadius: '6px', backgroundColor: message.startsWith('❌') ? '#f8d7da' : '#d4edda', color: message.startsWith('❌') ? '#721c24' : '#155724', textAlign: 'center', fontWeight: 'bold' }}>
          {message}
        </div>
      )}

      {/* بخش اول: اطلاعات مالی و شارژ ولت */}
      <div style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '20px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <h3 style={{ marginTop: 0, color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>💳 وضعیت مالی و کیف پول</h3>
        <p style={{ fontSize: '18px' }}>موجودی فعلی حساب شما: <strong style={{ color: '#28a745' }}>{user?.wallet?.toLocaleString()} تومان</strong></p>
        
        <form onSubmit={handleChargeWallet} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '15px' }}>
          <input type="number" placeholder="مبلغ افزایش موجودی (تومان)" value={chargeAmount} onChange={(e) => setChargeAmount(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '200px' }} required min="1000" />
          <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>➕ شارژ آنلاین کیف پول</button>
        </form>
      </div>

      {/* بخش دوم: سبد خرید و اعمال کد تخفیف */}
      <div style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '20px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <h3 style={{ marginTop: 0, color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>🛒 سبد خرید شما</h3>
        
        {cartItems.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: '20px 0' }}>سبد خرید شما در حال حاضر خالی است.</p>
        ) : (
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', textAlign: 'right' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f3f5' }}>
                  <th style={{ padding: '10px', borderBottom: '2px solid #dee2e6' }}>نام کالا</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #dee2e6' }}>قیمت واحد</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #dee2e6' }}>تعداد درخواست</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #dee2e6' }}>قیمت کل</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.itemId}>
                    <td style={{ padding: '10px', borderBottom: '1px solid #dee2e6' }}>{item.name}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #dee2e6' }}>{item.price.toLocaleString()} تومان</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #dee2e6' }}>{item.quantity} عدد</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #dee2e6' }}>{(item.price * item.quantity).toLocaleString()} تومان</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* بخش اعمال کد تخفیف */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '6px' }}>
              <input type="text" placeholder="کد تخفیف (مثلاً: 12345678)" value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
              <button onClick={() => { setMessage('✅ کد تخفیف ذخیره شد. موقع پرداخت نهایی اعمال می‌شود.'); }} style={{ padding: '8px 15px', backgroundColor: '#17a2b8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>ثبت کد</button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #eee', paddingTop: '15px' }}>
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>مبلغ کل قابل پرداخت: {totalCartPrice.toLocaleString()} تومان</span>
              <button onClick={handleCheckout} style={{ padding: '12px 25px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>💳 پرداخت و تسویه نهایی</button>
            </div>
          </div>
        )}
      </div>

      {/* بخش سوم: تاریخچه خریدها (فاکتورها) */}
      <div style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '20px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <h3 style={{ marginTop: 0, color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>📜 تاریخچه خریدها و فاکتورها</h3>
        
        {purchaseHistory.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: '20px 0' }}>هنوز هیچ فاکتور یا خریدی در تاریخچه شما ثبت نشده است.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f3f5' }}>
                <th style={{ padding: '10px', borderBottom: '2px solid #dee2e6' }}>شماره فاکتور</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #dee2e6' }}>تاریخ ثبت</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #dee2e6' }}>مبلغ پرداختی</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #dee2e6' }}>وضعیت فاکتور</th>
              </tr>
            </thead>
            <tbody>
              {purchaseHistory.map((history) => (
                <tr key={history.purchaseId}>
                  <td style={{ padding: '10px', borderBottom: '1px solid #dee2e6' }}>{history.purchaseId}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #dee2e6' }}>{history.date}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #dee2e6' }}>{history.total.toLocaleString()} تومان</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #dee2e6', color: '#28a745', fontWeight: 'bold' }}>{history.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  )
}

export default Dashboard