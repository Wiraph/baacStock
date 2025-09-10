import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Login } from '../../services/login';
import Swal from 'sweetalert2';

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
  loading = false;

  
  private readonly router = inject(Router);
  constructor(
    private readonly loginService: Login,
    private readonly cd: ChangeDetectorRef
  ) { }

  resetForm() {
    this.username = '';
    this.password = '';
    this.errorMessage = '';
  }

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';
    this.loginService.login(this.username, this.password).subscribe({
      next: (res: any) => {
        console.log(res);
        this.loading = false;
        this.cd.detectChanges();

        if (res.siGNonALLOW === 1) {
          console.log("Pass");
          console.log("Login response:", res);
          
          // เก็บข้อมูลพื้นฐาน
          sessionStorage.setItem('level', res.usr_LVL);
          sessionStorage.setItem('lvlDesc', res.usr_DESC);
          sessionStorage.setItem('username', res.usr_ID);
          sessionStorage.setItem('fullname', res.usr_DESC);
          sessionStorage.setItem('brCode', res.usr_BRC);
          sessionStorage.setItem('brName', res.brName);
          
          // เก็บข้อมูลเพิ่มเติมสำหรับตรวจสอบ password status
          const userData = {
            datetimeup: res.datetimeup,
            pwdExp: res.pwdExp,
            usr_PWDExp: res.usr_PWDExp, // เพิ่ม usr_PWDExp
            usrPWD: res.usr_PWD || this.password, // เก็บรหัสผ่านที่ใช้ login
            currentPassword: this.password, // เก็บรหัสผ่านปัจจุบัน
            level: res.usr_LVL,
            username: res.usr_ID,
            fullname: res.usr_DESC
          };
          
          sessionStorage.setItem('userData', JSON.stringify(userData));
          console.log("Stored userData:", userData);
          
          this.router.navigate(['/dashboard-admin/']);
          this.cd.detectChanges();
        } else {
          Swal.fire({
            icon: 'error',
            text: `${res.siGNonMSG}`
          })
        }
      },
      error: (err: any) => {
        if (err) {
          alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ โปรดติดต่อผู้ดูแลระบบ');
          this.loading = false;
          this.cd.detectChanges(); // ⬅️ บังคับให้ UI รู้
        }
      }
    });
  }
}
