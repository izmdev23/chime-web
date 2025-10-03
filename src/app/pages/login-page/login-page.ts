import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '@services/api';
import { ApiResponse } from '@services/models';
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
    if (
      this.username().length === 0 ||
      this.password().length === 0
    ) {
      this.errorMessage.set("All fields must not be empty");
      return;
    }
    
    let sub = this.api.login({
      userName: this.username(),
      password: this.password()
    })
    .subscribe({
      next: response => {
        console.log(response);
        this.cookie.set("auth", JSON.stringify(response.data), 7);
      },
      error: (error: HttpErrorResponse) => {
        let err = error.error as ApiResponse<undefined>;
        this.errorMessage.set(err.message);
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
