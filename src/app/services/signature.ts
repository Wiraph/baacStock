import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, map } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

export interface Signature {
  empId: number;
  empName: string;
  empPosition: string;
  substituteTo: string | null;
  sigFileData: string;
}

// ข้อมูลหุ้น
export interface StockData {
  // tbl_Stock
  stkNOTE: string;           // เลขที่ใบหุ้น
  stkOWNiD: string;          // เลขบัตรประชาชนผู้ถือหุ้น
  stkUNiT: number;           // จำนวนหุ้น
  stkValue: number;          // มูลค่าหุ้น
  stkDateIssue: string;      // วันที่ออกใบหุ้น
  stkDateEffect: string;     // วันที่มีผล
  stkDateApprove: string;    // วันที่อนุมัติ
  stkDatePrint: string;      // วันที่พิมพ์
  stkNOStart: string;        // เลขหุ้นเริ่มต้น
  stkNOStop: string;         // เลขหุ้นสิ้นสุด
  stkPayType: string;        // ประเภทการจ่ายเงินปันผล
  stkSTATUS: string;         // สถานะหุ้น
  
  // tbl_cusTOMER
  cusiD: string;             // เลขบัตรประชาชน
  cusFName: string;          // ชื่อ
  cusLName: string;          // นามสกุล
  titleCode: string;         // รหัสคำนำหน้า
  cusCODE: string;           // รหัสประเภทลูกค้า
  cusCODEg: string;          // รหัสกลุ่มลูกค้า
  
  // tbl_TiTLE
  titleDESC: string;         // คำอธิบายคำนำหน้า
  titleABBR: string;         // คำย่อ
  
  // tbl_BRN
  brCode: string;            // รหัสสาขา
  brName: string;            // ชื่อสาขา
  
  // คำนวณเพิ่มเติม
  fullName?: string;         // ชื่อเต็ม (title + name + surname)
  statusDesc?: string;       // คำอธิบายสถานะ
}

@Injectable({
  providedIn: 'root'
})
export class SignatureService {
  private readonly apiUrl = 'https://localhost:7089/api/Signature/signature';

  constructor(private readonly http: HttpClient) { }

  getSignatures(): Observable<Signature[]> {
    const token = sessionStorage.getItem('token');
    if (!token) {
      return throwError(() => new Error('ไม่มีการยืนยันตัวตน กรุณา login ใหม่'));
    }

    return this.http.get<Signature[]>(this.apiUrl, {
      headers: this.createAuthHeaders()
    }).pipe(
      retry(1),
      map((signatures: Signature[]) => {
        // กรองเฉพาะ signature ที่ active (ไม่มี substituteTo)
        return signatures.filter(sig => !sig.substituteTo);
      }),
      catchError(this.handleError)
    );
  }

  // ดึงข้อมูลหุ้น
  getStockData(searchPayload: any): Observable<StockData[]> {
    const token = sessionStorage.getItem('token');
    if (!token) {
      return throwError(() => new Error('ไม่มีการยืนยันตัวตน กรุณา login ใหม่'));
    }

    const stockApiUrl = 'https://localhost:7089/api/Stock/stkdetail';
    
    return this.http.post<any[]>(stockApiUrl, searchPayload, {
      headers: this.createAuthHeaders()
    }).pipe(
      retry(1),
      map((response: any) => {
        console.log('Stock API Response:', response);
        
        // ถ้า response เป็น array ให้ใช้เลย
        if (Array.isArray(response)) {
          return response.map((item: any) => this.mapStockData(item));
        }
        
        // ถ้า response มี data property (อาจเป็น encrypted)
        if (response && response.data) {
          console.log('Encrypted response detected');
          return [];
        }
        
        return [];
      }),
      catchError(this.handleError)
    );
  }

  // แปลงข้อมูล API เป็น StockData
  private mapStockData(apiData: any): StockData {
    return {
      // tbl_Stock
      stkNOTE: apiData.stkNOTE || '',
      stkOWNiD: apiData.stkOWNiD || '',
      stkUNiT: apiData.stkUNiT || 0,
      stkValue: apiData.stkValue || 0,
      stkDateIssue: apiData.stkDateIssue || '',
      stkDateEffect: apiData.stkDateEffect || '',
      stkDateApprove: apiData.stkDateApprove || '',
      stkDatePrint: apiData.stkDatePrint || '',
      stkNOStart: apiData.stkNOStart || '',
      stkNOStop: apiData.stkNOStop || '',
      stkPayType: apiData.stkPayType || '',
      stkSTATUS: apiData.stkSTATUS || '',
      
      // tbl_cusTOMER
      cusiD: apiData.cusiD || '',
      cusFName: apiData.cusFName || '',
      cusLName: apiData.cusLName || '',
      titleCode: apiData.titleCode || '',
      cusCODE: apiData.cusCODE || '',
      cusCODEg: apiData.cusCODEg || '',
      
      // tbl_TiTLE
      titleDESC: apiData.titleDESC || '',
      titleABBR: apiData.titleABBR || '',
      
      // tbl_BRN
      brCode: apiData.brCode || '',
      brName: apiData.brName || '',
      
      // คำนวณเพิ่มเติม
      fullName: this.buildFullName(apiData.titleABBR, apiData.cusFName, apiData.cusLName),
      statusDesc: this.getStatusDescription(apiData.stkSTATUS)
    };
  }

  // สร้างชื่อเต็ม
  private buildFullName(title: string, firstName: string, lastName: string): string {
    return `${title || ''} ${firstName || ''} ${lastName || ''}`.trim();
  }

  // แปลงสถานะเป็นคำอธิบาย
  private getStatusDescription(status: string): string {
    const statusMap: { [key: string]: string } = {
      'S000': 'ปกติ',
      'S001': 'รออนุมัติ',
      'S002': 'ยกเลิก',
      'S003': 'หมดอายุ',
      'S004': 'ระงับ',
      'S005': 'โอน',
      'S006': 'ขาย',
      'S007': 'สูญหาย',
      'S008': 'บล็อค'
    };
    return statusMap[status] || status;
  }

  private createAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `ข้อผิดพลาด: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 401:
          errorMessage = 'Token หมดอายุหรือไม่ถูกต้อง - กรุณา login ใหม่';
          sessionStorage.removeItem('token');
          break;
        case 403:
          errorMessage = 'ไม่มีสิทธิ์เข้าถึงข้อมูลนี้';
          break;
        case 404:
          errorMessage = 'ไม่พบ API endpoint - กรุณาตรวจสอบ URL';
          break;
        case 500:
          errorMessage = 'ข้อผิดพลาดที่ server - กรุณาติดต่อผู้ดูแลระบบ';
          break;
        case 0:
          errorMessage = 'ไม่สามารถเชื่อมต่อกับ server ได้ - กรุณาตรวจสอบการเชื่อมต่อ';
          break;
        default:
          errorMessage = `ข้อผิดพลาด HTTP: ${error.status} - ${error.message}`;
      }
    }
    
    console.error('SignatureService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
