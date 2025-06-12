import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChangePasswordDto {
  userName: string;
  oldPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:5205/api/user';

  constructor(private http: HttpClient) { }

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

}
