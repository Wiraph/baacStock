import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface PendingTransfer {
  rowNumber: number;
  totalRows: number;
  customerId: string;
  customerFirstName: string;
  customerLastName: string;
  branchCode: string;
  branchName: string;
  stockNote: string;
  stockNoteOriginal: string;
  stockUnit: number;
  stockValue: number;
  statusCode: string;
  statusDescription: string;
  remarkCode: string;
  remarkDescription: string;
  approveDate: string; // หรือ Date ก็ได้ถ้าแปลงแล้ว
  approverUserId: string;
  approverUserName: string;
  userLevelCode: string;
  userLevelDescription: string;
}

export interface PendingTransferResponse {
  totalRows: number;
  currentPage: number;
  pageSize: number;
  data: PendingTransfer[];
}

@Injectable({
  providedIn: 'root'
})
export class StocktransferService {
  private readonly apiUrl = 'https://localhost:7089/api/stocktransfer';

  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) { }

  transferRequest(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/transfer`, payload, { headers: this.createAuthHeaders() });
  }

  transferCancel(payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/cancel`, payload, { headers: this.createAuthHeaders() });
  }

  transferApprove(payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/approve`, payload, { headers: this.createAuthHeaders() });
  }

  getPendingTransfers(action: string, branchCode: string, pageNumber = 1, pageSize = 10): Observable<PendingTransferResponse> {
    let params = new HttpParams()
      .set('action', action)
      .set('branchCode', branchCode)
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<PendingTransferResponse>(`${this.apiUrl}/pending-transfers`, { params, headers: this.createAuthHeaders() });
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
