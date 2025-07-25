import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class StockBlockService {
  private apiUrl = `${environment.dotnetApiUrl}/api/stockblock`;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  /**
   * บล็อค/ยกเลิกบล็อคใบหุ้น (ใช้ endpoint เดียวกัน)
   * Backend จะตรวจสอบสถานะปัจจุบันและเปลี่ยนให้อัตโนมัติ
   * @param stkNote หมายเลขใบหุ้น
   * @returns Observable<any>
   */

  blockStock(stkNote: string): Observable<any[]> {
    const encodedStkNote = encodeURIComponent(stkNote)
    return this.http.put<any[]>(`${this.apiUrl}/block/${encodedStkNote}`, {
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