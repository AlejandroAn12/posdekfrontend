export interface InventoryItem {
    id: string;
    product: {
        barcode: string;
        code: string;
        name: string;
    };
    systemQuantity: number;
    physicalQuantity?: number; // ingresado por el usuario
}