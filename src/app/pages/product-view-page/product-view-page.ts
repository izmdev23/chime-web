import { HttpErrorResponse } from '@angular/common/http';
import { Component, resolveForwardRef, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarLayout } from "@layouts/navbar-layout/navbar-layout";
import { Utils } from '@lib/utils';
import { ApiService } from '@services/api';
import { CacheService } from '@services/cache';
import { EmptyGuid, Product, ProductVariant } from '@lib/models';
import { Enums } from '@lib/enums';
import { AddCartItemDto, DtoStruct } from '@lib/dto';
import { SecureService } from '@services/security';
import { ErrorBox } from "@components/error-box/error-box";
import { ErrorStruct } from '@lib/objects';
import { UtilityService } from '@services/utility-service';


@Component({
  selector: 'app-product-view-page',
  imports: [NavbarLayout, ErrorBox],
  templateUrl: './product-view-page.html',
  styleUrl: './product-view-page.less'
})
export class ProductViewPage {
  protected data = signal<Product>(Enums.Defaults.Model.PRODUCT);
  protected variantImages = signal<string[]>([]);
  protected currentShownImage = signal<string>("");
  protected purchaseBoxOpen = signal(false);
  protected addToCartShown = signal(false);
  protected selectedVariant = signal<ProductVariant | undefined>(undefined);
  protected selectedQuantity = signal(0);

  // error messages
  protected cartErrorMessage = signal<ErrorStruct>(new ErrorStruct());

  protected variants = signal<ProductVariant[]>([]);
  
  constructor(
    protected cache: CacheService,
    protected api: ApiService,
    protected activatedRoute: ActivatedRoute,
    protected secure: SecureService,
    protected router: Router,
    protected utils: UtilityService
  ) {}

  ngOnInit() {
    if (this.cache.contains("@cache-product")) {
      this.data.set(this.cache.get<Product>("@cache-product")!);
      this.fetchVariants(this.data().id);
    }
    else {
      this.activatedRoute.queryParamMap.subscribe((q) => {
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

          const imgUrl = `${this.api.address}/${img}`;
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

  getCalculatedPrice(): string {
    let minPrice = Number.MAX_VALUE;
    let maxPrice = 0;

    for(const v of this.variants()) {
      if (v.price < minPrice) minPrice = v.price;
      if (v.price > maxPrice) maxPrice = v.price;
    }
    return `${this.utils.toCurrency(minPrice)} - ${this.utils.toCurrency(maxPrice)}`;
  }

  hasDiscount() {
    // return Utils.getDiscountRate(this.data().price, this.data().salePrice) > 0;
    return 0;
  }

  getDiscount() {
    // return Utils.getDiscountRate(this.data().price, this.data().salePrice);
    return 0;
  }

  closePurchaseBox() {
    console.log("Closing purchase box");
    this.purchaseBoxOpen.set(false);
  }

  closeCart(event: Event) {
    event.stopPropagation();
    this.addToCartShown.set(false);
  }
  
  addToCart() {
    let hasError = false;
    if (this.selectedQuantity() < 1) {
      this.cartErrorMessage.update(val => {
        val.set(Enums.Errors.InvalidQuantityError, "You need to have at least one quantity.");
        return val;
      });
      hasError = true;
    }
    else {
      this.cartErrorMessage.update(val => {
        val.delete(Enums.Errors.InvalidQuantityError);
        return val;
      });
    }

    if (this.selectedVariant() === undefined) {
      this.cartErrorMessage.update(val => {
        val.set(Enums.Errors.InvalidVariantError, "You need to select a variant");
        return val;
      });
      hasError = true;
    }
    else {
      this.cartErrorMessage.update(val => {
        val.delete(Enums.Errors.InvalidVariantError);
        return val;
      });
    }

    if (hasError) return;
    
    this.addToCartShown.set(false);
    
    const authString = this.secure.getAuthString();
    if (authString === undefined) {
      console.error("User must login first")
      this.router.navigate(["login"]);
      return;
    }
    
    const dto: AddCartItemDto = {
      productId: this.data().id,
      quantity: this.selectedQuantity(),
      userId: authString.userId,
      variantId: this.selectedVariant()!.id
    };

    this.api.addCartItem(dto)?.subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (response: HttpErrorResponse) => {
        console.error(response);
        
      }
    })

  }

  increaseQuantity() {
    this.selectedQuantity.set(this.selectedQuantity() + 1);
  }

  decreaseQuantity() {
    if (this.selectedQuantity() > 0)
      this.selectedQuantity.set(this.selectedQuantity() - 1);
  }
}
