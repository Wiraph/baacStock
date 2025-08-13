import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { EncryptionService } from './encryption.service';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environments';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Stocklost {
  private readonly apiUrl = `${environment.dotnetApiUrl}/api/StockLost`;

  constructor(
    private readonly http: HttpClient,
    private readonly encryption: EncryptionService,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) { }

  getListStkLost(payload: any): Observable<any[]> {
    const encrypPlayload = this.encryption.encrypPayload(payload);
    console.log("ข้อมูลที่จะส่งไปทดสอบ", encrypPlayload);
    return this.http.post<any[]>(`${this.apiUrl}/createstocklostlist`, encrypPlayload, {
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
