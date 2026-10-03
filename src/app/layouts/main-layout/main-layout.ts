import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ROLE_CONSTANTS } from '../../core/constants/role.constants';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.currentUser;

  get isCustomer(): boolean {
    return this.authService.currentUser()?.role === ROLE_CONSTANTS.CUSTOMER;
  }

  get isBankEmployee(): boolean {
    return this.authService.currentUser()?.role === ROLE_CONSTANTS.BANK_EMPLOYEE;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
