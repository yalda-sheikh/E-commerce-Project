import { useState } from "react";

function FilterHandler({ setProducts }) {

    const [brand, setBrand] = useState("");
    const [type, setType] = useState("");
    const [min, setMin] = useState("");
    const [max, setMax] = useState("");
    console.log(
        `http://localhost:8080/api/filter?brand=${brand}&type=${type}&minPrice=${min}&maxPrice=${max}`
    );
    const Filter = () => {

        fetch(
            `http://localhost:8080/api/filter?brand=${brand}&type=${type}&minPrice=${min}&maxPrice=${max}`
        )
            .then(res => res.json())
            .then(data => setProducts(data))
            .catch(err => console.log(err));

    };

    return (

        <div className="filter-box">
    
            <select
                className="filter-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
            >
                <option value="">همه دسته‌ها</option>
                <option value="MOBILE">موبایل</option>
                <option value="LAPTOP">لپ‌تاپ</option>
            </select>
    
            <input
                className="filter-input"
                type="text"
                placeholder="برند"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
            />
    
            <input
                className="filter-input"
                type="number"
                placeholder="حداقل قیمت"
                value={min}
                onChange={(e) => setMin(e.target.value)}
            />
    
            <input
                className="filter-input"
                type="number"
                placeholder="حداکثر قیمت"
                value={max}
                onChange={(e) => setMax(e.target.value)}
            />
    
            <button 
                className="filter-btn"
                onClick={Filter}
            >
                🔍 اعمال فیلتر
            </button>
    
        </div>
    
    );

}

export default FilterHandler;