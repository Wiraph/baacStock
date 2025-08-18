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
    console.log("ข้อมูลเตรียมส่ง ", encrypPayload);
    return this.http.post<any[]>(`${this.apiUrl}/dividend`, encrypPayload, {
      headers: this.createAuthHeaders()
    });
  }

  getAllDividend() {
    return this.http.get<any[]>(`${this.apiUrl}/dividends`, {
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
