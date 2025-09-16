import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-report-17-daily-sales-pre-approve',
  standalone: true,
  imports: [],
  templateUrl: './report-17-daily-sales-pre-approve.html',
  styleUrl: './report-17-daily-sales-pre-approve.css'
})
export class Report17DailySalesPreApprove implements OnInit {
  @Output() headerChange = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();

  ngOnInit(): void {
    setTimeout(() => this.sendHead());
  }

  sendHead() {
    this.headerChange.emit("รายงานการขายหุ้นประจำวันก่อนอนุมัติ");
  }

  goBack(): void {
    this.back.emit();
  }
}
