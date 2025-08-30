import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { EncryptionService } from './encryption.service';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environments';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Pnd {
  private readonly apiUrl = `${environment.dotnetApiUrl}/api/pndreport`;
  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) private readonly platformId: object,
    private readonly encryptionService: EncryptionService
  ) { }

  // ดึง ภ.ง.ด. เป็นรายการ
  // payload = { pndType: string }
  getPndReport(payload: any): Observable<any[]> {
    const encryptionPayload = this.encryptionService.encrypPayload(payload);
    console.log("en", encryptionPayload);
    return this.http.post<any[]>(`${this.apiUrl}/list` , encryptionPayload , {
      headers: this.createAuthHeaders()
    });
  }

  getPndDividendList(payload: any): Observable<any[]> {
    const encrypPayload = this.encryptionService.encrypPayload(payload);
    console.log("en", encrypPayload);
    return this.http.post<any[]>(`${this.apiUrl}/pndx`, encrypPayload, {
      headers: this.createAuthHeaders()
    });
  }

  generateReport(payload: any): Observable<any[]> {
    const encrypPayload = this.encryptionService.encrypPayload(payload);
    return this.http.post<any[]>(`${this.apiUrl}/generate`, encrypPayload , {
      headers: this.createAuthHeaders()
    });
  }

  private createAuthHeaders() {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = sessionStorage.getItem('token') || '';
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
}
