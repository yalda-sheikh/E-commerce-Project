import React, { useState } from 'react';
import './SellerDashboard.css'; // متصل کردن فایل استایل

function SellerDashboard({ user, setUser }) {
    
const [products, setProducts] = useState([]);
    
fetch('http://localhost:8080/api/products', {
  method: 'GET',
})
  .then(res => {
    if (!res.ok) {
      throw new Error("خطا در پاسخ سرور");
    }
    return res.json();
  })
  .then(data => {
    setProducts(data); 
  })
  .catch(err => {
    System.out.println("خطا در دریافت محصولات:", err); 
    console.log("nashod", err);
  });

const [newProduct, setNewProduct] = useState({
  name: '',
  price: '',
  color: '',
  quantity: ''
});

    const handleAddProduct = (e) => {
        e.preventDefault();
        const productToAdd ={
            itemId : products.length +1,
            name : newProduct.name,
            brand: "برند فروشنده",
        color: newProduct.color,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.quantity),
        sellerName: user?.username
        }
      

        fetch('http://localhost:8080/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productToAdd)
        })
        .then(res => {
          if (res.ok) {
            setProducts(prevProducts => [...prevProducts, productToAdd]);
            setNewProduct({ name: '', price: '', color: '', quantity: '' });
      alert("🎉 محصول با موفقیت ثبت و به لیست اضافه شد!");
    } else {
      alert("❌ سرور درخواست را قبول نکرد.");
    }
})
.catch(err => {
    console.log(err);
    alert("❌ خطا در ارتباط با سرور جاوا");
})
      };

  return (
    <div className="seller-dashboard">
      <h3 className="dashboard-title">🏪 پنل مدیریت فروشنده</h3>
      
      {/* فرم افزودن محصول جدید */}
      <form onSubmit={handleAddProduct} className="add-product-form">
        <h4>➕ افزودن محصول جدید به سایت</h4>
        <div className="form-field">
          <label>نام محصول: </label>
          <input type="text" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
        </div>
        <div className="form-field">
          <label>قیمت (تومان): </label>
          <input type="number" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
        </div>
        <div className="form-field">
          <label>رنگ: </label>
          <input type="text" required value={newProduct.color} onChange={e => setNewProduct({...newProduct, color: e.target.value})} />
        </div>
        <div className="form-field">
          <label>تعداد موجودی در انبار: </label>
          <input type="number" required value={newProduct.quantity} onChange={e => setNewProduct({...newProduct, quantity: e.target.value})} />
        </div>
        <button type="submit" className="submit-btn">
          تایید و انتشار محصول
        </button>
      </form>

      {/* لیست محصولات ثبت شده */}
      <h4 className="list-heading">📦 لیست محصولات شما در سایت:</h4>
      <ul className="products-grid">
        {Array.isArray(products) ? (
          products.filter(p => p.sellerName === user?.username).map((prod, index) => (
            <li key={prod.itemId} className="product-card">
              <strong className="product-title">{prod.name}</strong>
              <span className="product-price">قیمت: {prod.price?.toLocaleString()} تومان</span>
              <span className="product-stock">(موجودی: {prod.stock} عدد)</span>
            </li>
          ))
        ) : (
          <p className="loading-msg">در حال بارگذاری یا خطای دریافت محصولات...</p>
        )}
      </ul>
    </div>
  );
}

export default SellerDashboard;