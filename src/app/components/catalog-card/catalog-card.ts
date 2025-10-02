import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '@services/api';
import { CacheService } from '@services/cache';
import { Product } from '@services/models';

@Component({
  selector: 'app-catalog-card',
  imports: [],
  templateUrl: './catalog-card.html',
  styleUrl: './catalog-card.less'
})
export class CatalogCard {
  @Input() data: Product = undefined!;
  @Input() image: undefined = undefined;

  constructor(
    private cache: CacheService,
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.data === undefined) {
      this.data = {
        id: this.api.guidEmpty,
        storeId: this.api.guidEmpty,
        uploaderId: this.api.guidEmpty,
        name: "",
        description: '',
        price: 0,
        salePrice: 0,
        rating: 0,
        saleStart: new Date(),
        saleEnd: new Date(),
        categoryId: -1
      }
    }
  }

  protected isValid() {
    return this.data.id !== this.api.guidEmpty;
  }

  protected onClick() {
    if (this.isValid() === false) return;
    this.cache.set<Product>("@cache-product", this.data);
    console.log(this.cache.get("@cache-product"));
    this.router.navigate(["product"]);
  }
}
