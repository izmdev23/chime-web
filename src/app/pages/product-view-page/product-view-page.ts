import { Component, signal } from '@angular/core';
import { NavbarLayout } from "@layouts/navbar-layout/navbar-layout";
import { ProductViewer } from "@components/product-viewer/product-viewer";
import { Enums } from '@lib/enums';
import { Image, Product, ProductVariant } from '@lib/models';
import { ApiService } from '@services/api';
import { ActivatedRoute } from '@angular/router';
import { LogService } from '@services/logger';
import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { v4 as uuidv4 } from "uuid";
import { Navbar } from "@components/navbar/navbar";

@Component({
  selector: 'app-product-view-page',
  imports: [NavbarLayout, ProductViewer, Navbar],
  templateUrl: './product-view-page.html',
  styleUrl: './product-view-page.less'
})
export class ProductViewPage {
  protected product$ = signal<Product>(Enums.Defaults.Model.PRODUCT);
  protected productVariants$ = signal<ProductVariant[]>([]);
  protected variantImages$ = signal<Image[]>([]);

  constructor(
    private api: ApiService,
    private activatedRoute: ActivatedRoute,
    private logger: LogService,
    private location: Location
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe({
      next: (values) => {
        const prodId = values.get("prodId");
        if (prodId === null) {
          this.logger.error("An error occured while trying to load product. Please try again.");
          this.location.back();
          return;
        }
        // fetch product
        this.updateProduct(prodId);
      }
    })
    
  }

  updateProduct(prodId: string) {
    // fetch product data
    this.api.getProduct(prodId).subscribe({
      next: (response) => {
        if (response.code > 1) {
          this.logger.error(response.message);
          this.location.back();
          return;
        }
        this.product$.set(response.data);
        this.updateVariants(prodId)
      },
      error: (response: HttpErrorResponse) => {
        this.logger.error("Failed to fetch product data.");
        this.location.back();
      }
    });
    
    
    
    
  }
  
  updateVariants(prodId: string) {
    this.api.getProductVariants(prodId).subscribe({
      next: (response) => {
        if (response.code > 1) {
          this.logger.error(response.message);
          this.location.back();
          return;
        }
        this.productVariants$.set(response.data);
        response.data.forEach(variant => {
          this.updateImages(prodId, variant.id);
        })
      },
      error: (response: HttpErrorResponse) => {
        this.logger.error("Failed to fetch product variants.");
        this.location.back();
      }
    });
    
    
    
    
    
  }
  
  updateImages(prodId: string, variantId: string) {
    // fetch images
    this.api.getProductVariantImages(prodId, variantId).subscribe({
      next: (response) => {
        if (response.code > 1) this.logger.error(response.message);
        const imageObjects: Image[] = [];
        for(const image of response.data) {
          imageObjects.push({
            file: null,
            id: uuidv4(),
            image: `${this.api.address}/${image}`,
            variantId: variantId
          });
        }
        this.variantImages$.update(val => val.concat(imageObjects));
        
      },
      error: (response: HttpErrorResponse) => {
        this.logger.error("Failed to fetch product image.");
      }
    });
  }

  
}
