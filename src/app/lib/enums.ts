import { Product, ProductVariant } from "@lib/models";
import { Utils } from "./utils";

export namespace Enums {

    export namespace Defaults {
        export namespace Model {
            export const PRODUCT: Product = {
                id: Utils.Guid.EMPTY,
                storeId: Utils.Guid.EMPTY,
                uploaderId: Utils.Guid.EMPTY,
                name: "",
                description: "",
                categoryId: 0,
            }

            export const VARIANT: ProductVariant = {
                id: Utils.Guid.EMPTY,
                name: "",
                productId: "",
                price: 0,
                rating: 0,
                saleEnd: new Date(),
                salePrice: 0,
                saleStart: new Date(),
                stock: 0,
            }
        }

    }

    export namespace Errors {
        export const InvalidQuantityError = "InvalidQuantityError";
        export const InvalidVariantError = "InvalidVariantError";
    }

    export namespace Logging {
        export enum ErrorDestination {
            console,
            file
        }
    }
    
    
}