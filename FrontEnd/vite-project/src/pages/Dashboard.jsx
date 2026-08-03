import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css' 
import AlertModal from "../components/AlertModal";
import useAlert from '../components/useAlert';
import { useTranslation } from 'react-i18next';
import Discount from './Discount';

function Dashboard({ user, setUser }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [discountCodes, setDiscountCodes] = useState([])
  const [discountCode, setDiscountCode] = useState('')
  const [chargeAmount, setChargeAmount] = useState('')
  const [message, setMessage] = useState('')
  const [cartItems, setCartItems] = useState([])
  const [totalCartPrice, setTotalCartPrice] = useState(0)
  const [purchaseHistory, setPurchaseHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const {alert, showAlert, closeAlert} = useAlert()
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
      showAlert("نا موفق", "❌ ابتدا باید وارد حساب کاربری خود شوید!", "warning");
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
        showAlert("موفق", "شارژ کیف پول با موفقیت انجام شد!", "success");
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
      const data = await res.json();
  
      console.log("checkout status:", res.status);
      console.log("checkout response:", data);
  
      if (!res.ok) {
          throw new Error(data.message || "تسویه ناموفق بود");
      }
  
      showAlert("موفق", "تسویه حساب با موفقیت انجام شد!", "success");
      return data;
  })
  
  .then((data) => {
      // فقط وقتی خرید موفق بوده
      showAlert("موفق", "تسویه حساب با موفقیت انجام شد!", "success");
      setDiscountCode("");
      fetchDashboardData();
  })
  
  .catch((err) => {
      // فقط وقتی خطا بوده
      if (err.message === "INSUFFICIENT_WALLET") {
          showAlert("خطا", "موجودی کیف پول کافی نیست.", "error");
      }
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
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({
        discountCode,
        userId: user.userId,
      }),
    })
    .then(async (res) => {
      const data = await res.json();
    
      console.log("discount response:", data);
    
      return data;
    })
    .then((data) => {
    
      if (!data.success) {
    
        switch (data.message) {
    
          case "DISCOUNT_EXPIRED":
            showAlert("خطا", "کد تخفیف منقضی شده است.", "error");
            return;
    
          case "DISCOUNT_NOT_STARTED":
            showAlert("خطا", "کد تخفیف هنوز فعال نشده است.", "error");
            return;
    
          case "MINIMUM_PRICE":
            showAlert("خطا", "حداقل مبلغ خرید رعایت نشده است.", "error");
            return;
    
          case "DISCOUNT_ALREADY_USED":
            showAlert("خطا", "این کد قبلاً استفاده شده است.", "error");
            return;
    
          case "DISCOUNT_ALREADY_APPLIED":
            showAlert("خطا", "این کد قبلاً روی سبد اعمال شده است.", "error");
            return;
    
          default:
            showAlert("خطا", "کد تخفیف معتبر نیست.", "error");
            return;
        }
      }
    
    
      setTotalCartPrice(data.newPrice);
    
      showAlert(
        "موفق",
        "کد تخفیف با موفقیت اعمال شد.",
        "success"
      );
    
    })
    .catch((err) => {
    
      console.error("discount error:", err);
    
      showAlert(
        "خطا",
        "ارتباط با سرور برقرار نشد.",
        "error"
      );
    
    });}
const handleRemove = (itemId) => {
  fetch("http://localhost:8080/api/cart/remove",{
    method : "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userId : user.userId,
      itemId : itemId
    })


  }).then(async(res) =>{
    const data = await res.json();
    if(!res.ok) throw new Error(data.error);
    return data;
  }).then(()=>{
    fetchDashboardData();
    
}).catch((err) => alert(err.message))
}
return (
  <div className="dashboard-container">

    {message && (
      <div
        className={`dashboard-message ${
          message.startsWith("❌") ? "error-msg" : "success-msg"
        }`}
      >
        {message}
      </div>
    )}

    {/* Wallet */}

    <div className="dashboard-card discount-list-card">

      <h3 className="card-title">
        💳 {t("dashboard.wallet")}
      </h3>

      <p className="wallet-status">
        {t("dashboard.currentBalance")}{" "}
        <strong>
          {user?.wallet?.toLocaleString()} {t("product.currency")}
        </strong>
      </p>

      <form
        onSubmit={handleChargeWallet}
        className="charge-form"
      >

        <input
          type="number"
          placeholder={t("dashboard.chargePlaceholder")}
          value={chargeAmount}
          onChange={(e) => setChargeAmount(e.target.value)}
          className="dashboard-input"
          required
          min="1000"
        />

        <button
          type="submit"
          className="btn btn-success"
        >
          ➕ {t("dashboard.chargeWallet")}
        </button>

      </form>

    </div>



    {/* <div className="dashboard-card">

      <h3 className="card-title">
        🎁 {t("dashboard.myDiscounts")}
      </h3> */}
{/* 
      {discountCodes.map((discount, index) => (

        <div
          key={index}
          className="discount-card"
        >

          <p className="discount-item">
            <strong>{t("discount.table.code")}:</strong>{" "}
            {discount.code}
          </p>

          <p className="discount-item">
            <strong>{t("discount.table.type")}:</strong>{" "}
            {discount.discountType}
          </p>

          <p className="discount-item">
            <strong>{t("discount.table.value")}:</strong>{" "}
            {discount.value}
          </p>

          <p className="discount-item">
            <strong>{t("discount.table.minimum")}:</strong>{" "}
            {(discount.minimumPrice || 0).toLocaleString()}{" "}
            {t("product.currency")}
          </p> */}
{/* 
          <p className="discount-item">
            <strong>{t("discount.table.status")}:</strong>{" "}
            {discount.active
              ? `✅ ${t("discount.enabled")}`
              : `❌ ${t("dashboard.used")}`}
          </p> */}
          {/* <p className="discount-item">
            <strong>تاریخ شروع:</strong>
                {discount.startDate}
          </p>
          <p className="discount-item">
            <strong>تاریخ انقضا:</strong>
                {discount.endDate}
          </p>
        </div>

      ))}

    </div> */}

    {/* Cart */}

    <div className="dashboard-card">

      <h3 className="card-title">
        🛒 {t("dashboard.cart")}
      </h3>

      {cartItems.length === 0 ? (

        <p className="empty-state">
          {t("dashboard.emptyCart")}
        </p>

      ) : (

        <div>

          <div className="table-responsive">

            <table className="dashboard-table">

              <thead>

                <tr>
                  <th>{t("dashboard.product")}</th>
                  <th>{t("dashboard.unitPrice")}</th>
                  <th>{t("dashboard.quantity")}</th>
                  <th>{t("dashboard.totalPrice")}</th>
                  <th></th>
                </tr>

              </thead>

              <tbody>

                {cartItems.map((item) => (

                  <tr key={item.itemId}>

                    <td>
                      {item.name}-{item.color}
                    </td>

                    <td>
                      {item.price.toLocaleString()} {t("product.currency")}
                    </td>

                    <td>
                      {item.quantity} {t("product.items")}
                    </td>

                    <td>
                      {(item.price * item.quantity).toLocaleString()}{" "}
                      {t("product.currency")}
                    </td>

                    <td>

                      <button
                        className="btn btn-primary"
                        onClick={() => handleRemove(item.itemId)}
                      >
                        🗑 {t("dashboard.remove")}
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          <div className="discount-section">

            <input
              type="text"
              placeholder={t("dashboard.discountPlaceholder")}
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              className="dashboard-input"
            />

            <button
              onClick={handleApplyDiscount}
              className="btn btn-info"
            >
              {t("dashboard.applyDiscount")}
            </button>

          </div>

          <div className="checkout-section">

            <span className="total-price">
              {t("dashboard.payable")}{" "}
              {totalCartPrice.toLocaleString()}{" "}
              {t("product.currency")}
            </span>

            <button
              onClick={handleCheckout}
              className="btn btn-primary"
            >
              💳 {t("dashboard.checkout")}
            </button>

          </div>

        </div>

      )}

    </div>

    {/* Purchase History */}

    <div className="dashboard-card">

      <h3 className="card-title">
        📜 {t("dashboard.history")}
      </h3>

      {purchaseHistory.length === 0 ? (

        <p className="empty-state">
          {t("dashboard.emptyHistory")}
        </p>

      ) : (

        <div className="table-responsive">

          <table className="dashboard-table">

            <thead>

              <tr>
                <th>{t("dashboard.invoice")}</th>
                <th>{t("dashboard.date")}</th>
                <th>{t("dashboard.amount")}</th>
                <th>{t("dashboard.status")}</th>
              </tr>

            </thead>

            <tbody>

              {purchaseHistory.map((history) => (

                <tr key={history.purchaseId}>

                  <td>{history.purchaseId}</td>

                  <td>{history.date}</td>

                  <td>
                    {history.total.toLocaleString()}{" "}
                    {t("product.currency")}
                  </td>

                  <td className="status-success">
                    {history.status}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>

    <AlertModal
      {...alert}
      onClose={closeAlert}
    />

  </div>
);

}

export default Dashboard;