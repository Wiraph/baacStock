import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import * as CryptoJS from 'crypto-js';

export interface EncrypPayload {
  data: string;
  iv: string;
}

export interface ApproveIssueDto {
  cusId: string;
  stkNote: string;
  stkNostart: string;
  stkNoend: string;
  stkNodeo: string;
  unit: number;
  unitValue: number;
  fullname: string;
  custype: string;
  statusDesc: string;
  status: string;
  datetimeup: string;
  brCode: string;
  brName: string;
  note: string;
  userName: string;
  lvlCode: string;
  lvlDesc: string;
  paytype: string;
  paydesc: string;
  accname: string;
  accno: string;
  acctype: string;
  acctypedesc: string;
  dateIssue: string;
}

export interface ApproveDetailResponse {
  stock: ApproveIssueDto;
  newStock: ApproveIssueDto[];
}

@Injectable({
  providedIn: 'root'
})
export class ApproveService {
  private readonly apiUrl = 'https://localhost:7089/api/Approve';
  private readonly encryptionKey = environment.encryptionKey;

  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) { }

  encrypPayload(payload: any): { data: string; iv: string } {
    const iv = CryptoJS.lib.WordArray.random(16);
    const keyWA = CryptoJS.enc.Utf8.parse(this.encryptionKey);
    const payloadStr = JSON.stringify(payload);
    const encrypted = CryptoJS.AES.encrypt(payloadStr, keyWA, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return {
      data: encrypted.ciphertext.toString(CryptoJS.enc.Base64),
      iv: iv.toString(CryptoJS.enc.Base64),
    };
  }


  getApproveList(
    act: string = '',
    stkBrc: string = '',
    pageNumber: number | null = null,
    pageSize: number | null = null
  ): Observable<any[]> {
    let params = new HttpParams();

    if (act) params = params.set('act', act);
    if (stkBrc) params = params.set('stkBrc', stkBrc);
    if (pageNumber !== null) params = params.set('pageNumber', pageNumber.toString());
    if (pageSize !== null) params = params.set('pageSize', pageSize.toString());

    return this.http.get<any[]>(
      `${this.apiUrl}/approvelist`,
      { params, headers: this.createAuthHeaders() }
    );
  }


  getDetail(payload: any): Observable<ApproveDetailResponse> {
    const encrypted: EncrypPayload = this.encrypPayload(payload)
    console.log("Payload", encrypted.data , "///// " ,encrypted.iv);
    const params = new HttpParams().set('stkNote', encrypted.data).set('iv', encrypted.iv);
    return this.http.get<ApproveDetailResponse>(`${this.apiUrl}/detail`, { params, headers: this.createAuthHeaders() });
  }

  sentConfirm(payload: any): Observable<any[]> {
    const encrypted: EncrypPayload = this.encrypPayload(payload);
    const body = {
      data: encrypted.data,
      iv: encrypted.iv
    };
    return this.http.post<any[]>(`${this.apiUrl}/confirm`, body, {
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
