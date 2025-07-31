import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Spin } from '../../../services/spin';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-spin-files',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-spin-files.html',
  styleUrl: './create-spin-files.css'
})
export class CreateSpinFilesComponent implements OnInit {
  files: string[] = [];
  constructor(
    private spinService: Spin,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.spinService.getSpinFiles().subscribe(data => {
      this.files = data;
      this.cd.markForCheck();
    })
  }

  createSpinFile() {
    this.spinService.createSpinFile().subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'สร้าง SPiN FILE สำเร็จ',
          showConfirmButton: true,
          // timer: 1500
        }).then((result) => {
          if (result.isDismissed) {
            this.spinService.getSpinFiles().subscribe(data => {
              this.files = data;
              this.cd.markForCheck();
            });
          }
        })

      }, error: (err) => {
        console.error('Error creating spin file:', err);
      }
    })
  }

  download(fileName: string) {
    this.spinService.downloadSpinFile(fileName).subscribe(blob => {
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
    });
  }
}
