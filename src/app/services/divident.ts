import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { EncryptionService } from './encryption.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class Divident {
  private readonly apiUrl = 'https://localhost:7089/api/Dividend';

  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) private readonly platformId: object,
    private readonly encryptionService: EncryptionService
  ) { }

  getDividend(requestPayload: any) {
    const encrypPayload = this.encryptionService.encrypPayload(requestPayload);
    return this.http.post<any[]>(`${this.apiUrl}/dividend`, encrypPayload, {
      headers: this.createAuthHeaders()
    });
  }

  getAllDividend(payload: any = {}) {
    const encrypPayload = this.encryptionService.encrypPayload(payload);
    console.log("EncrypPayload", encrypPayload);
    return this.http.post<any[]>(`${this.apiUrl}/dividends`, encrypPayload , {
      headers: this.createAuthHeaders()
    })
  }

  getDividendList(payload: any) {
    const encrypPayload = this.encryptionService.encrypPayload(payload);
    console.log("รหัสที่จะไปดึง array ", encrypPayload);
    return this.http.post<any[]>(`${this.apiUrl}/dividendlist`, encrypPayload , {
      headers: this.createAuthHeaders()
    });
  }

  getDividendDetailPerPerson(payload: any) {
    const encrypPayload = this.encryptionService.encrypPayload(payload);
    return this.http.post<any[]>(`${this.apiUrl}/detailperperson`, encrypPayload, {
      headers: this.createAuthHeaders()
    });
  }

  deleteDividendLST() {
    return this.http.delete<any[]>(`${this.apiUrl}/removedividend`, {
      headers: this.createAuthHeaders()
    })
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
