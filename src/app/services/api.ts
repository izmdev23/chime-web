import { Injectable } from "@angular/core";
import { ApiResponse, LoginDto, LoginResponseDto, Product, ProductCategoryDto, ProductUploadDto, ProductVariant, SignUpDto, User } from "./models";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CookieService } from "ngx-cookie-service";
import { SecureService } from "./security";



export namespace Endpoints {
    export namespace Auth {
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
    public readonly guidEmpty: string = "00000000-0000-0000-0000-000000000000";
    private apiHost: string = "https://localhost:7199";
    
    constructor(
        protected http: HttpClient,
        protected cookie: CookieService,
        protected secure: SecureService
    ) {}

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
        let userId = this.guidEmpty;
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
        return this.http.post(this.apiHost + Endpoints.File.UploadProductImage, form, {
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
}