import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {

  private cdRef = inject(ChangeDetectorRef);


  username = '';
  password = '';
  errorMessage = '';
  loading = false;

  private http = inject(HttpClient);
  private router = inject(Router);

  resetForm() {
    this.username = '';
    this.password = '';
    this.errorMessage = '';
  }

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';
    console.log('🟡 เริ่ม login');

    const loginData = {
      username: this.username,
      password: this.password
    };

    this.http.post('https://localhost:7089/api/auth/login', loginData).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.cdRef.detectChanges(); // ⬅️ บังคับให้ UI รู้ว่า loading เปลี่ยนแล้ว

        if (res?.success !== true) {
          this.loading = false;
          this.cdRef.detectChanges(); // ⬅️ บังคับให้ UI รู้ว่า loading เปลี่ยนแล้ว
          this.errorMessage = res.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
          return;
        }

        const status = (res.statusCode || '').toUpperCase();

        if (status !== 'U000') {
          this.errorMessage = 'ไม่มีสิทธิ์ในการเข้าถึงระบบ (' + status + ')';
          this.resetForm();
          return;
        }

        // console.log('🎉 Login สำเร็จ!');

        sessionStorage.setItem('token', res.token);
        sessionStorage.setItem('username', res.userId);
        sessionStorage.setItem('fullname', res.fullName);
        sessionStorage.setItem('brCode', res.brCode);

        if (res.role === '99') {
          sessionStorage.setItem('brName', res.brName);
          this.router.navigate(['/dashboard-admin/']);
        } else if (res.role === '89') {
          this.router.navigate(['/head-office/']);
        } else {
          this.errorMessage = 'คุณไม่มีสิทธิ์เข้าถึงระบบ';
        }
      },
      error: (err: HttpErrorResponse) => {
        // console.error('❌ HTTP Error:', err);
        if (err) {
          alert('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง โปรดติดต่อผู้ดูแลระบบ');
          this.loading = false;
          this.cdRef.detectChanges(); // ⬅️ บังคับให้ UI รู้
        }
        

        if (err.status === 401) {
          this.errorMessage = err.error?.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
        } else {
          this.errorMessage = 'เกิดข้อผิดพลาดขณะเชื่อมต่อเซิร์ฟเวอร์';
        }
      }
    });
  }

}
