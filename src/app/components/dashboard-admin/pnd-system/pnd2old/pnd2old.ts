import { Component, OnInit } from '@angular/core';
import { PndOld } from '../../../pnd-old/pnd-old';

@Component({
  selector: 'app-pnd2old',
  standalone: true,
  imports: [PndOld],
  templateUrl: './pnd2old.html',
  styleUrls: ['./pnd2old.css']
})
export class Pnd2old implements OnInit {
  pndType: string = '';
  title: string = '';

  constructor() { }

  ngOnInit(): void {
    this.pndType = "PND2";
    this.title = "ภ.ง.ด. 2";
  }
}
