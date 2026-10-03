// 1. What the frontend sends to register
export interface RegisterPayload {
  userName: string;
  fullName: string;
  emailId: string;
  password: string;
}

// 2. The raw shape returned by the backend API
export interface RegisterResponse {
  message: string;
  result: boolean;
  data: string | null;
}

// 3. What the frontend sends to login
export interface LoginPayload {
  userName: string;
  password: string;
}

export interface LoginUser {
  userId: number;
  userName: string;
  emailId: string;
  fullName: string;
  role: string;
  createdDate: string;
  password: string;
  projectName: string;
  refreshToken: any;
  refreshTokenExpiryTime: any;
}

// 4. The raw shape returned by the backend login API
export interface LoginResponse {
  token?: string;
  message: string;
  result: boolean;
  data: LoginUser | null;
}
