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
    const [active, setActive] = useState(true);
    const [editingDiscount, setEditingDiscount] = useState(null);
    const [discounts, setDiscounts] = useState([]);

    const { alert, showAlert, closeAlert } = useAlert();

    const loadDiscounts = () => {

        fetch(`http://localhost:8080/api/seller-discounts?sellerName=${user.username}`)
            .then(res => res.json())
            .then(data => setDiscounts(data));

    };

    useEffect(() => {
        if (!user) return;
        loadDiscounts();
    }, [user]);

    const createDiscount = () => {

        fetch("http://localhost:8080/api/discount", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                code,
                discountType,
                value: Number(value),
                minimumPrice: Number(minimumPrice),
                active,
                sellerName: user?.username
            })
        })
            .then(res => res.json())
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
                setActive(true);

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
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                code,
                discountType,
                value: Number(value),
                minimumPrice: Number(minimumPrice),
                active,
                sellerName: user.username
            })

        })

            .then(res => res.json())

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
                setActive(true);

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
                method: "DELETE"
            }
        )

            .then(res => res.json())

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
    return (
      <div className="discount-page">
  
          <div className="discount-form-card">
  
              <h2 className="discount-title">
                  🎁 {t("discount.title")}
              </h2>
  
              <label>{t("discount.code")}</label>
  
              <input
                  className="discount-input"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
              />
  
              <label>{t("discount.type")}</label>
  
              <select
                  className="discount-input"
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
              >
                  <option value="PERCENT">
                      {t("discount.percent")}
                  </option>
  
                  <option value="FIXED">
                      {t("discount.fixed")}
                  </option>
  
              </select>
  
              <label>{t("discount.value")}</label>
  
              <input
                  className="discount-input"
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
              />
  
              <label>{t("discount.minimumPrice")}</label>
  
              <input
                  className="discount-input"
                  type="number"
                  value={minimumPrice}
                  onChange={(e) => setMinimumPrice(e.target.value)}
              />
  
              <label className="discount-check">
  
                  <input
                      type="checkbox"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                  />
  
                  {t("discount.active")}
  
              </label>
  
              <button
                  className="discount-submit-btn"
                  onClick={editingDiscount ? updateDiscount : createDiscount}
              >
                  {editingDiscount
                      ? `💾 ${t("discount.save")}`
                      : `➕ ${t("discount.create")}`}
              </button>
  
          </div>
  
          <div className="discount-list">
  
              <h3 className="discount-list-title">
                  🎟 {t("discount.myDiscounts")}
              </h3>
  
              {discounts.length === 0 ? (
  
                  <p className="discount-empty">
                      {t("discount.empty")}
                  </p>
  
              ) : (
  
                  <table className="discount-table">
  
                      <thead>
  
                          <tr>
                              <th>{t("discount.table.code")}</th>
                              <th>{t("discount.table.type")}</th>
                              <th>{t("discount.table.value")}</th>
                              <th>{t("discount.table.minimum")}</th>
                              <th>{t("discount.table.status")}</th>
                              <th>{t("discount.table.edit")}</th>
                              <th>{t("discount.table.delete")}</th>
                          </tr>
  
                      </thead>
  
                      <tbody>
  
                          {discounts.map((discount) => (
  
                              <tr key={discount.code}>
  
                                  <td>{discount.code}</td>
  
                                  <td>
                                      {discount.discountType === "PERCENT"
                                          ? t("discount.percent")
                                          : t("discount.fixed")}
                                  </td>
  
                                  <td>
                                      {discount.discountType === "PERCENT"
                                          ? `${discount.value}%`
                                          : `${discount.value.toLocaleString()} ${t("product.currency")}`}
                                  </td>
  
                                  <td>
                                      {discount.minimumPrice.toLocaleString()} {t("product.currency")}
                                  </td>
  
                                  <td>
                                      {discount.active
                                          ? `🟢 ${t("discount.enabled")}`
                                          : `🔴 ${t("discount.disabled")}`}
                                  </td>
  
                                  <td>
  
                                      <button
                                          className="btn btn-primary"
                                          onClick={() => {
  
                                              setEditingDiscount(discount);
  
                                              setCode(discount.code);
                                              setDiscountType(discount.discountType);
                                              setValue(discount.value);
                                              setMinimumPrice(discount.minimumPrice);
                                              setActive(discount.active);
  
                                          }}
                                      >
                                          {t("discount.edit")}
                                      </button>
  
                                  </td>
  
                                  <td>
  
                                      <button
                                          className="btn btn-danger"
                                          onClick={() => deleteDiscount(discount.code)}
                                      >
                                          {t("discount.delete")}
                                      </button>
  
                                  </td>
  
                              </tr>
  
                          ))}
  
                      </tbody>
  
                  </table>
  
              )}
  
          </div>
  
          <AlertModal
              {...alert}
              onClose={closeAlert}
          />
  
      </div>
  );
  
  }
  
  export default Discount;