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

  onSubmit(): void {
    const loginData = {
      username: this.username,
      password: this.password
    };

    this.http.post('http://localhost:5205/api/auth/login', loginData).subscribe({
      next: (res: any) => {
        console.log('📦 API response:', res);

        if (res.success === true) {
          alert('Login success');
          sessionStorage.setItem('token', res.token);
          console.log('✅ token:', res.token);
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.errorMessage = 'Login failed. Please try again.';
        }
      },
      error: err => {
        console.error('❌ API error:', err);
        this.errorMessage = err.error?.message || 'เชื่อมต่อกับเซิร์ฟเวอร์ไม่ได้';
      }
    });

  }
}
