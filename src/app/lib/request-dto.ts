export interface AddCartItemRequestDto {
    productId: string;
    variantId: string;
    userId: string;
    quantity: number;
}

export interface UpdateCartItemQuantityRequestDto {
    cartItemId: string;
    quantity: number;
}

export interface DeleteCartItemRequestDto {
    cartItemId: string;
}