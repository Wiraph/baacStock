import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environments';

/**
 * Interface สำหรับ Request การออกใบหุ้นใหม่
 */
export interface StockReissueRequest {
  stkNote: string;
  stkRemCode: string;
}

/**
 * Interface สำหรับ Response จาก Backend
 */
export interface StockReissueResponse {
  message: string;
  stkNote: string;
  stkRemCode: string;
  success: boolean;
}



@Injectable({
  providedIn: 'root'
})
export class StockLostReissueService {
  private apiUrl = `${environment.dotnetApiUrl}/api/StockLost`;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  // ✨ ตัวอย่างการใช้งาน:
  // const request = { stkNote: 'A000123456', stkRemCode: '0020' };
  // this.stockLostReissueService.reissueStock(request).subscribe(...);

  /**
   * ออกใบหุ้นใหม่แทนใบหุ้นชำรุด/เสียหาย
   * @param request ข้อมูลการออกใบหุ้นใหม่ { stkNote, stkRemCode }
   * @returns Observable<StockReissueResponse>
   */
  reissueStock(request: StockReissueRequest): Observable<StockReissueResponse> {
    console.log('🔄 StockLostReissueService - Reissuing stock:', request);
    console.log('🔗 API URL:', `${this.apiUrl}/reissue`);
    console.log('🔑 Headers:', this.createAuthHeaders());
    
    return this.http.post<StockReissueResponse>(`${this.apiUrl}/reissue`, request, {
      headers: this.createAuthHeaders()
    });
  }





  /**
   * สร้าง HTTP Headers พร้อม Authorization token
   * @returns HttpHeaders
   */
  private createAuthHeaders(): HttpHeaders {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = sessionStorage.getItem('token') || '';
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}
