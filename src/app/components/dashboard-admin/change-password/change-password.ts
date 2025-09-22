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
  
  // เพิ่ม properties สำหรับตรวจสอบ password status
  isPasswordExpired = false;
  passwordExpiryDays = 0;
  passwordExpiryDate: string | null = null;
  isDefaultPassword = false; // เพิ่มการตรวจสอบรหัสผ่านเริ่มต้น

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
      // ใช้ UserService เพื่อดึงข้อมูลผู้ใช้ปัจจุบันแทนการ decode token
      const currentUser = this.userService.getCurrentUser();
      
      if (currentUser.username) {
        this.userId = currentUser.username;
        this.userName = currentUser.username;
        this.fullName = currentUser.fullname;
        
        // keep UI minimal logs
        
        // ตรวจสอบ password status จากข้อมูลใน sessionStorage
        this.checkPasswordStatusFromSession();
        
        console.log('ngOnInit - After checkPasswordStatusFromSession - Properties:', {
          isPasswordExpired: this.isPasswordExpired,
          isDefaultPassword: this.isDefaultPassword
        });
        
        // โหลดข้อมูลผู้ใช้จาก API
        this.loadUser();
      } else {
        console.error("User data not found in sessionStorage");
        return;
      }
    }
  }

    // ตรวจสอบ password status
  private checkPasswordStatusFromSession() {
    const currentUser = this.userService.getCurrentUser();
    
    if (currentUser) {
      
      
      // ใช้ PasswordStatusService แทนการเขียน logic ซ้ำ
      const passwordStatus: PasswordStatus = this.passwordStatusService.checkPasswordStatus(currentUser);
      
      
      
      // อัปเดต properties จาก service
      this.isPasswordExpired = passwordStatus.isPasswordExpired;
      this.passwordExpiryDays = passwordStatus.passwordExpiryDays;
      this.passwordExpiryDate = passwordStatus.passwordExpiryDate;
      this.isDefaultPassword = passwordStatus.isDefaultPassword;
      
      
      
      // Force change detection
      this.cd.detectChanges();
      
      // ตรวจสอบ template condition (no-op for logging removed)
      
    }
  }



  loadUser() {
    
    
    this.userService.getUserById(this.userId).subscribe({
      next: (res: any) => {
        this.dataUser = res;
        
        
        // ตรวจสอบ password status
        this.checkPasswordStatus();
        
        
        
        this.cd.detectChanges();
      },
      error: (err: any) => {
        console.error('loadUser - API Error:', err);
      }
    })
  }

  // ตรวจสอบสถานะรหัสผ่านจากข้อมูล API
  private checkPasswordStatus() {
    if (!this.dataUser) return;

    // รวมข้อมูลจาก session (เชื่อถือได้กว่า) กับข้อมูลจาก API
    // ถ้า API ไม่มีค่าบางตัว (เช่น datetimeup = null) ให้ใช้ค่าจาก session เพื่อป้องกัน false positive
    const sessionUser = this.userService.getCurrentUser() || {};
    const effectiveUser = {
      // กรณี API คืนค่า null/'' ให้ใช้ของ session แทน
      datetimeup: (this.dataUser.datetimeup ?? sessionUser.datetimeup) || '',
      // รองรับชื่อฟิลด์แตกต่างจาก API
      pwdExp: this.dataUser.pwdExp ?? this.dataUser.usrPwdexp ?? sessionUser.pwdExp,
      usr_PWDExp: this.dataUser.usr_PWDExp ?? sessionUser.usr_PWDExp,
      usrPWD: this.dataUser.usrPWD ?? sessionUser.usrPWD
    } as any;

    if (effectiveUser.datetimeup) {
      this.passwordExpiryDate = effectiveUser.datetimeup;
    }

    // ประเมินสถานะด้วยข้อมูลที่รวมแล้ว
    const passwordStatus: PasswordStatus = this.passwordStatusService.checkPasswordStatus(effectiveUser);
    
    // อัปเดต properties จาก service
    this.isPasswordExpired = passwordStatus.isPasswordExpired;
    this.passwordExpiryDays = passwordStatus.passwordExpiryDays;
    this.passwordExpiryDate = passwordStatus.passwordExpiryDate;
    this.isDefaultPassword = passwordStatus.isDefaultPassword;
    
    
    
    
    // Force change detection
    this.cd.detectChanges();
  }

  onClear(): void {
    this.oldPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.cd.detectChanges();
  }

  onChangePassword(): void {
    this.loading = true;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (this.oldPassword == '' || this.newPassword == '' || this.confirmPassword == '') {
      this.loading = false;
      Swal.fire({
        icon: 'error',
        text: "กรุณากรอกข้อมูลให้ครบถ้วน",
      });
      return;
    }
    
    // ตรวจสอบรหัสผ่านใหม่ตรงกัน
    if (this.newPassword !== this.confirmPassword) {
      this.loading = false;
      Swal.fire({
        icon: 'error',
        text: "รหัสผ่านใหม่ไม่ตรงกัน",
      });
      return;
    }
    
    // ตรวจสอบรหัสผ่านใหม่ไม่ซ้ำกับรหัสผ่านเดิม
    if (this.oldPassword === this.newPassword) {
      this.loading = false;
      Swal.fire({
        icon: 'error',
        text: "รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม กรุณาบันทึกใหม่",
      });
      return;
    }
    
    // ตรวจสอบความยาวรหัสผ่านใหม่ (ขั้นต่ำ 8 ตัวอักษร)
    if (this.newPassword.length < 8) {
      this.loading = false;
      Swal.fire({
        icon: 'error',
        text: "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร",
      });
      return;
    }
    
    // ตรวจสอบรหัสผ่านใหม่ไม่ใช่รหัสผ่านเริ่มต้น (baac)
    if (this.newPassword === 'baac') {
      this.loading = false;
      Swal.fire({
        icon: 'error',
        text: "รหัสผ่านใหม่ต้องไม่ใช่รหัสผ่านเริ่มต้น 'baac' กรุณาบันทึกใหม่",
      });
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
        
        // กำหนดว่าต้อง login ใหม่หรือไม่ ก่อนรีเซ็ตสถานะ
        const shouldReLogin = this.isPasswordExpired || this.isDefaultPassword;
        
        // อัปเดตสถานะหลังจากเปลี่ยนรหัสผ่านสำเร็จ
        this.isPasswordExpired = false;
        this.isDefaultPassword = false;
        
        // ไม่แก้ไข datetimeup ในฝั่ง client ปล่อยให้ backend อัปเดตและรีเฟรชเมื่อจำเป็น
        
        Swal.fire({
          icon: 'success',
          text: `${msg}`,
          confirmButtonText: 'ตกลง',
          confirmButtonColor: "#50C878"
        }).then((result) => {
          if (result.isConfirmed) {
            // ถ้ารหัสผ่านหมดอายุหรือเป็นรหัสผ่านเริ่มต้น ให้ login ใหม่
            if (shouldReLogin) {
              this.loginService.login(this.userId, this.newPassword).subscribe({
                next: (res: any) => {
                  sessionStorage.setItem('token', res.token);
                  // อัปเดตข้อมูลผู้ใช้ใน sessionStorage ให้เมนูโหลดตามสิทธิ์ทันที
                  try {
                    // ใช้ service กลางในการอัปเดต session
                    const responseWithToday = { ...res, datetimeup: this.getTodayBEDateString() };
                    this.userService.updateSessionFromAuthResponse(responseWithToday);
                  } catch (e) {
                    console.error('Failed to update session userData after password change:', e);
                  }
                  // ทำ reload ทั้งหน้าเพื่อให้ AdminDashboard re-init และโหลดเมนูใหม่
                  window.location.href = '/dashboard-admin/home';
                }, error: (err) => {
                  console.log('Error', err);
                  // ถ้า login ไม่สำเร็จ ให้ clear form
                  this.onClear();
                }
              });
            } else {
              // ถ้าเปลี่ยนรหัสผ่านปกติ ให้ clear form
              this.onClear();
            }
          }
        });
        this.cd.detectChanges();
      }, error: (err: any) => {
        if (err.status === 409) {
          this.loading = false
          Swal.fire({
            icon: 'warning',
            text: `${err.error}`,
            confirmButtonText: 'Yes',
            confirmButtonColor: "#50C878"
          });
          this.cd.detectChanges();
        } else {
          console.log("Error", err);
        }
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
