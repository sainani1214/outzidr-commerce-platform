import mongoose from "mongoose";

const RefreshTokenSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    tenantId: { type: String, required: true },
    tokenId: { type: String, required: true, unique: true },
    revoked: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const RefreshToken = mongoose.model(
  "RefreshToken",
  RefreshTokenSchema
);
