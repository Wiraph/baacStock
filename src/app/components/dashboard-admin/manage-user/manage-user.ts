import { Component } from '@angular/core';

@Component({
  selector: 'app-manage-user',
  imports: [],
  templateUrl: './manage-user.html',
  styleUrl: './manage-user.css'
})
export class ManageUserComponent {
  users = [
    { name: 'สมชาย', email: 'somchai@example.com', role: 'Admin' },
    { name: 'ศิริพร', email: 'siri@example.com', role: 'User' },
  ];

  editUser(user: any) {
    // ตัวอย่าง: เปิด modal หรือ navigate ไปหน้าแก้ไขผู้ใช้
    console.log('กำลังแก้ไข', user);
    // this.router.navigate(['/dashboard-admin/users/edit', user.id]);
  }
}
