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
          sessionStorage.setItem('level', res.usr_LVL);
          sessionStorage.setItem('lvlDesc', res.usr_DESC);
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
