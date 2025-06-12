import { Component, inject } from '@angular/core';
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
  username = '';
  password = '';
  errorMessage = '';

  private http = inject(HttpClient);
  private router = inject(Router);

  resetForm() {
  this.username = '';
  this.password = '';
  this.errorMessage = '';
}


  loading = false;

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';

    const loginData = {
      username: this.username,
      password: this.password
    };

    this.http.post('http://localhost:5205/api/auth/login', loginData).subscribe({
      next: (res: any) => {
        this.loading = false;

        if (res?.success) {
          const status = (res.statusCode || '').toUpperCase();

          if (status !== 'U000') {
            alert('ไม่มีสิทธิ์ในการเข้าถึงระบบ (' + status + ')');
            location.reload();
            this.resetForm();
            return;
          } else {
            if (res.role === '99') {
              alert('เข้าสู่ระบบสำเร็จ');
              sessionStorage.setItem('token', res.token);
              sessionStorage.setItem('username', res.userId);
              sessionStorage.setItem('fullname', res.fullName);
              this.router.navigate(['/dashboard-admin/']);
            } else {
              this.errorMessage = 'คุณไม่มีสิทธิ์เข้าถึงระบบ';
            }
          }
        } else {
          this.errorMessage = 'Login failed. Please try again.';
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('❌ API error:', err);
        this.errorMessage = err.error?.message || 'เชื่อมต่อกับเซิร์ฟเวอร์ไม่ได้';
      }
    });
  }

}
