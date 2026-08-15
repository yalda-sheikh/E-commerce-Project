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
    const [maxPurchaseCount, setMaxPurchaseCount] = useState(null);

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
                customerId: customerId ? Number(customerId) : null,
                maxPurchaseCount: maxPurchaseCount
                    ? Number(maxPurchaseCount)
                    : null,
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
                setCustomerId("");
                setMaxPurchaseCount(null);
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
                maxPurchaseCount: maxPurchaseCount
                    ? Number(maxPurchaseCount)
                    : null,
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
                setCustomerId("");
                setMaxPurchaseCount(null);
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
        setMaxPurchaseCount(discount.maxPurchaseCount || null);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const getCategoryLabel = (category) => {
        switch (category) {
            case "LAPTOP":
                return t("discount.laptop");

            case "MOBILE":
                return t("discount.mobile");

            case "BASE":
                return t("discount.allProducts");

            default:
                return category || "-";
        }
    };

    return (
        <div className="discount-page">

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
                            {t("discount.subtitle")}
                        </p>
                    </div>
                </div>

                <div className="discount-form-grid">

                    <div className="discount-field">
                        <label>{t("discount.code")}</label>

                        <input
                            className="discount-input"
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />
                    </div>

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

                    <div className="discount-field">
                        <label>{t("discount.startDate")}</label>

                        <input
                            className="discount-input"
                            type="date"
                            value={startDate}
                            onChange={(e) =>
                                setStartDate(e.target.value)
                            }
                        />
                    </div>

                    <div className="discount-field">
                        <label>{t("discount.endDate")}</label>

                        <input
                            className="discount-input"
                            type="date"
                            value={endDate}
                            onChange={(e) =>
                                setEndDate(e.target.value)
                            }
                        />
                    </div>

                    <div className="discount-field">
                        <label>{t("discount.maxDiscount")}</label>

                        <input
                            className="discount-input"
                            type="number"
                            value={maxDiscount}
                            onChange={(e) =>
                                setMaxDiscount(e.target.value)
                            }
                        />
                    </div>

                    <div className="discount-field">
                        <label>{t("discount.usageLimit")}</label>

                        <input
                            className="discount-input"
                            type="number"
                            value={usageLimit}
                            onChange={(e) =>
                                setUsageLimit(e.target.value)
                            }
                        />
                    </div>

                    <div className="discount-field">
                        <label>{t("discount.category")}</label>

                        <select
                            className="discount-input"
                            value={category}
                            onChange={(e) =>
                                setCategory(e.target.value)
                            }
                        >
                            <option value="BASE">
                                {t("discount.allProducts")}
                            </option>

                            <option value="LAPTOP">
                                {t("discount.laptop")}
                            </option>

                            <option value="MOBILE">
                                {t("discount.mobile")}
                            </option>
                        </select>
                    </div>

                    <div className="discount-field">
                        <label>{t("discount.productId")}</label>

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

                <div className="discount-field purchase-limit-field">

                    <label>{t("discount.purchaseLimit")}</label>

                    <select
                        className="discount-input"
                        value={maxPurchaseCount ?? ""}
                        onChange={(e) =>
                            setMaxPurchaseCount(
                                e.target.value === ""
                                    ? null
                                    : Number(e.target.value)
                            )
                        }
                    >
                        <option value="">
                            {t("discount.noLimit")}
                        </option>

                        <option value="1">
                            {t("discount.firstPurchase")}
                        </option>

                        <option value="3">
                            {t("discount.firstThreePurchases")}
                        </option>

                        <option value="5">
                            {t("discount.firstFivePurchases")}
                        </option>
                    </select>

                </div>

                <div className="discount-field">

                    <label>{t("discount.customerId")}</label>

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
                        {t("discount.sellerOnly")}
                    </span>

                </label>

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
                            {t("discount.listSubtitle")}
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
                                            {t("discount.table.startDate")}
                                        </th>

                                        <th>
                                            {t("discount.table.endDate")}
                                        </th>

                                        <th>
                                            {t("discount.table.maxDiscount")}
                                        </th>

                                        <th>
                                            {t("discount.table.usageLimit")}
                                        </th>

                                        <th>
                                            {t("discount.table.category")}
                                        </th>

                                        <th>
                                            {t("discount.table.product")}
                                        </th>

                                        <th>
                                            {t("discount.table.seller")}
                                        </th>

                                        <th>
                                            {t("discount.table.customer")}
                                        </th>

                                        <th>
                                            {t("discount.table.purchaseLimit")}
                                        </th>

                                        <th></th>

                                        <th></th>

                                    </tr>
                                </thead>

                                <tbody>

                                    {discounts.map((discount) => (

                                        <tr key={discount.code}>

                                            <td data-label={t("discount.table.code")}>
                                                <span className="discount-code-badge">
                                                    {discount.code}
                                                </span>
                                            </td>

                                            <td data-label={t("discount.table.type")}>
                                                {discount.discountType === "PERCENT"
                                                    ? t("discount.percent")
                                                    : t("discount.fixed")}
                                            </td>

                                            <td data-label={t("discount.table.value")}>

                                                <strong className="discount-value">

                                                    {discount.discountType === "PERCENT"
                                                        ? `${discount.value}%`
                                                        : `${discount.value.toLocaleString()} ${t("product.currency")}`}

                                                </strong>

                                            </td>

                                            <td data-label={t("discount.table.minimum")}>

                                                {discount.minimumPrice
                                                    ? discount.minimumPrice.toLocaleString()
                                                    : 0}

                                            </td>

                                            <td data-label={t("discount.table.startDate")}>

                                                {discount.startDate || "-"}

                                            </td>

                                            <td data-label={t("discount.table.endDate")}>

                                                {discount.endDate || "-"}

                                            </td>

                                            <td data-label={t("discount.table.maxDiscount")}>

                                                {discount.maxDiscount
                                                    ? `${discount.maxDiscount.toLocaleString()} ${t("product.currency")}`
                                                    : "-"}

                                            </td>

                                            <td data-label={t("discount.table.usageLimit")}>

                                                {discount.usageLimit || "-"}

                                            </td>

                                            <td data-label={t("discount.table.category")}>

                                                {getCategoryLabel(discount.category)}

                                            </td>

                                            <td data-label={t("discount.table.product")}>

                                                {discount.productId || "-"}

                                            </td>

                                            <td data-label={t("discount.table.seller")}>

                                                <span
                                                    className={
                                                        discount.sellerOnly
                                                            ? "seller-status yes"
                                                            : "seller-status no"
                                                    }
                                                >

                                                    {discount.sellerOnly
                                                        ? t("common.yes")
                                                        : t("common.no")}

                                                </span>

                                            </td>

                                            <td data-label={t("discount.table.customer")}>

                                                {discount.customerId || "-"}

                                            </td>

                                            <td data-label={t("discount.table.purchaseLimit")}>

                                                {discount.maxPurchaseCount || "-"}

                                            </td>

                                            <td data-label={t("discount.edit")}>

                                                <button
                                                    className="btn btn-primary discount-edit-btn"
                                                    onClick={() =>
                                                        startEditing(discount)
                                                    }
                                                >
                                                    ✏️ {t("discount.edit")}
                                                </button>

                                            </td>

                                            <td data-label={t("discount.delete")}>

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
                                                ? `✓ ${t("discount.onlySeller")}`
                                                : t("discount.allSellers")}

                                        </span>

                                    </div>

                                    <div className="mobile-discount-grid">

                                        <div>
                                            <span>
                                                {t("discount.table.type")}
                                            </span>

                                            <strong>
                                                {discount.discountType === "PERCENT"
                                                    ? t("discount.percent")
                                                    : t("discount.fixed")}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                {t("discount.table.value")}
                                            </span>

                                            <strong className="discount-value">

                                                {discount.discountType === "PERCENT"
                                                    ? `${discount.value}%`
                                                    : `${discount.value.toLocaleString()} ${t("product.currency")}`}

                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                {t("discount.table.minimum")}
                                            </span>

                                            <strong>
                                                {discount.minimumPrice
                                                    ? discount.minimumPrice.toLocaleString()
                                                    : 0}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                {t("discount.table.maxDiscount")}
                                            </span>

                                            <strong>

                                                {discount.maxDiscount
                                                    ? `${discount.maxDiscount.toLocaleString()} ${t("product.currency")}`
                                                    : "-"}

                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                {t("discount.table.usageLimit")}
                                            </span>

                                            <strong>
                                                {discount.usageLimit || "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                {t("discount.table.category")}
                                            </span>

                                            <strong>
                                                {getCategoryLabel(discount.category)}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                {t("discount.table.product")}
                                            </span>

                                            <strong>
                                                {discount.productId || "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                {t("discount.table.startDate")}
                                            </span>

                                            <strong>
                                                {discount.startDate || "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                {t("discount.table.endDate")}
                                            </span>

                                            <strong>
                                                {discount.endDate || "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                {t("discount.table.customer")}
                                            </span>

                                            <strong>
                                                {discount.customerId || "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                {t("discount.table.purchaseLimit")}
                                            </span>

                                            <strong>
                                                {discount.maxPurchaseCount || "-"}
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