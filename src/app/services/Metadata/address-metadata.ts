import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from '../../../environments/environments';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { EncryptionService } from '../encryption.service';

@Injectable({
  providedIn: 'root'
})
export class AddressMetadata {
  private readonly apiUrl = `${environment.dotnetApiUrl}/api/AddressMetadata`;
  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    private readonly encryptionService: EncryptionService
  ) { }

  getProvince(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/provinces`, {
      headers: this.createAuthHeaders()
    });
  }

  getAumphor(prvCode: string): Observable<any[]> {
    const payload = {
      prvCode: prvCode
    }
    const encryptionPayload = this.encryptionService.encrypPayload(payload);
    return this.http.post<any[]>(`${this.apiUrl}/provinces`, encryptionPayload, {
      headers: this.createAuthHeaders()
    });
  }

  getTumbon(prvCode: string, ampcode: string): Observable<any[]> {
    const payload = {
      ampCode: ampcode,
      prvCode: prvCode
    }
    const encryptionPayload = this.encryptionService.encrypPayload(payload);
    return this.http.post<any[]>(`${this.apiUrl}/tumbons`, encryptionPayload, {
      headers: this.createAuthHeaders()
    });
  }

  private createAuthHeaders(): HttpHeaders {
    let tokent = '';
    if (isPlatformBrowser(this.platformId)) {
      tokent = sessionStorage.getItem('token') || '';
    }
    return new HttpHeaders({
      Authorization: `Bearer ${tokent}`
    });
  }
}
