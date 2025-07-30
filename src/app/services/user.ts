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
