import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService } from '@services/api';
import { LoginResponseDto } from '@lib/models';
import { CookieService } from 'ngx-cookie-service';
import { ErrorBox } from "@components/error-box/error-box";
import dotnev from "dotenv";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ErrorBox],
  templateUrl: './app.html',
  styleUrl: './app.less'
})
export class App {
  protected readonly title = signal('chime-web');
  protected readonly hasError = signal(false);
  protected readonly errorMessage = signal("");
  protected readonly connectedToServer = signal(false);

  constructor(
    private cookie: CookieService,
    private api: ApiService
  ) {}
  
  ngOnInit() {
    // load environment variables
    // dotnev.config({
    //     path: "./secrets/.env",
    // })
    
    this.connectServer();
  }

  private connectServer() {
    this.hasError.set(true);
    this.errorMessage.set("Connecting to server...");
    console.warn("Connecting to server...");
    this.api.ping().subscribe({
      error: () => {
        this.hasError.set(true);
        this.errorMessage.set("Cannot connect to server");
        console.error("Cannot connect to server " + this.api.address);
        setTimeout(this.connectServer, 5000);
      },
      complete: () => {
        this.hasError.set(false);
        this.errorMessage.set("");
        this.autoLogin();
      }
    })
  }

  autoLogin() {
    if (this.cookie.check("auth")) {
      console.warn("logging in automatically", "feature not yet properly implemented");
      let auth = JSON.parse(this.cookie.get("auth")) as LoginResponseDto;
    }
  }
}
