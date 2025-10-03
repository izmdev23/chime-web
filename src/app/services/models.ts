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
    categoryId: number;
    stock: number;
}

export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}

