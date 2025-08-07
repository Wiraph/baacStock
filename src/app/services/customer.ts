import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { EncryptionService } from './encryption.service';

export interface CustomerSearchDto {
  cusId?: string;
  stockId?: string;
  fname?: string;
  lname?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly apiUrl = 'https://localhost:7089/api/Customer';

  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    private readonly encryped: EncryptionService
  ) { }

  getCustomer(requestPayload: any) {
    const encrypPayload = this.encryped.encrypPayload(requestPayload);
    console.log("log", encrypPayload);
    return this.http.post<any[]>(`${this.apiUrl}/customer`, encrypPayload, { headers: this.createAuthHeaders() });
  }

  getCustomerTr(requestPayload: any) {
    const encrypPayload = this.encryped.encrypPayload(requestPayload);
    return this.http.post<any[]>(`${this.apiUrl}/customer2tr`, encrypPayload, { headers: this.createAuthHeaders() });
  }

  postUpdateCustomer(requestPayload: any) {
    const encrypPayload = this.encryped.encrypPayload(requestPayload);
    return this.http.post<any[]>(`${this.apiUrl}/update`, encrypPayload, { headers: this.createAuthHeaders() });
  }

  searchCustomerStk(requestPayload: any) {
    const encrypPayload = this.encryped.encrypPayload(requestPayload);
    console.log("ข้อมูลที่ถูกเข้ารหัส", encrypPayload);
    return this.http.post<any[]>(`${this.apiUrl}/search`, encrypPayload, { headers: this.createAuthHeaders() });
  }

  private createAuthHeaders(): HttpHeaders {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = sessionStorage.getItem('token') || '';
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
}
