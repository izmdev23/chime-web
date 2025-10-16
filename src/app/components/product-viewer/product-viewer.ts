import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, signal, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Enums } from '@lib/enums';
import { Image, Product, ProductVariant } from '@lib/models';
import { Utils } from '@lib/utils';
import { ApiService } from '@services/api';
import { LogService } from '@services/logger';
import { SecureService } from '@services/security';
import { UtilityService } from '@services/utility-service';

@Component({
  selector: 'app-product-viewer',
  imports: [FormsModule],
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

  // fot ui
  protected showCartPanel = signal(false);

  // for cart item
  protected cartItemVariant$ = signal<ProductVariant>(Enums.Defaults.Model.VARIANT);
  protected cartItemAmount$ = signal<number>(0);

  constructor(
    protected api: ApiService,
    protected utils: UtilityService,
    protected activatedRoute: ActivatedRoute,
    protected logger: LogService,
    protected secure: SecureService,
    protected router: Router
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

  getVariantImageThumbnail(variant: ProductVariant): Image | null {
    let image: Image | null = null;
    for(const img of this.images$()) {
      if (variant.id !== img.variantId) continue;
      image = img;
      break;
    }
    return image;
  }

  setSelectedVariant(variant: ProductVariant) {
    this.selectedVariant$.set(variant);
    // adjust the image to the proper variant
    const currentImage = this.previewImage$()
    if (currentImage === null) {
      const img = this.images$().filter(e => e.variantId === variant.id);
      if (img.length === 0) return;
      this.previewImage$.set(img[0]);
      return;
    }

    if (currentImage.variantId !== variant.id) {
      const img = this.images$().filter(e => e.variantId === variant.id);
      if (img.length === 0) return;
      this.previewImage$.set(img[0]);
      return;
    }
  }

  setSelectedImage(image: Image) {
    this.previewImage$.set(image);
    // adjust the selected variant based on image variant id
    const selectedVariant = this.selectedVariant$();
    if (selectedVariant === null) {
      const variant = this.variants$().find(e => e.id === image.variantId);
      if (variant === undefined) return;
      this.selectedVariant$.set(variant);
      return;
    }

    if (selectedVariant.id !== image.variantId) {
      const variant = this.variants$().find(e => e.id === image.variantId);
      if (variant === undefined) return;
      this.selectedVariant$.set(variant);
      return;
    }
  }

  getSelectedVariantClass(variant: ProductVariant) {
    const selectedVariant = this.selectedVariant$();
    if (selectedVariant === null) return "";
    if (variant.id === selectedVariant.id) return "selected";
    return "";
  }

  getSelectedImageClass(image: Image) {
    const previewImage = this.previewImage$();
    if (previewImage === null) return "";
    if (previewImage.id === image.id) return "selected-image";
    return "";
  }

  decreaseAmount() {
    if (this.cartItemAmount$() > 0) this.cartItemAmount$.set(this.cartItemAmount$() - 1);
  }

  increaseAmount() {
    this.cartItemAmount$.set(this.cartItemAmount$() + 1);
  }

  openCartPanel() {
    // validate fields
    
    if (this.preview) {
      this.logger.error("Unable to add product to cart because you are in preview mode");
      return;
    }

    // add product to cart
    this.showCartPanel.set(true);
    
  }

  addToCart() {
    // validate fields
    let invalid = false;
    if (this.cartItemVariant$().id === Utils.Guid.EMPTY) {
      this.logger.error("You need to select a variant");
      invalid = true;
    }
    if (this.cartItemAmount$() < 1) {
      this.logger.error("You need at least one amount");
      invalid = true;
    }
    if (invalid) return;

    const auth = this.secure.getAuthString();
    if (auth === undefined) {
      this.logger.error("Session expired. Please login again");
      this.router.navigate(["login"]);
      return;
    }
    let result = this.api.addCartItem({
      productId: this.product$().id,
      variantId: this.cartItemVariant$().id,
      userId: auth.userId,
      quantity: this.cartItemAmount$()
    });
    if (result === undefined) return;
    result.subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (response: HttpErrorResponse) => {
        console.error(response);
      },
      complete: () => {
        this.logger.success("New product added to cart");
      }
    })
  }

}
