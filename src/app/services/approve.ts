import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { EncryptionService } from './encryption.service';

@Injectable({
  providedIn: 'root'
})
export class ApproveService {
  private readonly apiUrl = 'https://localhost:7089/api/approve';

  constructor(
    private readonly http: HttpClient,
    private readonly encryption: EncryptionService,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) { }

  test(payload:any) {
    const encrypPayload = this.encryption.encrypPayload(payload);
    console.log("Tesst ", encrypPayload);
  }

  getStockApprove(payloadRequst: any): Observable<any[]> {
    const encrypPayload = this.encryption.encrypPayload(payloadRequst);
    return this.http.post<any[]>(`${this.apiUrl}/stktransai`, encrypPayload, {
      headers: this.createAuthHeaders()
    });
  }

  confirmStock(payload: any): Observable<any> {
    const encrypPayload = this.encryption.encrypPayload(payload);
    return this.http.post(`${this.apiUrl}/confirm`, encrypPayload, {
      headers: this.createAuthHeaders()
    });
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
