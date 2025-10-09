import { Component, signal, WritableSignal } from '@angular/core';
import { NavbarLayout } from "@layouts/navbar-layout/navbar-layout";
import { CatalogCard } from "@components/catalog-card/catalog-card";
import { ApiService } from '@services/api';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { Product, ProductCategoryDto } from '@lib/models';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { UploadButton } from "@components/button/upload-button/upload-button";
import { DropdownBox } from "@components/dropdown-box/dropdown-box";

@Component({
  selector: 'app-catalog-page',
  imports: [NavbarLayout, CatalogCard, UploadButton, DropdownBox],
  templateUrl: './catalog-page.html',
  styleUrl: './catalog-page.less'
})
export class CatalogPage {
  private subs: Subscription[] = [];

  selectedCategories = signal<string[]>([]);
  categories = signal<ProductCategoryDto[]>([]);
  products = signal<Product[]>([]);
  categoriesStringList: WritableSignal<string[]> = signal([]);
  
  constructor(
    private api: ApiService,
    protected router: Router,
    private cookie: CookieService
  ) {}

  ngOnInit() {
    let sub = this.api.getProductCategories()
    .subscribe({
      next: response => {
        console.log(response);
        this.categories.set(response.data);
        let t: string[] = [];
        response.data.forEach(cat => {
          t.push(cat.name);
        })
        this.categoriesStringList.set(t);
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
      complete: () => {

      }
    });

    let sub2 = this.api.getProducts(-1, 0, 30)
    .subscribe({
      next: response => {
        console.log(response);
        this.products.set(response.data);
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
      complete: () => {

      }
    })
    
    this.subs.push(sub);
    this.subs.push(sub2);
  }

  categoriesSelected(values: string[]) {
    this.selectedCategories.set(values);
  }
  
  navigateToUpload() {
    if (this.cookie.check("auth") === false) {
      this.router.navigate(["login"]);
      return;
    }

    this.router.navigate(["upload"]);
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }
}
