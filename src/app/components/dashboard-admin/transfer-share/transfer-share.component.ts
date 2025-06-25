import { Component, Input } from '@angular/core';
import { SearchEditComponent } from '../search-edit/search-edit';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transfer-share.component',
  imports: [SearchEditComponent, CommonModule],
  templateUrl: './transfer-share.component.html',
  styleUrl: './transfer-share.component.css'
})
export class TransferShareComponent {
  @Input() InputtransferShare!: string;
  internalViewName = "transfer-share";



  activeView: string = 'search';
  setView(view: string) {
    this.activeView = view;
  }
}
