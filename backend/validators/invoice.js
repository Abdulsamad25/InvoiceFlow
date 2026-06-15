import { body } from "express-validator";

export const createInvoiceValidation = [
  body("clientId").notEmpty().withMessage("Client is required"),
  body("bankId").notEmpty().withMessage("Bank details are required"),
  body("invoiceType")
    .isIn(["repair", "purchase"])
    .withMessage("Invoice type must be either repair or purchase"),
  body("items")
    .isArray({ min: 1 })
    .withMessage("At least one item is required"),
  body("items.*.name").notEmpty().withMessage("Item name is required"),
  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
  body("items.*.price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("items.*.serialNumber").custom((value, { req, path }) => {
    const itemIndex = path.match(/items\[(\d+)\]/)?.[1];
    const invoiceType = req.body.invoiceType;

    if (invoiceType === "repair") {
      if (!value || value.trim() === "") {
        throw new Error("Serial number is required for repair invoices");
      }
    }
    return true;
  }),
  body("issueDate").isISO8601().withMessage("Valid issue date is required"),
  body("dueDate").isISO8601().withMessage("Valid due date is required"),
];

export const updateInvoiceValidation = [
  body("clientId").optional().notEmpty().withMessage("Client is required"),
  body("bankId").optional().notEmpty().withMessage("Bank details are required"),
  body("invoiceType")
    .optional()
    .isIn(["repair", "purchase"])
    .withMessage("Invoice type must be either repair or purchase"),
  body("items")
    .optional()
    .isArray({ min: 1 })
    .withMessage("At least one item is required"),
  body("status")
    .optional()
    .isIn([
      "Draft",
      "Sent",
      "Viewed",
      "Pending",
      "Paid",
      "Overdue",
      "Cancelled",
    ])
    .withMessage("Invalid status"),
];
