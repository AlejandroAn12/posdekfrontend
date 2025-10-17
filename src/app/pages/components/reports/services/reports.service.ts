import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, tap } from "rxjs";
import { environment } from "../../../../../environments/environment";


@Injectable({
    providedIn: 'root'
})
export class ReportsService {

    private http = inject(HttpClient);
    getHistoryDailySales(params: {
        fromDate?: string;  // formato ISO o 'YYYY-MM-DD'
        toDate?: string;    // formato ISO o 'YYYY-MM-DD'
        page?: number;
        limit?: number;
    }) {
        const queryParams: any = {};

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
        }>(`${environment.API_URL}/sales/daily`, {
            params: queryParams,
        });
    }

    getSalesByEmployee(params: {
        credentialId?: string;
        fromDate?: string;  // formato ISO o 'YYYY-MM-DD'
        toDate?: string;    // formato ISO o 'YYYY-MM-DD'
        page?: number;
        limit?: number;
    }) {
        const queryParams: any = {};
        if (params.credentialId) queryParams.credentialId = params.credentialId;
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
        }>(`${environment.API_URL}/sales/by-employee`, {
            params: queryParams,
        });
    }
}