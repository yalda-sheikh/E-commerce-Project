import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import "./ProductDetail.css";
import useAlert from "../components/useAlert";
import AlertModal from "../components/AlertModal";

function ProductDetail({ user }) {
  const {alert , showAlert, closeAlert} = useAlert()

  const { t } = useTranslation();

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
          throw new Error(t("product.notFound"));
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

  }, [id, t]);



  const handleAddToCart = (itemId) => {

    if (!selectedVariant) return;

    if (!user) {

      showAlert(t("failed") , t("product.loginRequired"), t("error"))
      return;

    }
    if(user.role === "SELLER"){
      showAlert(t("failed") , t("product.sellerCannotAddToCart"), t("error"))
      return;
    }

    fetch("http://localhost:8080/api/cart/add", {

      method: "POST",

      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },

      body: JSON.stringify({

        userId: user.userId,
        itemId,
        quantity: 1,

      }),

    })

      .then(async (res) => {

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || t("product.addError"));
        }

        return data;

      })

      .then(() => {
        showAlert(
          t("product.success"),
          t("product.productAdded"),
          "success"
        );
      })

      .catch((err) => {
        setTimeout(() => setMessage(""), 4000);
      });

  };



  if (loading) {
    return <h2 className="loading">{t("common.loading")}</h2>;
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
  
          <h1 className="product-title">
            {product.name}
          </h1>
  
          <p className="product-description">
            {product.description}
          </p>
  
          <div className="colors">
  
            <h4 className="color-title">
              {t("product.selectColor")}
            </h4>
  
            {message && (
              <div className="home-alert">
                {message}
              </div>
            )}
  
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
            {selectedVariant?.price.toLocaleString()} {t("product.currency")}
          </h3>
  
          <p className="product-stock">
  
            {t("product.stock")}:
  
            <span
              className={
                selectedVariant?.stock > 0
                  ? "stock-available"
                  : "stock-unavailable"
              }
            >
  
              {selectedVariant?.stock > 0
                ? `${selectedVariant.stock} ${t("product.items")}`
                : t("product.outOfStock")}
  
            </span>
  
          </p>
  
          <button
            className="buy-btn"
            onClick={() => handleAddToCart(selectedVariant.itemId)}
            disabled={selectedVariant.stock === 0}
          >
  
            {selectedVariant.stock > 0
              ? `🛒 ${t("product.addToCart")}`
              : t("product.outOfStock")}
  
          </button>
  
        </div>
  
      </div>
      <AlertModal onClose={closeAlert} {...alert}/>
  
    </div>
  
  );
  
  }
  
  export default ProductDetail;