import React from "react";
import AddProductForm from "../components/AddProductForm";
import Discount from "./Discount";
import "./SellerDashboard.css";

export default function SellerDashboard({ user }) {
  return (
    <div className="seller-dashboard">

      <div className="dashboard-header">
        <h1>🏪 داشبورد فروشنده</h1>
        <p>مدیریت محصولات، موجودی و کدهای تخفیف</p>
      </div>

      <AddProductForm user={user} />

      <Discount />

    </div>
  );
}