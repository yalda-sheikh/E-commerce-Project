import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import "./ProductDetail.css";

function ProductDetail({user}) {

  const { id } = useParams();
  const [selectedVariant, setSelectedVariant] = useState(null);

  const [product, setProduct] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {

    fetch(`http://localhost:8080/api/products/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("محصول پیدا نشد");
        }

        return res.json();
      })
      .then((data) => {
        setProduct(data);
      
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
      
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

  }, [id]);
  const handleAddToCart = (itemId) => {
    if (!selectedVariant) return;
    if (!user) {
      alert('❌ برای اضافه کردن کالا به سبد خرید، ابتدا باید وارد حساب خود شوید!');
      return;
    }

    fetch('http://localhost:8080/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify({ userId: user.userId, itemId: itemId, quantity: 1 })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'خطا در اضافه کردن به سبد خرید');
        return data;
      })
      .then((data) => {
        setMessage(data.message || "✅ محصول با موفقیت اضافه شد.");
        setTimeout(() => setMessage(''), 3000);
      })
      .catch((err) => {
        setMessage(`❌ ${err.message}`);
        setTimeout(() => setMessage(''), 4000);
      });
  };

  if (loading) {
    return <h2 className="loading">در حال بارگذاری...</h2>;
  }

  if (error) {
    return <h2 className="error">{error}</h2>;
  }

  return (
    
    <div className="product-detail">

      <div className="product-card">

        <div className="image-box">

          <img
            src={product.image}
            alt={product.name}
            className="product-image"
          />

        </div>

        <div className="product-info">

          <h1 className="product-title">{product.name}</h1>

          <p className="product-description">{product.description}</p>
          <div className="colors">

  <h4 className="color-title">انتخاب رنگ</h4>
  {message && <div className="home-alert">{message}</div>}
  <div className="color-list">
    {product.variants?.map((variant) => (
      <button
        key={variant.itemId}
        className={`color-btn ${
          selectedVariant?.itemId === variant.itemId
            ? "selected-color"
            : ""
        }`}
        onClick={() => setSelectedVariant(variant)}
      >
        {variant.color}
      </button>
    ))}
  </div>

</div>

          <h3 className="product-price">
  {selectedVariant?.price.toLocaleString()} تومان
</h3>

<p className="product-stock">
  موجودی:
  <span
    className={
      selectedVariant?.stock > 0
        ? "stock-available"
        : "stock-unavailable"
    }
  >
    {selectedVariant?.stock > 0
      ? `${selectedVariant.stock} عدد`
      : "ناموجود"}
  </span>
</p>

          <button className="buy-btn"
                            onClick={(e) => { 
                              handleAddToCart(selectedVariant.itemId) ;
                            }}
                              disabled={selectedVariant.stock === 0}>
          {selectedVariant.stock > 0 ? '🛒 افزودن' : 'ناموجود'}
          </button>

        </div>

      </div>

    </div>
  );
}

export default ProductDetail;