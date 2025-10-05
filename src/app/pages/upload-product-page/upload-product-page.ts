import { HttpErrorResponse, HttpResourceFn } from '@angular/common/http';
import { Component, signal, WritableSignal } from '@angular/core';
import { NavbarLayout } from "@layouts/navbar-layout/navbar-layout";
import { ApiService } from '@services/api';
import { EmptyGuid, LoginResponseDto, ProductCategoryDto, ProductUploadDto } from '@services/models';
import { Subscription } from 'rxjs';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { CookieService } from 'ngx-cookie-service';
import { v4 as uuidv4 } from "uuid";
import { ErrorBox } from "@components/error-box/error-box";
import { SecureService } from '@services/security';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

interface ImageWrapper {
  id: string;
  file: File | null;
  image: string | ArrayBuffer | null;
  forVariant: string | null;
}

interface Variant {
  id: string,
  name: string | null
}

const NoVariant = "No Variant";

function imageValid(): ValidatorFn {
  return (control: AbstractControl<ImageWrapper>): ValidationErrors | null => {
    
    return control.value.file === null || control.value.image ? {error: "Image file must be valid"} : null;
  }
}

function variantValidator(control: AbstractControl<WritableSignal<Variant>>): ValidationErrors | null {
  const variant = control.value();
  if (variant.name === null) return {variantNameRequired: true}
  if (variant.name.trim().length === 0) return {variantNameTooShort: true}
  return (control: AbstractControl<WritableSignal<Variant>>) => {
    console.log("yeah");
    return null;
  }
}

@Component({
  selector: 'app-upload-product-page',
  imports: [NavbarLayout, FormsModule, ReactiveFormsModule, ErrorBox],
  templateUrl: './upload-product-page.html',
  styleUrl: './upload-product-page.less'
})
export class UploadProductPage {
  protected productForm: FormGroup;
  protected categories = signal<ProductCategoryDto[]>([]);
  protected previewImage = signal<string | ArrayBuffer | null>(null);
  protected _hasError = signal(false);

  set hasError(value: boolean) {
    console.log("Setting has error");
    this._hasError.set(value);
  }

  private subs: Subscription[] = [];

  constructor(
    protected api: ApiService,
    protected cookie: CookieService,
    protected formBuilder: FormBuilder,
    protected security: SecureService,
    protected router: Router,
    protected location: Location
  ) {
    this.productForm = formBuilder.group({
      name: ["", [Validators.required, Validators.minLength(1)]],
      description: ["", [Validators.required, Validators.minLength(1)]],
      price: [null, [Validators.required, Validators.min(0)]],
      stock: [null, [Validators.required, Validators.min(0)]],
      // salePrice: ["", [Validators.required, Validators.min(0)]],
      category: [null, [Validators.required, Validators.minLength(1)]],
      variants: new FormArray<FormControl<WritableSignal<Variant>>>([]),
      images: new FormArray<FormControl<ImageWrapper>>([])
    });
  }

  get variants() {
    return (<FormArray<FormControl<WritableSignal<Variant>>>>this.productForm.get("variants"));
  }

  get images() {
    return (<FormArray<FormControl<ImageWrapper>>>this.productForm.get("images"));
  }

  get displayImages() {
    const imgs: Array<ArrayBuffer | string> = [];
    this.images.controls.map(e => {
      const reader = new FileReader();
      reader.onload = () => {
        const res = reader.result;
        if (res === null) return;
        imgs.push(res);
      }
    })
    return imgs;
  }

  ngOnInit() {
    let sub = this.api.getProductCategories()
    .subscribe({
      next: (response) => {
        this.categories.set(response.data);
      },
      error: (response: HttpErrorResponse) => {
        console.error("Error: Failed to fetch product categories");
      }
    });
    this.subs.push(sub);
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  trackIndex(control: AbstractControl) {
    return (control as any).uniqueId;
  }

  addVariant() {
    let variant = signal<Variant>({
      id: uuidv4(),
      name: null
    })
    const newControl = new FormControl<WritableSignal<Variant>>(variant, [variantValidator]);
    (newControl as any).uniqueId = uuidv4();
    this.variants.push(newControl as any);
  }

  addImage(wrapper: ImageWrapper) {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result;
      if (res === null) return;
      wrapper.image = res;
      const newControl = new FormControl(wrapper, [Validators.required, imageValid]);
      (newControl as any).uniqueId = uuidv4();
      (<FormArray>this.productForm.get("images")).push(newControl);
      console.log("new image added");
    }
    if (wrapper.file === null) return;
    reader.readAsDataURL(wrapper.file);
  }
  
  deleteVariant(id: number) {
    this.variants.removeAt(id);
  }

  deleteAllVariant() {
    this.variants.clear();
  }
  
  onImageSelected(event: Event) {
    let element = event.target as HTMLInputElement;
    // console.log(element.files);
    let files = element.files;
    if (files === null) return;

    for(let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (file === null) continue;
      this.addImage({
        file: file,
        id: uuidv4(),
        image: null,
        forVariant: null
      });
    }
  }

  isVariantsInvalid() {
    let isInvalid = false;
    for(const variant of this.variants.controls) {
      variant.markAsDirty();
      isInvalid = isInvalid || (variant.value().name === null);
      isInvalid = isInvalid || (variant.value().name?.trim().length === 0);
    }
    return isInvalid;
  }

  getVariantsToArray() {
    let variants: string[] = [];
    for(const variant of this.variants.controls) {
      if (variant.value().name === null) continue;
      variants.push(variant.value().name!);
    }
    return variants;
  }

  
  upload() {

    // validate all fields
    let invalid = false;
    this.productForm.get("name")!.markAsDirty();
    this.productForm.get("description")!.markAsDirty();
    this.productForm.get("price")!.markAsDirty();
    this.productForm.get("category")!.markAsDirty();
    this.productForm.get("stock")!.markAsDirty();
    invalid ||= this.productForm.get("name")!.invalid;
    invalid ||= this.productForm.get("description")!.invalid;
    invalid ||= this.productForm.get("price")!.invalid;
    invalid ||= this.productForm.get("category")!.invalid;
    invalid ||= this.productForm.get("stock")!.invalid;
    invalid ||= this.isVariantsInvalid();
    if (invalid) {
      // this._hasError.set(true);
      console.error("Some fields in the form are invalid. Cannot upload product.");
      return;
    }

    let authString = this.security.getAuthString();
    if (authString === undefined) {
      console.error("Must login again");
      return;
    }

    let cat = this.categories().find(e => e.name === this.productForm.get("category")!.value)!;
    
    // start uploading
    let formData = new FormData();
    formData.append("Name", this.productForm.get("name")!.value);
    formData.append("Description", this.productForm.get("description")!.value);
    formData.append("Price", this.productForm.get("price")!.value);
    formData.append("ProductTypeId", cat.id.toString());
    formData.append("SalePrice", this.productForm.get("price")!.value);
    formData.append("UploaderId", authString.userId);
    formData.append("StoreId", EmptyGuid);

    for(const img of this.images.controls) {
      console.log(img.value.forVariant);
    }
    
    // formData.append("Stock", this.productForm.get("stock")!.value);
    // formData.append("SaleStart", (new Date()).toUTCString());
    // formData.append("SaleEnd", (new Date()).toUTCString());
    // formData.append("Rating", "0");

    // let imageFormArray: FormData[] = [];
    // for(const img of this.images.controls) {
    //   let imageForm = new FormData();
    //   if (img.value.file === null) continue;
    //   imageForm.append("Image", img.value.file, img.value.file.name);
    //   imageFormArray.push(imageForm);
    // }
    
    this.uploadProduct(formData);

    // let res = this.api.uploadProduct(formData);
    // if (res === undefined) {
    //   console.error("Error: Failed to upload product. User not logged in");
    //   return;
    // }
    // let sub = res.subscribe({
    //   next: (response) => {
    //     console.log(response);
    //   },
    //   error: (response: HttpErrorResponse) => {
    //     console.error("Error: Failed to upload.", response.error);
    //   },
    //   complete: () => {
    //     console.log("Upload complete");
    //   }
    // })

  }


  uploadProduct(form: FormData) {
    this.api.uploadProduct(form)
    .subscribe({
      next: (response) => {
        console.log(response);
        if (response.code > 1) {
          console.error("Something unexpected happened");
          return;
        }

        let forms = new FormData();
        for(const nm of this.getVariantsToArray()) {
            forms.append("Names", nm);
        }
        forms.append("ProductId", response.data.id);
        this.uploadVariant(forms);

      },
      error: (response: HttpErrorResponse) => {
        console.error(response.error);
      },
      complete: () => {
        console.warn("Product uploaded");
        
      }
    });
  }

  uploadVariant(form: FormData) {
    let variantResult = this.api.addProductVariant(form);
    if (variantResult === undefined) {
      console.error("Failed to add variants because session has expired");
      return;
    }
    variantResult.subscribe({
      next: (response) => {
        console.log(response);
        if (response.code > 1) {
          console.error("Something unexpected happened while creating variants");
        }

        
        const productId = <string>form.get("ProductId")!.valueOf()!;
        this.api.getProductVariants(productId).subscribe({
          next: (response) => {
            for(const img of this.images.controls) {
              let imageForm = new FormData();
              if (img.value.file === null) continue;
              imageForm.append("Image", img.value.file, img.value.file.name);
              imageForm.append("ProductId", productId);
              if (img.value.forVariant === NoVariant) img.value.forVariant = null;

              let targetVariantId = EmptyGuid;
              let targetVarId = response.data.find(e => e.name === img.value.forVariant);
              if (targetVarId !== undefined) targetVariantId = targetVarId.id;
              
              imageForm.append("VariantId", targetVariantId);
              console.log(img.value.forVariant);

              this.uploadImage(imageForm);
            }
          },
          error: (response: HttpErrorResponse) => {
            console.error(response.error);
          },
          complete: () => {

          }
        })

      },
      error: (error: HttpErrorResponse) => {
        console.error("Failed to add variants");
      },
      complete: () => {
        console.warn("Variants added");
      }
    })
  }

  uploadImage(form: FormData) {
    this.api.uploadProductImage(form).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (response: HttpErrorResponse) => {
        console.error(response.error);
      },
      complete: () => {
        console.warn("Image for product is uploaded");
        this.location.back()
      }
    })
  }
  
  
}
