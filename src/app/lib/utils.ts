export namespace Utils {
    export function getDiscountRate(price: number, salePrice: number): number {
        if (salePrice === 0) return 100;
        if (price === 0) return 0;
        if (salePrice === -1) return 0;
        if (salePrice === price) return 0;
        
        let ratio = salePrice / price;
        let rate = 1 - ratio;
        return Math.round(rate * 100);
    }

    export function fileToImage(imageFile: File) {
        const reader = new FileReader();
        reader.onload = () => {

        }
        // reader.readAsDataURL()
    }

    export namespace Guid {
        export const EMPTY = "00000000-0000-0000-0000-000000000000";
    }
}