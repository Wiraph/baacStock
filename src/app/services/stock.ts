import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';


export interface StockItem {
  brCode: string;
  stkNote: string;
  stkNoteo?: string;
  stkNostart?: string;
  stkNostop?: string;
  stkUniT?: number;
  stkValue?: number;
  stkStatus?: string;
  stkDateInput?: string;
  statusDesc?: string;
  datetimeup?: string;
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


  getStocksByCusId(cusId: string): Observable<StockItem[]> {
    const encodedCusId = encodeURIComponent(cusId);
    return this.http.get<StockItem[]>(`${this.apiUrl}/by-cusid/?cusId=${encodedCusId}`, { headers: this.createAuthHeaders() });
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
