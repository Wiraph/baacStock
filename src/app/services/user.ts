import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface ChangePasswordDto {
  userName: string;
  oldPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://localhost:7089/api/user';

  // User Level Mapping
  private userLevelMap: { [key: string]: string } = {
    '99': 'System Super Administrator',
    '98': 'ทดสอบ',
    '90': 'System Administrator',
    '89': 'สนญ.-Administrator',
    '85': 'สนญ.-Authorize',
    '80': 'สนญ.-Operator',
    '50': 'Stock Viewer',
    '20': 'PND Collector (ภ.ง.ด.)',
    '19': 'สนจ.-Administrator',
    '10': 'สนจ.-Operator',
    '09': 'สาขา-Administrator',
    '05': 'สาขา-Authorize',
    '00': 'สาขา-Operator'
  };

  constructor(private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`);
  }

  // เปลี่ยนรหัสผ่าน
  changePassword(data: ChangePasswordDto): Observable<any> {
    console.log(data);
    return this.http.post(`${this.apiUrl}/change-password`, data);
  }

  // รีเซ็ตรหัสผ่าน
  resetPassword(userId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/reset-password`, {});
  }

  getUserLevels(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/lvl`, {headers: this.createAuthHeaders()});
  }

  getBranchList(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/branch`, {headers: this.createAuthHeaders()});
  }

  addUser(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, payload, {headers: this.createAuthHeaders()});
  }

  // ดึงข้อมูล user ปัจจุบันจาก sessionStorage
  getCurrentUser(): any {
    if (isPlatformBrowser(this.platformId)) {
      return {
        username: sessionStorage.getItem('username') || '',
        fullname: sessionStorage.getItem('fullname') || '',
        brCode: sessionStorage.getItem('brCode') || '',
        brName: sessionStorage.getItem('brName') || '',
        level: sessionStorage.getItem('level') || ''
      };
    }
    return null;
  }

  // ดึงชื่อ level จาก code
  getUserLevelName(levelCode: string): string {
    const result = this.userLevelMap[levelCode] || 'ไม่ระบุ';
    return result;
  }

  // ดึงตัวอักษรแรกของชื่อ
  getInitials(fullname: string): string {
    if (!fullname) return 'U';
    const names = fullname.trim().split(' ');
    if (names.length >= 2) {
      return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    }
    return fullname.charAt(0).toUpperCase();
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
