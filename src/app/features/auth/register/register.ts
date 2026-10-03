import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  // Dependencies
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // UI state
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  // Register Form
  registerForm = this.fb.nonNullable.group({
    userName: ['', [Validators.required, Validators.minLength(6)]],
    fullName: ['', [Validators.required, Validators.minLength(6)]],
    emailId: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  // Easy access to form controls
  get f() {
    return this.registerForm.controls;
  }

  // Submit
  async onSubmit(): Promise<void> {
    // clear messages
    this.errorMessage.set('');
    this.successMessage.set('');

    // check validation
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    // Prevent duplicate requests
    if (this.isLoading()) {
      return;
    }

    this.isLoading.set(true);

    try {
      // Get strongly typed form data
      const payload = this.registerForm.getRawValue();

      console.log('Register payload:', payload);

      // Call API through AuthService
      const response = await this.authService.registerCustomer(payload);

      console.log('Register Response:', response);

      // API result
      if (response.result === true) {
        this.successMessage.set(response?.message || 'Registration Successful.');

        // Reset form
        this.registerForm.reset();

        // Navigate to login after successful registration
        this.router.navigate(['/login']);
      } else {
        this.errorMessage.set(response?.message || 'Registration Failed.');
      }
    } catch (error: any) {
      console.error('Registration Error:', error);
      this.errorMessage.set(
        error?.error?.message || error?.message || 'Something went wrong. Please try again.',
      );
    } finally {
      this.isLoading.set(false);
    }
  }
}
