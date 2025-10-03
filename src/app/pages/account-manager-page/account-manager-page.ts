import { Component, signal, WritableSignal } from '@angular/core';
import { NavbarLayout } from "@layouts/navbar-layout/navbar-layout";
import { AccountDetails } from "@components/account-details/account-details";
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

const panels: "account-details" = "account-details";

@Component({
  selector: 'app-account-manager-page',
  imports: [NavbarLayout, AccountDetails],
  templateUrl: './account-manager-page.html',
  styleUrl: './account-manager-page.less'
})
export class AccountManagerPage {
  protected activePanel: WritableSignal<"account-details"> = signal("account-details");

  constructor(
    protected router: Router,
    protected cookie: CookieService
  ) {}
  
  ngOnInit() {

  }

  logout() {
    if (this.cookie.check("auth")) {
      this.cookie.delete("auth");
    }

    console.warn("back button bug, user must not be able to go back")
    this.router.navigate(["catalog"], {
      replaceUrl: true
    });
  }
}
