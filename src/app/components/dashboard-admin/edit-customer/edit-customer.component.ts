import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchEditComponent } from '../search-edit/search-edit';
import { DataTransfer } from '../../../services/data-transfer';
import { MatTabsModule } from '@angular/material/tabs';
import { ManageFormComponent } from '../../manage-from/manage-from';


@Component({
  standalone: true,
  selector: 'app-edit-customer',
  imports: [CommonModule, ReactiveFormsModule, SearchEditComponent, MatTabsModule, FormsModule, ManageFormComponent],
  templateUrl: './edit-customer.component.html',
  styleUrl: './edit-customer.component.css',
})
export class EditCustomerComponent implements OnInit {
  activeView = 'search';
  loading = false;
  cusId = '';

  constructor(
    private readonly dataTransfer: DataTransfer,
    private readonly cd: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.dataTransfer.setPageStatus('1');
  }

  handleData(event: { view: string; cusId: string }) {
    this.activeView = event.view;
    this.cusId = event.cusId;
    this.cd.detectChanges();
  }

  onSubmit(event: any) {
    console.log(event);
  }

  onBack() {
    this.activeView = 'search';
    this.cd.detectChanges();
  }
}
