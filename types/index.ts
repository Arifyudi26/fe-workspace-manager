export type ProjectStatus = "Active" | "Paused" | "Archived";

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  user: string;
  timestamp: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface BillingData {
  companyProfile: {
    companyName: string;
    email: string;
    phone: string;
  };
  billingAddress: {
    country: string;
    city: string;
    address: string;
    postalCode: string;
  };
  paymentMethods: PaymentMethod[];
}

export interface PaymentMethod {
  id: string;
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  isDefault: boolean;
}
