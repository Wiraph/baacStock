import { ChangeDetectorRef, Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import Swal from 'sweetalert2';
import { Login } from '../../../services/login';
import { PasswordStatusService, PasswordStatus } from '../../../services/password-status.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.html',
  styleUrls: ['./change-password.css']
})
/**
 * เปลี่ยนรหัสผ่านผู้ใช้
 * - โหลดข้อมูลผู้ใช้ปัจจุบันและประเมินสถานะรหัสผ่าน (หมดอายุ/รหัสผ่านเริ่มต้น)
 * - ตรวจสอบความถูกต้องของแบบฟอร์ม และเรียก API เปลี่ยนรหัสผ่าน
 * - หากรหัสหมดอายุ/ใช้รหัสเริ่มต้น จะ re-login อัตโนมัติหลังเปลี่ยนสำเร็จ
 */
export class ChangePasswordComponent implements OnInit {
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  userId = '';
  userName = '';
  fullName = '';
  loading = false;
  errorMessage = '';
  successMessage = '';
  dataUser: any;
  
  // สถานะรหัสผ่าน
  isPasswordExpired = false;
  passwordExpiryDays = 0;
  passwordExpiryDate: string | null = null;
  isDefaultPassword = false;

  constructor(
    private readonly userService: UserService,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    private readonly cd: ChangeDetectorRef,
    private readonly loginService: Login,
    private readonly passwordStatusService: PasswordStatusService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const currentUser = this.userService.getCurrentUser();
      if (currentUser?.username) {
        this.userId = currentUser.username;
        this.userName = currentUser.username;
        this.fullName = currentUser.fullname;
        // ประเมินสถานะรหัสผ่านจาก session
        this.checkPasswordStatusFromSession();
        // โหลดข้อมูลผู้ใช้จาก API
        this.loadUser();
      } else {
        Swal.fire({ icon: 'warning', title: 'ไม่พบข้อมูลผู้ใช้', text: 'กรุณาเข้าสู่ระบบใหม่' })
          .then(() => this.router.navigate(['/login']));
        return;
      }
    }
  }

  /** ประเมินสถานะรหัสผ่านจากข้อมูล session */
  private checkPasswordStatusFromSession() {
    const currentUser = this.userService.getCurrentUser();
    if (currentUser) {
      const passwordStatus: PasswordStatus = this.passwordStatusService.checkPasswordStatus(currentUser);
      this.isPasswordExpired = passwordStatus.isPasswordExpired;
      this.passwordExpiryDays = passwordStatus.passwordExpiryDays;
      this.passwordExpiryDate = passwordStatus.passwordExpiryDate;
      this.isDefaultPassword = passwordStatus.isDefaultPassword;
      this.cd.detectChanges();
    }
  }

  /** โหลดข้อมูลผู้ใช้จาก API แล้วทบทวนสถานะรหัสผ่านอีกครั้ง */
  loadUser() {
    this.userService.getUserById(this.userId).subscribe({
      next: (res: any) => {
        this.dataUser = res;
        this.checkPasswordStatus();
        this.cd.detectChanges();
      },
      error: () => {
        Swal.fire({ icon: 'error', title: 'โหลดข้อมูลผู้ใช้ไม่สำเร็จ', text: 'โปรดลองใหม่' });
      }
    })
  }

  // ตรวจสอบสถานะรหัสผ่านจากข้อมูล API
  private checkPasswordStatus() {
    if (!this.dataUser) return;

    // รวมข้อมูลจาก session (เชื่อถือได้กว่า) กับข้อมูลจาก API
    const sessionUser = this.userService.getCurrentUser() || {};
    const effectiveUser = {
      datetimeup: (this.dataUser.datetimeup ?? sessionUser.datetimeup) || '',
      pwdExp: this.dataUser.pwdExp ?? this.dataUser.usrPwdexp ?? sessionUser.pwdExp,
      usr_PWDExp: this.dataUser.usr_PWDExp ?? sessionUser.usr_PWDExp,
      usrPWD: this.dataUser.usrPWD ?? sessionUser.usrPWD
    } as any;

    if (effectiveUser.datetimeup) this.passwordExpiryDate = effectiveUser.datetimeup;

    const passwordStatus: PasswordStatus = this.passwordStatusService.checkPasswordStatus(effectiveUser);
    this.isPasswordExpired = passwordStatus.isPasswordExpired;
    this.passwordExpiryDays = passwordStatus.passwordExpiryDays;
    this.passwordExpiryDate = passwordStatus.passwordExpiryDate;
    this.isDefaultPassword = passwordStatus.isDefaultPassword;
    this.cd.detectChanges();
  }

  onClear(): void {
    this.oldPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.cd.detectChanges();
  }

  /** ตรวจสอบฟอร์มและเรียก API เปลี่ยนรหัสผ่าน */
  onChangePassword(): void {
    this.loading = true;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (this.oldPassword == '' || this.newPassword == '' || this.confirmPassword == '') {
      this.loading = false;
      Swal.fire({ icon: 'error', text: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
      return;
    }
    // ตรวจสอบรหัสผ่านใหม่ตรงกัน
    if (this.newPassword !== this.confirmPassword) {
      this.loading = false;
      Swal.fire({ icon: 'error', text: 'รหัสผ่านใหม่ไม่ตรงกัน' });
      return;
    }
    // ตรวจสอบรหัสผ่านใหม่ไม่ซ้ำกับเดิม
    if (this.oldPassword === this.newPassword) {
      this.loading = false;
      Swal.fire({ icon: 'error', text: 'รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม กรุณาบันทึกใหม่' });
      return;
    }
    // ความยาวขั้นต่ำ
    if (this.newPassword.length < 8) {
      this.loading = false;
      Swal.fire({ icon: 'error', text: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร' });
      return;
    }
    // ไม่ใช้รหัสผ่านเริ่มต้น
    if (this.newPassword === 'baac') {
      this.loading = false;
      Swal.fire({ icon: 'error', text: "รหัสผ่านใหม่ต้องไม่ใช่รหัสผ่านเริ่มต้น 'baac' กรุณาบันทึกใหม่" });
      return;
    }

    const payload = {
      userId: this.dataUser?.usrId || '',
      pwdO: this.oldPassword,
      newPwd: this.newPassword,
      userDesc: this.dataUser?.usrDesc || ''
    };

    this.userService.changePassword(payload).subscribe({
      next: (msg: string) => {
        this.loading = false;
        const shouldReLogin = this.isPasswordExpired || this.isDefaultPassword;
        this.isPasswordExpired = false;
        this.isDefaultPassword = false;
        Swal.fire({ icon: 'success', text: `${msg}`, confirmButtonText: 'ตกลง', confirmButtonColor: '#50C878' })
          .then((result) => {
            if (result.isConfirmed) {
              if (shouldReLogin) {
                this.loginService.login(this.userId, this.newPassword).subscribe({
                  next: (res: any) => {
                    sessionStorage.setItem('token', res.token);
                    try {
                      const responseWithToday = { ...res, datetimeup: this.getTodayBEDateString() };
                      this.userService.updateSessionFromAuthResponse(responseWithToday);
                    } catch {
                      // no-op
                    }
                    window.location.href = '/dashboard-admin/home';
                  }, error: () => {
                    Swal.fire({ icon: 'error', title: 'เข้าสู่ระบบใหม่ไม่สำเร็จ', text: 'โปรดลองใหม่' });
                    this.onClear();
                  }
                });
              } else {
                this.onClear();
              }
            }
          });
        this.cd.detectChanges();
      }, error: (err: any) => {
        this.loading = false;
        if (err.status === 409) {
          Swal.fire({ icon: 'warning', text: `${err.error}`, confirmButtonText: 'Yes', confirmButtonColor: '#50C878' });
        } else {
          Swal.fire({ icon: 'error', title: 'เปลี่ยนรหัสผ่านไม่สำเร็จ', text: err?.message || 'โปรดลองใหม่' });
        }
        this.cd.detectChanges();
      }
    })

  }

  // Utility: วันที่ปัจจุบันรูปแบบ พ.ศ. YYYYMMDD
  private getTodayBEDateString(): string {
    const now = new Date();
    const yearBE = now.getFullYear() + 543;
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    const dd = now.getDate().toString().padStart(2, '0');
    return `${yearBE}${mm}${dd}`;
  }
}
