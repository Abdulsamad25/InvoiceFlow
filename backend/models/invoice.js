import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  amount: {
    type: Number,
    required: true,
  },
  serialNumber: {
    type: String,
  },
});

const auditLogEntrySchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  details: {
    type: String,
  },
});

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    bankId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bank",
      required: true,
    },
    invoiceType: {
      type: String,
      enum: ["repair", "purchase"],
      required: true,
    },
    items: [invoiceItemSchema],
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    taxRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      default: 0,
    },
    currency: {
      type: String,
      default: "USD",
    },
    status: {
      type: String,
      enum: [
        "Draft",
        "Sent",
        "Viewed",
        "Pending",
        "Paid",
        "Overdue",
        "Cancelled",
      ],
      default: "Draft",
    },
    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paidDate: {
      type: Date,
    },
    notes: {
      type: String,
    },
    terms: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    auditLog: [auditLogEntrySchema],
  },
  {
    timestamps: true,
  },
);

invoiceSchema.pre("save", function () {
  if (this.items && Array.isArray(this.items)) {
    this.subtotal = this.items.reduce(
      (sum, item) => sum + (item.amount || 0),
      0,
    );
  } else {
    this.subtotal = 0;
  }
  this.taxAmount = (this.subtotal * (this.taxRate || 0)) / 100;
  this.total = this.subtotal + this.taxAmount - (this.discount || 0);
});

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;
