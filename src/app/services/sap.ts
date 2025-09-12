import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EncryptionService } from './encryption.service';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Sap {
  private readonly apiUrl = `${environment.dotnetApiUrl}/api/SapExport`;
  constructor(
    private readonly http: HttpClient,
    private readonly encryptionService: EncryptionService
  ) { }

  // สร้างไฟล์ Sap interface
  generate(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/generate`, {withCredentials: true});
  }

  // ดึงรายการ sap
  getlist(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/list`, {withCredentials: true});
  }

  // ดาวน์โหลดไฟล์ sap
  // payload = { fileName: string }
  download(payload: any): Observable<Blob> {
    const encrypPayload = this.encryptionService.encrypPayload(payload);
    console.log("Payload", encrypPayload);
    return this.http.post(`${this.apiUrl}/download`, encrypPayload, {
      withCredentials: true,
      responseType: 'blob'
    });
  }

  // สร้างไฟล์ Exel และดาวน์โหลด
  // payload = { dateArg: string }
  downloadExcel(payload: any): Observable<{ file: string, url: string }> {
    const encrypPayload = this.encryptionService.encrypPayload(payload);
    return this.http.post<{ file: string, url: string }>(`${this.apiUrl}/StockMovement`, encrypPayload, {
      withCredentials: true
    });
  }
}
