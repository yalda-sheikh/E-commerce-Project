
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "./Discount.css";
import useAlert from "../components/useAlert";
import AlertModal from "../components/AlertModal";

function Discount({ user }) {
    const { t } = useTranslation();

    const [code, setCode] = useState("");
    const [discountType, setDiscountType] = useState("PERCENT");
    const [value, setValue] = useState("");
    const [minimumPrice, setMinimumPrice] = useState("");
    const [editingDiscount, setEditingDiscount] = useState(null);
    const [discounts, setDiscounts] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [maxDiscount, setMaxDiscount] = useState("");
    const [usageLimit, setUsageLimit] = useState("");
    const [category, setCategory] = useState("BASE");
    const [productId, setProductId] = useState("");
    const [sellerOnly, setSellerOnly] = useState(false);
    const [customerId, setCustomerId] = useState("");
    const [maxPurchaseCount, setMaxPurchaseCount] =  useState(null)

    const { alert, showAlert, closeAlert } = useAlert();

    const loadDiscounts = () => {
        fetch(
            `http://localhost:8080/api/seller-discounts?sellerName=${user.username}`
        )
            .then((res) => res.json())
            .then((data) => setDiscounts(data));
    };

    useEffect(() => {
        if (!user) return;
        loadDiscounts();
    }, [user]);

    const createDiscount = () => {
        console.log("Before fetch:", usageLimit);

        fetch("http://localhost:8080/api/discount", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                code,
                discountType,
                value: Number(value),
                minimumPrice: Number(minimumPrice),
                sellerName: user?.username,
                startDate,
                endDate,
                usageLimit: Number(usageLimit),
                maxDiscount: Number(maxDiscount),
                category,
                productId: productId ? Number(productId) : null,
                sellerOnly,
                customerId : customerId ? Number(customerId) : null,
                maxPurchaseCount : maxPurchaseCount ? Number(maxPurchaseCount) : null,
            }),
        })
            .then((res) => res.json())
            .then(() => {
                showAlert(
                    t("common.success"),
                    t("discount.createSuccess"),
                    "success"
                );

                loadDiscounts();

                setCode("");
                setDiscountType("PERCENT");
                setValue("");
                setMinimumPrice("");
                setEndDate("");
                setStartDate("");
                setMaxDiscount("");
                setUsageLimit("");
                setCategory("BASE");
                setProductId("");
                setSellerOnly(false);
                setCustomerId("")
            })
            .catch(() => {
                showAlert(
                    t("common.failed"),
                    t("discount.createError"),
                    "error"
                );
            });
    };

    const updateDiscount = () => {
        fetch("http://localhost:8080/api/seller-discounts", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                code,
                discountType,
                value: Number(value),
                minimumPrice: Number(minimumPrice),
                sellerName: user.username,
                startDate,
                endDate,
                usageLimit: Number(usageLimit),
                maxDiscount: Number(maxDiscount),
                category,
                productId: productId ? Number(productId) : null,
                sellerOnly,
                customerId: customerId ? Number(customerId) : null,
            }),
        })
            .then((res) => res.json())
            .then(() => {
                showAlert(
                    t("common.success"),
                    t("discount.updateSuccess"),
                    "success"
                );

                loadDiscounts();

                setEditingDiscount(null);

                setCode("");
                setDiscountType("PERCENT");
                setValue("");
                setMinimumPrice("");
                setEndDate("");
                setStartDate("");
                setMaxDiscount("");
                setUsageLimit("");
                setCategory("BASE");
                setProductId("");
                setSellerOnly(false);
                setCustomerId("")
            })
            .catch(() => {
                showAlert(
                    t("common.failed"),
                    t("discount.updateError"),
                    "error"
                );
            });
    };

    const deleteDiscount = (code) => {
        fetch(
            `http://localhost:8080/api/seller-discounts?code=${code}&sellerName=${user.username}`,
            {
                method: "DELETE",
            }
        )
            .then((res) => res.json())
            .then(() => {
                showAlert(
                    t("common.success"),
                    t("discount.deleteSuccess"),
                    "success"
                );

                loadDiscounts();
            })
            .catch(() => {
                showAlert(
                    t("common.failed"),
                    t("discount.deleteError"),
                    "error"
                );
            });
    };

    const startEditing = (discount) => {
        setEditingDiscount(discount);

        setCode(discount.code);
        setDiscountType(discount.discountType);
        setValue(discount.value);
        setMinimumPrice(discount.minimumPrice);
        setStartDate(discount.startDate || "");
        setEndDate(discount.endDate || "");
        setMaxDiscount(discount.maxDiscount || "");
        setUsageLimit(discount.usageLimit || "");
        setCategory(discount.category || "BASE");
        setProductId(discount.productId || "");
        setSellerOnly(discount.sellerOnly || false);
        setCustomerId(discount.customerId || "");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <div className="discount-page">

            {/* =========================
                FORM
            ========================= */}

            <section className="discount-form-card">

                <div className="discount-form-heading">
                    <div className="discount-heading-icon">
                        🎁
                    </div>

                    <div>
                        <h2 className="discount-title">
                            {t("discount.title")}
                        </h2>

                        <p className="discount-subtitle">
                            مدیریت و ایجاد کدهای تخفیف فروشگاه
                        </p>
                    </div>
                </div>

                <div className="discount-form-grid">

                    {/* Code */}

                    <div className="discount-field">
                        <label>{t("discount.code")}</label>

                        <input
                            className="discount-input"
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />
                    </div>

                    {/* Type */}

                    <div className="discount-field">
                        <label>{t("discount.type")}</label>

                        <select
                            className="discount-input"
                            value={discountType}
                            onChange={(e) =>
                                setDiscountType(e.target.value)
                            }
                        >
                            <option value="PERCENT">
                                {t("discount.percent")}
                            </option>

                            <option value="FIXED">
                                {t("discount.fixed")}
                            </option>
                        </select>
                    </div>

                    {/* Value */}

                    <div className="discount-field">
                        <label>{t("discount.value")}</label>

                        <input
                            className="discount-input"
                            type="number"
                            value={value}
                            onChange={(e) =>
                                setValue(e.target.value)
                            }
                        />
                    </div>

                    {/* Minimum */}

                    <div className="discount-field">
                        <label>{t("discount.minimumPrice")}</label>

                        <input
                            className="discount-input"
                            type="number"
                            value={minimumPrice}
                            onChange={(e) =>
                                setMinimumPrice(e.target.value)
                            }
                        />
                    </div>

                    {/* Start Date */}

                    <div className="discount-field">
                        <label>تاریخ شروع</label>

                        <input
                            className="discount-input"
                            type="date"
                            value={startDate}
                            onChange={(e) =>
                                setStartDate(e.target.value)
                            }
                        />
                    </div>

                    {/* End Date */}

                    <div className="discount-field">
                        <label>تاریخ پایان</label>

                        <input
                            className="discount-input"
                            type="date"
                            value={endDate}
                            onChange={(e) =>
                                setEndDate(e.target.value)
                            }
                        />
                    </div>

                    {/* Max Discount */}

                    <div className="discount-field">
                        <label>سقف مبلغ</label>

                        <input
                            className="discount-input"
                            type="number"
                            value={maxDiscount}
                            onChange={(e) =>
                                setMaxDiscount(e.target.value)
                            }
                        />
                    </div>

                    {/* Usage Limit */}

                    <div className="discount-field">
                        <label>محدودیت تعداد استفاده</label>

                        <input
                            className="discount-input"
                            type="number"
                            value={usageLimit}
                            onChange={(e) =>
                                setUsageLimit(e.target.value)
                            }
                        />
                    </div>

                    {/* Category */}

                    <div className="discount-field">
                        <label>دسته بندی</label>

                        <select
                            className="discount-input"
                            value={category}
                            onChange={(e) =>
                                setCategory(e.target.value)
                            }
                        >
                            <option value="BASE">
                                همه محصولات
                            </option>

                            <option value="LAPTOP">
                                لپ تاپ
                            </option>

                            <option value="MOBILE">
                                موبایل
                            </option>
                        </select>
                    </div>

                    {/* Product */}

                    <div className="discount-field">
                        <label>آیدی محصول خاص</label>

                        <input
                            className="discount-input"
                            type="number"
                            value={productId}
                            onChange={(e) =>
                                setProductId(e.target.value)
                            }
                        />
                    </div>

                </div>
                <label>محدودیت خرید مشتری</label>

<select
  value={maxPurchaseCount ?? ""}
  onChange={(e) =>
    setMaxPurchaseCount(
      e.target.value === "" ? null : Number(e.target.value)
    )
  }
>
  <option value="">بدون محدودیت</option>
  <option value="1">فقط خرید اول</option>
  <option value="3">۳ خرید اول</option>
  <option value="5">۵ خرید اول</option>
</select>

                {/* Seller Only */}
                <div className="discount-field">
                        <label>آیدی کاربر خاص</label>

                        <input
                            className="discount-input"
                            type="number"
                            value={customerId}
                            onChange={(e) =>
                                setCustomerId(e.target.value)
                            }
                        />
                    </div>
                <label className="discount-check">
                    <input
                        type="checkbox"
                        checked={sellerOnly}
                        onChange={(e) =>
                            setSellerOnly(e.target.checked)
                        }
                    />

                    <span>
                        فقط این فروشنده
                    </span>
                </label>

                {/* Submit */}

                <button
                    className={`discount-submit-btn ${
                        editingDiscount
                            ? "editing-mode"
                            : ""
                    }`}
                    onClick={
                        editingDiscount
                            ? updateDiscount
                            : createDiscount
                    }
                >
                    {editingDiscount
                        ? `💾 ${t("discount.save")}`
                        : `➕ ${t("discount.create")}`}
                </button>

            </section>


            {/* =========================
                DISCOUNT LIST
            ========================= */}

            <section className="discount-list">

                <div className="discount-list-heading">

                    <div className="discount-list-icon">
                        🎟️
                    </div>

                    <div>
                        <h3 className="discount-list-title">
                            {t("discount.myDiscounts")}
                        </h3>

                        <p className="discount-list-subtitle">
                            کدهای تخفیف ایجاد شده توسط شما
                        </p>
                    </div>

                    <span className="discount-count">
                        {discounts.length}
                    </span>

                </div>


                {discounts.length === 0 ? (

                    <div className="discount-empty">
                        <div className="discount-empty-icon">
                            🎟️
                        </div>

                        <p>
                            {t("discount.empty")}
                        </p>
                    </div>

                ) : (

                    <>

                        {/* Desktop */}

                        <div className="discount-table-wrapper">

                            <table className="discount-table">

                                <thead>
                                    <tr>

                                        <th>
                                            {t("discount.table.code")}
                                        </th>

                                        <th>
                                            {t("discount.table.type")}
                                        </th>

                                        <th>
                                            {t("discount.table.value")}
                                        </th>

                                        <th>
                                            {t("discount.table.minimum")}
                                        </th>

                                        <th>
                                            تاریخ شروع
                                        </th>

                                        <th>
                                            تاریخ پایان
                                        </th>

                                        <th>
                                            سقف مبلغ
                                        </th>

                                        <th>
                                            محدودیت استفاده
                                        </th>

                                        <th>
                                            دسته بندی خاص
                                        </th>

                                        <th>
                                            محصول خاص
                                        </th>

                                        <th>
                                            فروشنده
                                        </th>
                                        <th>
                                         آیدی کابر خاص
                                        </th>

                                        <th>
                                            
                                        </th>

                                        <th>
                                            
                                        </th>

                                    </tr>
                                </thead>

                                <tbody>

                                    {discounts.map((discount) => (

                                        <tr key={discount.code}>

                                            <td data-label="کد">
                                                <span className="discount-code-badge">
                                                    {discount.code}
                                                </span>
                                            </td>

                                            <td data-label="نوع">
                                                {discount.discountType === "PERCENT"
                                                    ? t("discount.percent")
                                                    : t("discount.fixed")}
                                            </td>

                                            <td data-label="مقدار">
                                                <strong className="discount-value">
                                                    {discount.discountType === "PERCENT"
                                                        ? `${discount.value}%`
                                                        : `${discount.value.toLocaleString()} ${t("product.currency")}`}
                                                </strong>
                                            </td>

                                            <td data-label="حداقل خرید">
                                                {discount.minimumPrice
                                                    ? discount.minimumPrice.toLocaleString()
                                                    : 0}
                                            </td>

                                            <td data-label="شروع">
                                                {discount.startDate || "-"}
                                            </td>

                                            <td data-label="پایان">
                                                {discount.endDate || "-"}
                                            </td>

                                            <td data-label="سقف">
                                                {discount.maxDiscount
                                                    ? `${discount.maxDiscount.toLocaleString()} ${t("product.currency")}`
                                                    : "-"}
                                            </td>

                                            <td data-label="محدودیت">
                                                {discount.usageLimit || "-"}
                                            </td>

                                            <td data-label="دسته‌بندی">
                                                {discount.category || "-"}
                                            </td>

                                            <td data-label="محصول">
                                                {discount.productId || "-"}
                                            </td>

                                            <td data-label="فروشنده">
                                                <span
                                                    className={
                                                        discount.sellerOnly
                                                            ? "seller-status yes"
                                                            : "seller-status no"
                                                    }
                                                >
                                                    {discount.sellerOnly
                                                        ? "بله"
                                                        : "خیر"}
                                                </span>
                                            </td>
                                            <td data-label= "کاربر">
                                            {discount.customerId || "-"}

                                            </td>

                                            <td data-label="ویرایش">

                                                <button
                                                    className="btn btn-primary discount-edit-btn"
                                                    onClick={() =>
                                                        startEditing(discount)
                                                    }
                                                >
                                                    ✏️ {t("discount.edit")}
                                                </button>

                                            </td>

                                            <td data-label="حذف">

                                                <button
                                                    className="btn btn-danger discount-delete-btn"
                                                    onClick={() =>
                                                        deleteDiscount(
                                                            discount.code
                                                        )
                                                    }
                                                >
                                                    🗑️ {t("discount.delete")}
                                                </button>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>


                        {/* Mobile */}

                        <div className="discount-mobile-list">

                            {discounts.map((discount) => (

                                <article
                                    className="discount-mobile-card"
                                    key={`mobile-${discount.code}`}
                                >

                                    <div className="mobile-discount-header">

                                        <span className="discount-code-badge">
                                            {discount.code}
                                        </span>

                                        <span
                                            className={
                                                discount.sellerOnly
                                                    ? "seller-status yes"
                                                    : "seller-status no"
                                            }
                                        >
                                            {discount.sellerOnly
                                                ? "✓ فقط فروشنده"
                                                : "همه فروشندگان"}
                                        </span>

                                    </div>

                                    <div className="mobile-discount-grid">

                                        <div>
                                            <span>نوع</span>
                                            <strong>
                                                {discount.discountType === "PERCENT"
                                                    ? t("discount.percent")
                                                    : t("discount.fixed")}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>مقدار</span>
                                            <strong className="discount-value">
                                                {discount.discountType === "PERCENT"
                                                    ? `${discount.value}%`
                                                    : `${discount.value.toLocaleString()} ${t("product.currency")}`}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>حداقل خرید</span>
                                            <strong>
                                                {discount.minimumPrice
                                                    ? discount.minimumPrice.toLocaleString()
                                                    : 0}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>سقف مبلغ</span>
                                            <strong>
                                                {discount.maxDiscount
                                                    ? `${discount.maxDiscount.toLocaleString()} ${t("product.currency")}`
                                                    : "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>محدودیت استفاده</span>
                                            <strong>
                                                {discount.usageLimit || "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>دسته‌بندی</span>
                                            <strong>
                                                {discount.category || "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>محصول خاص</span>
                                            <strong>
                                                {discount.productId || "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>تاریخ شروع</span>
                                            <strong>
                                                {discount.startDate || "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>تاریخ پایان</span>
                                            <strong>
                                                {discount.endDate || "-"}
                                            </strong>
                                        </div>
                                        <div>
                                            <span>کاربر خاص</span>
                                            <strong>
                                                {discount.customerId || "-"}
                                            </strong>
                                        </div>

                                    </div>

                                    <div className="mobile-discount-actions">

                                        <button
                                            className="btn btn-primary discount-edit-btn"
                                            onClick={() =>
                                                startEditing(discount)
                                            }
                                        >
                                            ✏️ {t("discount.edit")}
                                        </button>

                                        <button
                                            className="btn btn-danger discount-delete-btn"
                                            onClick={() =>
                                                deleteDiscount(
                                                    discount.code
                                                )
                                            }
                                        >
                                            🗑️ {t("discount.delete")}
                                        </button>

                                    </div>

                                </article>

                            ))}

                        </div>

                    </>

                )}

            </section>


            <AlertModal
                {...alert}
                onClose={closeAlert}
            />

        </div>
    );
}

export default Discount;

