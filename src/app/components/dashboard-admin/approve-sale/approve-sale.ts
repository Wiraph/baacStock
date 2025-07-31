import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DataTransfer } from '../../../services/data-transfer';

@Component({
  selector: 'app-approve-sale',
  imports: [CommonModule],
  templateUrl: './approve-sale.html',
  styleUrl: './approve-sale.css'
})
export class ApproveSale implements OnInit {
  loading = false;
  stkNote: string = '';
  status: string = '';


  constructor (
    private dataTransfer: DataTransfer
  ) {}



  ngOnInit(): void {
    this.loading = true;
    this.stkNote = this.dataTransfer.getStkNote();
    this.status = this.dataTransfer.getStatus();
    // Simulate loading data
    setTimeout(() => {
      this.loading = false;
    }, 1000);

  }

  onClose() {

  }
}
