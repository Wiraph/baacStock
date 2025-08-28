import { Component, OnInit } from '@angular/core';
import { PndComponent } from '../../../pnd/pnd';

@Component({
  selector: 'app-pnd53old',
  standalone: true,
  imports: [PndComponent],
  templateUrl: './pnd53old.html',
  styleUrls: ['./pnd53old.css']
})
export class Pnd53old implements OnInit {
  pndType: string = '';
  title: string = '';

  constructor() { }

  ngOnInit(): void {
    this.pndType = "PND53OLD";
    this.title = "ภ.ง.ด. 53 เก่า";
  }
}
