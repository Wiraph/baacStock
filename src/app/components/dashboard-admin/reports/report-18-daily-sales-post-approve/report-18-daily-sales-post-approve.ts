import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-report-18-daily-sales-post-approve',
  standalone: true,
  imports: [],
  templateUrl: './report-18-daily-sales-post-approve.html',
  styleUrl: './report-18-daily-sales-post-approve.css'
})
export class Report18DailySalesPostApprove implements OnInit {
  @Output() headerChange = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();

  ngOnInit(): void {
    setTimeout(() => this.sendHead());
  }

  sendHead() {
    this.headerChange.emit("รายงานการขายหุ้นประจำวันหลังอนุมัติ");
  }

  goBack(): void {
    this.back.emit();
  }
}