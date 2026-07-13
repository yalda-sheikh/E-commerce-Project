import { useState } from "react";

function Search({ onSearch }) {

    const [keyword, setKeyword] = useState("");

    const handleSearch = () => {
        onSearch(keyword);
    };

    return (
        <div className="search-wrapper">

            <div className="search-box">

                <span className="search-icon">
                    🔍
                </span>

                <input
                    type="text"
                    placeholder="جستجوی محصول، برند یا دسته‌بندی..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleSearch();
                        }
                    }}
                />

                <button 
                    className="search-btn"
                    onClick={handleSearch}
                >
                    جستجو
                </button>

            </div>

        </div>
    );
}

export default Search;