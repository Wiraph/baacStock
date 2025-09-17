import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-report-19-sales-new-only',
  standalone: true,
  imports: [],
  templateUrl: './report-19-sales-new-only.html',
  styleUrl: './report-19-sales-new-only.css'
})
export class Report19SalesNewOnly implements OnInit {
  @Output() headerChange = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();

  ngOnInit(): void {
    setTimeout(() => this.sendHead());
  }

  sendHead() {
    this.headerChange.emit("รายงานการขายหุ้นสามัญ (เฉพาะรายใหม่)");
  }

  goBack(): void {
    this.back.emit();
  }
}