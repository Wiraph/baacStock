import { ChangeDetectorRef, Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { JwtDecoder } from '../../../services/jwt-decoder';
import Swal from 'sweetalert2';
import { Login } from '../../../services/login';

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
  token = '';
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
    private readonly jwdDecodeService: JwtDecoder,
    private readonly cd: ChangeDetectorRef,
    private readonly loginService: Login
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.token = sessionStorage.getItem('token') || "";
    }

    if (!this.token) {
      console.error("Token not found in sessionStorage");
      return;
    }

    const decodedToken = this.jwdDecodeService.decodeToken(String(this.token));
    this.userId = decodedToken.UserId;
    this.loadUser();
    
    // ตรวจสอบว่าต้องเปลี่ยนรหัสผ่านหรือไม่
    this.checkIfPasswordChangeRequired();
  }

  // ตรวจสอบว่าต้องเปลี่ยนรหัสผ่านหรือไม่
  private checkIfPasswordChangeRequired() {
    // ตรวจสอบหลังจาก loadUser เสร็จแล้ว
    setTimeout(() => {
      if (this.isFirstTimeUser || this.isPasswordExpired || this.isDefaultPassword) {
        console.log('Password change required:', {
          isFirstTimeUser: this.isFirstTimeUser,
          isPasswordExpired: this.isPasswordExpired,
          isDefaultPassword: this.isDefaultPassword
        });
        
        // แสดงข้อความแจ้งเตือน
        if (this.isFirstTimeUser) {
          this.msgAlert("กรุณากำหนดรหัสผ่านใหม่ สำหรับการใช้งานระบบครั้งแรก");
        } else if (this.isPasswordExpired) {
          this.msgAlert(`รหัสผ่านหมดอายุ (${this.passwordExpiryDays} วัน) กรุณากำหนดรหัสผ่านใหม่`);
        } else if (this.isDefaultPassword) {
          this.msgAlert("คุณกำลังใช้รหัสผ่านเริ่มต้น (baac) กรุณากำหนดรหัสผ่านใหม่เพื่อความปลอดภัย");
        }
      }
    }, 1000); // รอให้ loadUser เสร็จก่อน
  }

  loadUser() {
    this.userService.getUserById(this.userId).subscribe({
      next: (res: any) => {
        this.dataUser = res;
        console.log(this.dataUser);
        
        // ตรวจสอบ password status
        this.checkPasswordStatus();
        
        this.cd.detectChanges();
      }
    })
  }

  // ตรวจสอบสถานะรหัสผ่าน
  private checkPasswordStatus() {
    if (!this.dataUser) return;

    // ตรวจสอบการใช้งานระบบครั้งแรก (DATETIMEUP เป็น null)
    this.isFirstTimeUser = !this.dataUser.datetimeup || this.dataUser.datetimeup === null;
    
    // ตรวจสอบรหัสผ่านหมดอายุ
    if (this.dataUser.pwdExp && this.dataUser.datetimeup) {
      const lastPasswordChange = new Date(this.dataUser.datetimeup);
      const currentDate = new Date();
      const daysDiff = Math.floor((currentDate.getTime() - lastPasswordChange.getTime()) / (1000 * 60 * 60 * 24));
      
      this.passwordExpiryDays = this.dataUser.pwdExp;
      this.isPasswordExpired = daysDiff > this.passwordExpiryDays;
      this.passwordExpiryDate = this.dataUser.datetimeup;
    }
    
    // ถ้าไม่มี pwdExp ให้ใช้ค่า default 30 วัน
    if (!this.dataUser.pwdExp) {
      this.passwordExpiryDays = 30;
    }
    
    // ตรวจสอบรหัสผ่านเริ่มต้น (baac) - ตรวจสอบจาก oldPassword ที่ user กรอก
    // หรือตรวจสอบจากข้อมูลในระบบ
    this.isDefaultPassword = this.oldPassword === 'baac' || 
                           this.dataUser.currentPassword === 'baac' || 
                           this.dataUser.usrPWD === 'baac';
    
    console.log('Password Status:', {
      isFirstTimeUser: this.isFirstTimeUser,
      isPasswordExpired: this.isPasswordExpired,
      passwordExpiryDays: this.passwordExpiryDays,
      passwordExpiryDate: this.passwordExpiryDate,
      isDefaultPassword: this.isDefaultPassword,
      dataUser: this.dataUser
    });
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
      this.msgAlert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    
    // ตรวจสอบรหัสผ่านใหม่ตรงกัน
    if (this.newPassword !== this.confirmPassword) {
      this.loading = false;
      this.msgAlert("รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }
    
    // ตรวจสอบรหัสผ่านใหม่ไม่ซ้ำกับรหัสผ่านเดิม
    if (this.oldPassword === this.newPassword) {
      this.loading = false;
      this.msgAlert("รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม กรุณาบันทึกใหม่");
      return;
    }
    
    // ตรวจสอบความยาวรหัสผ่านใหม่ (ขั้นต่ำ 8 ตัวอักษร)
    if (this.newPassword.length < 8) {
      this.loading = false;
      this.msgAlert("รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }
    
    // ตรวจสอบรหัสผ่านใหม่ไม่ใช่รหัสผ่านเริ่มต้น (baac)
    if (this.newPassword === 'baac') {
      this.loading = false;
      this.msgAlert("รหัสผ่านใหม่ต้องไม่ใช่รหัสผ่านเริ่มต้น 'baac' กรุณาบันทึกใหม่");
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

  msgAlert(msg: string) {
    Swal.fire({
      icon: 'error',
      text: `${msg}`,
    })
    this.cd.detectChanges();
  }
}
