import { HttpErrorResponse } from '@angular/common/http';
import { Component, effect, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Enums } from '@lib/enums';
import { ProductCategory, Product, ProductVariant, Image, ProductUploadDto, ProductVariantDto } from '@lib/models';
import { ApiService } from '@services/api';
import { LogService } from '@services/logger';
import { v4 as uuid } from "uuid";
import { NavbarLayout } from "@layouts/navbar-layout/navbar-layout";
import { ProductViewer } from "@components/product-viewer/product-viewer";
import { FormsModule } from '@angular/forms';
import { SecureService } from '@services/security';
import { errorContext } from 'rxjs/internal/util/errorContext';
import { Utils } from '@lib/utils';
import { Location } from '@angular/common';

type Context = "upload" | "edit";

@Component({
  selector: 'app-product-editor-page',
  imports: [NavbarLayout, ProductViewer, FormsModule],
  templateUrl: './product-editor-page.html',
  styleUrl: './product-editor-page.less'
})
export class ProductEditorPage {
  protected categories$ = signal<ProductCategory[]>([]);

  protected tags = signal<string[]>([]);
  protected product$ = signal<Product>(Enums.Defaults.Model.PRODUCT);
  protected variants$ = signal<ProductVariant[]>([]);
  protected images$ = signal<Image[]>([]);
  protected selectedCategory$ = signal<string>("");

  protected showImageEditor$ = signal(false);
  protected previewImage$ = signal<Image | null>(null);
  protected previewFullImage$ = signal(false);
  protected context$ = signal<Context>("upload");

  constructor(
    protected api: ApiService,
    protected logger: LogService,
    protected activatedRoute: ActivatedRoute,
    protected secure: SecureService,
    protected router: Router,
    private location: Location
  ) {
    effect(() => {
      const cat = this.categories$().find(e => e.id == this.product$().categoryId);
      if (cat === undefined) {
        console.error("Category is not found");
        return;
      }
      this.selectedCategory$.set(cat.name);
    })
  }

  ngOnInit() {
    this.checkContext();
    this.getCategories();
    this.addVariant();
    // init the neccessary variables
    this.initFields();
  }

  initFields() {
    const auth = this.secure.getAuthString();
    if (auth === undefined) {
      this.logger.error(`You need to login first to ${this.context$} a product`);
      this.router.navigate(["login"]);
      return;
    }
    this.product$.update(val => {
      val.storeId = Utils.Guid.EMPTY,
      val.uploaderId = auth.userId;
      return val;
    })
  }

  // checks context of the page
  // context can be either EDIT or UPLOAD
  // EDIT context will modify existing products
  // UPLOAD context will add a new product
  // defaults to UPLOAD when no context is given
  checkContext() {
    this.activatedRoute.queryParamMap.subscribe({
      next: (query) => {
        const queryParams = query.get("context");
        if (queryParams === null) this.logger.warn(`No context was provided. Default to ${this.context$()} mode`);
      }
    })
  }
  
  getCategories() {
    this.api.getProductCategories().subscribe({
      next: (response) => {
        if (response.code > 1) {
          this.logger.error(response.message);
          return;
        }
        this.categories$.set(response.data);
      },
      error: (response: HttpErrorResponse) => {
        this.logger.error(response);
      }
    })
  }

  addVariant() {
    this.variants$.update(val => {
      const newVariant = structuredClone(Enums.Defaults.Model.VARIANT);
      newVariant.id = uuid();
      val.push(newVariant);
      return val;
    })
  }

  removeVariant(id: string) {
    this.variants$.update(val => val.filter(e => e.id != id));
  }

  onFileSelected(event: Event) {
    const target = <HTMLInputElement | null>event.target;
    if (target === null) {
      this.logger.error("Some files are invalid");
      return;
    }
    if (target.files === null) {
      this.logger.error("No files selected");
      return;
    }

    for(const file of target.files) {
      this.images$.update(val => {
        const fr = new FileReader();
        fr.onload = () => {
          // image will be added
          const img: Image = {
            file: file,
            id: uuid(),
            image: fr.result,
            variantId: this.variants$().length > 0 ? this.variants$()[0].id : "",
          };
          if (this.previewImage$() === null) this.previewImage$.set(img);
          val.push(img);
        }
        fr.readAsDataURL(file);
        return val;
      });
    }
  }

  clearImages() {
    this.images$.set([]);
    this.previewImage$.set(null);
    this.showImageEditor$.set(false);
  }

  // will either upload or save the changes of the product 
  applyChanges() {

    if (this.context$() === "upload") this.uploadProduct();
    else if (this.context$() === "edit") this.saveProductChanges();
    
  }

  // validate product if all fields are satisfied
  private validateProductForUpload() {
    let invalid = false;
    if (this.product$().categoryId === 0) {
      this.logger.error("You need to select a category");
      invalid = true;
    }
    if (this.product$().description.length === 0) {
      this.logger.error("You need to add a description");
      invalid = true;
    }
    if (this.product$().name.length === 0) {
      this.logger.error("You need to add a name for the product");
      invalid = true;
    }
    if (this.product$().uploaderId.length === 0) {
      this.logger.error("No upload can be attached. Please login again.");
      invalid = true;
    }
    if (this.product$().storeId.length === 0) {
      this.logger.error("Invalid id for store. Please reload the page");
      invalid = true;
    }

    // check variants
    if (this.variants$().length === 0) {
      this.logger.error("You need to have at least one variant");
      invalid = true;
    }
    
    let unnamedVariants = 0;
    for(const variant of this.variants$()) {
      if (variant.name.length === 0) unnamedVariants++;
      if (variant.price < 1) {
        this.logger.error(`Variant${' ' + variant.name} has no price.`);
        invalid = true;
      }
      if (variant.stock < 1) {
        this.logger.error(`Variant${' ' + variant.name} has no stocks.`);
        invalid = true;
      }
    }
    if (unnamedVariants > 0) {
      this.logger.error(`You have ${unnamedVariants} unnamed ${unnamedVariants > 1? 'variants' : 'variant'}.`);
      invalid = true;
    }

    // check media
    // check images
    if (this.images$().length === 0) {
      this.logger.error("You need to add at least one image.");
      invalid = true;
    }
    for(const image of this.images$()) {
      const cat = this.variants$().find(e => e.id === image.variantId);
      if (cat === undefined) {
        this.logger.error(`Image${' ' + image.file?.name} must belong to a variant.`);
        invalid = true;
      }
    }
    
    return !invalid;
  }
  
  private uploadProduct() {
    this.logger.print("Uploading product...");
    if (this.validateProductForUpload() === false) {
      this.logger.error("Failed to upload product");
      return;
    }

    const productDto: ProductUploadDto = {
      name: this.product$().name,
      description: this.product$().description,
      productTypeId: this.product$().categoryId,
      uploaderId: this.product$().uploaderId,
      storeId: this.product$().storeId,
    }

    this.uploadProductData(productDto);
    this.location.back();
    
  }

  private saveProductChanges() {
    this.logger.print("Saving changes to product...");
  }



  // utility functions
  private uploadProductData(dto: ProductUploadDto) {
    this.api.uploadProduct(dto).subscribe({
      next: (response) => {
        console.log(response);
        if (response.code > 1) {
          this.logger.error("Something unexpected occured while uploading product");
          return;
        }
        this.variants$().forEach(variant => {
          this.uploadProductVariants({
            name: variant.name,
            price: variant.price,
            rating: variant.rating,
            saleEnd: variant.saleEnd,
            saleStart: variant.saleStart,
            salePrice: variant.price,
            stock: variant.stock,
            productId: response.data.id
          });
        });
      },
      error: (response) => {
        console.error(response);
        this.logger.error("An error occured while uploading product");
      },
      complete: () => {
        // this.logger.success("Product upload successful");
      }
    })
  }

  private uploadProductVariants(dto: ProductVariantDto) {
    let result = this.api.addProductVariant(dto);
    if (result === undefined) {
      this.logger.error("Failed to upload variant because you are not authenticated");
      return;
    }
    result.subscribe({
      next: (response) => {
        if (response.code > 1) {
          this.logger.error("Something unexpected occured while uploading variant");
          return;
        }
        this.images$().forEach(image => {
          this.uploadProductImage(image, dto.productId, response.data);
        });
      },
      error: (response) => {
        console.error(response);
        this.logger.error(`An error occured while uploading variant ${dto.name}`);
      },
      complete: () => {
      }
    })
  }

  private uploadProductImage(image: Image, productId: string, variantId: string) {
    if (image.file === null) {
      this.logger.error("An image is null. Please reattach all images");
      return;
    }
    let result = this.api.uploadProductImage(image.file, variantId, productId);
    if (result === undefined) {
      this.logger.error("Failed to upload image because you are not authenticated");
      return;
    }
    result.subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (response: HttpErrorResponse) => {
        console.error(response);
        this.logger.error(`An error occured while uploading iamge ${image.file? image.file.name : ''}`);
      },
      complete: () => {
        this.logger.success("Product upload successful");
      }
    })
  }
}
