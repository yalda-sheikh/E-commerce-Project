import { useState } from "react";
import { useTranslation } from "react-i18next";

function Search({ onSearch }) {
    const [keyword, setKeyword] = useState("");
    const { t } = useTranslation();

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
                    placeholder={t("searchPlaceholder")}
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
                    {t("search")}
                </button>

            </div>

        </div>
    );
}

export default Search;