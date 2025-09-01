import { ChangeDetectorRef, Component, Inject, PLATFORM_ID } from '@angular/core';
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
export class ChangePasswordComponent {
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
  }

  loadUser() {
    this.userService.getUserById(this.userId).subscribe({
      next: (res: any) => {
        this.dataUser = res;
        console.log(this.dataUser);
        this.cd.detectChanges();
      }
    })
  }

  onClear(): void {
    this.oldPassword = '',
      this.newPassword = '',
      this.confirmPassword = ''
    this.cd.detectChanges();
  }

  onChangePassword(): void {
    this.loading = true;

    if (this.oldPassword == '' || this.newPassword == '' || this.confirmPassword == '') {
      this.loading = false;
      this.msgAlert("กรุณากรอกข้อมูลให้ครบถ้วน");
    }
    if (this.newPassword !== this.confirmPassword) {
      this.loading = false;
      this.msgAlert("รหัสผ่านใหม่ไม่ตรงกัน");
    }

    const payload = {
      userId: this.dataUser.usrId,
      pwdO: this.oldPassword,
      newPwd: this.newPassword,
      userDesc: this.dataUser.usrDesc
    };

    this.userService.changePassword(payload).subscribe({
      next: (msg: string) => {
        this.loading = false;
        Swal.fire({
          icon: 'success',
          text: `${msg}`,
          confirmButtonText: 'Yes',
          confirmButtonColor: "#50C878"
        }).then((result) => {
          if (result.isConfirmed) {
            this.loginService.login(this.userId, this.newPassword).subscribe({
              next: (res:any) => {
                sessionStorage.setItem('token', res.token);
              }, error: (err) => {
                console.log('Error', err);
              }
            })
            // TODO ไปหน้า HOME
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
