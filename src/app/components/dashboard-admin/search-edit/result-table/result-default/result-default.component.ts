import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PermissionService } from '../../../../../services/permission.service';

@Component({
  selector: 'result-default',
  templateUrl: './result-default.component.html',
  //   styleUrls: ['./result-default.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ResultDefaultComponent {
  @Input() results: any[] = [];
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 10;
  @Input() totalItems: number = 0;
  @Input() viewMode: string = '';
  @Input() userLevel: string = ''; 

  @Output() edit = new EventEmitter<any>();
  @Output() viewStock = new EventEmitter<any>();

  constructor(private readonly permissionService: PermissionService) {}

  // ตรวจสอบสิทธิ์การแก้ไข (เฉพาะ level 99, 85, 05)
  canEdit(): boolean {
    return this.permissionService.hasEditPermission(this.userLevel);
  }

  onEditClick(item: any) {
    const dataToEdit = {
      cusId: item.cusId
    };
    console.log('Data to edit:', dataToEdit);
    this.edit.emit(dataToEdit);
  }

  onViewStockClick(item: any) {
    const dataToViewStock = {
      stockNotes: item.stockNotes || [],
      cusId: item.cusId,
      fullname: item.fullName,
      stockList: item.stockList || [],
      statusDesc: item.statusDesc || item.status,
      viewMode: 'viewer'
    }
    console.log("🔍 Emit viewStock data:", dataToViewStock);
    console.log("📋 Original item data:", item);
    this.viewStock.emit(dataToViewStock);
  }

}
