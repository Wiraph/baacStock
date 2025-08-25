import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environments';

export interface ChangePasswordDto {
  userName: string;
  oldPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.dotnetApiUrl}/api/user`;

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

  getCurrentUser(): any {
    if (isPlatformBrowser(this.platformId)) {
      return {
        username: sessionStorage.getItem('username') || '',
        fullname: sessionStorage.getItem('fullname') || '',
        brCode: sessionStorage.getItem('brCode') || '',
        brName: sessionStorage.getItem('brName') || '',
        level: sessionStorage.getItem('level') || '',
        lvlDesc: sessionStorage.getItem('lvlDesc') || ''
      };
    }
    return null;
  }

  // ดึงชื่อ level จาก lvlDesc
  getUserLevelName(levelCode: string): string {
    // ดึง lvlDesc จาก sessionStorage
    const lvlDesc = sessionStorage.getItem('lvlDesc');
    if (lvlDesc) {
      return lvlDesc;
    }
    
    return levelCode ;
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
