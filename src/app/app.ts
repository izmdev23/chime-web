import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService } from '@services/api';
import { LoginResponseDto } from '@services/models';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.less'
})
export class App {
  protected readonly title = signal('chime-web');

  constructor(
    private cookie: CookieService,
    private api: ApiService
  ) {}
  
  ngOnInit() {
    if (this.cookie.check("auth")) {
      console.warn("logging in automatically", "feature not yet properly implemented");
      let auth = JSON.parse(this.cookie.get("auth")) as LoginResponseDto;
      
    }
  }
}
