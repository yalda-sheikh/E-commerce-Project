import { useEffect, useState } from "react";
import "./Discount.css"
function Discount({user}){
const [code, setCode] = useState("");
const [discountType, setDiscountType] = useState("PERCENT");
const [value, setValue] = useState("");
const [minimumPrice, setMinimumPrice] = useState("");
const [active, setActive] = useState(true);
const [editingDiscount, setEditingDiscount] = useState(null);
const [discounts, setDiscounts] = useState([]);

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
    if (!user) {
        alert("کاربر هنوز بارگذاری نشده است.");
        return;
    }
    console.log({
        code,
        discountType,
        value,
        minimumPrice,
        active
    });

    fetch("http://localhost:8080/api/discount",{
        method : "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            code: code,
            discountType: discountType,
            value: Number(value),
            minimumPrice: Number(minimumPrice),
            active: active,
            sellerName : user?.username
        })
    }).then(res => res.json())
    .then(data => {
        alert(data.message);
        loadDiscounts();
        setCode("");
        setDiscountType("PERCENT");
        setValue("");
        setMinimumPrice("");
        setActive(true);

    })
    .catch(err => console.log(err));

}
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
        .then(data => {

            alert(data.message);

            loadDiscounts();

            setEditingDiscount(null);

            setCode("");
            setDiscountType("PERCENT");
            setValue("");
            setMinimumPrice("");
            setActive(true);

        })
        .catch(err => console.log(err));

};
const deleteDiscount = (code) => {

    fetch(`http://localhost:8080/api/seller-discounts?code=${code}&sellerName=${user.username}`, {
        method: "DELETE"
    })
        .then(res => res.json())
        .then(data => {

            alert(data.message);

            loadDiscounts();

        })
        .catch(err => console.log(err));

};
return(
    <div className="discount-page">

        <div className="discount-form-card">

            <h2 className="discount-title">
                🎁 ایجاد کد تخفیف
            </h2>


            <input
                className="discount-input"
                type="text"
                placeholder="کد تخفیف"
                value={code}
                onChange={(e) => setCode(e.target.value)}
            />


            <select
                className="discount-input"
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
            >

                <option value="PERCENT">
                    درصدی
                </option>

                <option value="FIXED">
                    مبلغ ثابت
                </option>

            </select>



            <input
                className="discount-input"
                type="number"
                placeholder="مقدار تخفیف"
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />



            <input
                className="discount-input"
                type="number"
                placeholder="حداقل مبلغ خرید"
                value={minimumPrice}
                onChange={(e) => setMinimumPrice(e.target.value)}
            />



            <label className="discount-check">

                <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                />

                فعال بودن کد تخفیف

            </label>



            <button
  className="discount-submit-btn"
  onClick={editingDiscount ? updateDiscount : createDiscount}
>
  {editingDiscount ? "💾 ذخیره تغییرات" : "➕ ثبت کد تخفیف"}
</button>

        </div>
        <div className="discount-list">

<h3 className="discount-list-title">
  🎟 کدهای تخفیف من
</h3>

{discounts.length === 0 ? (

  <p className="discount-empty">
    هنوز کد تخفیفی ایجاد نکرده‌اید.
  </p>

) : (

  <table className="discount-table">

    <thead>
      <tr>
        <th>کد</th>
        <th>نوع</th>
        <th>مقدار</th>
        <th>حداقل خرید</th>
        <th>وضعیت</th>
        <th>ویرایش</th>
        <th>حذف</th>
      </tr>
    </thead>

    <tbody>

      {discounts.map((discount) => (

        <tr key={discount.code}>

          <td>{discount.code}</td>

          <td>
            {discount.discountType === "PERCENT"
              ? "درصدی"
              : "مبلغ ثابت"}
          </td>

          <td>
            {discount.discountType === "PERCENT"
              ? `${discount.value}%`
              : `${discount.value.toLocaleString()} تومان`}
          </td>

          <td>
            {discount.minimumPrice.toLocaleString()} تومان
          </td>

          <td>
            {discount.active ? "🟢 فعال" : "🔴 غیرفعال"}
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
              ویرایش
            </button>
          </td>

          <td>
            <button
              className="btn btn-danger"
              onClick={() => deleteDiscount(discount.code)}
            >
              حذف
            </button>
          </td>

        </tr>

      ))}

    </tbody>

  </table>

)}

</div>

    </div>
)

}
export default Discount;