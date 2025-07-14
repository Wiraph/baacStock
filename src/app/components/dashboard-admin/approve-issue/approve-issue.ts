import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-approve-issue',
  imports: [CommonModule],
  templateUrl: './approve-issue.html',
  styleUrl: './approve-issue.css'
})
export class ApproveIssue {


  activeView: string = "table";
  brName = sessionStorage.getItem('brName');

  setView(view: string) {
    this.activeView = view;
  }
}
