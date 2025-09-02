import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environments';
import { EncryptionService } from './encryption.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = `${environment.dotnetApiUrl}/api/user`;

  constructor(private readonly http: HttpClient,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    private readonly encryptionService: EncryptionService
  ) { }

  // ดึงผู้งานทั้งหมด
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/getallusers`, {
      withCredentials: true
    });
  }

  getUserById(userId: string): Observable<any> {
    const payload = {
      UserId: userId
    };
    const encrypPayload = this.encryptionService.encrypPayload(payload);
    return this.http.post(`${this.apiUrl}/getuserbyid`, encrypPayload ,{
      headers: this.createAuthHeaders()
    });
  }

  /*
    ใช้ควบคุมการทำงาน เช่น resetpwd, resetuser, delete
    payload = {UserId: string, brc: string, Act: string}
  */
  manageUser(payload: any): Observable<any[]> {
    const encryptionPayload = this.encryptionService.encrypPayload(payload);
    return this.http.post<any[]>(`${this.apiUrl}/controlleraction`, encryptionPayload , {
      headers: this.createAuthHeaders()
    });
  }

  // เปลี่ยนรหัสผ่าน
  changePassword(payload: any): Observable<string> {
    const encrypPayload = this.encryptionService.encrypPayload(payload);
    return this.http.post(`${this.apiUrl}/changepassword`, encrypPayload, {
      headers: this.createAuthHeaders(),
      responseType: 'text'
    });
  }


  addUser(payload: any): Observable<string> {
    const encrypPayload = this.encryptionService.encrypPayload(payload);
    return this.http.post(`${this.apiUrl}/adduser`, encrypPayload, {
      headers: this.createAuthHeaders(),
      responseType: 'text'
    });
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
