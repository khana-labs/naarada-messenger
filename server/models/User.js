import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const trustedContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: 80,
    },

    naradaId: {
      type: String,
      trim: true,
      uppercase: true,
    },

    phone: {
      type: String,
      trim: true,
    },
  },
  {
    _id: true,
  }
);

const locationSchema = new mongoose.Schema(
  {
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

    updatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must contain at least 2 characters"],
      maxlength: [80, "Name cannot exceed 80 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Enter a valid email address",
      ],
    },

    phone: {
      type: String,
      trim: true,
      default: "",
      maxlength: [20, "Phone number is too long"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must contain at least 8 characters"],
      select: false,
    },

    naradaId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    role: {
      type: String,
      enum: [
        "civilian",
        "responder",
        "hospital",
        "police",
        "shelter",
        "authority",
        "admin",
      ],
      default: "civilian",
    },

    verificationStatus: {
      type: String,
      enum: ["unverified", "verified", "authority_verified"],
      default: "unverified",
    },

    emergencyContact: {
      name: {
        type: String,
        trim: true,
        default: "",
      },

      phone: {
        type: String,
        trim: true,
        default: "",
      },

      relationship: {
        type: String,
        trim: true,
        default: "",
      },
    },

    trustedContacts: {
      type: [trustedContactSchema],
      default: [],
    },

    lastKnownLocation: {
      type: locationSchema,
      default: () => ({
        latitude: null,
        longitude: null,
        zone: "Unknown zone",
        accuracy: null,
        updatedAt: null,
      }),
    },

    publicKey: {
      type: String,
      default: null,
      select: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    next();
    return;
  }

  const salt = await bcrypt.genSalt(12);

  this.password = await bcrypt.hash(this.password, salt);

  next();
});

userSchema.methods.comparePassword = async function comparePassword(
  candidatePassword
) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    naradaId: this.naradaId,
    role: this.role,
    verificationStatus: this.verificationStatus,
    emergencyContact: this.emergencyContact,
    trustedContacts: this.trustedContacts,
    lastKnownLocation: this.lastKnownLocation,
    isActive: this.isActive,
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const User = mongoose.model("User", userSchema);

export default User;