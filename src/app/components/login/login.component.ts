import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Login } from '../../services/login';
import { UserService } from '../../services/user';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
/** ฟอร์มเข้าสู่ระบบ: ตรวจสอบและตั้งค่า session จากผลลัพธ์ */
export class LoginComponent {

  username = '';
  password = '';
  errorMessage = '';
  loading = false;

  private readonly router = inject(Router);
  constructor(
    private readonly loginService: Login,
    private readonly cd: ChangeDetectorRef,
    private readonly userService: UserService
  ) { }

  /** ล้างค่าในฟอร์ม */
  resetForm() {
    this.username = '';
    this.password = '';
    this.errorMessage = '';
  }

  /** ส่งฟอร์มเข้าสู่ระบบ และอัปเดต session เมื่อสำเร็จ */
  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cd.detectChanges();

    this.loginService.login(this.username, this.password).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.cd.detectChanges();

        if (res.siGNonALLOW === 1) {
          // อัปเดต session ผ่าน service กลาง
          this.userService.updateSessionFromAuthResponse(res);
          this.router.navigate(['/dashboard-admin/']);
          this.cd.detectChanges();
        } else {
          Swal.fire({ icon: 'error', text: `${res.siGNonMSG}` });
        }
      },
      error: () => {
        this.loading = false;
        this.cd.detectChanges();
        Swal.fire({ icon: 'error', title: 'เชื่อมต่อไม่สำเร็จ', text: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ โปรดติดต่อผู้ดูแลระบบ' });
      }
    });
  }
}
