import React, { useState , useEffect} from 'react'; 
import axios from 'axios'; 
import "./AddProductForm.css"
import AlertModal from './AlertModal';
import useAlert from './useAlert';
import { useTranslation } from "react-i18next";

export default function AddProductForm({ user }) {
  const [editingId, setEditingId] = useState(null);
  const [productType, setProductType] = useState('BASE'); 
  const [generalFields, setGeneralFields] = useState({
    name: '', brand: ''
  });
  const {alert, showAlert, closeAlert} = useAlert()
  const [currentVariant, setCurrentVariant] = useState({
    color: "",
    price: "",
    stock: ""
});
const { t } = useTranslation();
 const [variants, setVariants] = useState([]);
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
      console.log(response.data);
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
  const handleVariantChange = (e) => {
    setCurrentVariant({
      ...currentVariant,
      [e.target.name]: e.target.value
    });
  };

  const handleLaptopChange = (e) => {
    setLaptopFields({ ...laptopFields, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  

    const automaticItemId = Date.now() % 2000000000;

  let finalVariants = [...variants];

if (
  currentVariant.color &&
  currentVariant.price &&
  currentVariant.stock
) {
  finalVariants.push(currentVariant);
}

    const finalPayload = {
      ...generalFields,
      variants: finalVariants,
      sellerName: user?.username || "نامشخص",
      productType,
    
      ...(productType === "LAPTOP" && {
        ram: laptopFields.ram,
        storage: laptopFields.storage,
        graphics: laptopFields.graphics
      }),
    
      ...(productType === "MOBILE" && {
        cameraMP: String(mobileFields.cameraMP),
        batteryMah: String(mobileFields.batteryMah),
        is5G: String(mobileFields.is5G)
      })
    };
    
    if (!editingId) {
      finalPayload.itemId = String(automaticItemId);
    }
  
    try {

      let response;
    
      if (editingId) {
    
        response = await axios.put(
          `http://localhost:8080/api/products/${editingId}`,
          finalPayload
        );
    
      } else {
    
        response = await axios.post(
          'http://localhost:8080/api/products',
          finalPayload
        );
    
      }
    
  
    if(editingId){
      showAlert("موفق" ,"تغییرات با موفقیت اعمال شد.","success")
    }
    if(!editingId){
      showAlert("موفق" ,"محصول با موفقیت اضافه شد.","success")
    }

    
    

      setEditingId(null);
    
      setGeneralFields({
        name: '',
        brand: '',
      });
      setCurrentVariant({
        color: "",
        price: "",
        stock: ""
      })
      setVariants([])
    
    
      fetchProducts();
    
    
    } catch (error) {
    
      console.error("خطا در ذخیره محصول:", error);
      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Backend message:", error.response.data);
      }
    
    }
  };

  if (loading) {
    return <p style={{ textAlign: 'center', fontSize: '18px' }}>🔄 در حال بارگذاری محصولات...</p>;
  }
  const handleDelete = async (itemId) => {
    // const confirmDelete = window.confirm(
    //   "آیا مطمئن هستید که می‌خواهید این محصول را حذف کنید؟"
    // );
  
    // if (!confirmDelete) return;
  
    try {
      const res = await fetch(
        `http://localhost:8080/api/products/${itemId}`,
        {
          method: "DELETE",
        }
      );
  
      const data = await res.json();
      showAlert("موفق" ,"محصول با موفقیت حذف شد.","success")
  
      if (!res.ok) {
        throw new Error(data.error);
      }
  

      setProducts((prevProducts) =>
        prevProducts.filter(
          (product) => product.itemId !== itemId
        )
      );
  
      console.log(data.message);
  
    } catch (error) {
      console.log("خطا در حذف محصول:", error.message);
      showAlert("نا موفق" ,"حذف محصول با خطا مواجه شد.","error")
    }
  };
  const handelEdit = (product) => {

    console.log(product);
  
    setEditingId(product.itemId);
  
    setGeneralFields({
      name: product.name || "",
      brand: product.brand || "",
    });
    setVariants(product.variants || [])
    setCurrentVariant({
      color : "",
      price:"",
      stock : ""
    })
  
    setProductType(product.productType || "BASE");
  
  
    if(product.productType === "LAPTOP") {
  
      setLaptopFields({
        ram: product.ram || "",
        storage: product.storage || "",
        graphics: product.graphics || "false"
      });
  
    }
  
  
    if(product.productType === "MOBILE") {
  
      setMobileFields({
        cameraMP: product.cameraMP || "",
        batteryMah: product.batteryMah || "",
        is5G: product.is5G === true || product.is5G === "true"
      });
  
    }
  };
  const handleVariantEdit = (index, field, value) => {

    const updatedVariants = [...variants];
  
    updatedVariants[index] = {
      ...updatedVariants[index],
      [field]: value
    };
  
    setVariants(updatedVariants);
  
  };
  return (
    <div className="seller-page">
      <form onSubmit={handleSubmit}>
        <h3>➕ افزودن محصول جدید (داشبورد فروشنده: {user?.username})</h3>

        <div className="input-group">
  <label>نام محصول</label>
  <input
    className="form-input"
    type="text"
    name="name"
    onChange={handleGeneralChange}
    required
    value={generalFields.name || ""}
  />
</div>

<div className="input-group">
  <label>برند</label>
  <input
    className="form-input"
    type="text"
    name="brand"
    onChange={handleGeneralChange}
    required
    value={generalFields.brand || ""}
  />
</div>

{!editingId && (
  <>
    <div className="input-group">
  <label>رنگ</label>
  <input
    className="form-input"
    type="text"
    name="color"
    onChange={handleVariantChange}
    value={currentVariant.color}
    required
  />
</div>

<div className="input-group">
  <label>قیمت</label>
  <input
    className="form-input"
    type="number"
    name="price"
    onChange={handleVariantChange}
    value={currentVariant.price}
    required
  />
</div>

<div className="input-group">
  <label>موجودی انبار</label>
  <input
    className="form-input"
    type="number"
    name="stock"
    onChange={handleVariantChange}
    value={currentVariant.stock}
    required
  />
</div>

    <button
      className="btn btn-primary"
      type="button"
      onClick={() => {

        if (
          !currentVariant.color ||
          !currentVariant.price ||
          !currentVariant.stock
        ) {
          alert("اطلاعات رنگ را کامل وارد کنید.");

          return;
        }

        setVariants([...variants, currentVariant]);

        setCurrentVariant({
          color: "",
          price: "",
          stock: ""
        });

      }}
    >
      ➕ افزودن رنگ
    </button>

    {variants.map((v, index) => (
      <div key={index}>
        {v.color} | {v.price} | {v.stock}
      </div>
    ))}
  </>
)}
{/* =================== حالت ویرایش محصول =================== */}

{editingId && (
  <>
    <h4>رنگ‌های محصول</h4>

    {variants.map((v , index) => (
      <div
        key={v.itemId}
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "10px"
        }}
      >
<div className="input-group">
  <label>رنگ</label>
  <input
    className="form-input"
    type="text"
    value={v.color}
    onChange={(e) =>
      handleVariantEdit(index, "color", e.target.value)
    }
  />
</div>

<div className="input-group">
  <label>قیمت</label>
  <input
    className="form-input"
    type="number"
    value={v.price}
    onChange={(e) =>
      handleVariantEdit(index, "price", e.target.value)
    }
  />
</div>

<div className="input-group">
  <label>موجودی</label>
  <input
    className="form-input"
    type="number"
    value={v.stock}
    onChange={(e) =>
      handleVariantEdit(index, "stock", e.target.value)
    }
  />
</div>



      </div>


    ))}
    <div className="input-group">
  <label>رنگ جدید</label>
  <input
    className="form-input"
    type="text"
    name="color"
    value={currentVariant.color}
    onChange={handleVariantChange}
  />
</div>

<div className="input-group">
  <label>قیمت</label>
  <input
    className="form-input"
    type="number"
    name="price"
    value={currentVariant.price}
    onChange={handleVariantChange}
  />
</div>

<div className="input-group">
  <label>موجودی</label>
  <input
    className="form-input"
    type="number"
    name="stock"
    value={currentVariant.stock}
    onChange={handleVariantChange}
  />
</div>

<button
  type="button"
  className="btn btn-success"
  onClick={() => {

    if (
      !currentVariant.color ||
      !currentVariant.price ||
      !currentVariant.stock
    ) {
      alert("اطلاعات رنگ را کامل وارد کنید.");
      return;
    }

    setVariants(prev => [
      ...prev,
      {
        itemId: Date.now(),
        color: currentVariant.color,
        price: Number(currentVariant.price),
        stock: Number(currentVariant.stock)
      }
    ]);

    setCurrentVariant({
      color: "",
      price: "",
      stock: ""
    });

  }}
>
    ➕ افزودن رنگ جدید
</button>
  </>
)}
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
    {editingId ? "💾 ذخیره تغییرات" : "➕ ثبت محصول جدید"}
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
                    <th>
                      __
                    </th>
                    <th>
                      __
                    </th>
                    
                </tr>

            </thead>


            <tbody>

            {products
            .filter(p => p.sellerName === user?.username)
            .map((item)=>(


                <tr key={item.itemId}>
                  

                    <td>
                        <strong>{item.variants?.[0].itemId}</strong>
                    </td>

                    <td>{item.name}</td>

                    <td>{item.brand}</td>

                    <td>
  {item.variants?.map((v) => (
    <div key={v.itemId}>
      {v.color}
    </div>
  ))}
</td>


<td>
  {item.variants?.map((v) => (
    <div key={v.itemId}>
      {v.price.toLocaleString()}
    </div>
  ))}
</td>

<td>
  {item.variants?.map((v) => (
    <div key={v.itemId}>
      {v.stock} عدد
    </div>
  ))}
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
                    <td><button className='btn btn-primary' onClick={() => handelEdit(item)}>ویرایش</button></td>
                    <td> <button className='btn btn-primary' onClick={() => handleDelete(item.itemId)}>حذف محصول</button></td>


                </tr>

            ))}


            </tbody>

        </table>

    </div>

)}

</div>
<AlertModal {...alert}  onClose={closeAlert} />

    </div>
  );
}