export interface LoginDto {
    userName: string;
    password: string;
}

export interface LoginResponseDto {
    userId: string;
    accessToken: string;
    refreshToken: string;
}

export interface ProductCategory {
    id: number;
    name: string;
}

export interface SignUpDto {
    username: string;
    password: string;
    firstName: string;
    middleName: string;
    lastName: string;
}

export interface Product {
    id: string;
    storeId: string;
    uploaderId: string;
    name: string;
    description: string;
    categoryId: number;
}

export interface User {
    userName: string;
    role: string;
    firstName: string;
    middleName: string;
    lastName: string;
}

export interface ProductUploadDto {
    name: string;
    description: string;
    productTypeId: number;
    uploaderId: string;
    storeId: string;
}

export interface ProductVariantDto {
    name: string;
    price: number;
    rating: number;
    saleEnd: Date;
    saleStart: Date;
    salePrice: number;
    stock: number;
    productId: string;
}

export interface ProductVariant {
    id: string;
    name: string;
    productId: string;
    price: number;
    rating: number;
    saleEnd: Date;
    saleStart: Date;
    salePrice: number;
    stock: number;
}

export interface CartItem {
    id: string;
    variantId: string;
    userId: string;
    dateAdded: string;
    productId: string;
    quantity: number;
    images: string[]
}

export interface Image {
    id: string;
    file: File | null;
    image: string | ArrayBuffer | null;
    variantId: string;
}

export interface ApiResponse<T> {
    this: any;
    code: number;
    message: string;
    data: T;
}

export interface ErrorData {
    code: number;
    message: string;
    type: "log" | "warning" | "error" | "success"
}

export const EmptyGuid = "00000000-0000-0000-0000-000000000000";
