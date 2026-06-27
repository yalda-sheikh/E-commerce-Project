import { useState, useEffect } from 'react';
import './Home.css'; 

function Home({ user }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(''); // اضافه شده برای رفع خطا

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

  if (loading) return <h3 className="loading-state">⏳ در حال بارگذاری محصولات...</h3>;

  return (
    <div className="home-container">
      <h2 className="home-title">🏪 ویترین فروشگاه دیجیتال</h2>
      
      {message && <div className="home-alert">{message}</div>}
      
      <div className="store-grid">
        {products.length === 0 ? (
          <p className="empty-msg">محصولی برای نمایش یافت نشد.</p>
        ) : (
          products.map((item) => (
            <div key={item.itemId} className="store-card">
              <div className="product-emoji-wrapper">
                {item.name?.toLowerCase().includes('watch') ? '⌚' : '📱'}
              </div>
              <div className="product-info">
                <h3 className="product-name">{item.name} ({item.brand})</h3>
                <p className="product-meta">رنگ: {item.color}</p>
                <p className={`stock-status ${item.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                  {item.stock > 0 ? `📦 موجود: ${item.stock} عدد` : '❌ ناموجود'}
                </p>
              </div>
              <div className="card-footer">
                <span className="price-tag">{item.price?.toLocaleString()} تومان</span>
                <button 
                  onClick={() => handleAddToCart(item.itemId)}
                  disabled={item.stock === 0}
                  className="add-to-cart-btn"
                >
                  {item.stock > 0 ? '🛒 افزودن' : 'ناموجود'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Home;