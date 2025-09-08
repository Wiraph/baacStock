import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UserService } from '../../../services/user';
import { JwtDecoder } from '../../../services/jwt-decoder';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { MetadataService } from '../../../services/metadata';

@Component({
  selector: 'app-adduser',
  imports: [FormsModule, CommonModule],
  templateUrl: './adduser.html',
  styleUrl: './adduser.css'
})
export class AdduserComponent implements OnInit {
  @Output() back = new EventEmitter<void>();
  constructor(
    private readonly userService: UserService,
    private readonly jwtDecoder: JwtDecoder,
    private readonly cd: ChangeDetectorRef,
    private readonly metadataService: MetadataService
  ) { }

  levelList: any[] = [];
  branchList: any[] = [];
  decodedToken: any;
  token = '';
  selectedBranchCode: string = '';
  selectedLevelCode: string = '';
  userId: string = '';
  fullName: string = '';

  ngOnInit(): void {
    this.metadataService.getLevel().subscribe({
      next: (data) => {
        this.levelList = data;
        this.cd.detectChanges();
      },
      error: (error) => {
        console.log('Error fetching users:', error);
      }
    });

    this.metadataService.getBranch().subscribe({
      next: (data) => {
        this.branchList = data;
        this.cd.detectChanges();
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
      usrBrc: this.selectedBranchCode,
      usrID: this.userId,
      usrDESC: this.fullName,
      usrLVL: this.selectedLevelCode
    };
    this.userService.addUser(payload).subscribe({
      next: (msg: string) => {
        Swal.fire({
          icon: 'success',
          text: `${msg}`,
          confirmButtonText: 'Yes',
          confirmButtonColor: "#50C878"
        }).then((result) => {
          if(result.isConfirmed) {
            this.onBackClick();
          }
        });
        this.cd.detectChanges();
      }, error: (err: any) => {
        if (err.status === 409) {
          Swal.fire({
            icon: 'warning',
            text: `${err.error}`,
            confirmButtonText: 'Yes',
            confirmButtonColor: "#50C878"
          });
        } else {
          console.log("Error", err);
        }
      }
    })
  }

  clearForm() {
    this.selectedBranchCode = '';
    this.selectedLevelCode = '';
    this.userId = '';
    this.fullName = '';
  }

  onBackClick() {
    this.back.emit();
  }
}
