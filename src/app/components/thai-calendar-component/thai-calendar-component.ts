import { Component, EventEmitter, Output, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
  standalone: true,
  selector: 'app-calendar-popup',
  imports: [CommonModule, MatCardModule, MatDatepickerModule],
  templateUrl: './thai-calendar-component.html',
  styleUrl: './thai-calendar-component.css', // ✅ แก้เป็น styleUrls
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThaiCalendarComponent {
  @Input() selected: Date = new Date(); 
  @Output() selectedChange = new EventEmitter<Date>();
  @Output() dateSelected = new EventEmitter<Date>();
  @Output() closed = new EventEmitter<void>();

  onDateSelected(date: Date) {
    this.selected = date;
    this.selectedChange.emit(date); // ✅ sync กลับไปให้ parent
    this.dateSelected.emit(date);
    this.closed.emit();
  }

  onBackgroundClick(event: MouseEvent) {
    this.closed.emit();
  }
}
