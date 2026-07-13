import React, { useState } from 'react';
import AddProductForm from '../components/AddProductForm'; // همین فرمی که گام اول ساختیم
import Discount from './Discount';


export default function SellerDashboard({user}) {

  return (
    <div style={{ padding: '20px' }}>
      <h1>داشبورد فروشنده 🏪</h1>
      <hr />
      <AddProductForm user = {user}/>
      <Discount />
    </div>
  );
}