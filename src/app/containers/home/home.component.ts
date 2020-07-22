import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  age = 20;
  constructor() { }

  ngOnInit(): void {
    const now = moment();
    const dateOfYear = moment('1999-07-27');
    this.age = now.diff(dateOfYear, 'years');
  }

}
