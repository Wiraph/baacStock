import { ChangeDetectorRef, Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import Swal from 'sweetalert2';
import { Login } from '../../../services/login';
import { PasswordStatusService, PasswordStatus } from '../../../services/password-status.service';

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
  isFirstTimeUser = false;
  isPasswordExpired = false;
  passwordExpiryDays = 0;
  passwordExpiryDate: string | null = null;
  isDefaultPassword = false; // เพิ่มการตรวจสอบรหัสผ่านเริ่มต้น

  constructor(
    private readonly userService: UserService,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    private readonly cd: ChangeDetectorRef,
    private readonly loginService: Login,
    private readonly passwordStatusService: PasswordStatusService
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // ใช้ UserService เพื่อดึงข้อมูลผู้ใช้ปัจจุบันแทนการ decode token
      const currentUser = this.userService.getCurrentUser();
      
      if (currentUser.username) {
        this.userId = currentUser.username;
        this.userName = currentUser.username;
        this.fullName = currentUser.fullname;
        
        console.log('Change Password Component - Current User:', currentUser);
        
        // ตรวจสอบ password status จากข้อมูลใน sessionStorage
        this.checkPasswordStatusFromSession();
        
        console.log('ngOnInit - After checkPasswordStatusFromSession - Properties:', {
          isFirstTimeUser: this.isFirstTimeUser,
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
      console.log('checkPasswordStatusFromSession - Current User:', currentUser);
      
      // ใช้ PasswordStatusService แทนการเขียน logic ซ้ำ
      const passwordStatus: PasswordStatus = this.passwordStatusService.checkPasswordStatus(currentUser);
      
      console.log('checkPasswordStatusFromSession - Password Status:', passwordStatus);
      
      // อัปเดต properties จาก service
      this.isFirstTimeUser = passwordStatus.isFirstTimeUser;
      this.isPasswordExpired = passwordStatus.isPasswordExpired;
      this.passwordExpiryDays = passwordStatus.passwordExpiryDays;
      this.passwordExpiryDate = passwordStatus.passwordExpiryDate;
      this.isDefaultPassword = passwordStatus.isDefaultPassword;
      
      console.log('checkPasswordStatusFromSession - Properties Updated:', {
        isFirstTimeUser: this.isFirstTimeUser,
        isPasswordExpired: this.isPasswordExpired,
        isDefaultPassword: this.isDefaultPassword
      });
      
      // Force change detection
      this.cd.detectChanges();
      
      // ตรวจสอบ template condition
      const shouldShowWarning = this.isFirstTimeUser || this.isPasswordExpired || this.isDefaultPassword;
      console.log('Template condition check:', {
        condition: 'isFirstTimeUser || isPasswordExpired || isDefaultPassword',
        result: shouldShowWarning,
        values: {
          isFirstTimeUser: this.isFirstTimeUser,
          isPasswordExpired: this.isPasswordExpired,
          isDefaultPassword: this.isDefaultPassword
        }
      });
    }
  }



  loadUser() {
    console.log('loadUser - Starting with userId:', this.userId);
    
    this.userService.getUserById(this.userId).subscribe({
      next: (res: any) => {
        this.dataUser = res;
        console.log('loadUser - API Response:', this.dataUser);
        
        // ตรวจสอบ password status
        this.checkPasswordStatus();
        
        console.log('loadUser - After checkPasswordStatus - Properties:', {
          isFirstTimeUser: this.isFirstTimeUser,
          isPasswordExpired: this.isPasswordExpired,
          isDefaultPassword: this.isDefaultPassword
        });
        
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

    // อัปเดตข้อมูลจาก API ถ้ามีข้อมูลใหม่
    if (this.dataUser.datetimeup) {
      this.isFirstTimeUser = false;
      this.passwordExpiryDate = this.dataUser.datetimeup;
    }
    
    // ใช้ PasswordStatusService แทนการเขียน logic ซ้ำ
    const passwordStatus: PasswordStatus = this.passwordStatusService.checkPasswordStatus(this.dataUser);
    
    // อัปเดต properties จาก service
    this.isFirstTimeUser = passwordStatus.isFirstTimeUser;
    this.isPasswordExpired = passwordStatus.isPasswordExpired;
    this.passwordExpiryDays = passwordStatus.passwordExpiryDays;
    this.passwordExpiryDate = passwordStatus.passwordExpiryDate;
    this.isDefaultPassword = passwordStatus.isDefaultPassword;
    
    console.log('Password Status from API:', passwordStatus);
    console.log('Change Password Component Properties After API Update:', {
      isFirstTimeUser: this.isFirstTimeUser,
      isPasswordExpired: this.isPasswordExpired,
      isDefaultPassword: this.isDefaultPassword
    });
    
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
        
        // อัปเดตสถานะหลังจากเปลี่ยนรหัสผ่านสำเร็จ
        this.isFirstTimeUser = false;
        this.isPasswordExpired = false;
        this.isDefaultPassword = false;
        
        // อัปเดต dataUser เพื่อให้ template แสดงผลถูกต้อง
        if (this.dataUser) {
          this.dataUser.datetimeup = new Date().toISOString();
        }
        
        Swal.fire({
          icon: 'success',
          text: `${msg}`,
          confirmButtonText: 'ตกลง',
          confirmButtonColor: "#50C878"
        }).then((result) => {
          if (result.isConfirmed) {
            // ถ้าเป็น first time user, password expired หรือ default password ให้ login ใหม่
            if (this.isFirstTimeUser || this.isPasswordExpired || this.isDefaultPassword) {
              this.loginService.login(this.userId, this.newPassword).subscribe({
                next: (res: any) => {
                  sessionStorage.setItem('token', res.token);
                  // Redirect ไปหน้า dashboard
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
}
