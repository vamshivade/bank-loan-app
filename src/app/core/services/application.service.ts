import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONSTANTS } from '../constants/api.constants';
import { AddApplicationRequest, AddApplicationResponse } from '../models/application.model';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  private readonly http = inject(HttpClient);

  async addApplication(application: AddApplicationRequest): Promise<AddApplicationResponse> {
    const url = `${API_CONSTANTS.BASE_URL}${API_CONSTANTS.APPLICATION.ADD_APPLICATION}`;

    const response = await firstValueFrom(this.http.post<AddApplicationResponse>(url, application));

    return response;
  }
}
