import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EncryptionService } from './encryption.service';
import { environment } from '../../environments/environments';
import { Observable } from 'rxjs';
export interface PndFileCheck {
  path: string;
  available: boolean;
}
@Injectable({
  providedIn: 'root'
})
export class Pnd {
  private readonly apiUrl = `${environment.dotnetApiUrl}/api/pndreport`;
  constructor(
    private readonly http: HttpClient,
    private readonly encryptionService: EncryptionService
  ) { }

  // ดึง ภ.ง.ด. เป็นรายการ
  // payload = { pndType: string }
  getPndReport(payload: any): Observable<any[]> {
    const encryptionPayload = this.encryptionService.encrypPayload(payload);
    return this.http.post<any[]>(`${this.apiUrl}/list`, encryptionPayload, { withCredentials: true });
  }

  getPndDividendList(payload: any): Observable<any[]> {
    const encrypPayload = this.encryptionService.encrypPayload(payload);
    return this.http.post<any[]>(`${this.apiUrl}/pndx`, encrypPayload, { withCredentials: true });
  }

  generateReport(payload: any): Observable<any[]> {
    const encrypPayload = this.encryptionService.encrypPayload(payload);
    return this.http.post<any[]>(`${this.apiUrl}/generate`, encrypPayload, { withCredentials: true });
  }

  checkFiles(fileNames: string[]): Observable<PndFileCheck[]> {
    return this.http.post<PndFileCheck[]>(`${this.apiUrl}/check`, fileNames, { withCredentials: true });
  }

  download(payload: any): Observable<Blob> {
    const encrypPayload = this.encryptionService.encrypPayload(payload);
    return this.http.post(`${this.apiUrl}/download`, encrypPayload, {
      withCredentials: true,
      responseType: 'blob'
    })
  }

  downloadExcel(payload: any): Observable<Blob> {
    const encrypPayload = this.encryptionService.encrypPayload(payload);
    return this.http.post(`${this.apiUrl}/downloadExcel`, encrypPayload, {
      withCredentials: true,
      responseType: 'blob'
    })
  }
}
