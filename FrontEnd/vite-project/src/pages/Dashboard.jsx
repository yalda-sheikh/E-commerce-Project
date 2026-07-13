import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css' // اضافه کردن فایل استایل داشبورد

function Dashboard({ user, setUser }) {
  const navigate = useNavigate()
  const [discountCodes, setDiscountCodes] = useState([])
  const [discountCode, setDiscountCode] = useState('')
  const [chargeAmount, setChargeAmount] = useState('')
  const [message, setMessage] = useState('')

  const [cartItems, setCartItems] = useState([])
  const [totalCartPrice, setTotalCartPrice] = useState(0)
  const [purchaseHistory, setPurchaseHistory] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = () => {
    if (!user) return

    fetch(`http://localhost:8080/api/cart?userId=${user.userId}`)
      .then((res) => {
        if (!res.ok) throw new Error('خطا در دریافت اطلاعات سبد خرید')
        return res.json()
      })
      .then((data) => {
        setCartItems(data.cartItems || [])
        setTotalCartPrice(data.totalPrice || 0)
        
        if (data.wallet !== undefined && user.wallet !== data.wallet) {
          const updatedUser = { ...user, wallet: data.wallet }
          setUser(updatedUser)
          localStorage.setItem('user', JSON.stringify(updatedUser))
        }
      })
      .catch((err) => {
        console.error('Cart Fetch Error:', err)
      })

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
      fetch("http://localhost:8080/api/discount")
.then(res => res.json())
.then(data => {
    setDiscountCodes(data)
})
.catch(err => {
    console.log("Discount Load Error:", err)
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
        fetchDashboardData() 
      })
      .catch((err) => {
        setMessage(`❌ ${err.message}`)
      })
      fetch(`http://localhost:8080/api/discounts?userId=${user.userId}`)
  .then(res => {
    if (!res.ok) throw new Error("خطا در دریافت کدهای تخفیف");
    return res.json();
  })
  .then(data => {
    setDiscountCodes(data);
  })
  .catch(err => {
    console.log(err);
  });
  }

  if (loading && user) {
    return (
      <div className="dashboard-loading">
        <h3>⏳ در حال بارگذاری اطلاعات داشبورد...</h3>
      </div>
    )
  }
  const handleApplyDiscount = () => {
    fetch("http://localhost:8080/api/discount/apply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8"
      },
      body: JSON.stringify({
        discountCode: discountCode,
        userId : user.userId
      })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        return data;
      })
      .then((data) => {
        setTotalCartPrice(data.newPrice);
        setMessage("✅ کد تخفیف اعمال شد.");
      })
      .then(async (res) => {
        const data = await res.json();
        console.log(data);
      
        if (!res.ok) throw new Error(data.error);
      
        return data;
      })
      .catch((err) => {
        setMessage("❌ " + err.message);
      });
  };

  return(
    <div className="dashboard-container">
      
      {/* پیام‌های وضعیت سیستم */}
      {message && (
        <div className={`dashboard-message ${message.startsWith('❌') ? 'error-msg' : 'success-msg'}`}>
          {message}
        </div>
      )}

      {/* بخش اول: اطلاعات مالی و شارژ ولت */}
      <div className="dashboard-card discount-list-card">
        <h3 className="card-title">💳 وضعیت مالی و کیف پول</h3>
        <p className="wallet-status">
          موجودی فعلی حساب شما: <strong>{user?.wallet?.toLocaleString()} تومان</strong>
        </p>
        
        <form onSubmit={handleChargeWallet} className="charge-form">
          <input 
            type="number" 
            placeholder="مبلغ افزایش موجودی (تومان)" 
            value={chargeAmount} 
            onChange={(e) => setChargeAmount(e.target.value)} 
            className="dashboard-input"
            required 
            min="1000" 
          />
          <button type="submit" className="btn btn-success">➕ شارژ آنلاین کیف پول</button>
        </form>
      </div>
      <div className="dashboard-card">
      <h3 className="card-title">🎁 کدهای تخفیف من</h3>

  {discountCodes.map((discount, index) => (
 <div key={index} className="discount-card">
<p className="discount-item"><strong>کد:</strong> {discount.code}</p>

<p className="discount-item"><strong>نوع:</strong> {discount.discountType}</p>

<p className="discount-item"><strong>مقدار:</strong> {discount.value}</p>

<p className="discount-item">
<strong>حداقل خرید:</strong> {discount.minimumPrice.toLocaleString()} تومان
</p>

<p className="discount-item">
<strong>وضعیت:</strong>{" "}
{discount.active ? "✅ فعال" : "❌ استفاده شده"}
</p>
  </div>
))}
</div>

      {/* بخش دوم: سبد خرید و اعمال کد تخفیف */}
      <div className="dashboard-card">
        <h3 className="card-title">🛒 سبد خرید شما</h3>
        
        {cartItems.length === 0 ? (
          <p className="empty-state">سبد خرید شما در حال حاضر خالی است.</p>
        ) : (
          <div>
            <div className="table-responsive">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>نام کالا</th>
                    <th>قیمت واحد</th>
                    <th>تعداد درخواست</th>
                    <th>قیمت کل</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.itemId}>
                      <td>{item.name}</td>
                      <td>{item.price.toLocaleString()} تومان</td>
                      <td>{item.quantity} عدد</td>
                      <td>{(item.price * item.quantity).toLocaleString()} تومان</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* بخش اعمال کد تخفیف */}
            <div className="discount-section">
              <input 
                type="text" 
                placeholder="کد تخفیف (مثلاً: 12345678)" 
                value={discountCode} 
                onChange={(e) => setDiscountCode(e.target.value)} 
                className="dashboard-input" 
              />
              <button 
                onClick={handleApplyDiscount}
                className="btn btn-info"
              >
                ثبت کد
              </button>
            </div>

            <div className="checkout-section">
              <span className="total-price">مبلغ کل قابل پرداخت: {totalCartPrice.toLocaleString()} تومان</span>
              <button onClick={handleCheckout} className="btn btn-primary">💳 پرداخت و تسویه نهایی</button>
            </div>
          </div>
        )}
      </div>

      {/* بخش سوم: تاریخچه خریدها (فاکتورها) */}
      <div className="dashboard-card">
        <h3 className="card-title">📜 تاریخچه خریدها و فاکتورها</h3>
        
        {purchaseHistory.length === 0 ? (
          <p className="empty-state">هنوز هیچ فاکتور یا خریدی در تاریخچه شما ثبت نشده است.</p>
        ) : (
          <div className="table-responsive">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>شماره فاکتور</th>
                  <th>تاریخ ثبت</th>
                  <th>مبلغ پرداختی</th>
                  <th>وضعیت فاکتور</th>
                </tr>
              </thead>
              <tbody>
                {purchaseHistory.map((history) => (
                  <tr key={history.purchaseId}>
                    <td>{history.purchaseId}</td>
                    <td>{history.date}</td>
                    <td>{history.total.toLocaleString()} تومان</td>
                    <td className="status-success">{history.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}

export default Dashboard