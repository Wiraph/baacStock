import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-contact',
  imports: [],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class ContactComponent {
  // Component logic goes here
  contactInfoAdmin   = {
    title: 'งานหุ้นธนาคาร | ฝ่ายบริหารการเงิน (บง.)',
    address: 'ธ.ก.ส.สำนักงานใหญ่ เลขที่ 2346 ถนนพหลโยธิน แขวงเสนานิคม เขตจตุจักร กรุงเทพฯ 10900',
    phone: '0 2558 6555 ต่อ 6780-1',
    fax: '0 2558 6155, 0 2558 6157'
  }

  contactInfoDev = {
    title: 'งานหุ้นธนาคาร | ฝ่ายพัฒนาระบบและสารสนเทศ (พส.)',
    address: 'ธ.ก.ส.สำนักงานใหญ่ เลขที่ 2346 ถนนพหลโยธิน แขวงเสนานิคม เขตจตุจักร กรุงเทพฯ 10900',
    phone: '0 2558 6555 ต่อ 4000',
  }
}
