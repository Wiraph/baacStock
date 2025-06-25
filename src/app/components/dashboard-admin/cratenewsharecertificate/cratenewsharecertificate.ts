import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchEditComponent } from '../search-edit/search-edit';

@Component({
  standalone: true,
  selector: 'app-cratenewsharecertificate',
  imports: [CommonModule, FormsModule, SearchEditComponent],
  templateUrl: './cratenewsharecertificate.html',
  styleUrl: './cratenewsharecertificate.css'
})
export class CratenewsharecertificateComponent {
  @Input() inputShareCertificate!: string;
  internalViewName = "create-new-share-certificate";



  activeView: string = 'search';
  setView(view: string) {
    this.activeView = view;
  }
}
