import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { EncryptionService } from './encryption.service';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class Sap {
  private readonly apiUrl = `${environment.dotnetApiUrl}/api/SapExport`;
  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) private readonly platformId: object,
    private readonly encryptionService: EncryptionService
  ) { }

  // สร้างไฟล์ Sap interface
  generate(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/generate`, {
      headers: this.createAuthHeaders()
    });
  }

  // ดึงรายการ sap
  getlist(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/list`, {
      headers: this.createAuthHeaders()
    });
  }

  // ดาวน์โหลดไฟล์ sap
  // payload = { fileName: string }
  download(payload: any): Observable<Blob> {
    const encrypPayload = this.encryptionService.encrypPayload(payload);
    console.log("Payload", encrypPayload);
    return this.http.post(`${this.apiUrl}/download`, encrypPayload, {
      headers: this.createAuthHeaders(),
      responseType: 'blob'
    });
  }

  // สร้างไฟล์ Exel และดาวน์โหลด
  // payload = { dateArg: string }
  downloadExcel(payload: any): Observable<{ file: string, url: string }> {
    const encrypPayload = this.encryptionService.encrypPayload(payload);
    return this.http.post<{ file: string, url: string }>(`${this.apiUrl}/StockMovement`, encrypPayload, {
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
