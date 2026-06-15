import { validationResult } from "express-validator";
import Invoice from "../models/invoice.js";
import Client from "../models/client.js";
import Bank from "../models/bank.js";
import { generateInvoiceNumber } from "../utils/generateInvoiceNumber.js";
import { logAction } from "../utils/logger.js";
import puppeteer from "puppeteer";
import https from "https";

// Helper function to convert image URL to base64
const getBase64FromUrl = (url) => {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          const buffer = Buffer.concat(chunks);
          const base64 = buffer.toString("base64");
          const mimeType = response.headers["content-type"] || "image/png";
          resolve(`data:${mimeType};base64,${base64}`);
        });
        response.on("error", reject);
      })
      .on("error", reject);
  });
};

export const createInvoice = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      clientId,
      bankId,
      invoiceType,
      items,
      taxRate,
      discount,
      currency,
      issueDate,
      dueDate,
      notes,
      terms,
      status,
    } = req.body;

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const bank = await Bank.findById(bankId);
    if (!bank) {
      return res.status(404).json({ message: "Bank details not found" });
    }

    const processedItems = items.map((item) => ({
      ...item,
      amount: item.quantity * item.price,
    }));

    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await Invoice.create({
      invoiceNumber,
      clientId,
      bankId,
      invoiceType,
      items: processedItems,
      taxRate: taxRate || 0,
      discount: discount || 0,
      currency: currency || "USD",
      issueDate: issueDate || new Date(),
      dueDate,
      notes,
      terms,
      status: status || "Draft",
      createdBy: req.user.id,
      auditLog: [
        {
          action: "Invoice created",
          userId: req.user.id,
          details: "Invoice created",
        },
      ],
    });

    await logAction(
      req.user.id,
      "invoice_created",
      "invoice",
      invoice._id,
      `Invoice ${invoiceNumber} created`,
      req.ip,
    );

    res.status(201).json({
      success: true,
      invoice: invoice,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllInvoices = async (req, res) => {
  try {
    const {
      status,
      clientId,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (clientId) {
      query.clientId = clientId;
    }

    if (startDate || endDate) {
      query.issueDate = {};
      if (startDate) query.issueDate.$gte = new Date(startDate);
      if (endDate) query.issueDate.$lte = new Date(endDate);
    }

    const invoices = await Invoice.find(query)
      .populate("clientId")
      .populate("bankId")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Invoice.countDocuments(query);

    res.json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      invoices,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("clientId")
      .populate("bankId")
      .populate("createdBy", "name email signature")
      .populate("auditLog.userId", "name email");

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json({
      success: true,
      invoice,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const {
      clientId,
      bankId,
      invoiceType,
      items,
      taxRate,
      discount,
      currency,
      issueDate,
      dueDate,
      notes,
      terms,
      status,
    } = req.body;

    if (items) {
      invoice.items = items.map((item) => ({
        ...item,
        amount: item.quantity * item.price,
      }));
    }

    if (clientId) invoice.clientId = clientId;
    if (bankId) invoice.bankId = bankId;
    if (invoiceType) invoice.invoiceType = invoiceType;
    if (taxRate !== undefined) invoice.taxRate = taxRate;
    if (discount !== undefined) invoice.discount = discount;
    if (currency) invoice.currency = currency;
    if (issueDate) invoice.issueDate = issueDate;
    if (dueDate) invoice.dueDate = dueDate;
    if (notes !== undefined) invoice.notes = notes;
    if (terms !== undefined) invoice.terms = terms;

    const oldStatus = invoice.status;
    if (status && status !== oldStatus) {
      invoice.status = status;

      if (status === "Paid") {
        invoice.paidDate = new Date();
      }

      invoice.auditLog.push({
        action: "Status changed",
        userId: req.user.id,
        details: `Status changed from ${oldStatus} to ${status}`,
      });
    }

    invoice.auditLog.push({
      action: "Invoice updated",
      userId: req.user.id,
      details: "Invoice details updated",
    });

    await invoice.save();

    await logAction(
      req.user.id,
      "invoice_updated",
      "invoice",
      invoice._id,
      `Invoice ${invoice.invoiceNumber} updated`,
      req.ip,
    );

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate("clientId")
      .populate("bankId")
      .populate("createdBy", "name email")
      .populate("auditLog.userId", "name email");

    res.json({
      success: true,
      invoice: populatedInvoice,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    // Normalize status to title case
    const normalizedStatus =
      status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    const validStatuses = [
      "Draft",
      "Sent",
      "Viewed",
      "Pending",
      "Paid",
      "Overdue",
      "Cancelled",
    ];
    if (!validStatuses.includes(normalizedStatus)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const oldStatus = invoice.status;
    if (normalizedStatus === oldStatus) {
      return res
        .status(400)
        .json({ message: "Invoice is already in this status" });
    }

    invoice.status = normalizedStatus;

    if (normalizedStatus === "Paid") {
      invoice.paidDate = new Date();
    }

    invoice.auditLog.push({
      action: "Status changed",
      userId: req.user.id,
      details: `Status changed from ${oldStatus} to ${normalizedStatus}`,
    });

    await invoice.save();

    await logAction(
      req.user.id,
      "invoice_status_updated",
      "invoice",
      invoice._id,
      `Invoice ${invoice.invoiceNumber} status changed from ${oldStatus} to ${normalizedStatus}`,
      req.ip,
    );

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate("clientId")
      .populate("bankId")
      .populate("createdBy", "name email")
      .populate("auditLog.userId", "name email");

    res.json({
      success: true,
      invoice: populatedInvoice,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (invoice.status === "Paid") {
      return res.status(400).json({ message: "Cannot delete paid invoices" });
    }

    await invoice.deleteOne();

    await logAction(
      req.user.id,
      "invoice_deleted",
      "invoice",
      invoice._id,
      `Invoice ${invoice.invoiceNumber} deleted`,
      req.ip,
    );

    res.json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const duplicateInvoice = async (req, res) => {
  try {
    const originalInvoice = await Invoice.findById(req.params.id);

    if (!originalInvoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const invoiceNumber = await generateInvoiceNumber();

    const newInvoice = await Invoice.create({
      invoiceNumber,
      clientId: originalInvoice.clientId,
      bankId: originalInvoice.bankId,
      items: originalInvoice.items,
      taxRate: originalInvoice.taxRate,
      discount: originalInvoice.discount,
      currency: originalInvoice.currency,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      notes: originalInvoice.notes,
      terms: originalInvoice.terms,
      status: "Draft",
      createdBy: req.user.id,
      auditLog: [
        {
          action: "Invoice duplicated",
          userId: req.user.id,
          details: `Duplicated from ${originalInvoice.invoiceNumber}`,
        },
      ],
    });

    await logAction(
      req.user.id,
      "invoice_duplicated",
      "invoice",
      newInvoice._id,
      `Invoice duplicated from ${originalInvoice.invoiceNumber}`,
      req.ip,
    );

    const populatedInvoice = await Invoice.findById(newInvoice._id)
      .populate("clientId")
      .populate("bankId")
      .populate("createdBy", "name email");

    res.status(201).json({
      success: true,
      invoice: populatedInvoice,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInvoiceStats = async (req, res) => {
  try {
    const totalInvoices = await Invoice.countDocuments();
    const draftInvoices = await Invoice.countDocuments({ status: "Draft" });
    const pendingInvoices = await Invoice.countDocuments({
      status: { $in: ["Pending", "Sent", "Viewed"] },
    });
    const paidInvoices = await Invoice.countDocuments({ status: "Paid" });
    const overdueInvoices = await Invoice.countDocuments({ status: "Overdue" });
    const totalClients = await Client.countDocuments();

    const totalRevenueAgg = await Invoice.aggregate([
      { $match: { status: "Paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    const pendingRevenueAgg = await Invoice.aggregate([
      { $match: { status: { $in: ["Pending", "Sent", "Viewed"] } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    const pendingRevenue = pendingRevenueAgg[0]?.total || 0;
    const paidPercentage = totalInvoices
      ? Math.round((paidInvoices / totalInvoices) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        totalInvoices,
        totalClients,
        paidInvoices,
        paidPercentage,
        totalRevenue,
        pendingRevenue,
        draftInvoices,
        pendingInvoices,
        overdueInvoices,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecentInvoices = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 5;

    const invoices = await Invoice.find()
      .populate("clientId", "name company email")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const formattedInvoices = invoices.map((invoice) => ({
      id: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status?.toLowerCase(),
      total: invoice.total,
      currency: invoice.currency,
      dueDate: invoice.dueDate,
      client: invoice.clientId
        ? {
            id: invoice.clientId._id,
            name: invoice.clientId.name,
            company: invoice.clientId.company,
            email: invoice.clientId.email,
          }
        : null,
    }));

    res.json({
      success: true,
      data: formattedInvoices,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const exportInvoicePDF = async (req, res) => {
  try {
    console.log("Starting PDF export for invoice:", req.params.id);

    const invoice = await Invoice.findById(req.params.id)
      .populate("clientId")
      .populate("bankId")
      .populate("createdBy", "name email signature");

    if (!invoice) {
      console.log("Invoice not found:", req.params.id);
      return res.status(404).json({ message: "Invoice not found" });
    }

    console.log("Invoice found, converting logo to base64...");

    // Convert logo to base64
    let logoBase64;
    try {
      logoBase64 = await getBase64FromUrl(
        "https://res.cloudinary.com/dvd7wbty8/image/upload/v1769988042/Sterling-pro-logo_fuzfap.png",
      );
      console.log("Logo converted to base64 successfully");
    } catch (error) {
      console.error("Error converting logo:", error);
      // Use a fallback or empty string
      logoBase64 = "";
    }

    console.log("Generating HTML...");

    // Generate HTML for the invoice
    const html = generateInvoiceHTML(invoice, logoBase64);
    console.log("HTML generated, length:", html.length);

    console.log("Launching puppeteer...");

    // Use puppeteer to generate PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    console.log("Browser launched, creating new page...");

    const page = await browser.newPage();

    // Set viewport for better PDF generation
    await page.setViewport({ width: 1200, height: 1600 });

    console.log("Setting content...");

    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 60000,
    });

    console.log("Content set successfully, generating PDF...");

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });

    console.log("PDF generated, closing browser...");

    await browser.close();

    console.log("PDF export successful, sending response...");

    await logAction(
      req.user.id,
      "invoice_exported_pdf",
      "invoice",
      invoice._id,
      `Invoice ${invoice.invoiceNumber} exported as PDF`,
      req.ip,
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
    );
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF export error:", error);
    console.error("Error stack:", error.stack);
    res
      .status(500)
      .json({ message: "Error generating PDF", error: error.message });
  }
};

// Helper function to generate invoice HTML - EXACT Sterling Pro Design
const generateInvoiceHTML = (invoice, logoBase64 = "") => {
  // Calculate values
  const subtotal =
    invoice.subtotal ||
    invoice.items.reduce((sum, item) => sum + item.amount, 0);
  const vatAmount = invoice.taxAmount || subtotal * (invoice.taxRate / 100);
  const total = invoice.total || subtotal + vatAmount - (invoice.discount || 0);

  // Helper function to convert number to words
  const convertToWords = (num) => {
    const ones = [
      "",
      "ONE",
      "TWO",
      "THREE",
      "FOUR",
      "FIVE",
      "SIX",
      "SEVEN",
      "EIGHT",
      "NINE",
    ];
    const tens = [
      "",
      "",
      "TWENTY",
      "THIRTY",
      "FORTY",
      "FIFTY",
      "SIXTY",
      "SEVENTY",
      "EIGHTY",
      "NINETY",
    ];
    const teens = [
      "TEN",
      "ELEVEN",
      "TWELVE",
      "THIRTEEN",
      "FOURTEEN",
      "FIFTEEN",
      "SIXTEEN",
      "SEVENTEEN",
      "EIGHTEEN",
      "NINETEEN",
    ];

    if (num === 0) return "ZERO";

    const numStr = Math.floor(num).toString();
    let words = "";

    if (numStr.length > 6) {
      const millions = parseInt(numStr.slice(0, -6));
      words += convertToWords(millions) + " MILLION ";
      return words + convertToWords(parseInt(numStr.slice(-6)));
    }

    if (numStr.length > 3) {
      const thousands = parseInt(numStr.slice(0, -3));
      words += convertToWords(thousands) + " THOUSAND ";
      return words + convertToWords(parseInt(numStr.slice(-3)));
    }

    if (numStr.length === 3) {
      words += ones[parseInt(numStr[0])] + " HUNDRED ";
      return words + convertToWords(parseInt(numStr.slice(-2)));
    }

    if (num >= 20) {
      words += tens[Math.floor(num / 10)] + " ";
      if (num % 10 !== 0) words += ones[num % 10];
      return words.trim();
    }

    if (num >= 10) {
      return teens[num - 10];
    }

    return ones[num];
  };

  const totalInWords = convertToWords(total);

  // Format date with ordinal suffix (2nd FEBRUARY 2026)
  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const issueDate = new Date(invoice.issueDate);
  const issueDay = issueDate.getDate();
  const issueMonth = issueDate
    .toLocaleDateString("en-US", { month: "long" })
    .toUpperCase();
  const issueYear = issueDate.getFullYear();

  // Format currency without symbol (just numbers with commas)
  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Build items rows
  let itemsHTML = "";

  if (
    invoice.invoiceType === "repair" &&
    invoice.items.some((item) => item.serialNumber)
  ) {
    // For repair invoices with serial numbers, create a row for each serial number
    let allSerialRows = [];
    
    invoice.items.forEach((item) => {
      if (item.serialNumber) {
        const serialNumbers = item.serialNumber
          .split(",")
          .map((sn) => sn.trim())
          .filter((sn) => sn);
        
        serialNumbers.forEach((sn) => {
          allSerialRows.push({
            serialNumber: sn,
            description: item.description || "",
            amount: item.amount / serialNumbers.length,
            itemName: item.name
          });
        });
      }
    });

    // Now generate rows - build column 1 content first to calculate spacing
    let col1Parts = [];
    
    // Terminal type and item name at top
    col1Parts.push(`${invoice.invoiceType === "repair" ? "Terminal Repair" : "Terminal Purchase"}`);
    col1Parts.push(`${allSerialRows[0].itemName}`);
    
    // All serial numbers
    allSerialRows.forEach((row) => {
      col1Parts.push(`SN: ${row.serialNumber}`);
    });
    
    // VAT at bottom
    col1Parts.push(`V.A.T @ ${invoice.taxRate}%`);
    
    const col1Content = col1Parts.join("<br><br>");
    
    // Column 2: All descriptions aligned with their serial numbers (skip first 2 parts for terminal type and item name)
    let col2Parts = ["", ""]; // Empty slots for terminal type and item name
    allSerialRows.forEach((row) => {
      col2Parts.push(row.description || "");
    });
    col2Parts.push(""); // Empty slot for VAT line
    
    const col2Content = col2Parts.join("<br><br>");
    
    // Column 3: All amounts aligned with their serial numbers, VAT amount at bottom
    let col3Parts = ["", ""]; // Empty slots for terminal type and item name
    allSerialRows.forEach((row) => {
      col3Parts.push(formatAmount(row.amount));
    });
    col3Parts.push(formatAmount(vatAmount)); // VAT amount
    
    const col3Content = col3Parts.join("<br><br>");
    
    itemsHTML = `
      <tr>
        <td style="border-left: 1px solid #000; border-right: 1px solid #000; padding: 10px 12px; font-size: 13px; vertical-align: top; line-height: 1.6;">
          ${col1Content}
        </td>
        <td style="border-right: 1px solid #000; padding: 10px 12px; font-size: 13px; vertical-align: top; line-height: 1.6;">
          ${col2Content}
        </td>
        <td style="border-right: 1px solid #000; padding: 10px 12px; font-size: 13px; vertical-align: top; text-align: right; line-height: 1.6;">
          ${col3Content}
        </td>
      </tr>
    `;
  } else {
    // For purchase invoices or items without serial numbers - single row
    const mainItem = invoice.items.find((item) => item.name) || invoice.items[0];
    const totalAmount = invoice.items.reduce((sum, item) => sum + item.amount, 0);

    let col1Content = `${invoice.invoiceType === "repair" ? "Terminal Repair" : "Terminal Purchase"}<br><br>${mainItem.name || ""}`;
    
    // Collect all serial numbers if present
    const allSerialNumbers = invoice.items
      .filter(item => item.serialNumber)
      .flatMap(item => item.serialNumber.split(",").map(sn => sn.trim()))
      .filter(sn => sn);
    
    if (allSerialNumbers.length > 0) {
      allSerialNumbers.forEach(sn => {
        col1Content += `<br><br>SN: ${sn}`;
      });
    }
    
    col1Content += `<br><br>V.A.T @ ${invoice.taxRate}%`;

    // Collect all descriptions
    const descriptions = invoice.items
      .map((item) => item.description)
      .filter((d) => d);
    const col2Content = descriptions.join("<br><br>");

    const col3Content = `${formatAmount(totalAmount)}<br><br>${formatAmount(vatAmount)}`;

    itemsHTML = `
      <tr>
        <td style="border-left: 1px solid #000; border-right: 1px solid #000; padding: 10px 12px; font-size: 13px; vertical-align: top; line-height: 1.6;">
          ${col1Content}
        </td>
        <td style="border-right: 1px solid #000; padding: 10px 12px; font-size: 13px; vertical-align: top; line-height: 1.6;">
          ${col2Content}
        </td>
        <td style="border-right: 1px solid #000; padding: 10px 12px; font-size: 13px; vertical-align: top; text-align: right; line-height: 1.6;">
          ${col3Content}
        </td>
      </tr>
    `;
  }

  // TOTAL row - has vertical line between col1 and col2, and between col2 and col3
  const totalRow = `
    <tr class="total-row">
      <td style="border-left: 1px solid #000; border-right: 1px solid #000; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 10px 12px; font-size: 14px; font-weight: bold;">
        <strong>TOTAL</strong>
      </td>
      <td style="border-right: 1px solid #000; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 10px 12px; font-size: 14px; font-weight: bold;">
      </td>
      <td style="border-right: 1px solid #000; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 10px 12px; font-size: 14px; font-weight: bold; text-align: right;">
        <strong>${formatAmount(total)}</strong>
      </td>
    </tr>
  `;

  // Amount in Words row
  const wordsRow = `
    <tr class="amount-words-row">
      <td style="border-left: 1px solid #000; border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 10px 12px; font-size: 12px; font-weight: bold;">
        <strong>AMOUNT IN WORDS</strong>
      </td>
      <td colspan="2" style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 10px 12px; font-size: 12px; font-weight: bold;">
        <strong>${totalInWords} ${invoice.currency === "NGN" ? "NAIRA" : invoice.currency} ONLY.</strong>
      </td>
    </tr>
  `;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Calibri', 'Arial', sans-serif;
      padding: 30px 40px;
      background: #fff;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: flex-end;
      align-items: flex-start;
      margin-bottom: 40px;
    }
    .logo {
      width: 240px;
      margin-bottom: 15px;
    }
    .logo img {
      width: 100%;
      height: auto;
    }
    .invoice-info {
      text-align: right;
    }
    .invoice-title {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 20px;
      letter-spacing: 2px;
    }
    .invoice-meta {
      font-size: 13px;
      line-height: 2;
    }
    .invoice-meta div {
      margin-bottom: 2px;
    }
    .client-box {
      border: 2px solid #000;
      padding: 15px 18px;
      margin-bottom: 25px;
      max-width: 350px;
    }
    .client-name {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 6px;
      text-transform: uppercase;
    }
    .client-address {
      font-size: 13px;
      line-height: 1.5;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 0;
    }
    th {
      background: #fff;
      border: 1px solid #000;
      padding: 10px 12px;
      text-align: left;
      font-size: 13px;
      font-weight: bold;
      text-transform: uppercase;
    }
    th:last-child {
      text-align: right;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-top: 60px;
    }
    .signature-section {
      flex: 1;
    }
    .for-text {
      font-size: 12px;
      margin-bottom: 8px;
    }
    .signature-line {
      border-bottom: 2px solid #000;
      width: 180px;
      height: 45px;
      margin-bottom: 3px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }
    .signature-line img {
      max-width: 160px;
      max-height: 40px;
      object-fit: contain;
    }
    .signature-name {
      font-size: 13px;
      font-weight: bold;
      text-transform: uppercase;
    }
    .bank-info {
      flex: 1;
      text-align: right;
      font-size: 13px;
      line-height: 1.8;
    }
    @media print {
      body { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="invoice-info">
        <div class="logo">
          ${
            logoBase64
              ? `<img src="${logoBase64}" alt="SterlingPRO Logo" />`
              : '<div style="width: 240px; height: 80px; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold;">SterlingPRO</div>'
          }
        </div>
        <div class="invoice-title">INVOICE</div>
        <div class="invoice-meta">
          <div>${issueDay}<sup>${getOrdinalSuffix(issueDay)}</sup> ${issueMonth} ${issueYear}</div>
          <div><strong>INVOICE NO.</strong> – ${invoice.invoiceNumber}</div>
          ${invoice.clientId?.taxId ? `<div><strong>TIN NO-</strong> ${invoice.clientId.taxId}</div>` : ""}
        </div>
      </div>
    </div>

    <!-- Client Info -->
    <div class="client-box">
      <div class="client-name">${invoice.clientId?.company || invoice.clientId?.name || "CLIENT NAME"}</div>
      ${invoice.clientId?.address ? `<div class="client-address">${invoice.clientId.address.replace(/,/g, ",<br>")}</div>` : ""}
    </div>

    <!-- Items Table -->
    <table>
      <thead>
        <tr>
          <th style="width: 28%;">DESCRIPTION</th>
          <th style="width: 50%;">DESCRIPTION</th>
          <th style="width: 22%; text-align: right;">AMOUNT</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
        ${totalRow}
        ${wordsRow}
      </tbody>
    </table>

    <!-- Footer -->
    <div class="footer">
      <div class="signature-section">
        <div class="for-text">FOR: SterlingPRO.</div>
        <div class="signature-line">
          ${invoice.createdBy?.signature ? `<img src="${invoice.createdBy.signature}" alt="Signature" />` : ""}
        </div>
        <div class="signature-name">${invoice.createdBy?.name?.toUpperCase() || "AUTHORIZED SIGNATORY"}</div>
      </div>
      ${
        invoice.bankId
          ? `
      <div class="bank-info">
        <strong>Account Name:</strong> ${invoice.bankId.accountName}<br>
        <strong>Account Number:</strong> ${invoice.bankId.accountNumber}
      </div>
      `
          : ""
      }
    </div>
  </div>
</body>
</html>
  `;
};

// Helper function to format currency
const formatCurrency = (amount, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};
