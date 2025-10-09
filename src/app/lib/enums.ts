import { Product } from "@lib/models";
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
                price: -1,
                salePrice: -1,
                rating: -1,
                saleStart: new Date(),
                saleEnd: new Date(),
                categoryId: -1,
                stock: -1
            }
        }

    }
    
    
}