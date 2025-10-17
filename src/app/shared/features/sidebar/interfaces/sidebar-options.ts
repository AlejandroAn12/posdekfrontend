export interface SidebarOption {
    title: string;
    iconClass: string;
    route?: string;
    children?: SidebarOption[];
}

export const SIDEBAR_OPTIONS: SidebarOption[] = [
    {
        title: 'Dashboard',
        iconClass: 'fa-solid fa-chart-pie',
        route: '/admin/dashboard',
    },
    {
        title: 'Administración',
        iconClass: 'fa-solid fa-user-gear',
        children: [
            { title: 'Gestionar credenciales', iconClass: 'fa-solid fa-user-tie', route: '/admin/credentials' },
            { title: 'Gestionar colaboradores', iconClass: 'fa-solid fa-users', route: '/admin/employees' },
        ],
    },
    {
        title: 'Proveedores',
        iconClass: 'fa-solid fa-truck',
        children: [
            { title: 'Nuevo proveedor', iconClass: 'fa-solid fa-plus-circle', route: '/admin/suppliers/form' },
            { title: 'Lista de proveedores', iconClass: 'fa-solid fa-list', route: '/admin/suppliers/view' },
        ],
    },
    {
        title: 'Categorías',
        iconClass: 'fa-solid fa-tags',
        children: [
            { title: 'Lista de categorías', iconClass: 'fa-solid fa-list', route: '/admin/categories/view' },
        ],
    },
    {
        title: 'Productos',
        iconClass: 'fa-solid fa-box',
        children: [
            { title: 'Nuevo producto', iconClass: 'fa-solid fa-plus-circle', route: '/admin/products/form' },
            { title: 'Lista de productos', iconClass: 'fa-solid fa-list', route: '/admin/products/list' },
            { title: 'Movimiento de productos', iconClass: 'fa-solid fa-arrows-rotate', route: '/admin/products/movements' },
        ],
    },
    {
        title: 'Inventario',
        iconClass: 'fa-solid fa-boxes-stacked',
        children: [
            { title: 'Realizar inventario', iconClass: 'fa-solid fa-clipboard-list', route: '/admin/inventory/generate' },
            { title: 'Ajuste de stock', iconClass: 'fa-solid fa-sliders', route: '/admin/inventory/adjustment' },
            { title: 'Historial de inventario', iconClass: 'fa-solid fa-history', route: '/admin/inventory/history-inventories' },
        ],
    },
    {
        title: 'Compras',
        iconClass: 'fa-solid fa-cart-shopping',
        children: [
            { title: 'Registrar compra', iconClass: 'fa-solid fa-cart-plus', route: '/admin/invoices/purchase-invoice' },
            { title: 'Ver facturas', iconClass: 'fa-solid fa-list', route: '/admin/invoices/list-purchase-invoices' },
        ]
    },
    {
        title: 'Facturas',
        iconClass: 'fa-regular fa-file-lines',
        children: [
            { title: 'Ver facturas', iconClass: 'fa-solid fa-list', route: '/admin/invoices' },
            { title: 'Comprobantes de venta', iconClass: 'fa-solid fa-receipt', route: '/admin/invoices/sales' },
        ]
    },
    {
        title: 'Reportes',
        iconClass: 'fa-regular fa-folder',
        children: [
            { title: 'Ventas generales', iconClass: 'fa-solid fa-list', route: '/admin/reports/sales' },
            { title: 'Ventas por colaborador', iconClass: 'fa-solid fa-list', route: '/admin/reports/sales-by-employee' },
            // { title: 'Comprobantes de venta', iconClass: 'fa-solid fa-receipt', route: '/admin/invoices/sales' },
        ]
    },
     {
        title: 'KPI',
        iconClass: 'fa-regular fa-folder',
        children: [
            // { title: 'Vendedores', iconClass: 'fa-solid fa-list', route: '/admin/reports/sales' },
            { title: 'Vendedores', iconClass: 'fa-solid fa-users', route: '/admin/reports/sales-by-employee' },
            // { title: 'Comprobantes de venta', iconClass: 'fa-solid fa-receipt', route: '/admin/invoices/sales' },
        ]
    },
    {
        title: 'Caja',
        iconClass: 'fa-solid fa-cash-register',
        children: [
            { title: 'Control y asignación', iconClass: 'fa-solid fa-list', route: '/admin/cajas/form' },
            // { title: 'Asignar vendedor a caja', iconClass: 'fa-solid fa-list', route: '/admin/cajas/sales' },
            // { title: 'Reporte de movimientos', iconClass: 'fa-solid fa-receipt', route: '/admin/invoices/sales' },
            // { title: 'Comprobantes de venta', iconClass: 'fa-solid fa-receipt', route: '/admin/invoices/sales' },
        ]
    },
    {
        title: 'Configuraciones',
        iconClass: 'fa-solid fa-gears',
        children: [
            { title: 'Información de tienda', iconClass: 'fa-solid fa-store', route: '/admin/store' },
            { title: 'Configuración general', iconClass: 'fa-solid fa-sliders', route: '/admin/store/settings' },
            { title: 'Cambiar contraseña', iconClass: 'fa-solid fa-lock', route: '/admin/change-password' },
        ]
    }
];
