import { Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService, ChangePasswordDto } from '../../../services/user';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.html',
  styleUrls: ['./change-password.css']
})
export class ChangePasswordComponent {
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  userName = '';
  fullName = '';
  loading = false;
  errorMessage = '';
  successMessage = '';

  private platformId = inject(PLATFORM_ID);

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.userName = sessionStorage.getItem('username') || '';
      this.fullName = sessionStorage.getItem('fullname') || '';
    }
  }

  onChangePassword(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.loading = true;

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'รหัสผ่านใหม่ไม่ตรงกัน';
      this.loading = false;
      return;
    }

    const payload: ChangePasswordDto = {
      userName: this.userName,
      oldPassword: this.oldPassword,
      newPassword: this.newPassword
    };

    this.userService.changePassword(payload).subscribe({
      next: () => {
        this.successMessage = 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว';
        this.oldPassword = this.newPassword = this.confirmPassword = '';
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'ไม่สามารถเปลี่ยนรหัสผ่านได้';
        this.loading = false;
      }
    });
  }
}
