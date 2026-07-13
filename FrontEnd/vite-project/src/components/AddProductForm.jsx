import React, { useState , useEffect} from 'react'; 
import axios from 'axios'; 
import "./AddProductForm.css"

export default function AddProductForm({ user }) {

  const [productType, setProductType] = useState('BASE'); 
  const [generalFields, setGeneralFields] = useState({
    name: '', brand: '', color: '', price: '', stock: '' // 💡 itemId از اینجا حذف شد
  });
  const [laptopFields, setLaptopFields] = useState({
    ram: '', storage: '', graphics: 'false'
  });
  const [mobileFields, setMobileFields] = useState({
    cameraMP: '',
    batteryMah: '',
    is5G: false
  });
  const [products, setProducts] = useState([]); 
  const [loading, setLoading] = useState(true); 

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/products');
      setProducts(response.data); 
      setLoading(false);
    } catch (error) {
      console.error('خطا در دریافت لیست محصولات از جاوا:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleGeneralChange = (e) => {
    setGeneralFields({ ...generalFields, [e.target.name]: e.target.value });
  };

  const handleLaptopChange = (e) => {
    setLaptopFields({ ...laptopFields, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // 💡 تولید یک شناسه عددی کاملاً یکتا که در محدوده Integer جاوا جا شود
    const automaticItemId = Date.now() % 2000000000;
  
    // جفت‌وجور کردن دیتای نهایی
    const finalPayload = {
      itemId: String(automaticItemId), // ✨ ارسال شناسه اتوماتیک و یکتا برای راضی نگه‌داشتن جاوا
      ...generalFields,
      sellerName: user?.username || 'نامشخص', 
      productType: productType,
      ...(productType === 'LAPTOP' && {
        ram: laptopFields.ram,
        storage: laptopFields.storage,
        graphics: laptopFields.graphics
      }),
      ...(productType === 'MOBILE' && {
        cameraMP: String(mobileFields.cameraMP),
        batteryMah: String(mobileFields.batteryMah),
        is5G: String(mobileFields.is5G) 
      })
    };
  
    try {
      const response = await axios.post('http://localhost:8080/api/products', finalPayload);
      alert(response.data.message || 'محصول با موفقیت ثبت شد!'); 
      fetchProducts(); 
    } catch (error) {
      console.error('خطا در فرستادن کالا به جاوا:', error);
      alert('خطایی در ثبت محصول رخ داد!');
    }
  };

  if (loading) {
    return <p style={{ textAlign: 'center', fontSize: '18px' }}>🔄 در حال بارگذاری محصولات...</p>;
  }
  const handleDelete = async (itemId) => {
    const confirmDelete = window.confirm(
      "آیا مطمئن هستید که می‌خواهید این محصول را حذف کنید؟"
    );
  
    if (!confirmDelete) return;
  
    try {
      const res = await fetch(
        `http://localhost:8080/api/products/${itemId}`,
        {
          method: "DELETE",
        }
      );
  
      const data = await res.json();
  
      if (!res.ok) {
        throw new Error(data.error);
      }
  
      // حذف محصول از صفحه بدون رفرش
      setProducts((prevProducts) =>
        prevProducts.filter(
          (product) => product.itemId !== itemId
        )
      );
  
      console.log(data.message);
  
    } catch (error) {
      console.log("خطا در حذف محصول:", error.message);
    }
  };

  return (
    <div className="seller-page">
      <form onSubmit={handleSubmit}>
        <h3>➕ افزودن محصول جدید (داشبورد فروشنده: {user?.username})</h3>

        {/* 💡 اینپوت دستی itemId کلاً حذف شد تا سیستم خودش داینامیک بسازه */}
        <input type="text" name="name" placeholder="نام محصول" onChange={handleGeneralChange} required />
        <input type="text" name="brand" placeholder="برند" onChange={handleGeneralChange} required />
        <input type="text" name="color" placeholder="رنگ" onChange={handleGeneralChange} required />
        <input type="number" name="price" placeholder="قیمت" onChange={handleGeneralChange} required />
        <input type="number" name="stock" placeholder="موجودی انبار" onChange={handleGeneralChange} required />
        
        <label>نوع محصول:</label>
        <select value={productType} onChange={(e) => setProductType(e.target.value)}>
          <option value="BASE">محصول معمولی (ساده)</option>
          <option value="LAPTOP">لپ‌تاپ (Laptop)</option>
          <option value="MOBILE">موبایل (Mobile)</option>
        </select>

        {productType === 'LAPTOP' && (
         <div className="special-fields laptop-fields">
            <h4>ویژگی‌های اختصاصی لپ‌تاپ:</h4>
            <input className="special-fields-input" type="number" name="ram" placeholder="مقدار رم (GB)" onChange={handleLaptopChange} required />
            <input className="special-fields-input" type="number" name="storage" placeholder="مقدار حافظه (GB)" onChange={handleLaptopChange} required />
            <label>
              کارت گرافیک مجزا دارد؟
              <select name="graphics" onChange={handleLaptopChange}>
                <option value="false">خیر</option>
                <option value="true">بله</option>
              </select>
            </label>
          </div>
        )}

        {productType === 'MOBILE' && (
          <div className="special-fields mobile-fields">
            <h4 >مشخصات فنی موبایل:</h4>
            <div >
              <label>کیفیت دوربین (مگاپیکسل): </label>
              <input className="special-fields-input"
                type="number" 
                value={mobileFields.cameraMP} 
                onChange={(e) => setMobileFields({...mobileFields, cameraMP: e.target.value})} 
                placeholder="مثلاً 48"
                required
              />
            </div>
            <div >
              <label>ظرفیت باتری (mAh): </label>
              <input className="special-fields-input"
                type="number" 
                value={mobileFields.batteryMah} 
                onChange={(e) => setMobileFields({...mobileFields, batteryMah: e.target.value})} 
                placeholder="مثلاً 5000"
                required
              />
            </div>
            <div>
            </div>
          </div>
        )}

<button className="submit-product-btn" type="submit">
    ثبت و ارسال به سرور جاوا
</button>
      </form>

      <div className="inventory-section">

<h3 className="inventory-title">
    📦 لیست محصولات موجود در انبار شما
</h3>

{products.filter(p => p.sellerName === user?.username).length === 0 ? (

    <p className="inventory-empty">
        هیچ محصولی توسط شما ثبت نشده است.
    </p>

) : (

    <div className="table-wrapper">

        <table className="inventory-table">

            <thead>

                <tr>
                    <th>شناسه کالا</th>
                    <th>نام محصول</th>
                    <th>برند</th>
                    <th>رنگ</th>
                    <th>قیمت (تومان)</th>
                    <th>موجودی</th>
                    <th>نوع کالا</th>
                    <th>✨ ویژگی‌های اختصاصی</th>
                    
                </tr>

            </thead>


            <tbody>

            {products
            .filter(p => p.sellerName === user?.username)
            .map((item)=>(
              console.log(products),

                <tr key={item.itemId}>
                  

                    <td>
                        <strong>{item.itemId}</strong>
                    </td>

                    <td>{item.name}</td>

                    <td>{item.brand}</td>

                    <td>{item.color}</td>


                    <td>
                        {item.price 
                        ? item.price.toLocaleString()
                        : 0}
                    </td>


                    <td className={
                        item.stock > 0 
                        ? "stock-good"
                        : "stock-bad"
                    }>

                        {
                        item.stock > 0 
                        ? `${item.stock} عدد`
                        : "ناموجود"
                        }

                    </td>


                    <td>

                        {
                        item.productType === "LAPTOP"
                        ? "💻 لپ‌تاپ"
                        : item.productType === "MOBILE"
                        ? "📱 موبایل"
                        : "📦 محصول ساده"
                        }

                    </td>


                    <td className={
                        item.productType === "LAPTOP"
                        ? "laptop-detail"
                        :
                        item.productType === "MOBILE"
                        ? "mobile-detail"
                        :
                        "base-detail"
                    }>


                        {
                        item.productType === "LAPTOP" && (

                            <span>
                                رم: {item.ram}GB 
                                <br/>
                                حافظه: {item.storage}GB
                            </span>

                        )
                        }


                        {
                        item.productType === "MOBILE" && (

                            <span>
                                دوربین: {item.cameraMP}MP
                                <br/>
                                باتری: {item.batteryMah}mAh
                                <br/>
                                {item.is5G === "true" || item.is5G === true
                                ? "5G"
                                : "4G"}
                            </span>

                        )
                        }


                        {
                        item.productType === "BASE" && (
                            <span>
                                ---
                            </span>
                        )
                        }


                    </td>
                    <td> <button className='btn btn-primary' onClick={() => handleDelete(item.itemId)}>حذف محصول</button></td>


                </tr>

            ))}


            </tbody>

        </table>

    </div>

)}

</div>
    </div>
  );
}