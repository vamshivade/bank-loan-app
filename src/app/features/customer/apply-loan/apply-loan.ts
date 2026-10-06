import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ApplicationService } from '../../../core/services/application.service';
import { Router } from '@angular/router';
import { AddApplicationRequest } from '../../../core/models/application.model';

function pastDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const selectedDate = new Date(control.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDate > today) {
    return { futureDate: true };
  }
  return null;
}

@Component({
  selector: 'app-apply-loan',
  imports: [ReactiveFormsModule],
  templateUrl: './apply-loan.html',
  styleUrl: './apply-loan.css',
})
export class ApplyLoan {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly applicationService = inject(ApplicationService);
  private readonly router = inject(Router);

  // UI States
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  applicationForm = this.fb.nonNullable.group({
    // Applicant details
    fullName: ['', [Validators.required, Validators.minLength(6)]],
    panCard: ['', [Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i)]],
    dateOfBirth: ['', [Validators.required, pastDateValidator]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^0?[6-9]\d{9}$/)]],
    address: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', Validators.required],
    zipCode: ['', [Validators.required, Validators.pattern(/^[1-9][0-9]{5}$/)]],
    annualIncome: ['', [Validators.required, Validators.min(1)]],
    employmentStatus: ['', Validators.required],
    creditScore: ['', [Validators.required, Validators.min(300), Validators.max(900)]],
    assets: [''],
    // Loan details
    bankName: ['', Validators.required],
    loanAmount: ['', [Validators.required, Validators.min(1)]],
    emi: ['', [Validators.required, Validators.min(1)]],
  });

  constructor() {
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    const user = this.authService.getCurrentUser();

    if (!user) {
      return;
    }

    this.applicationForm.patchValue({
      fullName: user?.fullName,
      email: user?.emailId,
    });
  }

  async submitApplication(): Promise<void> {
    // clear messages
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.applicationForm.invalid) {
      this.applicationForm.markAllAsTouched();
      this.errorMessage.set(
        'Please fill out all required fields correctly. Check for any missing or invalid data.',
      );

      // Helper to log exactly which fields are failing
      const invalidFields = [];
      const controls = this.applicationForm.controls;
      for (const name in controls) {
        if (controls[name as keyof typeof controls].invalid) {
          invalidFields.push(name);
        }
      }
      console.log('The form is invalid! The failing fields are:', invalidFields);

      return;
    }

    this.isSubmitting.set(true);

    try {
      const formValue = this.applicationForm.getRawValue();
      const user = this.authService.getCurrentUser();

      const payload: AddApplicationRequest = {
        ...formValue,
        phone: formValue.phone.replace(/^0+/, ''),
        applicantID: 0,
        customerId: Number(user?.userId),
        creditScore: Number(formValue?.creditScore),
        applicationStatus: 'Pending',
        annualIncome: Number(formValue.annualIncome),
        dateApplied: new Date().toISOString(),
        loans: [
          {
            bankName: formValue.bankName,
            loanAmount: Number(formValue.loanAmount),
            emi: Number(formValue.emi),
          },
        ],
      };

      console.log('Payload to send:', payload);

      const response = await this.applicationService.addApplication(payload);
      console.log('Application Submission Response:', response);
      if (response.result === true) {
        this.applicationForm.reset();
        this.router.navigate(['/pages/customer/applications']);
      }
    } catch (error: any) {
      console.log('Error in Submitting Application:', error);
      this.errorMessage.set(
        error?.error?.message || error?.message || 'Something went wrong. Please try again.',
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
