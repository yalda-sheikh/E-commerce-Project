import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AddProductForm.css";
import AlertModal from "./AlertModal";
import useAlert from "./useAlert";
import useToast from "./UseToast";
import Toast from "./Toast";
import { useTranslation } from "react-i18next";

export default function AddProductForm({ user }) {
  const { t } = useTranslation();

  const [editingId, setEditingId] = useState(null);

  const [productType, setProductType] = useState("BASE");

  const [generalFields, setGeneralFields] = useState({
    name: "",
    brand: "",
  });
  const {toast , showToast , hideToast} = useToast();

  const { alert, showAlert, closeAlert } = useAlert();

  const [currentVariant, setCurrentVariant] = useState({
    color: "",
    price: "",
    stock: "",
  });

  const [variants, setVariants] = useState([]);

  const [laptopFields, setLaptopFields] = useState({
    ram: "",
    storage: "",
    graphics: "false",
  });

  const [mobileFields, setMobileFields] = useState({
    cameraMP: "",
    batteryMah: "",
    is5G: false,
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/products"
      );

      setProducts(response.data);
      console.log(response.data);
      setLoading(false);
    } catch (error) {
      console.error(
        t("addProduct.messages.fetchError"),
        error
      );

      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleGeneralChange = (e) => {
    setGeneralFields({
      ...generalFields,
      [e.target.name]: e.target.value,
    });
  };

  const handleVariantChange = (e) => {
    setCurrentVariant({
      ...currentVariant,
      [e.target.name]: e.target.value,
    });
  };

  const handleLaptopChange = (e) => {
    setLaptopFields({
      ...laptopFields,
      [e.target.name]: e.target.value,
    });
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
      sellerName: user?.username || "unknown",
      productType,

      ...(productType === "LAPTOP" && {
        ram: laptopFields.ram,
        storage: laptopFields.storage,
        graphics: laptopFields.graphics,
      }),

      ...(productType === "MOBILE" && {
        cameraMP: String(mobileFields.cameraMP),
        batteryMah: String(mobileFields.batteryMah),
        is5G: String(mobileFields.is5G),
      }),
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
          "http://localhost:8080/api/products",
          finalPayload
        );
      }

      if (editingId) {
        showToast(t("addProduct.messages.updateSuccess"), "success");
      }

      if (!editingId) {
        showToast(t("addProduct.messages.createSuccess"), "success");
      }

      setEditingId(null);

      setGeneralFields({
        name: "",
        brand: "",
      });

      setCurrentVariant({
        color: "",
        price: "",
        stock: "",
      });

      setVariants([]);

      fetchProducts();
    } catch (error) {
      console.error(
        t("addProduct.messages.saveError"),
        error
      );

      if (error.response) {
        console.log("Status:", error.response.status);
        console.log(
          "Backend message:",
          error.response.data
        );
      }

      showAlert(
        t("common.failed"),
        t("addProduct.messages.saveErrorAlert"),
        "error"
      );
    }
  };

  if (loading) {
    return (
      <p
        style={{
          textAlign: "center",
          fontSize: "18px",
        }}
      >
        🔄 {t("addProduct.messages.loading")}
      </p>
    );
  }

  const handleDelete = async (itemId) => {
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

      showToast( t("addProduct.messages.deleteSuccess"), "success");

      setProducts((prevProducts) =>
        prevProducts.filter(
          (product) => product.itemId !== itemId
        )
      );

      console.log(data.message);
    } catch (error) {
      console.log(
        t("addProduct.messages.deleteError"),
        error.message
      );

      showAlert(
        t("common.failed"),
        t("addProduct.messages.deleteErrorAlert"),
        "error"
      );
    }
  };

  const handelEdit = (product) => {
    console.log(product);

    setEditingId(product.itemId);

    setGeneralFields({
      name: product.name || "",
      brand: product.brand || "",
    });

    setVariants(product.variants || []);

    setCurrentVariant({
      color: "",
      price: "",
      stock: "",
    });

    setProductType(product.productType || "BASE");

    if (product.productType === "LAPTOP") {
      setLaptopFields({
        ram: product.ram || "",
        storage: product.storage || "",
        graphics: product.graphics || "false",
      });
    }

    if (product.productType === "MOBILE") {
      setMobileFields({
        cameraMP: product.cameraMP || "",
        batteryMah: product.batteryMah || "",
        is5G:
          product.is5G === true ||
          product.is5G === "true",
      });
    }
  };

  const handleVariantEdit = (
    index,
    field,
    value
  ) => {
    const updatedVariants = [...variants];

    updatedVariants[index] = {
      ...updatedVariants[index],
      [field]: value,
    };

    setVariants(updatedVariants);
  };

  return (
    <div className="seller-page">
      <form onSubmit={handleSubmit}>
        <h3>
          {editingId
            ? `✏️ ${t("addProduct.editTitle")}`
            : `➕ ${t("addProduct.createTitle")}`}{" "}
          ({t("addProduct.sellerDashboard")}:{" "}
          {user?.username})
        </h3>

        {/* نام محصول */}
        <div className="input-group">
          <label>{t("addProduct.name")}</label>

          <input
            className="form-input"
            type="text"
            name="name"
            onChange={handleGeneralChange}
            required
            value={generalFields.name || ""}
          />
        </div>

        {/* برند */}
        <div className="input-group">
          <label>{t("addProduct.brand")}</label>

          <input
            className="form-input"
            type="text"
            name="brand"
            onChange={handleGeneralChange}
            required
            value={generalFields.brand || ""}
          />
        </div>

        {/* =========================
            حالت افزودن محصول
        ========================= */}

        {!editingId && (
          <>
            <div className="input-group">
              <label>{t("addProduct.color")}</label>

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
              <label>{t("addProduct.price")}</label>

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
              <label>{t("addProduct.stock")}</label>

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
                  showAlert(
                    t("common.warning"),
                    t(
                      "addProduct.messages.completeVariant"
                    ),
                    "warning"
                  );

                  return;
                }

                setVariants([
                  ...variants,
                  currentVariant,
                ]);

                setCurrentVariant({
                  color: "",
                  price: "",
                  stock: "",
                });
              }}
            >
              ➕ {t("addProduct.addColor")}
            </button>

            {variants.map((v, index) => (
              <div key={index}>
                {v.color} | {v.price} | {v.stock}
              </div>
            ))}
          </>
        )}

        {/* =========================
            حالت ویرایش محصول
        ========================= */}
              {toast && (
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    )}

        {editingId && (
          <>
            <h4>{t("addProduct.productColors")}</h4>

            {variants.map((v, index) => (
              <div
                key={v.itemId}
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "10px",
                }}
              >
                <div className="input-group">
                  <label>{t("addProduct.color")}</label>

                  <input
                    className="form-input"
                    type="text"
                    value={v.color}
                    onChange={(e) =>
                      handleVariantEdit(
                        index,
                        "color",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="input-group">
                  <label>{t("addProduct.price")}</label>

                  <input
                    className="form-input"
                    type="number"
                    value={v.price}
                    onChange={(e) =>
                      handleVariantEdit(
                        index,
                        "price",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="input-group">
                  <label>{t("addProduct.stock")}</label>

                  <input
                    className="form-input"
                    type="number"
                    value={v.stock}
                    onChange={(e) =>
                      handleVariantEdit(
                        index,
                        "stock",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            ))}

            <div className="input-group">
              <label>{t("addProduct.newColor")}</label>

              <input
                className="form-input"
                type="text"
                name="color"
                value={currentVariant.color}
                onChange={handleVariantChange}
              />
            </div>

            <div className="input-group">
              <label>{t("addProduct.price")}</label>

              <input
                className="form-input"
                type="number"
                name="price"
                value={currentVariant.price}
                onChange={handleVariantChange}
              />
            </div>

            <div className="input-group">
              <label>{t("addProduct.stock")}</label>

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
                  showAlert(
                    t("common.warning"),
                    t(
                      "addProduct.messages.completeVariant"
                    ),
                    "warning"
                  );

                  return;
                }

                setVariants((prev) => [
                  ...prev,
                  {
                    itemId: Date.now(),
                    color: currentVariant.color,
                    price: Number(
                      currentVariant.price
                    ),
                    stock: Number(
                      currentVariant.stock
                    ),
                  },
                ]);

                setCurrentVariant({
                  color: "",
                  price: "",
                  stock: "",
                });
              }}
            >
              ➕ {t("addProduct.addNewColor")}
            </button>
          </>
        )}

        {/* نوع محصول */}

        <div className="input-group">
          <label>{t("addProduct.productType")}</label>

          <select
            value={productType}
            onChange={(e) =>
              setProductType(e.target.value)
            }
          >
            <option value="BASE">
              {t("addProduct.types.base")}
            </option>

            <option value="LAPTOP">
              {t("addProduct.types.laptop")}
            </option>

            <option value="MOBILE">
              {t("addProduct.types.mobile")}
            </option>
          </select>
        </div>

        {/* لپ تاپ */}

        {productType === "LAPTOP" && (
          <div className="special-fields laptop-fields">
            <h4>
              {t("addProduct.laptop.title")}
            </h4>

            <input
              className="special-fields-input"
              type="number"
              name="ram"
              placeholder={t(
                "addProduct.laptop.ram"
              )}
              value={laptopFields.ram}
              onChange={handleLaptopChange}
              required
            />

            <input
              className="special-fields-input"
              type="number"
              name="storage"
              placeholder={t(
                "addProduct.laptop.storage"
              )}
              value={laptopFields.storage}
              onChange={handleLaptopChange}
              required
            />

            <label>
              {t("addProduct.laptop.graphics")}

              <select
                name="graphics"
                value={laptopFields.graphics}
                onChange={handleLaptopChange}
              >
                <option value="false">
                  {t("common.no")}
                </option>

                <option value="true">
                  {t("common.yes")}
                </option>
              </select>
            </label>
          </div>
        )}

        {/* موبایل */}

        {productType === "MOBILE" && (
          <div className="special-fields mobile-fields">
            <h4>
              {t("addProduct.mobile.title")}
            </h4>

            <div>
              <label>
                {t("addProduct.mobile.camera")}
              </label>

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
                placeholder={t(
                  "addProduct.mobile.cameraPlaceholder"
                )}
                required
              />
            </div>

            <div>
              <label>
                {t("addProduct.mobile.battery")}
              </label>

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
                placeholder={t(
                  "addProduct.mobile.batteryPlaceholder"
                )}
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
            ? `💾 ${t("addProduct.saveChanges")}`
            : `➕ ${t("addProduct.createProduct")}`}
        </button>
      </form>

      {/* =========================
          INVENTORY
      ========================= */}

      <div className="inventory-section">
        <h3 className="inventory-title">
          📦 {t("addProduct.inventory.title")}
        </h3>

        {products.filter(
          (p) =>
            p.sellerName === user?.username
        ).length === 0 ? (
          <p className="inventory-empty">
            {t("addProduct.inventory.empty")}
          </p>
        ) : (
          <div className="table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>
                    {t("addProduct.inventory.itemId")}
                  </th>

                  <th>
                    {t("addProduct.inventory.name")}
                  </th>

                  <th>
                    {t("addProduct.inventory.brand")}
                  </th>

                  <th>
                    {t("addProduct.inventory.color")}
                  </th>

                  <th>
                    {t("addProduct.inventory.price")}
                  </th>

                  <th>
                    {t("addProduct.inventory.stock")}
                  </th>

                  <th>
                    {t("addProduct.inventory.type")}
                  </th>

                  <th>
                    {t(
                      "addProduct.inventory.specialFeatures"
                    )}
                  </th>

                  <th>
                    {t("common.edit")}
                  </th>

                  <th>
                    {t("common.delete")}
                  </th>
                </tr>
              </thead>

              <tbody>
                {products
                  .filter(
                    (p) =>
                      p.sellerName ===
                      user?.username
                  )
                  .map((item) => (
                    <tr key={item.itemId}>
                      <td>
                        <strong>
                          {item.variants?.[0]?.itemId ||
                            "-"}
                        </strong>
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
                            {Number(
                              v.price
                            ).toLocaleString()}
                          </div>
                        ))}
                      </td>

                      <td>
                        {item.variants?.map((v) => (
                          <div key={v.itemId}>
                            {v.stock}{" "}
                            {t(
                              "addProduct.inventory.unit"
                            )}
                          </div>
                        ))}
                      </td>

                      <td>
                        {item.productType ===
                        "LAPTOP"
                          ? `💻 ${t(
                              "addProduct.types.laptop"
                            )}`
                          : item.productType ===
                            "MOBILE"
                          ? `📱 ${t(
                              "addProduct.types.mobile"
                            )}`
                          : `📦 ${t(
                              "addProduct.types.base"
                            )}`}
                      </td>

                      <td
                        className={
                          item.productType ===
                          "LAPTOP"
                            ? "laptop-detail"
                            : item.productType ===
                              "MOBILE"
                            ? "mobile-detail"
                            : "base-detail"
                        }
                      >
                        {item.productType ===
                          "LAPTOP" && (
                          <span>
                            {t(
                              "addProduct.inventory.ram"
                            )}
                            : {item.ram}GB
                            <br />
                            {t(
                              "addProduct.inventory.storage"
                            )}
                            : {item.storage}GB
                          </span>
                        )}

                        {item.productType ===
                          "MOBILE" && (
                          <span>
                            {t(
                              "addProduct.inventory.camera"
                            )}
                            : {item.cameraMP}MP
                            <br />
                            {t(
                              "addProduct.inventory.battery"
                            )}
                            : {item.batteryMah}mAh
                            <br />
                            {item.is5G === "true" ||
                            item.is5G === true
                              ? "5G"
                              : "4G"}
                          </span>
                        )}

                        {item.productType ===
                          "BASE" && (
                          <span>---</span>
                        )}
                      </td>

                      <td>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() =>
                            handelEdit(item)
                          }
                        >
                          ✏️ {t("common.edit")}
                        </button>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() =>
                            handleDelete(
                              item.itemId
                            )
                          }
                        >
                          🗑️ {t("common.delete")}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AlertModal
        {...alert}
        onClose={closeAlert}
      />
    </div>
  );
}