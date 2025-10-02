import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.less'
})
export class Navbar {
  constructor(
    protected router: Router,
    protected cookie: CookieService
  ) {}

  ngOnInit() {
    
  }
}
