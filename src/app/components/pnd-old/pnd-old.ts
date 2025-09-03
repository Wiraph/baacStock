import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Pnd } from '../../services/pnd';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-pnd-old',
  imports: [CommonModule],
  templateUrl: './pnd-old.html',
  styleUrl: './pnd-old.css'
})
export class PndOld implements OnInit {
  @Input() pndType: string = '';
  @Input() title: string = '';
  isLoading: boolean = false;
  pndData: any[] = [];

  constructor(
    private readonly pndService: Pnd,
    private readonly cd: ChangeDetectorRef,
  ) { }
  ngOnInit(): void {
    this.loadPndData();
  }

  loadPndData() {
    this.isLoading = true;
    const payload = {
      pndType: this.pndType
    };
    this.pndService.getPndReport(payload).subscribe({
      next: (res: any) => {
        this.pndData = res;
        console.log("pndData", this.pndData);
        this.isLoading = false;
        this.cd.detectChanges();
      }, error: (err) => {
        console.log("Load Error", err);
        this.isLoading = false;
        this.cd.detectChanges();
      }
    })
  }

  /**
   * ฟังก์ชันเรียก เดือนแบบย่อ
   */
  getShortMonthName(monthNumber: number): string {
    const month = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    if (monthNumber < 1) {
      return month[11];
    }
    if (monthNumber > 12) {
      return '';
    }
    return month[monthNumber - 1];
  }

  toNumber(val: string): number {
    return Number(val);
  }
}
