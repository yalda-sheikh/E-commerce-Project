import { useState, useEffect } from 'react'

function Home({ user }) {

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    fetch('http://localhost:8080/api/products')
      .then((response) => {
        if (!response.ok) {
          throw new Error('خطا در پاسخ‌دهی سرور جاوا');
        }
        return response.json();
      })
      .then((data) => {
        setProducts(data); 
        setLoading(false);
      })
      .catch((error) => {
        console.error('خطا در اتصال به بک‌اِند جاوا:', error);
        setLoading(false);
      });
  }, []);

  
    const handleAddToCart = (itemId) => {
      if (!user) {
        alert('❌ برای اضافه کردن کالا به سبد خرید، ابتدا باید وارد حساب خود شوید!');
        return;
      }
  
      // فرستادن اطلاعات کالا و کاربر به بک‌اِند جاوا
      fetch('http://localhost:8080/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({
          userId: user.userId,
          itemId: itemId,
          quantity: 1 // یا هر تعدادی که کاربر انتخاب کرده
        })
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'خطا در اضافه کردن به سبد خرید');
          else{
         
            alert("محصول به سبد خرید اضافه شد.")
            return data;
          }
         
        })
        .then((data) => {

          setMessage(data.message);
          // پاک کردن پیام بعد از ۳ ثانیه
          setTimeout(() => setMessage(''), 3000);

        })
        .catch((err) => {
          setMessage(`❌ ${err.message}`);
          setTimeout(() => setMessage(''), 4000);
        });
    };

  if (loading) {
    return <h3 style={{ textAlign: 'center', marginTop: '50px' }}>⏳ در حال بارگذاری محصولات از سرور جاوا...</h3>;
  }

  return (
    <div>
      <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>🏪 ویترین فروشگاه دیجیتال</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', padding: '10px' }}>
        {products.length === 0 ? (
          <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>هیچ محصولی در انبار جاوای شما موجود نیست! (لیست allItems در جاوا خالی است)</p>
        ) : (
          products.map((item) => (
            <div key={item.itemId} style={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '15px', backgroundColor: '#fff', boxShadow: '0 4px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              
              <div style={{ fontSize: '60px', textAlign: 'center', marginBottom: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '10px' }}>
                {item.name && item.name.toLowerCase().includes('watch') ? '⌚' : '📱'}
              </div>

              <div>
                <h3 style={{ margin: '0 0 10px 0', color: '#222' }}>{item.name} ({item.brand})</h3>
                <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>رنگ: {item.color}</p>
                <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>شناسه کالا: {item.itemId}</p>
                <p style={{ margin: '5px 0', fontWeight: 'bold', color: item.stock > 0 ? '#28a745' : '#dc3545' }}>
                  {item.stock > 0 ? `📦 موجود در انبار: ${item.stock} عدد` : '❌ اتمام موجودی'}
                </p>
              </div>

              <div style={{ marginTop: '15px', borderTop: '1px solid #f0f0f0', paddingTop: '15px' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff', marginBottom: '10px', textAlign: 'left' }}>
                  {item.price.toLocaleString()} تومان
                </div>
                
                <button 
                  onClick={() => handleAddToCart(item.itemId)}
                  disabled={item.stock === 0}
                  style={{ width: '100%', padding: '10px', backgroundColor: item.stock > 0 ? '#007bff' : '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', cursor: item.stock > 0 ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: '14px' }}
                >
                  {item.stock > 0 ? '🛒 افزودن به سبد خرید' : 'ناموجود'}
                </button>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Home