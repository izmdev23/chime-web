import { Injectable } from "@angular/core";
import { ApiResponse, CartItem, LoginDto, LoginResponseDto, Product, ProductCategory, ProductUploadDto, ProductVariant, ProductVariantDto, SignUpDto, User } from "@lib/models";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { CookieService } from "ngx-cookie-service";
import { SecureService } from "./security";
import { Utils } from "@lib/utils";
import { DeleteCartItemResponseDto, UpdateCartItemQuantityResponseDto } from "@lib/response-dto";
import { UpdateCartItemQuantityRequestDto, AddCartItemRequestDto, DeleteCartItemRequestDto } from "@lib/request-dto";


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

        export function addCartItem() {
            return `/api/product/caritems/add`;
        }

        export function updateCartItemQuantity() {
            return `/api/product/caritems/update-quantity`;
        }

        export function deleteCartItem(cartItemId: string) {
            return `/api/product/caritems/${cartItemId}`;
        }

        export function uploadProductImage() {
            return "/api/files/upload/product-image";
        }

        export function getCartItems(userId: string) {
            return `/api/product/cartitems/${userId}`;
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
    private _host: string = "192.168.1.16"
    private _port: string = "5000"
    private _protocol: string = "http"
    private _address: string = `${this._protocol}://${this._host}:${this._port}`;
    
    public get address() {
        return this._address;
    }
    
    constructor(
        protected http: HttpClient,
        protected cookie: CookieService,
        protected secure: SecureService
    ) {}

    ngOnInit() {
        // let environment = process.env["RUNTIME"];
        // if (environment === undefined) {
        //     console.warn(`RUNTIME is undefined in env file. Your API endpoint will run in ${this.address}`);
        //     return;
        // }
        
    }

    public ping() {
        return this.http.get(this._address + Endpoints.Auth.ping()) as Observable<ApiResponse<null>>;
    }
    
    public login(dto: LoginDto) {
        return this.http.post(this._address + Endpoints.Auth.Login, dto) as Observable<ApiResponse<LoginResponseDto>>;
    }

    public getProductCategories() {
        return this.http.get(this._address + Endpoints.Product.GetCategories) as Observable<ApiResponse<ProductCategory[]>>;
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
            userId = auth.userId;
        }
        return this.http.get(this._address + 
            Endpoints.Product.GetProducts + `${userId},${categoryId},${start},${end}`) as Observable<ApiResponse<Product[]>>;
    }

    public getProduct(productId: string) {
        return this.http.get(this._address + Endpoints.Product.getProduct(productId)) as Observable<ApiResponse<Product>>;
    }

    public signUp(dto: SignUpDto) {
        console.log("api.signup", dto);
        return this.http.post(this._address + Endpoints.Auth.SignUp, dto) as Observable<ApiResponse<undefined>>;
    }

    public getUserData() {
        if (this.cookie.check("auth") === false) {
            return undefined;
        }
        let auth = JSON.parse(this.cookie.get("auth")) as LoginResponseDto;
        return this.http.get(this._address + Endpoints.Auth.GetUser, {
            headers: {
                authorization: "Bearer " + auth.accessToken
            }
        }) as Observable<ApiResponse<User>>;
    }

    public uploadProduct(dto: ProductUploadDto) {
        console.log(dto);
        let auth = JSON.parse(this.cookie.get("auth")) as LoginResponseDto;
        return this.http.post(this._address + Endpoints.Product.UploadProduct, dto, {
            headers: {
                authorization: "Bearer " + auth.accessToken
            }
        }) as Observable<ApiResponse<Product>>;
    }

    public addProductVariant(dto: ProductVariantDto): Observable<ApiResponse<ProductVariant>> | undefined {
        let auth = this.secure.getAuthString();
        if (auth === undefined) return undefined;
        return this.http.post<ApiResponse<ProductVariant>>(this._address + Endpoints.Product.AddProductVariant, dto, {
            headers: {
                authorization: "Bearer " + auth.accessToken
            }
        });
    }

    public uploadProductImage(image: File, variantId: string, productId: string) {
        let auth = JSON.parse(this.cookie.get("auth")) as LoginResponseDto;
        if (auth === undefined) return undefined;
        const form = new FormData();
        form.append("Image", image);
        form.append("VariantId", variantId);
        form.append("ProductId", productId);
        return this.http.post(this._address + Endpoints.Product.uploadProductImage(), form, {
            headers: {
                authorization: "Bearer " + auth.accessToken
            }
        }) as Observable<ApiResponse<Product>>;
    }

    public getProductVariants(productId: string): Observable<ApiResponse<ProductVariant[]>> {
        return this.http.get<ApiResponse<ProductVariant[]>>(this._address + Endpoints.Product.getProductVariant(productId));
    }
    public getProductVariant(productId: string, variantId: string): Observable<ApiResponse<ProductVariant>> {
        return this.http.get<ApiResponse<ProductVariant>>(this._address + Endpoints.Product.getProductVariant(productId, variantId));
    }

    public getProductVariantImages(productId: string, variantId: string): Observable<ApiResponse<string[]>> {
        return this.http.get<ApiResponse<string[]>>(this._address + Endpoints.Product.getProductVariantImages(productId, variantId));
    }

    public getCartItems(userId: string) {
        let auth = this.secure.getAuthString();
        if (auth === undefined) return undefined;
        const headers = new HttpHeaders({
            "Authorization": "Bearer " + auth.accessToken
        })
        
        return this.http.get<ApiResponse<CartItem[]>>(this.address + Endpoints.Product.getCartItems(userId));
    }

    public addCartItem(dto: AddCartItemRequestDto): Observable<ApiResponse<CartItem>> | undefined {
        let auth = this.secure.getAuthString();
        if (auth === undefined) return undefined;
        const headers = new HttpHeaders({
            "Authorization": "Bearer " + auth.accessToken
        })
        return this.http.post<ApiResponse<CartItem>>(this.address + Endpoints.Product.addCartItem(), dto, {
            headers: headers
        });
    }

    public updateCartItemQuantity(cartItemId: string, newQuantity: number, accessToken: string): Observable<UpdateCartItemQuantityResponseDto> {
        const dto: UpdateCartItemQuantityRequestDto = {
            cartItemId: cartItemId,
            quantity: newQuantity
        };
        const headers = new HttpHeaders();
        headers.append("Authorization", `Bearer ${accessToken}`);
        return this.http.put<UpdateCartItemQuantityResponseDto>(this.address + Endpoints.Product.updateCartItemQuantity(), dto, { headers: headers });
    }

    public deleteCartItem(cartItemId: string, accessToken: string): Observable<DeleteCartItemResponseDto> {
        const dto: DeleteCartItemRequestDto = {
            cartItemId: cartItemId,
        };
        const headers = new HttpHeaders();
        headers.append("Authorization", `Bearer ${accessToken}`);
        return this.http.delete<DeleteCartItemResponseDto>(this.address + Endpoints.Product.deleteCartItem(cartItemId), { headers: headers });
    }
    
}