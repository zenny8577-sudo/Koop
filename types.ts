export enum UserRole {
  ADMIN = 'ADMIN',
  SELLER = 'SELLER',
  BUYER = 'BUYER'
}

export enum ProductCondition {
  NEW = 'NEW',
  LIKE_NEW = 'LIKE_NEW',
  GOOD = 'GOOD',
  FAIR = 'FAIR'
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  SOLD = 'SOLD'
}

export interface Product {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  condition: ProductCondition;
  status: ProductStatus;
  category: string;
  image: string;
  commissionRate: number;
  commissionAmount: number;
  sku: string;
  barcode: string;
  weight: number;
  dimensions: string;
  originCountry: string;
  estimatedDelivery: string;
  shippingMethods: string[];
  warehouseLocation: string;
  supplierId?: string;
  is3DModel: boolean;
  modelGLB?: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  phone?: string;
  verificationStatus?: VerificationStatus;
}

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';