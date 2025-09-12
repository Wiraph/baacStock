import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

export interface PayType {
  payType: string;
  payDesc?: string;
  payAbbr?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PayTypeService {
  private readonly apiUrl = `${environment.dotnetApiUrl}/api/PayType`;

  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) {}

  getAll(): Observable<PayType[]> {
    return this.http.get<PayType[]>(this.apiUrl, {
      headers: this.createAuthHeaders()
    });
  }

  getById(id: string): Observable<PayType> {
    return this.http.get<PayType>(`${this.apiUrl}/${id}`, {
      headers: this.createAuthHeaders()
    });
  }

  // ✅ ใช้ token จาก sessionStorage เฉพาะในฝั่ง browser
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
