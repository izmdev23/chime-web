import { Component, Input, signal, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Enums } from '@lib/enums';
import { Image, Product, ProductVariant } from '@lib/models';
import { ApiService } from '@services/api';
import { LogService } from '@services/logger';
import { UtilityService } from '@services/utility-service';

@Component({
  selector: 'app-product-viewer',
  imports: [],
  templateUrl: './product-viewer.html',
  styleUrl: './product-viewer.less'
})
export class ProductViewer {
  // use these when in preview mode
  @Input() product: Product | undefined;
  @Input() variants: ProductVariant[] = [];
  @Input() images: Image[] = [];
  @Input() preview = true;

  protected previewImageClass$ = signal("");
  protected previewImage$ = signal<Image | null>(null);
  protected product$ = signal<Product>(Enums.Defaults.Model.PRODUCT);
  protected variants$ = signal<ProductVariant[]>([]);
  protected images$ = signal<Image[]>([]);
  protected category$ = signal<string>("");
  protected selectedVariant$ = signal<ProductVariant | null>(null);


  constructor(
    protected api: ApiService,
    protected utils: UtilityService,
    protected activatedRoute: ActivatedRoute,
    protected logger: LogService
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe({
      next: (p) => {
        // open in preview mode when preview params if not found
        // preview mode will prevent users from adding the product to the cart
        // used when uploading or updating a product
        if (p.get("preview") === undefined) return;

      }
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["product"]) {
      this.product$.set(changes["product"].currentValue);
    }
    if (changes["variants"]) {
      this.variants$.set(changes["variants"].currentValue);
    }
    if (changes["images"]) {
      this.images$.set(changes["images"].currentValue);
      this.previewImage$.set(changes["images"].currentValue[0]);
    }
  }

  previewImage() {
    if (this.previewImageClass$() === "show-image") this.previewImageClass$.set("hide-image");
    else this.previewImageClass$.set("show-image")
  }

  getTotalRatingCount() {
    let ratings = 0;
    for(const variant of this.variants$()) {
      ratings += variant.rating;
    }
    if (ratings < 999) {
      return ratings.toString();
    }
    else {
      return (ratings / 1000).toFixed(1).toString() + "k+";
    }
  }

  getPriceString() {
    let minPrice = Number.MAX_VALUE;
    let maxPrice = -1;
    for(const variant of this.variants$()) {
      if (variant.price < minPrice) minPrice = variant.price;
      if (variant.price > maxPrice) maxPrice = variant.price;
    }
    let minPr = this.utils.toCurrency(minPrice);
    let maxPr = this.utils.toCurrency(maxPrice);
    if (minPrice === Number.MAX_VALUE) return maxPr;
    if (minPrice === maxPrice) return maxPr;
    return `${minPr} - ${maxPr}`;
  }

  getVariantImage(variant: ProductVariant) {
    let image: Image | null = null;
    for(const img of this.images$()) {
      if (variant.id !== img.variantId) continue;
      image = img;
    }
    return image;
  }

  addToCart() {
    // validate fields
    
    if (this.preview) {
      this.logger.error("Unable to add product to cart because you are in preview mode");
      return;
    }
  }

}
