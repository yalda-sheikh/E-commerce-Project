import React, { useEffect, useState } from "react";
import { useParams } from "react-router";

function ProductDetail() {

  const { id } = useParams();


  const [product, setProduct] = useState(null);


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
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

  }, [id]);


  if (loading) {
    return <h2>در حال بارگذاری...</h2>;
  }


  if (error) {
    return <h2>{error}</h2>;
  }

  return (
    <div className="product-detail">

      <img
        src={product.image}
        alt={product.name}
      />

      <h1>{product.name}</h1>

      <p>{product.description}</p>

      <h3>{product.price} تومان</h3>

      <p>موجودی: {product.stock}</p>

      <button>
        افزودن به سبد خرید
      </button>

    </div>
  );
}

export default ProductDetail;