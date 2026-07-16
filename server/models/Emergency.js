import mongoose from "mongoose";

const emergencyUpdateSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        "active",
        "acknowledged",
        "responding",
        "resolved",
        "cancelled",
      ],
      required: true,
    },

    note: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
);

const emergencySchema = new mongoose.Schema(
  {
    emergencyId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    naradaId: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "medical",
        "fire",
        "trapped",
        "police",
        "evacuation",
        "shelter",
        "food_water",
        "missing_person",
        "other",
      ],
      required: true,
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "high",
      index: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    peopleAffected: {
      type: Number,
      min: 1,
      max: 10000,
      default: 1,
    },

    location: {
      latitude: {
        type: Number,
        min: -90,
        max: 90,
        default: null,
      },

      longitude: {
        type: Number,
        min: -180,
        max: 180,
        default: null,
      },

      zone: {
        type: String,
        trim: true,
        default: "Unknown zone",
      },

      accuracy: {
        type: Number,
        min: 0,
        default: null,
      },
    },

    batteryLevel: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "active",
        "acknowledged",
        "responding",
        "resolved",
        "cancelled",
      ],
      default: "active",
      index: true,
    },

    priorityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 80,
      index: true,
    },

    assignedAuthority: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    assignedTeam: {
      type: String,
      trim: true,
      default: "",
    },

    route: {
      type: [String],
      default: [],
    },

    currentHop: {
      type: Number,
      min: 0,
      default: 0,
    },

    relayStatus: {
      type: String,
      enum: [
        "created",
        "relaying",
        "authority_reached",
        "failed",
      ],
      default: "created",
    },

    updates: {
      type: [emergencyUpdateSchema],
      default: [],
    },

    acknowledgedAt: {
      type: Date,
      default: null,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    expiresAt: {
      type: Date,
      default: () =>
        new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  },
  {
    timestamps: true,
  }
);

emergencySchema.index({
  status: 1,
  severity: 1,
  createdAt: -1,
});

emergencySchema.index({
  "location.latitude": 1,
  "location.longitude": 1,
});

const Emergency = mongoose.model(
  "Emergency",
  emergencySchema
);

export default Emergency;