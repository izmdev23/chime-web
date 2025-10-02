import { Component, signal } from '@angular/core';
import { NavbarLayout } from "@layouts/navbar-layout/navbar-layout";
import { CatalogCard } from "@components/catalog-card/catalog-card";
import { ApiService } from '@services/api';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { ProductCategoryDto } from '@services/models';

@Component({
  selector: 'app-catalog-page',
  imports: [NavbarLayout, CatalogCard],
  templateUrl: './catalog-page.html',
  styleUrl: './catalog-page.less'
})
export class CatalogPage {
  private subs: Subscription[] = [];

  categories = signal<ProductCategoryDto[]>([]);
  
  constructor(
    private api: ApiService
  ) {}

  ngOnInit() {
    let sub = this.api.getProductCategories()
    .subscribe({
      next: response => {
        console.log(response);
        this.categories.set(response.data);
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
      complete: () => {

      }
    });
    this.subs.push(sub);
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }
}
