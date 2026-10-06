import { Component, computed, OnInit } from '@angular/core';
import { ApplicationService } from '../../../core/services/application.service';
import { inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { signal } from '@angular/core';
import { MyApplication } from '../../../core/models/user.model';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router'

@Component({
  selector: 'app-applications',
  imports: [DatePipe, RouterLink],
  templateUrl: './applications.page.html',
  styleUrl: './applications.page.css',
})
export class ApplicationsPage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly applicationService = inject(ApplicationService);

  // UI states
  isLoading = signal(false);
  errorMessage = signal('');

  applications = signal<MyApplication[]>([]);
  readonly totalApplications = computed(() => this.applications().length);
  readonly newApplications = computed(
    () =>
      this.applications().filter((application) => application.applicationStatus === 'New').length,
  );
  readonly approvedApplications = computed(
    () =>
      this.applications().filter((application) => application.applicationStatus === 'Approved')
        .length,
  );
  readonly rejectedApplications = computed(
    () =>
      this.applications().filter((application) => application.applicationStatus === 'Rejcted')
        .length,
  );

  ngOnInit(): void {
    this.loadMyApplications();
  }

  async loadMyApplications() {
    const user = this.authService.getCurrentUser();

    if (!user) {
      console.log('User not logged in');
      return;
    }

    const customerId = user?.userId;

    this.isLoading.set(true);

    try {
      const response = await this.applicationService.getMyApplications(customerId);
      console.log(response?.data);
      if (response && response?.result === true) {
        this.applications.set(response?.data ?? []);
      }
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}
