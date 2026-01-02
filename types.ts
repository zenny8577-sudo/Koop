
export enum UserRole {
  ADMIN = 'admin',
  SELLER = 'seller',
  BUYER = 'buyer'
}

export enum ProductStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  ACTIVE = 'active',
  SOLD = 'sold',
  REMOVED = 'removed'
}

export enum ProductCondition {
  NEW = 'new',
  LIKE_NEW = 'like_new',
  GOOD = 'good',
  FAIR = 'fair'
}

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface VerificationCheck {
  passed: boolean;
  score: number;
  message: string;
}

export interface VerificationResult {
  authenticity: VerificationCheck;
  condition: VerificationCheck;
  priceFairness: VerificationCheck;
  legalCompliance: VerificationCheck;
  overallPassed: boolean;
  verifiedAt: string;
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

export interface UserAddress extends Address {
  id: string;
  isDefault: boolean;
  label: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  phone?: string;
  stripeAccountId?: string;
  addresses?: UserAddress[];
  avatar?: string;
  verificationStatus?: VerificationStatus;
  verificationDocs?: string[];
  wishlist?: string[]; // IDs dos produtos favoritos
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
  gallery?: string[]; // URLs de imagens adicionais
  commissionRate: number;
  commissionAmount: number;
  stripeLink?: string;
  sku?: string;
  tags?: string[];
  barcode?: string;
  weight?: number;
  size?: string;
  shippingMethods?: string[];
  internalNote?: string;
  verification?: VerificationResult;
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

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  shippingFee: number;
  address: Address;
  paymentMethod: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
}

export interface Transaction {
  id: string;
  productId: string;
  productTitle: string;
  buyerId: string;
  sellerId: string;
  sellerEmail: string;
  amount: number;
  commission: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}
