export interface Merma {
    id?: number;
    product_id: number;
    quantity: number;
    type: 'vencido' | 'dañado' | 'perdido';
    date: Date;
    value: number;
    responsible_id: number;
    observations?: string;
    kardex_id?: number;
    is_automated?: boolean;
}

export interface MermaWithDetails extends Merma {
    product_name: string;
    responsible_name: string;
}