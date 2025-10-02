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

export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}