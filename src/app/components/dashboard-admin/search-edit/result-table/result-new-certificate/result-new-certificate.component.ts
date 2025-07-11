import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'result-new-certificate',
  imports: [CommonModule],
  templateUrl: './result-new-certificate.component.html',
  styleUrls: ['./result-new-certificate.component.css']
})
export class ResultNewCertificateComponent {
  @Input() results: any[] = [];
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 20;
  @Input() totalItems: number = 0;

  @Output() edit = new EventEmitter<any>();
  @Output() viewStock = new EventEmitter<any>();

  onEditClick(item: any) {
    this.edit.emit(item);
  }

}
