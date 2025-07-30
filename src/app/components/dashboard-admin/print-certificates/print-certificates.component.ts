import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-print-certificates',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './print-certificates.component.html',
  styleUrls: ['./print-certificates.component.css']
})
export class PrintCertificatesComponent {
  
  constructor() { }

  getCurrentDate(): string {
    const now = new Date();
    return now.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
} 