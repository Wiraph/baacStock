import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EncryptionService } from './encryption.service';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class Divident {
  private readonly apiUrl = `${environment.dotnetApiUrl}/api/Dividend`;

  constructor(
    private readonly http: HttpClient,
    private readonly encryptionService: EncryptionService
  ) { }

  getDividend(requestPayload: any) {
    const encrypPayload = this.encryptionService.encrypPayload(requestPayload);
    return this.http.post<any[]>(`${this.apiUrl}/dividend`, encrypPayload, {
      withCredentials: true
    });
  }

  private createAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  getAllDividend(payload: any = {}) {
    const encrypPayload = this.encryptionService.encrypPayload(payload);
    console.log("EncrypPayload", encrypPayload);
    return this.http.post<any[]>(`${this.apiUrl}/dividends`, encrypPayload , {
      withCredentials: true
    })
  }

  getDividendList(payload: any) {
    const encrypPayload = this.encryptionService.encrypPayload(payload);
    console.log("รหัสที่จะไปดึง array ", encrypPayload);
    return this.http.post<any[]>(`${this.apiUrl}/dividendlist`, encrypPayload , {
      withCredentials: true
    });
  }

  getDividendDetailPerPerson(payload: any) {
    const encrypPayload = this.encryptionService.encrypPayload(payload);
    return this.http.post<any[]>(`${this.apiUrl}/detailperperson`, encrypPayload, {
      withCredentials: true
    });
  }

  deleteDividendLST() {
    return this.http.delete<any[]>(`${this.apiUrl}/removedividend`, {
      withCredentials: true
    })
  }

  getDividend2Pay(stkOwnId: string) {
    const payload = { stkOwnId: stkOwnId };
    const encrypPayload = this.encryptionService.encrypPayload(payload);
    console.log('💰 Calling getDividend2Pay with payload:', payload);
    console.log('💰 API URL:', `${this.apiUrl}/2pay`);
    return this.http.post<any[]>(`${this.apiUrl}/2pay`, encrypPayload, {
      withCredentials: true
    });
  }
}
