import { Component } from '@angular/core';
import { NavbarLayout } from "@layouts/navbar-layout/navbar-layout";
import { Utils } from '@lib/utils';
import { ApiService } from '@services/api';
import { CacheService } from '@services/cache';
import { Product } from '@services/models';

@Component({
  selector: 'app-product-view-page',
  imports: [NavbarLayout],
  templateUrl: './product-view-page.html',
  styleUrl: './product-view-page.less'
})
export class ProductViewPage {
  protected data: Product = undefined!;
  
  constructor(
    protected cache: CacheService,
    protected api: ApiService
  ) {}

  ngOnInit() {
    if (this.cache.contains("@cache-product")) {
      this.data = this.cache.get<Product>("@cache-product")!;
    }

  }

  hasDiscount() {
    return Utils.getDiscountRate(this.data.price, this.data.salePrice) > 0;
  }

  getDiscount() {
    return Utils.getDiscountRate(this.data.price, this.data.salePrice);
  }

}
