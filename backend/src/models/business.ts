import pool from "../config/db";

export interface Business {
    id: number;
    name: string;
    description?: string;
    address?: string;
    tax_id: string;
    business_type_id: number;
    status: string;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface BusinessType {
    id: number;
    name: string;
  }

export interface BusinessUser {
    id?: number;
    user_id: number;
    business_id: number;
    business_role_id: number;
    status?: string;
    created_at?: Date;
}

export interface BusinessProduct {
    id?: number;
    business_id: number;
    product_id: number;
    custom_price?: number;
    actual_stock: number;
    created_at?: Date;
}

export interface BusinessOrgChart {
    id?: number;
    business_id: number;
    user_id: number;
    position: string;
    parent_position_id?: number;
    created_at?: Date;
}

// Funciones de acceso a datos
export const createBusiness = async (business: Business): Promise<Business> => {
    const query = `
        INSERT INTO businesses (name, description, address, tax_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;
    const values = [business.name, business.description, business.address, business.tax_id];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const assignUserToBusiness = async (businessUser: BusinessUser): Promise<BusinessUser> => {
    const query = `
        INSERT INTO business_users (user_id, business_id, business_role_id)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;
    const values = [businessUser.user_id, businessUser.business_id, businessUser.business_role_id];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const addProductToBusiness = async (businessProduct: BusinessProduct): Promise<BusinessProduct> => {
    const query = `
        INSERT INTO business_products (business_id, product_id, custom_price, actual_stock)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;
    const values = [businessProduct.business_id, businessProduct.product_id, businessProduct.custom_price, businessProduct.actual_stock];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const createOrgChartEntry = async (orgChart: BusinessOrgChart): Promise<BusinessOrgChart> => {
    const query = `
        INSERT INTO business_org_chart (business_id, user_id, position, parent_position_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;
    const values = [orgChart.business_id, orgChart.user_id, orgChart.position, orgChart.parent_position_id];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const getBusinessById = async (id: number): Promise<Business | null> => {
    const query = `SELECT * FROM businesses WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};