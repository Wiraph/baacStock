import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable, retry } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { EncryptionService } from './encryption.service';


export interface StockItem {
  brCode: string;
  stkNote: string;
  stkNoteo?: string;
  StkRemcode?: string;
  stkNostart?: string;
  stkNostop?: string;
  stkUniT?: number;
  stkValue?: number;
  stkStatus?: string;
  stkDateInput?: string;
  statusDesc?: string;
  stkOwniD?: string;
  fullname?: string;
  stkPayType?: string;
  stkAcctype?: string;
  stkAccno?: string;
  stkAccname?: string;
  datetimeup?: string;
}

export interface StockType {
  typeCode: string;
  typeName: string;
}


@Injectable({
  providedIn: 'root'
})
export class StockService {
  private readonly apiUrl = 'https://localhost:7089/api/Stock';

  constructor(
    private readonly http: HttpClient,
    private readonly encrypt: EncryptionService,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) { }

  stockManage(requestPayload: any): Observable<any[]> {
    const encodePayload = this.encrypt.encrypPayload(requestPayload);
    console.log("ข้อมูลที่จะส่งไป", encodePayload);
    return this.http.post<any[]>(`${this.apiUrl}/manage`, encodePayload, {
      headers: this.createAuthHeaders()
    });
  }

  getStockDetail(requestPayload: any): Observable<any[]> {
    const encodePayload = this.encrypt.encrypPayload(requestPayload);
    console.log("ข้อมูลที่จะส่งไป", encodePayload);
    return this.http.post<any[]>(`${this.apiUrl}/stkdetail`, encodePayload, {
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
