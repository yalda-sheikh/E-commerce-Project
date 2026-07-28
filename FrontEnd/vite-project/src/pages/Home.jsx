import { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import AlertModal from "../components/AlertModal";
import './Home.css';
import { Link } from 'react-router';
import Search from '../components/Search';
import FilterHandler from '../components/FilterHandler';
import useAlert from '../components/useAlert';

function Home({ user }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const { alert, showAlert, closeAlert } = useAlert();
  const { t } = useTranslation();

  useEffect(() => {
    fetch('http://localhost:8080/api/products')
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('خطا در اتصال به بک‌اِند:', error);
        setLoading(false);
      });
  }, []);

  const handleAddToCart = (itemId) => {
    if (!user) {
      showAlert(
        t("failed"),
        t("loginFirst"),
        "error"
      );
      return;
    }

    fetch('http://localhost:8080/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify({
        userId: user.userId,
        itemId,
        quantity: 1
      })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || t("addCartError"));
        return data;
      })
      .then((data) => {
        setMessage(data.message || t("productAdded"));
        setTimeout(() => setMessage(''), 3000);
      })
      .catch((err) => {
        setMessage(`❌ ${err.message}`);
        setTimeout(() => setMessage(''), 4000);
      });
  };

  const searchProduct = (keyword) => {

    if (keyword.trim() === "") {

      fetch("http://localhost:8080/api/products")
        .then(res => res.json())
        .then(data => setProducts(data));

      return;
    }

    fetch(`http://localhost:8080/api/search?q=${keyword}`)
      .then(res => res.json())
      .then(data => setProducts(data));
  };

  if (loading)
    return (
      <h3 className="loading-state">
        ⏳ {t("loadingProducts")}
      </h3>
    );

  return (
    <div className="home-container">

      <Search onSearch={searchProduct} />
      <FilterHandler setProducts={setProducts} />

      {message && <div className="home-alert">{message}</div>}

      <div className="store-grid">

        {products.length === 0 ? (

          <p className="empty-msg">
            {t("noProducts")}
          </p>

        ) : (

          products.map((item, index) => (

            <Link
              key={`${item.variants?.[0].itemId}-${index}`}
              className="store-card"
              to={`/product/${item.variants?.[0].itemId}`}
            >

              <div className="product-emoji-wrapper">
                {item.name?.toLowerCase().includes('watch') ? '⌚' : '📱'}
              </div>

              <div className="product-info">

                <h3 className="product-name">
                  {item.name} ({item.brand})
                </h3>

                <p className="product-meta">
                  {t("color")}: {item.variants?.[0].color}
                </p>

                <p
                  className={`stock-status ${item.variants?.[0].stock > 0 ? 'in-stock' : 'out-of-stock'}`}
                >
                  {item.variants?.[0].stock > 0
                    ? `📦 ${t("inStock")}: ${item.variants?.[0].stock} ${t("pieces")}`
                    : `❌ ${t("outOfStock")}`}
                </p>

              </div>

              <div className="card-footer">

                <span className="price-tag">
                  {item.variants?.[0].price?.toLocaleString()} {t("currency")}
                </span>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleAddToCart(item.variants?.[0].itemId);
                  }}
                  disabled={item.variants?.[0].stock === 0}
                  className="add-to-cart-btn"
                >
                  {item.variants?.[0].stock > 0
                    ? `🛒 ${t("addToCart")}`
                    : t("outOfStock")}
                </button>

              </div>

            </Link>

          ))
        )}

      </div>

      <AlertModal
        {...alert}
        onClose={closeAlert}
      />

    </div>
  );
}

export default Home;