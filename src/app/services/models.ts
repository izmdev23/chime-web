export interface LoginDto {
    userName: string;
    password: string;
}

export interface LoginResponseDto {
    userId: string;
    accessToken: string;
    refreshToken: string;
}

export interface ProductCategoryDto {
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
    price: number;
    salePrice: number;
    rating: number;
    saleStart: Date;
    saleEnd: Date;
    stock: number;
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
    Name: string;
    Description: string;
    Price: number;
    ProductTypeId: number;
    UploaderId: string;
    StoreId: string;
    SalePrice: number;
    Images: File[];
}

export interface ProductVariant {
    id: string;
    name: string;
    productId: string;
}

export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}

export const EmptyGuid = "00000000-0000-0000-0000-000000000000";