import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchEditComponent } from '../search-edit/search-edit';
import { StockTableDetailComponent } from '../stock-table-detail/stock-table-detail';

@Component({
  standalone: true,
  selector: 'app-cratenewsharecertificate',
  imports: [CommonModule, FormsModule, SearchEditComponent, StockTableDetailComponent],
  templateUrl: './cratenewsharecertificate.html',
  styleUrl: './cratenewsharecertificate.css'
})
export class CratenewsharecertificateComponent {
  @Input() inputShareCertificate!: string;
  internalViewName = "create-new-share-certificate";

  activeView: string = 'search';
  selectedStock: any;
  setView(view: string) {
    this.activeView = view;
  }

  onCreatenew(stock: any) {
    console.log("ค่าที่ได้รับกลับมา: ",stock);
    this.selectedStock = stock;
    this.activeView = 'create';
  }

  handleNewStockRequest(stock: any) {
    console.log('ผู้ใช้กดออกใหม่ที่ใบหุ้น:', stock); 
    this.activeView = "select"
  }
}
