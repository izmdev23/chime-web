import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '@services/api';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-upload-button',
  imports: [],
  templateUrl: './upload-button.html',
  styleUrl: './upload-button.less'
})
export class UploadButton {
  @Input() size: "small" | "large" = "small";
  
  constructor(
    protected cookie: CookieService,
    protected api: ApiService,
    protected router: Router
  ) {}
  
  navigateToUpload() {
    if (this.cookie.check("auth") === false) {
      this.router.navigate(["login"]);
      return;
    }

    this.router.navigate(["upload"]);
  }
}
