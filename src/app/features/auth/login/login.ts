import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { signal } from '@angular/core';
import { ROLE_CONSTANTS, ROLE_ROUTES } from '../../../core/constants/role.constants';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // UI States
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  loginForm = this.fb.nonNullable.group({
    userName: ['', Validators.required],
    password: ['', Validators.required],
  });

  get f() {
    return this.loginForm.controls;
  }

  private navigateByRole(): void {
    const role = this.authService.getCurrentUserRole();

    if (role === ROLE_CONSTANTS.CUSTOMER) {
      this.router.navigate([ROLE_ROUTES[ROLE_CONSTANTS.CUSTOMER]]);
      return;
    }
    if (role === ROLE_CONSTANTS.BANK_EMPLOYEE) {
      this.router.navigate([ROLE_ROUTES[ROLE_CONSTANTS.BANK_EMPLOYEE]]);
    }
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  async onSubmit() {
    // clear messages
    this.errorMessage.set('');
    this.successMessage.set('');

    // check validation
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    // Prevent duplicate requests
    if (this.isLoading()) {
      return;
    }

    this.isLoading.set(true);

    try {
      const payload = this.loginForm.getRawValue();
      console.log('Login Payload:', payload);

      const response = await this.authService.login(payload);
      console.log('Login Response:', response);

      if (response.result === true) {
        this.successMessage.set(response?.message || 'Login Success');

        this.loginForm.reset();

        this.navigateByRole();
      }
    } catch (error: any) {
      console.log('Login Error:', error);
      this.errorMessage.set(
        error?.error?.message || error?.message || 'Something wen wrong. Please try again',
      );
    } finally {
      this.isLoading.set(false);
    }
  }
}
