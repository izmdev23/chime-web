import { Injectable } from "@angular/core";
import { CookieService } from "ngx-cookie-service";
import { LoginResponseDto } from "../lib/models";

@Injectable({
    providedIn: "root"
})
export class SecureService {
    constructor(
        protected cookie: CookieService
    ) {}

    getAuthString() {
        if (this.cookie.check("auth") === false) return undefined;
        return JSON.parse(this.cookie.get("auth")) as LoginResponseDto;
    }

    get accessToken(): string | undefined {
        if (this.cookie.check("auth") === false) return undefined;
        let authString = <LoginResponseDto>JSON.parse(this.cookie.get("auth"));
        return authString.accessToken;
    }

    get userId(): string | undefined {
        if (this.cookie.check("auth") === false) return undefined;
        let authString = <LoginResponseDto>JSON.parse(this.cookie.get("auth"));
        return authString.userId;
    }
}