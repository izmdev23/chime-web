import { Component, Input } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-catalog-card',
  imports: [],
  templateUrl: './catalog-card.html',
  styleUrl: './catalog-card.less'
})
export class CatalogCard {
  @Input() name: string = "";
  @Input() price: number = 0;
  @Input() salePrice: number = 0;
  @Input() image: undefined = undefined;
}
