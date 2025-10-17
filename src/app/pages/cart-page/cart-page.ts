import { HttpErrorResponse } from '@angular/common/http';
import { Component, effect, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarLayout } from "@layouts/navbar-layout/navbar-layout";
import { Enums } from '@lib/enums';
import { CartItem, Product, ProductVariant } from '@lib/models';
import { ApiService } from '@services/api';
import { LogService } from '@services/logger';
import { SecureService } from '@services/security';
import { UtilityService } from '@services/utility-service';
import { CookieService } from 'ngx-cookie-service';
import { Navbar } from "@components/navbar/navbar";

@Component({
  selector: 'app-cart-page',
  imports: [NavbarLayout, FormsModule, Navbar],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.less'
})
export class CartPage {
  protected cartItems$ = signal<CartItem[]>([]);
  protected items$ = signal<Map<string, Product>>(new Map());
  protected itemVariants$ = signal<Map<string, ProductVariant[]>>(new Map());

  constructor(
    protected api: ApiService,
    protected secure: SecureService,
    protected router: Router,
    protected logger: LogService,
    protected util: UtilityService
  ) {}

  get subtotal(): number  {
    let subtotal = 0;

    for(const cartItem of this.cartItems$()) {
      for(const v of this.itemVariants$()) {
        const _v = v[1].find(e => e.id === cartItem.variantId);
        if (_v === undefined) continue;
        subtotal += _v.price * cartItem.quantity;
      }
    }
    return subtotal;
  }

  get total(): number {
    return this.subtotal;
  }

  getPrice(productId: string, variantId: string): number {
    const product = this.itemVariants$().get(productId);
    if (product === undefined) return 0;
    const variant = product.find(e => e.id === variantId);
    if (variant === undefined) return 0;
    return variant.price;
  }
  
  ngOnInit() {
    let authString = this.secure.getAuthString();
    if (authString === undefined) {
      this.router.navigate(["login"]);
      return;
    }
    let result = this.api.getCartItems(authString.userId);
    if(result === undefined) {
      this.router.navigate(["login"]);
      return;
    }
    result.subscribe({
      next: (response) => {
        this.cartItems$.set(response.data);
        for(const res of response.data) {
          this.fetchProductData(res.productId);
        }
        console.log(response.data);
      },
      error: (response: HttpErrorResponse) => {
        console.error(response);
      },
    })
  }

  fetchProductData(productId: string) {
    this.fetchVariants(productId)
    this.api.getProduct(productId).subscribe({
      next: (response) => {
        this.items$.update(val => {
          val.set(response.data.id, response.data);
          return val;
        });
      },
      error: (response: HttpErrorResponse) => {
        this.logger.error(response);
      },
    })
  }

  fetchVariants(productId: string) {
    this.api.getProductVariants(productId).subscribe({
      next: (response) => {
        this.itemVariants$.update(val => {
          val.set(response.data[0].productId, response.data);
          return val;
        })
        console.warn(response);
      },
      error: (response: HttpErrorResponse) => {
        this.logger.error(response);
      }
    })
  }

  getVariant(cartItem: CartItem): string {
    const temp = this.itemVariants$();
    const variant = this.itemVariants$().get(cartItem.productId);
    if (variant === undefined) return "No Variant";
    const finalVariant = variant.find(e => e.id === cartItem.variantId);
    if (finalVariant === undefined) return "No Variant";
    return finalVariant.name;
  }

  decreaseQuantity(cartItem: CartItem) {
    this.cartItems$.update(val => {
      const value = val.find(e => e.id === cartItem.id);
      if (value === undefined) return val;
      if (value.quantity > 0) value.quantity--;
      if (value.quantity < 1) {
        this.deleteCartItem(cartItem.id);
      }
      else this.updateQuantity(cartItem.id, value.quantity);
      return val;
    })
  }

  increaseQuantity(cartItem: CartItem) {
    this.cartItems$.update(val => {
      const value = val.find(e => e.id === cartItem.id);
      if (value === undefined) return val;
      value.quantity++;
      this.updateQuantity(cartItem.id, value.quantity);
      return val;
    })
  }

  private updateQuantity(cartItemId: string, newQuantity: number) {
    if (this.secure.accessToken === undefined) {
      this.logger.error("Session expired. Please login again");
      this.router.navigate(["login"]);
      return;
    }
    this.api.updateCartItemQuantity(cartItemId, newQuantity, this.secure.accessToken).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (response: HttpErrorResponse) => {
        console.error(response);
      }
    })
  }

  private deleteCartItem(cartItemId: string) {
    if (this.secure.accessToken === undefined) {
      this.logger.error("Session expired. Please login again");
      this.router.navigate(["login"]);
      return;
    }
    this.api.deleteCartItem(cartItemId, this.secure.accessToken).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (response: HttpErrorResponse) => {
        console.error(response);
      }
    })
  }
  
}
