import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SearchEditComponent } from '../../search-edit/search-edit';


@Component({
  standalone: true,
  selector: 'app-transfer-share',
  imports: [CommonModule, SearchEditComponent],
  templateUrl: './transfer-share.html',
  styleUrl: './transfer-share.css'
})
export class TransferShareComponent {
  @Input() inputTransferShare!: string;
  internalViewName = "โอนเปลี่ยนมือ";


  activeView: string = 'search';
  setView(view: string) {
    this.activeView = view;
  }
}
