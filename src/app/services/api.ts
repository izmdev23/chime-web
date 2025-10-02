import { Injectable } from "@angular/core";
import { ApiResponse, LoginDto, LoginResponseDto } from "./models";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

export namespace Endpoints {
    export namespace Auth {
        export const Login = "/api/auth/login";
    }

    export namespace Product {
        export const GetCategories = "/api/auth/login";
    }
}

@Injectable({
    providedIn: "root"
})
export class ApiService {
    apiHost: string = "https://localhost:7199";
    
    constructor(
        protected http: HttpClient
    ) {}

    public login(dto: LoginDto) {
        return this.http.post(this.apiHost + Endpoints.Auth.Login, dto) as Observable<ApiResponse<LoginResponseDto>>;
    }
}