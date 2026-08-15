import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import AlertModal from "../components/AlertModal";
import useAlert from "../components/useAlert";
import { useTranslation } from "react-i18next";

function Dashboard({ user, setUser }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [discountCodes, setDiscountCodes] = useState([]);
  const [discountCode, setDiscountCode] = useState("");
  const [chargeAmount, setChargeAmount] = useState("");
  const [message, setMessage] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [totalCartPrice, setTotalCartPrice] = useState(0);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { alert, showAlert, closeAlert } = useAlert();
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountApplied, setDiscountApplied] = useState(false);

  // =========================================
  // RTL / LTR
  // =========================================

  const isRTL = i18n.language === "fa";

  // =========================================
  // DASHBOARD DATA
  // =========================================

  const fetchDashboardData = () => {
    if (!user) return;

    // -----------------------------
    // Cart
    // -----------------------------

    fetch(`http://localhost:8080/api/cart?userId=${user.userId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(t("dashboard.cartFetchError"));
        }

        return res.json();
      })
      .then((data) => {
        setCartItems(data.cartItems || []);
        setTotalCartPrice(data.totalPrice || 0);

        if (
          data.wallet !== undefined &&
          user.wallet !== data.wallet
        ) {
          const updatedUser = {
            ...user,
            wallet: data.wallet,
          };

          setUser(updatedUser);

          localStorage.setItem(
            "user",
            JSON.stringify(updatedUser)
          );
        }
      })
      .catch((err) => {
        console.error("Cart Fetch Error:", err);
      });

    // -----------------------------
    // Purchase History
    // -----------------------------

    fetch(
      `http://localhost:8080/api/purchase-history?userId=${user.userId}`
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error(t("dashboard.historyFetchError"));
        }

        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setPurchaseHistory(data);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("History Fetch Error:", err);
        setLoading(false);
      });

    // -----------------------------
    // Discount Codes
    // -----------------------------

    fetch(
      `http://localhost:8080/api/discount?customerId=${user.userId}`
    )
      .then((res) => res.json())
      .then((data) => {
        setDiscountCodes(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Discount Load Error:", err);
      });
  };

  // =========================================
  // USER CHECK
  // =========================================

  useEffect(() => {
    if (!user) {
      showAlert(
        t("dashboard.error"),
        t("dashboard.loginRequired"),
        "warning"
      );

      navigate("/auth");

      return;
    }

    fetchDashboardData();
  }, [user, i18n.language]);

  // =========================================
  // CHARGE WALLET
  // =========================================

  const handleChargeWallet = (e) => {
    e.preventDefault();

    const amount = parseFloat(chargeAmount);

    if (isNaN(amount) || amount < 1000) {
      setMessage(
        `❌ ${t("dashboard.minimumCharge")}`
      );

      return;
    }

    fetch("http://localhost:8080/api/wallet/charge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({
        userId: user.userId,
        amount: amount,
      }),
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.error || t("dashboard.walletChargeError")
          );
        }

        return data;
      })
      .then((data) => {
        const updatedUser = {
          ...user,
          wallet: data.newWallet,
        };

        setUser(updatedUser);

        localStorage.setItem(
          "user",
          JSON.stringify(updatedUser)
        );

        setChargeAmount("");

        setMessage(data.message);

        showAlert(
          t("dashboard.success"),
          t("dashboard.walletCharged"),
          "success"
        );
      })
      .catch((err) => {
        setMessage(`❌ ${err.message}`);
      });
  };

  // =========================================
  // CHECKOUT
  // =========================================

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      setMessage(
        `❌ ${t("dashboard.emptyCartCheckout")}`
      );

      return;
    }

    fetch(
      `http://localhost:8080/api/cart/checkout?userId=${user.userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          discountCode: discountCode,
        }),
      }
    )
      .then(async (res) => {
        const data = await res.json();

        console.log("checkout status:", res.status);
        console.log("checkout response:", data);

        if (!res.ok) {
          throw new Error(
            data.message || t("dashboard.checkoutFailed")
          );
        }

        return data;
      })
      .then(() => {
        showAlert(
          t("dashboard.success"),
          t("dashboard.checkoutSuccess"),
          "success"
        );

        setDiscountCode("");
        setDiscountAmount(0);
        setDiscountApplied(false);

        fetchDashboardData();
      })
      .catch((err) => {
        if (err.message === "INSUFFICIENT_WALLET") {
          showAlert(
            t("dashboard.error"),
            t("dashboard.insufficientWallet"),
            "error"
          );
        } else {
          showAlert(
            t("dashboard.error"),
            err.message,
            "error"
          );
        }
      });
  };

  // =========================================
  // APPLY DISCOUNT
  // =========================================

  const handleApplyDiscount = () => {
    if (!discountCode.trim()) {
      showAlert(
        t("dashboard.error"),
        t("dashboard.enterDiscountCode"),
        "error"
      );

      return;
    }

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
              showAlert(
                t("dashboard.error"),
                t("dashboard.discountExpired"),
                "error"
              );
              return;

            case "DISCOUNT_NOT_STARTED":
              showAlert(
                t("dashboard.error"),
                t("dashboard.discountNotStarted"),
                "error"
              );
              return;

            case "MINIMUM_PRICE":
              showAlert(
                t("dashboard.error"),
                t("dashboard.minimumPriceError"),
                "error"
              );
              return;

            case "DISCOUNT_ALREADY_USED":
              showAlert(
                t("dashboard.error"),
                t("dashboard.discountAlreadyUsed"),
                "error"
              );
              return;

            case "DISCOUNT_ALREADY_APPLIED":
              showAlert(
                t("dashboard.error"),
                t("dashboard.discountAlreadyApplied"),
                "error"
              );
              return;

            case "DISCOUNT_NOT_FOR_THIS_CUSTOMER":
              showAlert(
                t("dashboard.error"),
                t("dashboard.discountNotForCustomer"),
                "error"
              );
              return;

            case "DISCOUNT_INACTIVE":
              showAlert(
                t("dashboard.error"),
                t("dashboard.discountInactive"),
                "error"
              );
              return;

            case "USAGE_LIMIT_REACHED":
              showAlert(
                t("dashboard.error"),
                t("dashboard.usageLimitReached"),
                "error"
              );
              return;

            case "CATEGORY_NOT_ALLOWED":
              showAlert(
                t("dashboard.error"),
                t("dashboard.categoryNotAllowed"),
                "error"
              );
              return;

            case "PRODUCT_NOT_ALLOWED":
              showAlert(
                t("dashboard.error"),
                t("dashboard.productNotAllowed"),
                "error"
              );
              return;

            case "PURCHASE_LIMIT_REACHED":
              showAlert(
                t("dashboard.error"),
                t("dashboard.purchaseLimitReached"),
                "error"
              );
              return;

            case "SELLER_NOT_ALLOWED":
              showAlert(
                t("dashboard.error"),
                t("dashboard.sellerNotAllowed"),
                "error"
              );
              return;

            case "INVALID_DISCOUNT":
              showAlert(
                t("dashboard.error"),
                t("dashboard.invalidDiscount"),
                "error"
              );
              return;

            default:
              showAlert(
                t("dashboard.error"),
                t("dashboard.unknownError"),
                "error"
              );
              return;
          }
        }

        setTotalCartPrice(data.newPrice);
        setDiscountAmount(data.discountAmount);
        setDiscountApplied(true);

        showAlert(
          t("dashboard.success"),
          t("dashboard.discountApplied", {
            amount: data.discountAmount.toLocaleString(),
            price: data.newPrice.toLocaleString(),
          }),
          "success"
        );
      })
      .catch((err) => {
        console.error("Discount Apply Error:", err);

        showAlert(
          t("dashboard.error"),
          t("dashboard.discountApplyFailed"),
          "error"
        );
      });
  };

  // =========================================
  // REMOVE DISCOUNT
  // =========================================

  const handleRemoveDiscount = () => {
    fetch("http://localhost:8080/api/discount/remove", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({
        userId: user.userId,
      }),
    })
      .then(async (res) => {
        const data = await res.json();

        console.log(
          "remove discount response:",
          data
        );

        if (!res.ok) {
          throw new Error(data.message);
        }

        return data;
      })
      .then(() => {
        setDiscountCode("");
        setDiscountAmount(0);
        setDiscountApplied(false);

        showAlert(
          t("dashboard.success"),
          t("dashboard.discountRemoved"),
          "success"
        );

        fetchDashboardData();
      })
      .catch((err) => {
        if (err.message === "NO_DISCOUNT_APPLIED") {
          showAlert(
            t("dashboard.error"),
            t("dashboard.noDiscountApplied"),
            "error"
          );
        } else {
          showAlert(
            t("dashboard.error"),
            t("dashboard.removeDiscountFailed"),
            "error"
          );
        }
      });
  };

  // =========================================
  // REMOVE CART ITEM
  // =========================================

  const handleRemove = (itemId) => {
    fetch("http://localhost:8080/api/cart/remove", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.userId,
        itemId: itemId,
      }),
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error);
        }

        return data;
      })
      .then(() => {
        fetchDashboardData();
      })
      .catch((err) => {
        showAlert(
          t("dashboard.error"),
          err.message,
          "error"
        );
      });
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading && user) {
    return (
      <div
        className="dashboard-loading"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <h3>
          ⏳ {t("dashboard.loading")}
        </h3>
      </div>
    );
  }

  // =========================================
  // RENDER
  // =========================================

  return (
    <div
      className="dashboard-container"
      dir={isRTL ? "rtl" : "ltr"}
    >

      {/* ================= MESSAGE ================= */}

      {message && (
        <div
          className={`dashboard-message ${
            message.startsWith("❌")
              ? "error-msg"
              : "success-msg"
          }`}
        >
          {message}
        </div>
      )}

      {/* ================= WALLET ================= */}

      <div className="dashboard-card discount-list-card">

        <h3 className="card-title">
          💳 {t("dashboard.wallet")}
        </h3>

        <p className="wallet-status">
          {t("dashboard.currentBalance")}{" "}

          <strong>
            {user?.wallet?.toLocaleString()}{" "}
            {t("product.currency")}
          </strong>
        </p>

        <form
          onSubmit={handleChargeWallet}
          className="charge-form"
        >

          <input
            type="number"
            placeholder={t(
              "dashboard.chargePlaceholder"
            )}
            value={chargeAmount}
            onChange={(e) =>
              setChargeAmount(e.target.value)
            }
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


      {/* ================= DISCOUNTS ================= */}

      <div className="dashboard-card">

        <div className="discounts-container">

          <h3 className="discounts-title">
            🎁 {t("dashboard.discounts")}
          </h3>

          {discountCodes.length === 0 ? (

            <p className="empty-discount">
              {t("dashboard.noDiscounts")}
            </p>

          ) : (

            <div className="discount-card-list">

              {discountCodes.map((discount) => (

                <div
                  className="discount-card"
                  key={discount.code}
                >

                  <div className="discount-card-header">

                    <h4>
                      {discount.code}
                    </h4>

                    <button
                      className="copy-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          discount.code
                        );

                        showAlert(
                          t("dashboard.success"),
                          t("dashboard.discountCopied"),
                          "success"
                        );
                      }}
                    >
                      📋 {t("dashboard.copy")}
                    </button>

                  </div>

                  <div className="discount-card-body">

                    <p>
                      <strong>
                        {t("dashboard.type")}
                      </strong>{" "}

                      {discount.discountType === "PERCENT"
                        ? t("dashboard.percent")
                        : t("dashboard.fixed")}
                    </p>

                    <p>
                      <strong>
                        {t("dashboard.value")}
                      </strong>{" "}

                      {discount.discountType === "PERCENT"
                        ? `${discount.value}%`
                        : `${discount.value.toLocaleString()} ${t(
                            "product.currency"
                          )}`}
                    </p>

                    <p>
                      <strong>
                        {t("dashboard.minimumPurchase")}
                      </strong>{" "}

                      {discount.minimumPrice.toLocaleString()}{" "}
                      {t("product.currency")}
                    </p>

                    <p>
                      <strong>
                        {t("dashboard.maximumDiscount")}
                      </strong>{" "}

                      {discount.maxDiscount > 0
                        ? `${discount.maxDiscount.toLocaleString()} ${t(
                            "product.currency"
                          )}`
                        : t("dashboard.none")}
                    </p>

                    <p>
                      <strong>
                        {t("dashboard.validity")}
                      </strong>{" "}

                      {discount.startDate}{" "}
                      {isRTL ? "تا" : "to"}{" "}
                      {discount.endDate}
                    </p>

                    {discount.category && (
  <p>
    <strong>
      {t("dashboard.category")}
    </strong>{" "}

    {discount.category === "ALL"
      ? t("dashboard.allCategories")
      : discount.category === "BASE"
      ? t("dashboard.baseCategory")
      : discount.category === "LAPTOP"
      ? t("dashboard.laptopCategory")
      : discount.category === "MOBILE"
      ? t("dashboard.mobileCategory")
      : discount.category}
  </p>
)}

                    <p>
                      <strong>
                        {t("dashboard.product")}
                      </strong>{" "}

                      {discount.productName ||
                        t("dashboard.allProducts")}
                    </p>

                    <p>
                      <strong>
                        {t("dashboard.sellerOnly")}
                      </strong>{" "}

                      {discount.sellerName ||
                        t("dashboard.allSellers")}
                    </p>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>


      {/* ================= CART ================= */}

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

                    <th>
                      {t("dashboard.product")}
                    </th>

                    <th>
                      {t("dashboard.unitPrice")}
                    </th>

                    <th>
                      {t("dashboard.quantity")}
                    </th>

                    <th>
                      {t("dashboard.totalPrice")}
                    </th>

                    <th></th>

                  </tr>

                </thead>

                <tbody>

                  {cartItems.map((item) => (

                    <tr key={item.itemId}>

                      <td>
                        {item.name} - {item.color}
                      </td>

                      <td>
                        {item.price.toLocaleString()}{" "}
                        {t("product.currency")}
                      </td>

                      <td>
                        {item.quantity}{" "}
                        {t("product.items")}
                      </td>

                      <td>
                        {(
                          item.price *
                          item.quantity
                        ).toLocaleString()}{" "}
                        {t("product.currency")}
                      </td>

                      <td>

                        <button
                          className="btn btn-primary"
                          onClick={() =>
                            handleRemove(
                              item.itemId
                            )
                          }
                        >
                          🗑 {t("dashboard.remove")}
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>


            {/* ================= DISCOUNT INPUT ================= */}

            <div className="discount-section">

              <input
                type="text"
                placeholder={t(
                  "dashboard.discountPlaceholder"
                )}
                value={discountCode}
                onChange={(e) =>
                  setDiscountCode(e.target.value)
                }
                className="dashboard-input"
              />

              <button
                onClick={handleApplyDiscount}
                className="btn btn-info"
                disabled={discountApplied}
              >
                {t("dashboard.applyDiscount")}
              </button>

              {discountCode && (
                <button
                  onClick={handleRemoveDiscount}
                  className="btn btn-danger"
                >
                  ❌ {t("dashboard.removeDiscount")}
                </button>
              )}

            </div>


            {/* ================= CHECKOUT ================= */}

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

              <p>

                <span>
                  {t("dashboard.discountAmount")}{" "}
                </span>

                {discountAmount
                  ? `${Number(
                      discountAmount
                    ).toLocaleString()} ${t(
                      "product.currency"
                    )}`
                  : `0 ${t("product.currency")}`}

              </p>

            </div>

          </div>

        )}

      </div>


      {/* ================= PURCHASE HISTORY ================= */}

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

                  <th>
                    {t("dashboard.invoice")}
                  </th>

                  <th>
                    {t("dashboard.date")}
                  </th>

                  <th>
                    {t("dashboard.amount")}
                  </th>

                  <th>
                    {t("dashboard.status")}
                  </th>

                  <th>
                    {t("dashboard.discountAmount")}
                  </th>

                </tr>

              </thead>

              <tbody>

                {purchaseHistory.map((history) => (

                  <tr key={history.purchaseId}>

                    <td>
                      {history.purchaseId}
                    </td>

                    <td>
                      {history.date}
                    </td>

                    <td>
                      {history.total.toLocaleString()}{" "}
                      {t("product.currency")}
                    </td>

                    <td className="status-success">
                      {history.status}
                    </td>

                    <td>

                      {history.discountAmount > 0
                        ? `${history.discountAmount.toLocaleString()} ${t(
                            "product.currency"
                          )}`
                        : t(
                            "dashboard.withoutDiscount"
                          )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* ================= ALERT ================= */}

      <AlertModal
        {...alert}
        onClose={closeAlert}
      />

    </div>
  );
}

export default Dashboard;