export interface OrdersGenerated {
    id:          string;
    numberOrder: string;
    supplierId:  string;
    user:        string;
    orderDate:   Date;
    totalAmount: number;
    orderItems:  OrderItem[];
    supplier:    Supplier;
}

export interface OrderItem {
    id:        string;
    orderId:   string;
    productId: string;
    quantity:  number;
    unitPrice: number;
    product:   Product;
}

export interface Product {
    id:             string;
    name:           string;
    barcode:        string;
    purchase_price: number;
}

export interface Supplier {
    id:           string;
    ruc:          string;
    company_name: string;
}
