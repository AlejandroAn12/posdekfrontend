export interface MovementProductFilters {
  productId?: string;
  movementType?: string;
  fromDate?: string; // formato ISO o yyyy-MM-dd
  toDate?: string;
  page?: number;
  limit?: number;
}
