import mongoose from 'mongoose';

// Single shipment item schema
const ItemSchema = new mongoose.Schema({
  receiptNo: {
    type: String,
    required: true
  },
  refNo: {
    type: String,
    required: true
  },
  insurance: {
    type: Number,
    required: true
  },
  vppAmount: {
    type: Number,
    required: true
  },
  toPay: {
    type: String,
    required: true,
    enum: ['pay', 'paid', 'none']
  },
  weight: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  }
});

const BookingSchema = new mongoose.Schema(
  {
    // Auto-generated booking ID
    bookingId: {
      type: String,
      unique: true
    },

    // Linked customer


    // Start & end stations
    startStation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'manageStation',
      required: true
    },
    endStation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'manageStation',
      required: true
    },

    // Customer info
    firstName: {
      type: String,

    },
    middleName: {
      type: String,
      default: ''
    },
    lastName: {
      type: String,

    },
    mobile: {
      type: String,

    },
    email: {
      type: String,
      required: true,
      validate: {
        validator: (v) =>
          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(v),
        message: (props) => `${props.value} is not a valid email address!`
      }
    },
    locality: {
      type: String
    },

    // Booking & delivery dates
    bookingDate: {
      type: Date,
      required: true
    },
    deliveryDate: {
      type: Date,
      required: true
    },

    // Sender information
    senderName: {
      type: String,
      required: true
    },
    senderGgt: {
      type: String,
      required: true
    },
    senderLocality: {
      type: String,
      required: true
    },
    fromState: {
      type: String,
      required: true
    },
    fromCity: {
      type: String,
      required: true
    },
    senderPincode: {
      type: String,
      required: true,
      validate: {
        validator: (v) => /^\d{6}$/.test(v),
        message: (props) => `${props.value} is not a valid pincode!`
      }
    },

    // Receiver information
    receiverName: {
      type: String,
      required: true
    },
    receiverGgt: {
      type: String,
      required: true
    },
    receiverLocality: {
      type: String,
      required: true
    },
    toState: {
      type: String,
      required: true
    },
    toCity: {
      type: String,
      required: true
    },
    toPincode: {
      type: String,
      required: true,
      validate: {
        validator: (v) => /^\d{6}$/.test(v),
        message: (props) => `${props.value} is not a valid pincode!`
      }
    },

    // Shipment items
    items: {
      type: [ItemSchema],
      required: true,
      validate: {
        validator: (v) => v.length > 0,
        message: 'At least one item is required.'
      }
    },

    // Optional comments
    addComment: {
      type: String,
      default: ''
    },

    // Charges
    freight: {
      type: Number,
      required: true
    },
    ins_vpp: {
      type: Number,
      required: true
    },
    cgst: {
      type: Number,
      required: true
    },
    sgst: {
      type: Number,
      required: true
    },
    igst: {
      type: Number,
      required: true
    },

    // Calculated totals
    billTotal: {
      type: Number
    },
    grandTotal: {
      type: Number
    },
    computedTotalRevenue: {
      type: Number,
      default: function () {
        return this.grandTotal;
      }
    },

    // Status
    activeDelivery: {
      type: Boolean,
      default: false
    },
    totalCancelled: {
      type: Number,
      default: 0
    },
    invoiceGenerated: {
      type: Boolean,
      default: false
    },
    createdByUser: {
      type: String,

    },
    createdByRole: {
      type: String,
      enum: ['admin', 'supervisor'],

    },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    isApproved: { type: Boolean, default: false },
    requestedByRole: { type: String, default: 'public' },
    approvedBy: { type: String },
    approvedAt: { type: Date },
    
    isDelivered: {
  type: Boolean,
  default: false,
}


  },
  { timestamps: true }
);

// Auto-generate booking ID
BookingSchema.pre('validate', function (next) {
  if (!this.bookingId) {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    this.bookingId = `BHPAR${randomDigits}BOOK`;
  }
  next();
});

// Calculate totals before saving
BookingSchema.pre('save', function (next) {
  // Calculate total from all items
  const itemAmounts = this.items.map(item => item.amount || 0);
  const totalItemAmount = itemAmounts.reduce((sum, val) => sum + val, 0);

  // Set billTotal
  this.billTotal = totalItemAmount;

  // Calculate grandTotal
  this.grandTotal =
    this.billTotal +
    (this.freight || 0) +
    (this.ins_vpp || 0) +
    (this.cgst || 0) +
    (this.sgst || 0) +
    (this.igst || 0);

  // Assign revenue
  this.computedTotalRevenue = this.grandTotal;

  next();
});

const Booking = mongoose.model('Booking', BookingSchema);
export default Booking;