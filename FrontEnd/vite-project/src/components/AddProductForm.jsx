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
      alert("خطایی رخ داد!");
    
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

<h3>
  ➕ {t("seller.addProduct")} ({t("seller.dashboard")}: {user?.username})
</h3>

<div className="input-group">
  <label>{t("seller.productName")}</label>
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
  <label>{t("seller.brand")}</label>
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
      <label>{t("seller.color")}</label>
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
      <label>{t("seller.price")}</label>
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
      <label>{t("seller.stock")}</label>
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
          alert(t("seller.fillVariant"));
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
      ➕ {t("seller.addColor")}
    </button>

    {variants.map((v, index) => (
      <div key={index}>
        {v.color} | {v.price} | {v.stock}
      </div>
    ))}
  </>
)}

{editingId && (
  <>
    <h4>{t("seller.productColors")}</h4>

    {variants.map((v, index) => (

      <div
        key={v.itemId}
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "10px"
        }}
      >

        <div className="input-group">
          <label>{t("seller.color")}</label>
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
          <label>{t("seller.price")}</label>
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
          <label>{t("seller.stock")}</label>
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
  </>
)}

<label>{t("seller.productType")}</label>

<select
  value={productType}
  onChange={(e) => setProductType(e.target.value)}
>
  <option value="BASE">{t("seller.baseProduct")}</option>
  <option value="LAPTOP">{t("seller.laptop")}</option>
  <option value="MOBILE">{t("seller.mobile")}</option>
</select>

{productType === "LAPTOP" && (
  <div className="special-fields laptop-fields">

    <h4>{t("seller.laptopSpecs")}</h4>

    <input
      className="special-fields-input"
      type="number"
      name="ram"
      placeholder={t("seller.ram")}
      onChange={handleLaptopChange}
      required
    />

    <input
      className="special-fields-input"
      type="number"
      name="storage"
      placeholder={t("seller.storage")}
      onChange={handleLaptopChange}
      required
    />

    <label>
      {t("seller.graphics")}

      <select
        name="graphics"
        onChange={handleLaptopChange}
      >
        <option value="false">{t("common.no")}</option>
        <option value="true">{t("common.yes")}</option>
      </select>

    </label>

  </div>
)}
{productType === "MOBILE" && (
  <div className="special-fields mobile-fields">

    <h4>{t("seller.mobileSpecs")}</h4>

    <div>

      <label>{t("seller.camera")}:</label>

      <input
        className="special-fields-input"
        type="number"
        value={mobileFields.cameraMP}
        onChange={(e) =>
          setMobileFields({
            ...mobileFields,
            cameraMP: e.target.value,
          })
        }
        placeholder={t("seller.cameraPlaceholder")}
        required
      />

    </div>

    <div>

      <label>{t("seller.battery")}:</label>

      <input
        className="special-fields-input"
        type="number"
        value={mobileFields.batteryMah}
        onChange={(e) =>
          setMobileFields({
            ...mobileFields,
            batteryMah: e.target.value,
          })
        }
        placeholder={t("seller.batteryPlaceholder")}
        required
      />

    </div>

  </div>
)}

<button
  className="submit-product-btn"
  type="submit"
>
  {editingId
    ? `💾 ${t("seller.saveChanges")}`
    : `➕ ${t("seller.submitProduct")}`}
</button>

</form>
<AlertModal {...alert}  onClose={closeAlert} />

    </div>
  );
}