import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { EncryptionService } from './encryption.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomerStockService {
  private readonly apiUrl = `${environment.dotnetApiUrl}/api/CustomerStock`;

  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) private readonly platformId: object,
    private readonly encryptionService: EncryptionService
  ) { }

  searchCustomerStock(requestPayload: any) {
    const encrypPayload = this.encryptionService.encrypPayload(requestPayload);
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
