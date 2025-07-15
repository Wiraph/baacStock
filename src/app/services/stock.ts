import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';


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
  private apiUrl = 'https://localhost:7089/api/Stock';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }


  getStocksByCusId(cusId: string): Observable<{ stockList: StockItem[]; stockUnitTotal: number }> {
    const encodedCusId = encodeURIComponent(cusId);
    return this.http.get<{ stockList: StockItem[]; stockUnitTotal: number }>(
      `${this.apiUrl}/by-cusid/?cusId=${encodedCusId}`,
      { headers: this.createAuthHeaders() }
    );
  }

  getIssueByStkNote(stkNote: string): Observable<any[]> {
    const encodedStkNote = encodeURIComponent(stkNote)
    return this.http.get<any[]>(`${this.apiUrl}/issue?stkNote=${encodedStkNote}`, {
      headers: this.createAuthHeaders()
    });
  }

  getStockType(): Observable<StockType[]> {
    return this.http.get<any[]>(`${this.apiUrl}/stocktype`, {
      headers: this.createAuthHeaders()
    });
  }

  getStockApprove(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/approve`, {
      headers: this.createAuthHeaders()
    })
  }

  getIssueApprove(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/approve-issue`, {
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
