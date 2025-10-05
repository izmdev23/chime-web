import { HttpErrorResponse } from '@angular/common/http';
import { Component, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarLayout } from "@layouts/navbar-layout/navbar-layout";
import { Utils } from '@lib/utils';
import { ApiService } from '@services/api';
import { CacheService } from '@services/cache';
import { Product, ProductVariant } from '@services/models';

@Component({
  selector: 'app-product-view-page',
  imports: [NavbarLayout],
  templateUrl: './product-view-page.html',
  styleUrl: './product-view-page.less'
})
export class ProductViewPage {
  protected data: WritableSignal<Product> = signal<Product>({
    categoryId: -1,
    description: "",
    id: "",
    name: "",
    price: -1,
    rating: -1,
    saleEnd: new Date(),
    salePrice: -1,
    saleStart: new Date(),
    stock: -1,
    storeId: "",
    uploaderId: ""
  });

  protected variants = signal<ProductVariant[]>([]);
  
  constructor(
    protected cache: CacheService,
    protected api: ApiService,
    protected router: ActivatedRoute
  ) {}

  ngOnInit() {
    if (this.cache.contains("@cache-product")) {
      this.data.set(this.cache.get<Product>("@cache-product")!);
      this.fetchVariants(this.data().id);
    }
    else {
      this.router.queryParamMap.subscribe((q) => {
        const prodId = q.get("prodId");
        if (prodId === null) {
          console.error("Invalid product id, failed to fetch data");
          return;
        }
        this.api.getProduct(prodId).subscribe({
          next: (response) => {
            if (response.code > 1) {
              console.error("Something unexpected happened while fetching data");
              return;
            }
            this.data.set(response.data);
            this.fetchVariants(response.data.id);
          },
          error: (response: HttpErrorResponse) => {
            console.error(response);
          },
          complete: () => {

          }
        });
      })
    }

  }

  fetchVariants(productId: string) {
    this.api.getProductVariants(productId).subscribe({
      next: (response) => {
        if (response.code > 1) {
          console.error("Something unexpected occured when loading variants");
          return;
        }
        this.variants.set(response.data);
      },
      error: (response: HttpErrorResponse) => {
        console.error(response);
      }
    })
  }

  hasDiscount() {
    return Utils.getDiscountRate(this.data().price, this.data().salePrice) > 0;
  }

  getDiscount() {
    return Utils.getDiscountRate(this.data().price, this.data().salePrice);
  }

}
