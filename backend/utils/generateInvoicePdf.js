const PDFDocument = require('pdfkit');

/**
 * Generates a clean, professional PDF invoice for an order and streams it directly to the response.
 * @param {Object} order - Full order object including user and items.product
 * @param {Object} res - Express response stream
 */
const generateInvoicePdf = (order, res) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Set response headers for PDF download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="Invoice_${order.id.slice(-8).toUpperCase()}.pdf"`
  );

  doc.pipe(res);

  const PRIMARY_COLOR = '#800020'; // Brand maroon
  const TEXT_DARK = '#222222';
  const TEXT_MUTED = '#666666';
  const BORDER_COLOR = '#E5E7EB';

  // ── HEADER ──────────────────────────────────────────────────────────────────
  doc
    .fillColor(PRIMARY_COLOR)
    .fontSize(22)
    .font('Helvetica-Bold')
    .text('SHIV FASHION', 40, 40);

  doc
    .fillColor(TEXT_MUTED)
    .fontSize(9)
    .font('Helvetica')
    .text('Authentic Ethnic Wear & Designer Chaniya Choli', 40, 66)
    .text('Surat, Gujarat, India | support@shivfashion.com', 40, 78);

  doc
    .fillColor(PRIMARY_COLOR)
    .fontSize(16)
    .font('Helvetica-Bold')
    .text('TAX INVOICE / RECEIPT', 350, 40, { align: 'right', width: 205 });

  doc
    .fillColor(TEXT_DARK)
    .fontSize(9)
    .font('Helvetica-Bold')
    .text(`Invoice No: `, 350, 62, { align: 'right', width: 120 })
    .font('Helvetica')
    .text(`INV-${order.id.slice(-8).toUpperCase()}`, 470, 62, { align: 'right', width: 85 });

  doc
    .font('Helvetica-Bold')
    .text(`Order Date: `, 350, 75, { align: 'right', width: 120 })
    .font('Helvetica')
    .text(new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }), 470, 75, { align: 'right', width: 85 });

  doc
    .font('Helvetica-Bold')
    .text(`Order Status: `, 350, 88, { align: 'right', width: 120 })
    .font('Helvetica')
    .text(order.status, 470, 88, { align: 'right', width: 85 });

  // Divider line
  doc
    .moveTo(40, 105)
    .lineTo(555, 105)
    .strokeColor(BORDER_COLOR)
    .lineWidth(1)
    .stroke();

  // ── BILLING & SHIPPING DETAILS ──────────────────────────────────────────────
  const billY = 118;

  // Billed / Shipped To
  doc
    .fillColor(PRIMARY_COLOR)
    .fontSize(11)
    .font('Helvetica-Bold')
    .text('DELIVERY & BILLING DETAILS', 40, billY);

  const customerName = order.user?.name || 'Customer';
  const customerEmail = order.user?.email || '—';
  const customerPhone = order.user?.phone || '—';
  const addr = order.shippingAddress || {};

  doc
    .fillColor(TEXT_DARK)
    .fontSize(9)
    .font('Helvetica-Bold')
    .text(customerName, 40, billY + 16)
    .font('Helvetica')
    .fillColor(TEXT_MUTED)
    .text(`Email: ${customerEmail}`, 40, billY + 28)
    .text(`Phone: ${customerPhone}`, 40, billY + 40)
    .text(`${addr.street || ''}`, 40, billY + 52)
    .text(`${addr.city || ''}, ${addr.state || ''} - ${addr.zipCode || ''}`, 40, billY + 64)
    .text(`${addr.country || 'India'}`, 40, billY + 76);

  // Payment Details (Right box)
  doc
    .fillColor(PRIMARY_COLOR)
    .fontSize(11)
    .font('Helvetica-Bold')
    .text('PAYMENT SUMMARY', 350, billY);

  doc
    .fillColor(TEXT_DARK)
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('Payment Status: ', 350, billY + 16)
    .font('Helvetica')
    .text(order.paymentStatus, 440, billY + 16);

  doc
    .font('Helvetica-Bold')
    .text('Method: ', 350, billY + 28)
    .font('Helvetica')
    .text(order.isCOD ? 'Cash on Delivery (Advance Paid)' : 'Online Razorpay / Card', 440, billY + 28);

  if (order.trackingNumber) {
    doc
      .font('Helvetica-Bold')
      .text('Tracking No: ', 350, billY + 40)
      .font('Helvetica')
      .text(order.trackingNumber, 440, billY + 40);
  }

  // ── ITEMS TABLE ─────────────────────────────────────────────────────────────
  const tableTop = 215;

  // Header background
  doc
    .rect(40, tableTop, 515, 22)
    .fillColor(PRIMARY_COLOR)
    .fill();

  // Header text
  doc
    .fillColor('#FFFFFF')
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('ITEM DESCRIPTION', 48, tableTop + 6)
    .text('SIZE / COLOR', 260, tableTop + 6)
    .text('QTY', 360, tableTop + 6, { align: 'center', width: 35 })
    .text('PRICE', 400, tableTop + 6, { align: 'right', width: 70 })
    .text('TOTAL', 475, tableTop + 6, { align: 'right', width: 75 });

  let y = tableTop + 26;

  let calculatedSubtotalPaise = 0;

  (order.items || []).forEach((item, index) => {
    const itemTotalPaise = item.price * item.quantity;
    calculatedSubtotalPaise += itemTotalPaise;

    // Alternating row background
    if (index % 2 === 1) {
      doc
        .rect(40, y - 4, 515, 22)
        .fillColor('#F9FAFB')
        .fill();
    }

    doc
      .fillColor(TEXT_DARK)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text(item.product?.name || 'Product', 48, y, { width: 205, lineBreak: false });

    doc
      .font('Helvetica')
      .fillColor(TEXT_MUTED)
      .text(`${item.size || 'Free size'} | ${item.color || 'Standard'}`, 260, y, { width: 95, lineBreak: false });

    doc
      .fillColor(TEXT_DARK)
      .text(String(item.quantity), 360, y, { align: 'center', width: 35 });

    doc
      .text(`Rs. ${(item.price / 100).toFixed(2)}`, 400, y, { align: 'right', width: 70 });

    doc
      .font('Helvetica-Bold')
      .text(`Rs. ${(itemTotalPaise / 100).toFixed(2)}`, 475, y, { align: 'right', width: 75 });

    y += 24;
  });

  // Table bottom border
  doc
    .moveTo(40, y)
    .lineTo(555, y)
    .strokeColor(BORDER_COLOR)
    .lineWidth(1)
    .stroke();

  y += 12;

  // ── TOTALS BOX ──────────────────────────────────────────────────────────────
  const totalsX = 330;

  doc
    .fillColor(TEXT_MUTED)
    .fontSize(9)
    .font('Helvetica')
    .text('Subtotal:', totalsX, y)
    .text(`Rs. ${(calculatedSubtotalPaise / 100).toFixed(2)}`, 435, y, { align: 'right', width: 115 });

  y += 15;

  if (order.couponCode) {
    doc
      .text(`Coupon Discount (${order.couponCode}):`, totalsX, y)
      .text(`Applied`, 435, y, { align: 'right', width: 115 });
    y += 15;
  }

  doc
    .text('Shipping & Delivery:', totalsX, y)
    .text('Free', 435, y, { align: 'right', width: 115 });

  y += 15;

  // Grand Total line
  doc
    .moveTo(totalsX, y)
    .lineTo(555, y)
    .strokeColor(BORDER_COLOR)
    .lineWidth(1)
    .stroke();

  y += 6;

  doc
    .rect(totalsX - 6, y - 2, 231, 24)
    .fillColor('#FEF2F2')
    .fill();

  doc
    .fillColor(PRIMARY_COLOR)
    .fontSize(11)
    .font('Helvetica-Bold')
    .text('GRAND TOTAL:', totalsX, y + 4)
    .text(`Rs. ${(order.totalAmount / 100).toFixed(2)}`, 435, y + 4, { align: 'right', width: 115 });

  // ── FOOTER & TERMS ──────────────────────────────────────────────────────────
  const footerY = 720;

  doc
    .moveTo(40, footerY)
    .lineTo(555, footerY)
    .strokeColor(BORDER_COLOR)
    .lineWidth(1)
    .stroke();

  doc
    .fillColor(PRIMARY_COLOR)
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('Thank you for choosing Shiv Fashion!', 40, footerY + 12, { align: 'center', width: 515 });

  doc
    .fillColor(TEXT_MUTED)
    .fontSize(8)
    .font('Helvetica')
    .text(
      'Returns & Exchanges: Accepted within 7 days of delivery for unworn items with tags intact.\nThis is a computer-generated tax invoice and requires no physical signature.',
      40,
      footerY + 26,
      { align: 'center', width: 515, lineGap: 3 }
    );

  doc.end();
};

module.exports = { generateInvoicePdf };
