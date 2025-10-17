import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Enums } from '@lib/enums';
import { Utils } from '@lib/utils';
import { ApiService } from '@services/api';
import { CacheService } from '@services/cache';
import { Product } from '@lib/models';

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
      this.data = Enums.Defaults.Model.PRODUCT;
    }
  }

  protected isValid() {
    return this.data.id !== Utils.Guid.EMPTY;
  }

  protected onClick() {
    if (this.isValid() === false) return;
    this.cache.set<Product>("@cache-product", this.data);
    this.router.navigate(["product"], {
      queryParams: {
        prodId: this.data.id
      }
    });
  }
}
