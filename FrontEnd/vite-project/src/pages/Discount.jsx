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
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [maxDiscount, setMaxDiscount] = useState("");
    const [usageLimit , setUsageLimit]= useState("");
    const [category , setCategory] = useState("BASE");
    const [productId , setProductId] = useState("");
    const [sellerOnly , setSellerOnly] = useState(false);
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
      console.log("Before fetch:", usageLimit);

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
                sellerName: user?.username,
                startDate,
                endDate,
                usageLimit : Number(usageLimit),
                maxDiscount: Number(maxDiscount),
                category,

                productId: productId 
                    ? Number(productId)
                    : null,
            
                sellerOnly

                
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
                setEndDate("");
                setStartDate("");
                setMaxDiscount("");
                setUsageLimit("");
setCategory("BASE");
setProductId("");
setSellerOnly(false);

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

              <label>


<input
              type="date"
  value={startDate}
  onChange={(e) => {setStartDate(e.target.value); console.log("start changed:", e.target.value)}}
  
/>
تاریخ شروع
              </label>
              <label>
                تاریخ پایان
              <input

type="date"
value={endDate}
onChange={(e) => {setEndDate(e.target.value) ; console.log("end changed:", e.target.value)}}
/>
              </label>
              <label>
                سقف مبلغ
                <input className="discount-input" type="number" value={maxDiscount} onChange={(e)=> { setMaxDiscount(e.target.value)}}/>

              </label>
              <label>
                محدودیت تعداد استفاده
                <input className="discount-input" type="number" value={usageLimit} onChange={(e) => {setUsageLimit(e.target.value)}}/>
              </label>
              <label>
                دسته بندی
                <select
                  className="discount-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
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
              </label>
              <label>
               آیدی محصول خاص 
                <input type="number" value={productId} onChange={(e) => setProductId(e.target.value)} />
                
              </label>
              <label>
                فقط این فروشنده
                <input  type="checkbox" checked={sellerOnly} onChange={(e) => setSellerOnly(e.target.checked)}/>
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
             
                              <th>تاریخ شروع</th>
                              <th>تاریخ پایان</th>
                              <th>سقف مبلغ</th>
                              <th>
                                محدودیت تعداد استفاده
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
                                  {discount.minimumPrice 
 ? discount.minimumPrice.toLocaleString()
 : 0
}
                                  </td>
                                  <td>
                                    {discount.startDate || "-"} 
                                  </td>
                                  <td>
                                    {discount.endDate || "-"}
                                  </td>


                                  <td>
                                  
    {discount.maxDiscount 
        ? discount.maxDiscount.toLocaleString() + " " + t("product.currency")
        : "-"
    }

                                  </td>
                                  <td>
                                    {discount.usageLimit || "-"}
                                  </td>
                                  <td>
                                    {discount.category || "-"}
                                  </td>
                                  <td>
                                    {discount.productId || "-"}
                                  </td>
                                  <td>
                                  <td>
 {discount.sellerOnly ? "بله" : "خیر"}
</td>
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