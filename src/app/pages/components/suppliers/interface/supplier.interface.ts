export interface ISupplier {
    id: string;
    ruc: number;
    legal_representative: string;
    company_name: string;
    address: string;
    phone: string;
    email: string;
    country: string;
    city: string;
    registration_date?: string;
    lastUpdated_date?: string;
    status?: boolean;
}