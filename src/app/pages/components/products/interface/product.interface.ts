export interface IProduct {
    id: string;
    name: string;
    code: string;
    stock: number;
    barcode: string;
    description: string;
    purchase_price: number;
    sale_price: number;
    registration_date: string,
    status: boolean;
    total?: number;
    category?: any[];
    its_service?: boolean;
}