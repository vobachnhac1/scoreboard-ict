const express = require('express');
const caidatRouter = express.Router();
const exportPDFController = require('../controllers/exportpdf.ts');
// controller

caidatRouter.get('/caidat', async (req, res) => {
  console.log('Router get Working');
  const rs = await exportPDFController.exportExcel(req, res);
  res.send(rs);
});

caidatRouter.post('/boctham-mau', async (req, res) => {
  console.log('/boctham-mau');
  const { soluong, noidung, uutien, danhsach } = req.body;
  const rs = await exportPDFController.thongtin_excel_mau(res, soluong, noidung, uutien, danhsach);
  //   res.send(rs);
});

module.exports = caidatRouter;
