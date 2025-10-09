import { HttpErrorResponse } from '@angular/common/http';
import { Component, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarLayout } from "@layouts/navbar-layout/navbar-layout";
import { Utils } from '@lib/utils';
import { ApiService } from '@services/api';
import { CacheService } from '@services/cache';
import { Product, ProductVariant } from '@lib/models';
import { Enums } from '@lib/enums';

@Component({
  selector: 'app-product-view-page',
  imports: [NavbarLayout],
  templateUrl: './product-view-page.html',
  styleUrl: './product-view-page.less'
})
export class ProductViewPage {
  protected data = signal<Product>(Enums.Defaults.Model.PRODUCT);
  protected variantImages = signal<string[]>([]);
  protected currentShownImage = signal<string>("");

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

  showImage(img: string) {
    if (img.length === 0) {
      this.currentShownImage.set("icons/package.svg");
      return;
    }
    this.currentShownImage.set(img);
  }

  fetchVariants(productId: string) {
    this.api.getProductVariants(productId).subscribe({
      next: (response) => {
        if (response.code > 1) {
          console.error("Something unexpected occured when loading variants");
          return;
        }
        this.variants.set(response.data);

        for(const variant of response.data) {
          this.fetchVariantImage(variant.productId, variant.id);
        }
        
      },
      error: (response: HttpErrorResponse) => {
        console.error(response);
      },
    })
  }

  fetchVariantImage(productId: string, variantId: string) {
    this.api.getProductVariantImages(productId, variantId).subscribe({
      next: (response) => {
        if (response.code > 1) {
          console.error("Server Error: Something unexpected occured while fetching image urls");
          return;
        }
        console.log();

        response.data.forEach(img => {

          const imgUrl = `${this.api.ApiHost}/${img}`;
          this.showImage(imgUrl);
          this.variantImages.update(val => {
            val.push(imgUrl);
            return val;
          });

        })
        
      },
      error: (response: HttpErrorResponse) => {
        console.error(response);
      },
    })
  }

  hasDiscount() {
    return Utils.getDiscountRate(this.data().price, this.data().salePrice) > 0;
  }

  getDiscount() {
    return Utils.getDiscountRate(this.data().price, this.data().salePrice);
  }

}
