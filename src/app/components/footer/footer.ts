import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Chrono } from 'src/app/services/chrono';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.less'
})
export class Footer {
  constructor(protected chrono: Chrono) {}
}
