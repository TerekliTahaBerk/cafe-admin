export type OpeningHoursDay = {
  /** 0 = Monday … 6 = Sunday */
  day: number;
  open: boolean;
  from: string; // "08:00"
  to: string; // "22:00"
};

export type Category = {
  id: string;
  name: string;
  sort_order: number;
  created_at: string;
};

export type Product = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_path: string | null;
  tags: string[];
  allergens: string[];
  in_stock: boolean;
  is_visible: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type SiteSettings = {
  id: boolean;
  cafe_name: string;
  tagline: string | null;
  about_text: string | null;
  location_label: string | null;
  address: string | null;
  phone: string | null;
  instagram: string | null;
  wifi_password: string | null;
  opening_hours: OpeningHoursDay[];
  logo_path: string | null;
  map_embed_url: string | null;
  updated_at: string;
};

type Table<Row, Required extends keyof Row = never> = {
  Row: Row;
  Insert: Partial<Row> & Pick<Row, Required>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      categories: Table<Category, "name">;
      products: Table<Product, "name" | "category_id" | "price">;
      site_settings: Table<SiteSettings>;
      admins: Table<{ user_id: string; created_at: string }, "user_id">;
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      reorder_categories: { Args: { ids: string[] }; Returns: undefined };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
