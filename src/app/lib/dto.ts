export interface BaseDto {

}
    
    

export interface AddCartItemDto extends BaseDto {
    productId: string;
    variantId: string;
    userId: string;
    quantity: number;
}

export class DtoStruct<Type extends BaseDto> {
    private data: Type | undefined;
    private form: FormData;
    
    constructor(data: Type) {
        this.form = new FormData();
        this.data = data;

        for(const d in data) {
            console.log(d, data[d]);
        }
        
    }

    toForm(): FormData {
        return this.form;
    }


}