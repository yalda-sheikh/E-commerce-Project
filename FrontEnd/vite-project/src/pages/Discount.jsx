import { useState } from "react";
import "./Discount.css"
function Discount(){
    const [code, setCode] = useState("");

const [discountType, setDiscountType] = useState("PERCENT");

const [value, setValue] = useState("");

const [minimumPrice, setMinimumPrice] = useState("");

const [active, setActive] = useState(true);
const createDiscount = () => {
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
            active: active
        })
    }).then(res => res.json())
    .then(data => {
        alert(data.message);

        setCode("");
        setDiscountType("PERCENT");
        setValue("");
        setMinimumPrice("");
        setActive(true);

    })
    .catch(err => console.log(err));

}
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
                onClick={createDiscount}
            >

                ثبت کد تخفیف

            </button>

        </div>

    </div>
)

}
export default Discount;