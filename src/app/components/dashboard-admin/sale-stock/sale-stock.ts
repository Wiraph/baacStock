import { ChangeDetectorRef, Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchEditComponent } from '../search-edit/search-edit';
import { DataTransfer } from '../../../services/data-transfer';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ManageFormComponent } from '../../manage-from/manage-from';

@Component({
  standalone: true,
  selector: 'app-sale-stock',
  imports: [CommonModule, ReactiveFormsModule, SearchEditComponent, FormsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, ManageFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sale-stock.html',
  styleUrl: './sale-stock.css'
})
export class SaleStockComponent implements OnInit {
  activeView = 'search';
  loading = false;
  cusId = '';
  customerForm!: FormGroup;

  constructor(
    private readonly dataTransfer: DataTransfer,
    private readonly cd: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.dataTransfer.setPageStatus('2');
  }

  handleData(event: { view: string; cusId: string }) {
    this.cusId = event.cusId;
    this.activeView = 'stksale';
    this.cd.detectChanges();
  }

  onBack() {
    this.activeView = 'search';
    this.cd.detectChanges();
  }

  submit(event: any) {
    console.log(event);
  }
}
