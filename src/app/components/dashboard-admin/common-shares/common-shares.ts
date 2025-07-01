import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchEditComponent } from '../search-edit/search-edit';

@Component({
  standalone: true,
  selector: 'app-common-shares',
  imports: [CommonModule, FormsModule, SearchEditComponent],
  templateUrl: './common-shares.html',
  styleUrl: './common-shares.css'
})
export class CommonSharesComponent {
  @Input() commonShare!: string;
  commonShares = "common-shares";

  
  
  activeView: string = 'search';

  editingItem: any = null;
  homeAddress: any = null;
  currentAddress: any = null;
  stockDividend: any = null;

  setView(view: string) {
    this.activeView = view;
  }

  onEditCustomer(data: {
    editingItem: any;
    homeAddress: any;
    currentAddress: any;
    stockDividend: any;
  }) {
    this.editingItem = data.editingItem;
    this.homeAddress = data.homeAddress;
    this.currentAddress = data.currentAddress;
    this.stockDividend = data.stockDividend;
    this.activeView = 'commonStock';
  }
}
