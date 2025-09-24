import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { environment } from "../../../../../environments/environment";
import { retry } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class InvoicesService {

    private http = inject(HttpClient);

    createInvoice(data: any) {
        return this.http.post(`${environment.API_URL}/invoices/create`, data);
    }

    getInvoiceTypes() {
        return this.http.get(`${environment.API_URL}/invoices/types`);
    }

    getInvoices(params: {
        invoiceType?: string,
        fromDate?: string;  // formato ISO o 'YYYY-MM-DD'
        toDate?: string;    // formato ISO o 'YYYY-MM-DD'
        page?: number;
        limit?: number;
    }) {
        const queryParams: any = {};

        if (params.invoiceType) queryParams.invoiceType = params.invoiceType;
        if (params.fromDate) queryParams.fromDate = params.fromDate;
        if (params.toDate) queryParams.toDate = params.toDate;
        if (params.page) queryParams.page = params.page;
        if (params.limit) queryParams.limit = params.limit;

        return this.http.get<{
            data: any[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        }>(`${environment.API_URL}/invoices/all`, {
            params: queryParams,
        });
    }

    getInvoiceById(invoiceId: string) {
        return this.http.get(`${environment.API_URL}/invoices/${invoiceId}`);
    }

    getInvoicesBilling(
        params: {
            invoiceType?: string,
            fromDate?: string;  // formato ISO o 'YYYY-MM-DD'
            toDate?: string;    // formato ISO o 'YYYY-MM-DD'
            page?: number;
            limit?: number;
        }
    ) {
        const queryParams: any = {};

        if (params.invoiceType) queryParams.invoiceType = params.invoiceType;
        if (params.fromDate) queryParams.fromDate = params.fromDate;
        if (params.toDate) queryParams.toDate = params.toDate;
        if (params.page) queryParams.page = params.page;
        if (params.limit) queryParams.limit = params.limit;

        return this.http.get<{
            data: any[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        }>(`${environment.API_URL}/invoices/billing`, {
            params: queryParams,
        });
    }

    getInvoiceBillingPosById(id: number){
        return this.http.get(`${environment.API_URL}/invoices/billing/${id}`);
    }
}