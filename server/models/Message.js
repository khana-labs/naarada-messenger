import mongoose from "mongoose";

const hopSchema = new mongoose.Schema(
  {
    naradaId: {
      type: String,
      required: true,
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    senderNaradaId: {
      type: String,
      required: true,
    },

    receiverNaradaId: {
      type: String,
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    encrypted: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "relaying",
        "delivered",
      ],
      default: "pending",
    },

    hops: {
      type: [hopSchema],
      default: [],
    },

    route: {
      type: [String],
      default: [],
    },

    currentHop: {
      type: Number,
      default: 0,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model(
  "Message",
  messageSchema
);

export default Message;