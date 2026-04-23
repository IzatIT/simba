export const Path = {
    Auth: {
        Login: 'admin/auth/login',
        Refresh: 'admin/auth/refresh',
        Logout: 'admin/auth/logout',
        Me: 'admin/auth/me',
    },
    PublicMenu: {
        Categories: 'public/menu/categories',
        Tags: 'public/menu/tags',
        Products: 'public/menu/products',
        Product: (slug: string) => `public/menu/products/${slug}`,
    },
    Menu: {
        Categories: 'admin/menu/categories',
        Category: (id: string) => `admin/menu/categories/${id}`,
        CategoriesReorder: 'admin/menu/categories/reorder',
        Tags: 'admin/menu/tags',
        Tag: (id: string) => `admin/menu/tags/${id}`,
        TagsReorder: 'admin/menu/tags/reorder',
        Products: 'admin/menu/products',
        Product: (id: string) => `admin/menu/products/${id}`,
        ProductsReorder: 'admin/menu/products/reorder',
    },
    Media: {
        Upload: 'admin/media/upload',
    },
    Bookings: {
        List: 'admin/bookings',
        Stats: 'admin/bookings/stats',
        One: (id: string) => `admin/bookings/${id}`,
        Status: (id: string) => `admin/bookings/${id}/status`,
    },
    PublicBookings: {
        Create: 'public/bookings',
        Availability: 'public/bookings/availability',
    },
    PublicOrders: {
        Create: 'public/orders',
        One: (id: string) => `public/orders/${id}`,
    },
    Orders: {
        List: 'admin/orders',
        One: (id: string) => `admin/orders/${id}`,
        Status: (id: string) => `admin/orders/${id}/status`,
    },
    PublicPayments: {
        Initiate: 'public/payments/initiate',
        One: (id: string) => `public/payments/${id}`,
    },
    Payments: {
        Status: (id: string) => `admin/payments/${id}/status`,
    },
    Customers: {
        List: 'admin/customers',
        Summary: 'admin/customers/summary',
        One: (phone: string) => `admin/customers/${encodeURIComponent(phone)}`,
    },
    Users: {
        List: 'admin/users',
        One: (id: string) => `admin/users/${id}`,
    },
    Configuration: {
        Root: 'admin/configuration',
        Public: 'public/configuration',
        Person: 'admin/configuration/person',
        Philosophy: 'admin/configuration/philosophy',
        Gallery: 'admin/configuration/gallery',
        GalleryItem: (id: string) => `admin/configuration/gallery/${id}`,
        Events: 'admin/configuration/events',
        Event: (id: string) => `admin/configuration/events/${id}`,
        Logo: 'admin/configuration/logo',
    },
}
