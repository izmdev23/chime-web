import { Injectable } from "@angular/core";
import { ApiResponse, LoginDto, LoginResponseDto, Product, ProductCategoryDto } from "./models";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CookieService } from "ngx-cookie-service";



export namespace Endpoints {
    export namespace Auth {
        export const Login = "/api/auth/login";
    }

    export namespace Product {
        export const GetCategories = "/api/product/categories";
        export const GetProducts = "/api/product/";
    }
}

@Injectable({
    providedIn: "root"
})
export class ApiService {
    private guidEmpty: string = "00000000-0000-0000-0000-000000000000";
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
}