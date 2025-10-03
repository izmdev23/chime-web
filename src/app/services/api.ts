import { Injectable } from "@angular/core";
import { ApiResponse, LoginDto, LoginResponseDto, Product, ProductCategoryDto, ProductUploadDto, SignUpDto, User } from "./models";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CookieService } from "ngx-cookie-service";



export namespace Endpoints {
    export namespace Auth {
        export const Login = "/api/auth/login";
        export const SignUp = "/api/auth/signup";
        export const GetUser = "/api/auth/get-user";
    }

    export namespace Product {
        export const GetCategories = "/api/product/categories";
        export const GetProducts = "/api/product/";
        export const UploadProduct = "/api/product/upload";
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
        protected cookie: CookieService
    ) {}

    public login(dto: LoginDto) {
        return this.http.post(this.apiHost + Endpoints.Auth.Login, dto) as Observable<ApiResponse<LoginResponseDto>>;
    }

    public getProductCategories() {
        return this.http.get(this.apiHost + Endpoints.Product.GetCategories) as Observable<ApiResponse<ProductCategoryDto[]>>;
    }

    public getProducts(categoryId: number, start: number, end: number) {
        let userId = this.guidEmpty;
        if (this.cookie.check("auth")) {
            let auth: LoginResponseDto = JSON.parse(this.cookie.get("auth"));
            console.log(auth);
            userId = auth.userId;
        }
        console.warn(Endpoints.Product.GetProducts + `${userId},${categoryId},${start},${end}`);
        return this.http.get(this.apiHost + 
            Endpoints.Product.GetProducts + `${userId},${categoryId},${start},${end}`) as Observable<ApiResponse<Product[]>>;
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

    public uploadProduct(dto: ProductUploadDto) {
        let formData = new FormData();

        for(let method in dto) {
            if (method === "Images") continue;
            console.log(method, dto[method as keyof typeof dto]);
            formData.append(method, dto[method as keyof typeof dto] as any);
        }
        formData.append("Images", dto.Images[0], dto.Images[0].name);
        // return undefined;
        if (this.cookie.check("auth") === false) {
            return undefined;
        }
        let auth = JSON.parse(this.cookie.get("auth")) as LoginResponseDto;
        return this.http.post(this.apiHost + Endpoints.Product.UploadProduct, formData, {
            headers: {
                authorization: "Bearer " + auth.accessToken
            }
        }) as Observable<ApiResponse<undefined>>;
    }
}