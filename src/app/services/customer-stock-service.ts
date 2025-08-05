import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { EncryptionService } from './encryption.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerStockService {
  private readonly apiUrl = '/api/CustomerStock';

  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) private readonly platformId: object,
    private readonly encryptionService: EncryptionService
  ) { }

  searchCustomerStock(payload: any) {
    const encrypPayload = this.encryptionService.encryptPayload(payload);
    return this.http.post<any[]>(`${this.apiUrl}/search`, encrypPayload, {headers: this.createAuthHeaders()});
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
