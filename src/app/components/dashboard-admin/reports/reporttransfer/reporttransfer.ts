import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-reporttransfer',
  imports: [CommonModule],
  templateUrl: './reporttransfer.html',
  styleUrl: './reporttransfer.css'
})
export class Reporttransfer implements OnInit {
  @Output() headerChange = new EventEmitter<string>();

  constructor(
    private readonly cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    setTimeout(() => this.sendHead());
  }

  sendHead() {
    this.headerChange.emit("รายงานการขายหุ้น/โอนเปลี่ยนมือ");
  }
}
