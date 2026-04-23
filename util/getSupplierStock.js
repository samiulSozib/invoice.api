const getSupplierStock = async (supplier_id) => {

  const totalBuy = await db.topUpTransaction.sum("topup_amount",{
    where:{
      supplier_id,
      transaction_type:"purchase"
    }
  });

  const totalSell = await db.topUpTransaction.sum("topup_amount",{
    where:{
      supplier_id,
      transaction_type:"sale"
    }
  });

  return (totalBuy || 0) - (totalSell || 0);
};