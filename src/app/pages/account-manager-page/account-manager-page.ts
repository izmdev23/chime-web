import { Component, signal, WritableSignal } from '@angular/core';
import { NavbarLayout } from "@layouts/navbar-layout/navbar-layout";
import { AccountDetails } from "@components/account-manager/account-details/account-details";
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { MyProductsPanel } from "@components/account-manager/my-products-panel/my-products-panel";
import { DropdownBox } from "@components/dropdown-box/dropdown-box";
import { Navbar } from "@components/navbar/navbar";

const panels = ["Account Details", "My Products", "Logout", "Managed Shops", "Products"] as const;
type PanelPage = typeof panels[number] | (string & []);

@Component({
  selector: 'app-account-manager-page',
  imports: [NavbarLayout, AccountDetails, MyProductsPanel, DropdownBox, Navbar],
  templateUrl: './account-manager-page.html',
  styleUrl: './account-manager-page.less'
})
export class AccountManagerPage {
  protected activePanel: WritableSignal<PanelPage> = signal("Account Details");
  protected readonly panels: string[] = ["Account Details", "My Products", "Logout"];
  protected readonly myShopsDropdown: string[] = ["Managed Shops", "My Products"];

  constructor(
    protected router: Router,
    protected cookie: CookieService
  ) {}
  
  ngOnInit() {

  }

  goToPanel(panel: PanelPage) {
    this.activePanel.set(panel);
    if (panel === "Account Details") {
    }
    else if (panel === "My Products") {

    }
    else if (panel === "Logout") {
      this.logout();
    }
    
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
