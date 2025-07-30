import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user';
import { JwtDecoder } from '../../../services/jwt-decoder';
import { filter } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-adduser',
  imports: [FormsModule, CommonModule],
  templateUrl: './adduser.html',
  styleUrl: './adduser.css'
})
export class AdduserComponent implements OnInit {
  constructor(
    private userService: UserService,
    private jwtDecoder: JwtDecoder,
    private cd: ChangeDetectorRef
  ) { }

  levelList: any[] = [];
  branchList: any[] = [];
  decodedToken: any;
  token = sessionStorage.getItem('token');
  selectedBranchCode: string = '';
  selectedLevelCode: string = '';
  userId: string = '';
  fullName: string = '';

  ngOnInit(): void {
    if (this.token) {
      this.decodedToken = this.jwtDecoder.decodeToken(this.token);
      console.log('Decoded Token:', this.decodedToken);
    }

    this.userService.getUserLevels().subscribe({
      next: (data) => {
        if (this.decodedToken.Role == 99) {
          this.levelList = data;
          this.cd.detectChanges();
        } else {
          this.levelList = data.filter((user: any) => user.lvlCode < this.decodedToken.Role);
          this.cd.detectChanges();
        }
      },
      error: (error) => {
        console.log('Error fetching users:', error);
      }
    });

    this.userService.getBranchList().subscribe({
      next: (data) => {
        console.log('Branch List:', data);
        if (this.decodedToken.Role == 99 || this.decodedToken.Role == 89) {
          this.branchList = data;
          this.cd.detectChanges();
        } else {
          this.branchList = data.filter((branch: any) => branch.brProBrn == this.decodedToken.BrCode);
          this.selectedBranchCode = this.branchList[0]?.brProBrn || '';
          this.cd.detectChanges();
        }
      },
      error: (error) => {
        console.log('Error fetching branch list:', error);
      }
    });

    this.cd.detectChanges();
  }

  onSubmit(form: any) {
    if (form.valid) {
      console.log('ข้อมูลที่ส่ง:', {
        branchCode: this.selectedBranchCode,
        userId: this.userId,
        fullName: this.fullName,
        levelCode: this.selectedLevelCode
      });
      Swal.fire({
        title: 'ยืนยันการเพิ่มผู้ใช้ใหม่',
        text: `สาขา: ${this.selectedBranchCode}, รหัสผู้ใช้: ${this.userId}, ชื่อเต็ม: ${this.fullName}, ระดับ: ${this.selectedLevelCode}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ยืนยัน',
        cancelButtonText: 'ยกเลิก'
      }).then((result) => {
        if (result.isConfirmed) {
          this.addUser();
        }
      })
    }
  }

  addUser() {
    const payload = {
      usrBRC: this.selectedBranchCode,
      usrID: this.userId,
      usrDESC: this.fullName,
      usrLVL: this.selectedLevelCode
    };
    console.log('Payload:', payload);
    this.userService.addUser(payload).subscribe({
      next: (res) => {
        Swal.fire({
          title: 'สำเร็จ',
          text: 'เพิ่มผู้ใช้ใหม่เรียบร้อยแล้ว',
          icon: 'success',
          confirmButtonText: 'ตกลง'
        }).then(() => {
          this.resetForm();
        })
      }, error: (err) => {
        console.error('Error adding user:', err);
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถเพิ่มผู้ใช้ใหม่ได้',
          icon: 'error',
          confirmButtonText: 'ตกลง'
        });
      }
    })
  }

  resetForm() {
    window.location.reload();
  }

  clearForm() {
    this.selectedBranchCode = '';
    this.selectedLevelCode = '';
    this.userId = '';
    this.fullName = '';
  }

}
