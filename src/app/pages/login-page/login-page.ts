import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '@services/api';
import { CookieService } from 'ngx-cookie-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.less'
})
export class LoginPage {
  protected username = signal("");
  protected password = signal("");
  private subs: Subscription[] = [];

  errorMessage = signal("");
  
  constructor(
    protected router: Router, 
    protected location: Location,
    protected api: ApiService,
    protected cookie: CookieService
  ) {}

  login() {
    let sub = this.api.login({
      userName: this.username(),
      password: this.password()
    })
    .subscribe({
      next: response => {
        console.log(response);
        this.cookie.set("auth", JSON.stringify(response.data), 7);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 400) this.errorMessage.set("Some fields are missing");
        if (err.status === 401) this.errorMessage.set("Incorrect login credentials");
        console.error("failed to login", err);
      },
      complete: () => {
        console.log("Login completed");
        const url = this.router.serializeUrl(
          this.router.createUrlTree(["/catalog"])
        );
        window.open(url, "_blank");
        this.location.back();
      }
    });
    this.subs.push(sub);
  }

  @HostListener("document:keydown.enter", ["$event"])
  onEnterKeyPressed(event: Event) {
    this.login();
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }
}
