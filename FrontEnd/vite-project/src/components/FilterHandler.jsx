import { useState } from "react";
import { useTranslation } from "react-i18next";

function FilterHandler({ setProducts }) {

    const [brand, setBrand] = useState("");
    const [type, setType] = useState("");
    const [min, setMin] = useState("");
    const [max, setMax] = useState("");

    const { t } = useTranslation();

    const Filter = () => {

        fetch(
            `http://localhost:8080/api/filter?brand=${brand}&type=${type}&minPrice=${min}&maxPrice=${max}`
        )
            .then(res => res.json())
            .then(data => {
                console.log("FILTER =", data);
                setProducts(data);
            })
            .catch(err => console.log(err));

    };

    return (

        <div className="filter-box">

            <select
                className="filter-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
            >
                <option value="">{t("allCategories")}</option>
                <option value="MOBILE">{t("mobile")}</option>
                <option value="LAPTOP">{t("laptop")}</option>
            </select>

            <input
                className="filter-input"
                type="text"
                placeholder={t("brand")}
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
            />

            <input
                className="filter-input"
                type="number"
                placeholder={t("minPrice")}
                value={min}
                onChange={(e) => setMin(e.target.value)}
            />

            <input
                className="filter-input"
                type="number"
                placeholder={t("maxPrice")}
                value={max}
                onChange={(e) => setMax(e.target.value)}
            />

            <button
                className="filter-btn"
                onClick={Filter}
            >
                🔍 {t("applyFilter")}
            </button>

        </div>

    );

}

export default FilterHandler;