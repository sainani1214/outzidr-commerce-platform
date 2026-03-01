import mongoose, { Document, Schema } from 'mongoose';
import { Tenant } from './tenant.types';
import { randomUUID } from 'crypto';

export interface ITenantDocument extends Document {
  tenantId: string;
  slug: string;
  name: string;
  metadata: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  toTenantObject(): Tenant;
}

const tenantSchema = new Schema<ITenantDocument>(
  {
    tenantId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => `tenant_${randomUUID()}`,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
      match: /^[a-z0-9-]+$/,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

tenantSchema.index({ name: 1 });
tenantSchema.index({ isActive: 1 });
tenantSchema.index({ slug: 1, isActive: 1 });

tenantSchema.methods.toTenantObject = function (): Tenant {
  return {
    id: this._id.toString(),
    tenantId: this.tenantId,
    slug: this.slug,
    name: this.name,
    metadata: this.metadata,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const TenantModel = mongoose.model<ITenantDocument>('Tenant', tenantSchema);
