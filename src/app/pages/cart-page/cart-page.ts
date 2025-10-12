import { HttpErrorResponse } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarLayout } from "@layouts/navbar-layout/navbar-layout";
import { Enums } from '@lib/enums';
import { CartItem, Product, ProductVariant } from '@lib/models';
import { ApiService } from '@services/api';
import { LogService } from '@services/logger';
import { SecureService } from '@services/security';
import { UtilityService } from '@services/utility-service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-cart-page',
  imports: [NavbarLayout],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.less'
})
export class CartPage {
  protected cartItems = signal<CartItem[]>([]);
  protected items = signal<Map<string, Product>>(new Map());
  protected itemVariants = signal<Map<string, ProductVariant[]>>(new Map());

  constructor(
    protected api: ApiService,
    protected secure: SecureService,
    protected router: Router,
    protected logger: LogService,
    protected util: UtilityService
  ) {}
  
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
        this.cartItems.set(response.data);
        for(const res of response.data) {
          this.fetchProductData(res.productId);
        }
      },
      error: (response: HttpErrorResponse) => {
        console.error(response);
      },
      complete: () => {
        console.log(this.api.address + this.cartItems()[0].images[0]);
      }
    })
  }

  fetchProductData(productId: string) {
    this.fetchVariants(productId)
    this.api.getProduct(productId).subscribe({
      next: (response) => {
        this.items.update(val => {
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
        this.itemVariants.update(val => {
          val.set(response.data[0].productId, response.data);
          return val;
        })
      },
      error: (response: HttpErrorResponse) => {
        this.logger.error(response);
      }
    })
  }

  getVariant(cartItem: CartItem): string {
    const temp = this.itemVariants();
    const variant = this.itemVariants().get(cartItem.productId);
    if (variant === undefined) return "No Variant";
    const finalVariant = variant.find(e => e.id === cartItem.variantId);
    if (finalVariant === undefined) return "No Variant";
    return finalVariant.name;
  }

  decreaseQuantity(cartItem: CartItem) {
    this.cartItems.update(val => {
      const value = val.find(e => e.id === cartItem.id);
      if (value === undefined) return val;
      if (value.quantity > 0) value.quantity--;
      return val;
    })
  }

  increaseQuantity(cartItem: CartItem) {
    this.cartItems.update(val => {
      const value = val.find(e => e.id === cartItem.id);
      if (value === undefined) return val;
      value.quantity++;
      return val;
    })
  }

  getSubtotal(): number  {
    let subtotal = 0;
    for(const cartItem of this.cartItems()) {
      // const price = this.items().get(cartItem.productId)?.price;
      const price = undefined;
      if (price === undefined) return -1;
      subtotal += cartItem.quantity * price;
    }
    return subtotal;
  }

  getTotal() {
    return this.getSubtotal();
  }
}
