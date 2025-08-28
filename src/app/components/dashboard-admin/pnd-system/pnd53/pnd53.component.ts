import { Component, OnInit } from '@angular/core';
import { PndComponent } from '../../../pnd/pnd';

@Component({
  selector: 'app-pnd53',
  standalone: true,
  imports: [PndComponent],
  templateUrl: './pnd53.component.html',
  styleUrls: ['./pnd53.component.css']
})
export class Pnd53Component implements OnInit {
  pndType: string = '';
  title: string = '';
  constructor() { }

  ngOnInit(): void {
    this.pndType = "PND53";
    this.title = "ภ.ง.ด. 53";
  }
}