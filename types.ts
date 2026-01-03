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
  SOLD = 'SOLD',
  REJECTED = 'REJECTED'
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
  dimensions?: string;
  originCountry?: string;
  estimatedDelivery?: string;
  shippingMethods: string[];
  warehouseLocation?: string;
  supplierId?: string;
  is3DModel: boolean;
  modelGLB?: string;
  createdAt?: string;
  verification?: VerificationResult;
  gallery?: string[];
  size?: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  phone?: string;
  verificationStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
  wishlist?: string[];
  addresses?: UserAddress[];
  stripeAccountId?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserAddress {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  email: string;
  street: string;
  houseNumber: string;
  city: string;
  zipCode: string;
  phone: string;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  productId: string;
  userId: string;
  amount: number;
  createdAt: string;
  status?: string;
  shippingMethod?: string;
  productTitle?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface VerificationResult {
  authenticity: VerificationCheck;
  condition: VerificationCheck;
  priceFairness: VerificationCheck;
  legalCompliance: VerificationCheck;
  overallPassed: boolean;
  verifiedAt: string;
}

export interface VerificationCheck {
  passed: boolean;
  message: string;
  details?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Address {
  firstName: string;
  lastName: string;
  email: string;
  street: string;
  houseNumber: string;
  city: string;
  zipCode: string;
  phone: string;
}