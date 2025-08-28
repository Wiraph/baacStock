import { Component, OnInit } from '@angular/core';
import { PndComponent } from '../../../pnd/pnd';

@Component({
  selector: 'app-pnd2a',
  standalone: true,
  imports: [PndComponent],
  templateUrl: './pnd2a.component.html',
  styleUrls: ['./pnd2a.component.css']
})
export class Pnd2aComponent implements OnInit {
  pndType: string = '';
  title: string = '';
  constructor() {}

  ngOnInit(): void {
    this.pndType = "PND2A";
    this.title = "ภ.ง.ด. 2 ก";
  }
}