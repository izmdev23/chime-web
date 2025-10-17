import { Component, signal, WritableSignal } from '@angular/core';
import { NavbarLayout } from "@layouts/navbar-layout/navbar-layout";
import { CatalogCard } from "@components/catalog-card/catalog-card";
import { ApiService } from '@services/api';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { Product, ProductCategory } from '@lib/models';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { UploadButton } from "@components/button/upload-button/upload-button";
import { DropdownBox } from "@components/dropdown-box/dropdown-box";
import { LogService } from '@services/logger';
import { Navbar } from "@components/navbar/navbar";

@Component({
  selector: 'app-catalog-page',
  imports: [CatalogCard, UploadButton, DropdownBox, Navbar],
  templateUrl: './catalog-page.html',
  styleUrl: './catalog-page.less'
})
export class CatalogPage {
  private subs: Subscription[] = [];

  selectedCategories = signal<string[]>([]);
  categories = signal<ProductCategory[]>([]);
  products = signal<Product[]>([]);
  categoriesStringList: WritableSignal<string[]> = signal([]);
  
  constructor(
    private api: ApiService,
    protected router: Router,
    private cookie: CookieService,
    private log: LogService
  ) {}

  ngOnInit() {
    let sub = this.api.getProductCategories()
    .subscribe({
      next: response => {
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
    this.filterProducts();
  }
  
  navigateToUpload() {
    if (this.cookie.check("auth") === false) {
      this.router.navigate(["login"]);
      return;
    }

    this.router.navigate(["upload"]);
  }

  filterProducts(): Product[] {
    return this.products().filter(e => {
      let products: Product[] = [];
      let includeProduct = true;
      for(const cat of this.selectedCategories()) {
        let category: ProductCategory | undefined = this.categories().find(e => e.name == cat);
        if (category === undefined) {
          this.log.appError(`${e.name} category is missing`);
          continue;
        }
        // compare the category of the product and the category found in selectedCategories
        if (e.categoryId === category.id) {
          includeProduct = false;
          continue;
        }
      }
      return includeProduct ;
    })
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }
}
