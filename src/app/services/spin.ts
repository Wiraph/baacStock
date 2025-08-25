import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { EncryptionService } from './encryption.service';

@Injectable({
  providedIn: 'root'
})
export class Spin {
  private readonly apiUrl = `${environment.dotnetApiUrl}/api/Spin`;
  private readonly apiUrlUpload = `${environment.dotnetApiUrl}/api/SpinUpload`;
  private readonly apiUrlDownload = `${environment.dotnetApiUrl}/api/SpinDownload`;

  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) private readonly platformId: object,
    private readonly encryptionService: EncryptionService
  ) { }

  createSpinFile(): Observable<any> {
    // Implementation for creating a spin file
    return this.http.post<any>(`${this.apiUrl}/createspindat`, {}, {
      headers: this.createAuthHeaders()
    });
  }

  getSpinFiles(payload: any): Observable<string[]> {
    const encrypPayload = this.encryptionService.encrypPayload(payload);
    return this.http.post<string[]>(`${this.apiUrl}/listspin`, encrypPayload, {
      headers: this.createAuthHeaders()
    });
  }

  downloadSpinFile(padload: any): Observable<Blob> {
    console.log("Payload", padload);
    const encryptedPayload = this.encryptionService.encrypPayload(padload);
    console.log("Encrypt", encryptedPayload);
    return this.http.post(`${this.apiUrlDownload}/download`, encryptedPayload, {
      headers: this.createAuthHeaders(),
      responseType: 'blob'
    });
  }

  uploadFiles(payload: any): Observable<any[]> {
    const encrypPayload = this.encryptionService.encrypPayload(payload);
    return this.http.post<any[]>(`${this.apiUrlUpload}/uploadout`, encrypPayload, {
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
