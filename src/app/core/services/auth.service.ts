import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONSTANTS } from '../constants/api.constants';
import { signal } from '@angular/core';
import {
  LoginPayload,
  LoginResponse,
  LoginUser,
  RegisterPayload,
  RegisterResponse,
} from '../models/auth.model';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // 1. DEPENDENCIES
  private readonly http = inject(HttpClient);

  // 2. LOCAL STORAGE KEYS
  private readonly USER_KEY = API_CONSTANTS.USER_KEY;
  private readonly USER_TOKEN = API_CONSTANTS.USER_TOKEN;

  // 3. AUTHENTICATED USER SIGNAL
  private readonly currentUserSignal = signal<LoginUser | null>(this.getStoredUser());

  // Read-only signal for components
  readonly currentUser = this.currentUserSignal.asReadonly();

  // 4. GET STORED USER
  getStoredUser(): LoginUser | null {
    const storedUser = localStorage.getItem(this.USER_KEY);

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as LoginUser;
    } catch (error) {
      console.log('Invalid Stored User Data:', error);
      localStorage.removeItem(this.USER_KEY);
      return null;
    }
  }

  // 5. GET STORED TOKEN
  getToken(): string | null {
    return localStorage.getItem(this.USER_TOKEN);
  }

  // 6. AUTHENTICATION CHECK
  isAuthenticated(): boolean {
    return this.currentUserSignal() !== null;
  }

  // 7. GET CURRENT USER
  getCurrentUser(): LoginUser | null {
    return this.currentUserSignal();
  }

  // 8. GET CURRENT USER ROLE
  getCurrentUserRole(): string | null {
    return this.currentUserSignal()?.role ?? null;
  }

  // 9. REGISTER CUSTOMER
  async registerCustomer(payload: RegisterPayload): Promise<RegisterResponse> {
    const registerUrl = `${API_CONSTANTS.BASE_URL}${API_CONSTANTS.AUTH.REGISTER_CUSTOMER}`;

    return await firstValueFrom(this.http.post<RegisterResponse>(registerUrl, payload));
  }

  // 10. LOGIN
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const loginUrl = `${API_CONSTANTS.BASE_URL}${API_CONSTANTS.AUTH.LOGIN}`;

    const response = await firstValueFrom(this.http.post<LoginResponse>(loginUrl, payload));

    const dummyToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

    // Save authentication session after successful login
    if (response.result && response.data) {
      this.setAuthenticatedSession(response?.data, dummyToken);
      response.token = dummyToken;
    }

    return response;
  }

  // 11. SAVE AUTHENTICATED SESSION
  setAuthenticatedSession(user: LoginUser, token?: string): void {
    // Save User
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    // Save token
    if (token) {
      localStorage.setItem(this.USER_TOKEN, token);
    }
    // Update signal
    this.currentUserSignal.set(user);
  }

  // 12. LOGOUT
  logout(): void {
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.USER_TOKEN);

    this.currentUserSignal.set(null);
  }
}
