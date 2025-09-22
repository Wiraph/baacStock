import { HttpClient } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { EncryptionService } from './encryption.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = `${environment.dotnetApiUrl}/api/user`;
  private readonly levelCodeToDescription: { [code: string]: string } = {
    '00': 'สาขา-Operator',
    '05': 'สาขา-Authorize',
    '09': 'สาขา-Administrator',
    '10': 'สนจ.-Operator',
    '19': 'สนจ.-Administrator',
    '20': 'PND Collector (ก.ง.ด.)',
    '50': 'Stock Viewer',
    '80': 'สนญ.-Operator',
    '85': 'สนญ.-Authorize',
    '89': 'สนญ.-Administrator',
    '90': 'System Administrator',
    '98': 'ทดสอบ',
    '99': 'System Super Administrator'
  };

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
      withCredentials: true
    });
  }

  /*
    ใช้ควบคุมการทำงาน เช่น resetpwd, resetuser, delete
    payload = {UserId: string, brc: string, Act: string}
  */
  manageUser(payload: any): Observable<any[]> {
    const encryptionPayload = this.encryptionService.encrypPayload(payload);
    return this.http.post<any[]>(`${this.apiUrl}/controlleraction`, encryptionPayload , {
      withCredentials: true
    });
  }

  // เปลี่ยนรหัสผ่าน
  changePassword(payload: any): Observable<string> {
    const encrypPayload = this.encryptionService.encrypPayload(payload);
    return this.http.post(`${this.apiUrl}/changepassword`, encrypPayload, {
      withCredentials: true,
      responseType: 'text'
    });
  }

  addUser(payload: any): Observable<string> {
    const encrypPayload = this.encryptionService.encrypPayload(payload);
    return this.http.post(`${this.apiUrl}/adduser`, encrypPayload, {
      withCredentials: true,
      responseType: 'text'
    });
  }

  // อัปเดตข้อมูล session หลัง login/re-login กลางที่เดียว
  updateSessionFromAuthResponse(authResponse: any): void {
    if (!isPlatformBrowser(this.platformId) || !authResponse) return;

    try {
      // คีย์พื้นฐาน
      sessionStorage.setItem('level', authResponse.usr_LVL);
      sessionStorage.setItem('username', authResponse.usr_ID);
      sessionStorage.setItem('fullname', authResponse.usr_DESC);
      sessionStorage.setItem('brCode', authResponse.usr_BRC);
      sessionStorage.setItem('brName', authResponse.brName);

      // คำอธิบายระดับสิทธิ์: ใช้จาก response ถ้ามี ไม่เช่นนั้น map จากรหัส
      const mappedLevelDesc = (authResponse.LVL_DESC || authResponse.lvlDesc || this.getLevelDescription(authResponse.usr_LVL) || '').toString();
      
      sessionStorage.setItem('lvlDesc', mappedLevelDesc);

      // userData สำหรับตรวจสอบสถานะรหัสผ่าน
      const userData = {
        datetimeup: authResponse.datetimeup ?? '',
        pwdExp: authResponse.pwdExp,
        usr_PWDExp: authResponse.usr_PWDExp,
        usrPWD: authResponse.usr_PWD,
        level: authResponse.usr_LVL,
        username: authResponse.usr_ID,
        fullname: authResponse.usr_DESC
      };
      sessionStorage.setItem('userData', JSON.stringify(userData));
      
    } catch (error) {
      console.error('Error updating session from auth response:', error);
    }
  }

  private getLevelDescription(levelCode: string | null | undefined): string {
    if (!levelCode) return '';
    return this.levelCodeToDescription[levelCode] || levelCode;
  }

  getCurrentUser(): any {
    if (isPlatformBrowser(this.platformId)) {
      // ดึงข้อมูลจาก userData ก่อน
      const userData = sessionStorage.getItem('userData');
      if (userData) {
        try {
          const parsedUserData = JSON.parse(userData);
          return {
            username: parsedUserData.username || sessionStorage.getItem('username') || '',
            fullname: parsedUserData.fullname || sessionStorage.getItem('fullname') || '',
            brCode: parsedUserData.brCode || sessionStorage.getItem('brCode') || '',
            brName: parsedUserData.brName || sessionStorage.getItem('brName') || '',
            level: parsedUserData.level || sessionStorage.getItem('level') || '',
            lvlDesc: parsedUserData.lvlDesc || sessionStorage.getItem('lvlDesc') || '',
            // เพิ่มข้อมูลสำหรับตรวจสอบ password status
            datetimeup: parsedUserData.datetimeup,
            pwdExp: parsedUserData.pwdExp,
            usr_PWDExp: parsedUserData.usr_PWDExp,
            usrPWD: parsedUserData.usrPWD,
            currentPassword: parsedUserData.currentPassword
          };
        } catch (error) {
          console.error('Error parsing userData:', error);
        }
      }
      
      // Fallback ไปใช้ข้อมูลเดิม
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
  
}
