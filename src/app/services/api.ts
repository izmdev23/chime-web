import { Injectable } from "@angular/core";
import { ApiResponse, LoginDto, LoginResponseDto, Product, ProductCategoryDto, ProductVariant, SignUpDto, User } from "../lib/models";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CookieService } from "ngx-cookie-service";
import { SecureService } from "./security";
import { Utils } from "@lib/utils";



export namespace Endpoints {
    export namespace Auth {
        export function ping() {
            return "/api/auth/ping";
        }
        export const Login = "/api/auth/login";
        export const SignUp = "/api/auth/signup";
        export const GetUser = "/api/auth/get-user";
    }

    export namespace Product {
        export const GetCategories = "/api/product/categories";
        export const GetProducts = "/api/product/";
        export function getProduct(productId: string) {
            return `/api/product/${productId}`;
        }
        export const UploadProduct = "/api/product/upload";
        export const AddProductVariant = "/api/product/add-prod-variant";
        export function getProductVariantImages(productId: string, variantId: string) {
            return `/api/product/${productId},${variantId}/image`;
        }

        export function uploadProductImage() {
            return "/api/files/upload/product-image";
        }

        export function getProductVariant(productId: string): string;
        export function getProductVariant(productId: string, variantId: string): string;
        export function getProductVariant(prodId: string, variantId?: string): string {
            let baseRoute = `/api/product/${prodId}/variants`;
            if (variantId !== undefined) {
                return baseRoute + `/${variantId}`;
            }
            else{
                return baseRoute;
            }
        }
    }

    export namespace File {
        export const UploadProductImage = "/api/files/upload/product-image";
    }
    
    export namespace Test {
        export const TestUploadImage = "/api/Test/test-upload-image";
    }
}

@Injectable({
    providedIn: "root"
})
export class ApiService {
    private networkHost: string = "192.168.1.16"
    private networkPort: string = "5000"
    private apiHost: string = `http://${this.networkHost}:${this.networkPort}`;
    
    public get ApiHost() {
        return this.apiHost;
    }
    
    constructor(
        protected http: HttpClient,
        protected cookie: CookieService,
        protected secure: SecureService
    ) {}

    public ping() {
        return this.http.get(this.apiHost + Endpoints.Auth.ping()) as Observable<ApiResponse<null>>;
    }
    
    public login(dto: LoginDto) {
        return this.http.post(this.apiHost + Endpoints.Auth.Login, dto) as Observable<ApiResponse<LoginResponseDto>>;
    }

    public getProductCategories() {
        return this.http.get(this.apiHost + Endpoints.Product.GetCategories) as Observable<ApiResponse<ProductCategoryDto[]>>;
    }

    // public getProduct(categoryId: number, start: number, end: number) {
    //     let userId = this.guidEmpty;
    //     if (this.cookie.check("auth")) {
    //         let auth: LoginResponseDto = JSON.parse(this.cookie.get("auth"));
    //         console.log(auth);
    //         userId = auth.userId;
    //     }
    //     console.warn(Endpoints.Product.GetProducts + `${userId},${categoryId},${start},${end}`);
    //     return this.http.get(this.apiHost + 
    //         Endpoints.Product.GetProducts + `${userId},${categoryId},${start},${end}`) as Observable<ApiResponse<Product[]>>;
    // }

    public getProducts(categoryId: number, start: number, end: number) {
        let userId = Utils.Guid.EMPTY;
        if (this.cookie.check("auth")) {
            let auth: LoginResponseDto = JSON.parse(this.cookie.get("auth"));
            console.log(auth);
            userId = auth.userId;
        }
        return this.http.get(this.apiHost + 
            Endpoints.Product.GetProducts + `${userId},${categoryId},${start},${end}`) as Observable<ApiResponse<Product[]>>;
    }

    public getProduct(productId: string) {
        return this.http.get(this.apiHost + Endpoints.Product.getProduct(productId)) as Observable<ApiResponse<Product>>;
    }

    public signUp(dto: SignUpDto) {
        console.log("api.signup", dto);
        return this.http.post(this.apiHost + Endpoints.Auth.SignUp, dto) as Observable<ApiResponse<undefined>>;
    }

    public getUserData() {
        if (this.cookie.check("auth") === false) {
            return undefined;
        }
        let auth = JSON.parse(this.cookie.get("auth")) as LoginResponseDto;
        return this.http.get(this.apiHost + Endpoints.Auth.GetUser, {
            headers: {
                authorization: "Bearer " + auth.accessToken
            }
        }) as Observable<ApiResponse<User>>;
    }

    public uploadProduct(data: FormData) {
        let auth = JSON.parse(this.cookie.get("auth")) as LoginResponseDto;
        return this.http.post(this.apiHost + Endpoints.Product.UploadProduct, data, {
            headers: {
                authorization: "Bearer " + auth.accessToken
            }
        }) as Observable<ApiResponse<Product>>;
    }

    public addProductVariant(form: FormData) {
        let auth = this.secure.getAuthString();
        if (auth === undefined) return undefined;
        return this.http.post(this.apiHost + Endpoints.Product.AddProductVariant, form, {
            headers: {
                authorization: "Bearer " + auth.accessToken
            }
        }) as Observable<ApiResponse<undefined>>;
    }

    public uploadProductImage(form: FormData) {
        let auth = JSON.parse(this.cookie.get("auth")) as LoginResponseDto;
        return this.http.post(this.apiHost + Endpoints.Product.uploadProductImage(), form, {
            headers: {
                authorization: "Bearer " + auth.accessToken
            }
        }) as Observable<ApiResponse<Product>>;
    }

    public getProductVariants(productId: string): Observable<ApiResponse<ProductVariant[]>> {
        return this.http.get<ApiResponse<ProductVariant[]>>(this.apiHost + Endpoints.Product.getProductVariant(productId));
    }
    public getProductVariant(productId: string, variantId: string): Observable<ApiResponse<ProductVariant>> {
        return this.http.get<ApiResponse<ProductVariant>>(this.apiHost + Endpoints.Product.getProductVariant(productId, variantId));
    }

    public getProductVariantImages(productId: string, variantId: string): Observable<ApiResponse<string[]>> {
        return this.http.get<ApiResponse<string[]>>(this.apiHost + Endpoints.Product.getProductVariantImages(productId, variantId));
    }
}