--
-- PostgreSQL database dump
--

\restrict ITiQN8QcZrXWl0mTJucSg4heC0fXK0R99FpYYYdL0KO0fSBzVpuks46wbJv2doJ

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: btree_gin; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS btree_gin WITH SCHEMA public;


--
-- Name: EXTENSION btree_gin; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION btree_gin IS 'support for indexing common datatypes in GIN';


--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: BusinessStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."BusinessStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED',
    'PENDING'
);


--
-- Name: BusinessType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."BusinessType" AS ENUM (
    'EMPRESA_UNIPERSONAL',
    'SOCIEDAD_ANONIMA',
    'SOCIEDAD_LIMITADA',
    'SOCIEDAD_COOPERATIVA',
    'EMPRESA_PUBLICA',
    'ORGANIZACION_NO_LUCRATIVA',
    'PERSONA_NATURAL'
);


--
-- Name: CartStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CartStatus" AS ENUM (
    'ACTIVE',
    'PROCESSING',
    'COMPLETED',
    'ABANDONED'
);


--
-- Name: CashRegisterStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CashRegisterStatus" AS ENUM (
    'OPEN',
    'CLOSED',
    'SUSPENDED'
);


--
-- Name: Currency; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Currency" AS ENUM (
    'BOB',
    'USD',
    'EUR'
);


--
-- Name: Department; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Department" AS ENUM (
    'LA_PAZ',
    'COCHABAMBA',
    'SANTA_CRUZ',
    'ORURO',
    'POTOSI',
    'CHUQUISACA',
    'TARIJA',
    'BENI',
    'PANDO'
);


--
-- Name: DocumentType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DocumentType" AS ENUM (
    'NIT',
    'CI',
    'PASSPORT',
    'FOREIGN_ID'
);


--
-- Name: EmployeeStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EmployeeStatus" AS ENUM (
    'ACTIVE',
    'ON_LEAVE',
    'TERMINATED',
    'RETIRED'
);


--
-- Name: Gender; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Gender" AS ENUM (
    'MALE',
    'FEMALE',
    'OTHER',
    'UNSPECIFIED'
);


--
-- Name: InventoryTransactionType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."InventoryTransactionType" AS ENUM (
    'PURCHASE',
    'SALE',
    'ADJUSTMENT',
    'TRANSFER',
    'RETURN',
    'DAMAGED',
    'EXPIRED',
    'THEFT',
    'LOSS'
);


--
-- Name: InvoiceType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."InvoiceType" AS ENUM (
    'FACTURA',
    'FACTURA_EXENTA',
    'NOTA_CREDITO',
    'NOTA_DEBITO',
    'GUIA_REMISION',
    'COMPROBANTE_ALQUILER',
    'NOTA_SIMPLE'
);


--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'CASH',
    'CREDIT_CARD',
    'DEBIT_CARD',
    'BANK_TRANSFER',
    'MOBILE_PAYMENT',
    'GIFT_CARD',
    'LOYALTY_POINTS',
    'QR_PAYMENT',
    'ELECTRONIC_WALLET'
);


--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PAID',
    'FAILED',
    'REFUNDED',
    'PARTIALLY_REFUNDED'
);


--
-- Name: ProductStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ProductStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'DISCONTINUED',
    'OUT_OF_STOCK'
);


--
-- Name: PurchaseOrderStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PurchaseOrderStatus" AS ENUM (
    'DRAFT',
    'PENDING',
    'APPROVED',
    'ORDERED',
    'PARTIALLY_RECEIVED',
    'RECEIVED',
    'CANCELLED'
);


--
-- Name: SaleStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SaleStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'CANCELLED',
    'REFUNDED',
    'PARTIALLY_REFUNDED'
);


--
-- Name: SupplierStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SupplierStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED'
);


--
-- Name: TaxType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TaxType" AS ENUM (
    'IVA_13',
    'IVA_0',
    'EXENTO',
    'ICE',
    'IT',
    'IUE'
);


--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserStatus" AS ENUM (
    'PENDING_VERIFICATION',
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED',
    'LOCKED',
    'PASSWORD_RESET',
    'DELETED'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: audit_cash_registers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_cash_registers (
    id integer NOT NULL,
    cash_register_id integer NOT NULL,
    user_id integer NOT NULL,
    action character varying(50) NOT NULL,
    amount numeric(12,2),
    details text,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: audit_cash_registers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_cash_registers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_cash_registers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_cash_registers_id_seq OWNED BY public.audit_cash_registers.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    business_id integer,
    user_id integer NOT NULL,
    action character varying(50) NOT NULL,
    entity character varying(50) NOT NULL,
    entity_id integer NOT NULL,
    old_values jsonb,
    new_values jsonb,
    ip_address character varying(45),
    user_agent text,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: business_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.business_products (
    id integer NOT NULL,
    business_id integer NOT NULL,
    product_id integer NOT NULL,
    custom_price numeric(10,2) NOT NULL,
    current_stock integer DEFAULT 0 NOT NULL,
    reserved_stock integer DEFAULT 0 NOT NULL,
    available_stock integer DEFAULT 0 NOT NULL,
    last_restock timestamp(3) without time zone,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: business_products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.business_products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: business_products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.business_products_id_seq OWNED BY public.business_products.id;


--
-- Name: businesses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.businesses (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    legal_name character varying(150),
    description text,
    nit character varying(20),
    business_type public."BusinessType" DEFAULT 'PERSONA_NATURAL'::public."BusinessType" NOT NULL,
    email character varying(100),
    phone character varying(20),
    address text,
    city character varying(50),
    department public."Department" DEFAULT 'LA_PAZ'::public."Department" NOT NULL,
    country character varying(50) DEFAULT 'Bolivia'::character varying NOT NULL,
    postal_code character varying(10),
    logo_url text,
    website text,
    timezone character varying(50) DEFAULT 'America/La_Paz'::character varying NOT NULL,
    currency public."Currency" DEFAULT 'BOB'::public."Currency" NOT NULL,
    default_tax_rate numeric(5,2) DEFAULT 13 NOT NULL,
    status public."BusinessStatus" DEFAULT 'ACTIVE'::public."BusinessStatus" NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp(3) without time zone,
    created_by integer DEFAULT 0 NOT NULL,
    updated_by integer DEFAULT 0 NOT NULL,
    deleted_by integer
);


--
-- Name: businesses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.businesses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: businesses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.businesses_id_seq OWNED BY public.businesses.id;


--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart_items (
    id integer NOT NULL,
    cart_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    tax_rate numeric(5,2) DEFAULT 13 NOT NULL,
    tax_amount numeric(10,2) DEFAULT 0 NOT NULL,
    total_price numeric(10,2) NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: cart_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cart_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cart_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cart_items_id_seq OWNED BY public.cart_items.id;


--
-- Name: carts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.carts (
    id integer NOT NULL,
    business_id integer NOT NULL,
    user_id integer NOT NULL,
    customer_id integer,
    status public."CartStatus" DEFAULT 'ACTIVE'::public."CartStatus" NOT NULL,
    subtotal numeric(12,2) DEFAULT 0 NOT NULL,
    tax_amount numeric(12,2) DEFAULT 0 NOT NULL,
    total_amount numeric(12,2) DEFAULT 0 NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: carts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.carts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: carts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.carts_id_seq OWNED BY public.carts.id;


--
-- Name: cash_registers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cash_registers (
    id integer NOT NULL,
    business_id integer NOT NULL,
    user_id integer NOT NULL,
    register_number character varying(20) NOT NULL,
    opening_amount numeric(12,2) NOT NULL,
    closing_amount numeric(12,2),
    current_amount numeric(12,2) NOT NULL,
    opening_date timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    closing_date timestamp(6) with time zone,
    status public."CashRegisterStatus" DEFAULT 'OPEN'::public."CashRegisterStatus" NOT NULL,
    notes text,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp(3) without time zone,
    created_by integer DEFAULT 0 NOT NULL,
    updated_by integer DEFAULT 0 NOT NULL,
    deleted_by integer
);


--
-- Name: cash_registers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cash_registers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cash_registers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cash_registers_id_seq OWNED BY public.cash_registers.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    parent_id integer,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp(3) without time zone,
    created_by integer DEFAULT 0 NOT NULL,
    updated_by integer DEFAULT 0 NOT NULL,
    deleted_by integer
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: customer_debts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_debts (
    id integer NOT NULL,
    customer_id integer NOT NULL,
    sale_id integer,
    amount numeric(12,2) NOT NULL,
    paid_amount numeric(12,2) DEFAULT 0 NOT NULL,
    due_date timestamp(3) without time zone NOT NULL,
    is_paid boolean DEFAULT false NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    paid_at timestamp(3) without time zone
);


--
-- Name: customer_debts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.customer_debts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: customer_debts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.customer_debts_id_seq OWNED BY public.customer_debts.id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    business_id integer NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50),
    document_type public."DocumentType" DEFAULT 'CI'::public."DocumentType" NOT NULL,
    document_number character varying(20),
    email character varying(100),
    phone character varying(20),
    address text,
    city character varying(50),
    department public."Department" DEFAULT 'LA_PAZ'::public."Department",
    country character varying(50) DEFAULT 'Bolivia'::character varying NOT NULL,
    postal_code character varying(10),
    credit_limit numeric(12,2),
    current_balance numeric(12,2) DEFAULT 0 NOT NULL,
    loyalty_points integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp(3) without time zone,
    created_by integer DEFAULT 0 NOT NULL,
    updated_by integer DEFAULT 0 NOT NULL,
    deleted_by integer
);


--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: employees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employees (
    id integer NOT NULL,
    user_id integer NOT NULL,
    business_id integer NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50),
    "position" character varying(100) NOT NULL,
    department character varying(50),
    start_date timestamp(3) without time zone NOT NULL,
    end_date timestamp(3) without time zone,
    salary numeric(10,2),
    status public."EmployeeStatus" DEFAULT 'ACTIVE'::public."EmployeeStatus" NOT NULL,
    gender public."Gender" DEFAULT 'UNSPECIFIED'::public."Gender" NOT NULL,
    birth_date timestamp(3) without time zone,
    email character varying(100),
    phone character varying(20),
    address text,
    emergency_contact character varying(100),
    emergency_phone character varying(20),
    ci_number character varying(15),
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp(3) without time zone,
    created_by integer DEFAULT 0 NOT NULL,
    updated_by integer DEFAULT 0 NOT NULL,
    deleted_by integer
);


--
-- Name: employees_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.employees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;


--
-- Name: fiscal_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fiscal_settings (
    id integer NOT NULL,
    business_id integer NOT NULL,
    authorization_number character varying(50) NOT NULL,
    activity_code character varying(20) NOT NULL,
    law_number character varying(20) NOT NULL,
    invoice_series character varying(10) NOT NULL,
    invoice_start_number integer DEFAULT 1 NOT NULL,
    invoice_current_number integer DEFAULT 1 NOT NULL,
    invoice_end_number integer NOT NULL,
    is_electronic boolean DEFAULT true NOT NULL,
    siat_url character varying(200),
    siat_token character varying(500),
    siat_environment character varying(10) DEFAULT 'TEST'::character varying NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp(3) without time zone,
    created_by integer DEFAULT 0 NOT NULL,
    updated_by integer DEFAULT 0 NOT NULL,
    deleted_by integer
);


--
-- Name: fiscal_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.fiscal_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: fiscal_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.fiscal_settings_id_seq OWNED BY public.fiscal_settings.id;


--
-- Name: inventory_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_transactions (
    id integer NOT NULL,
    business_id integer NOT NULL,
    product_id integer NOT NULL,
    user_id integer NOT NULL,
    transaction_type public."InventoryTransactionType" NOT NULL,
    quantity integer NOT NULL,
    unit_cost numeric(10,2) NOT NULL,
    total_cost numeric(12,2) NOT NULL,
    reference_id integer,
    reference_type character varying(50),
    notes text,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: inventory_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.inventory_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: inventory_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.inventory_transactions_id_seq OWNED BY public.inventory_transactions.id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    module character varying(50) DEFAULT ''::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id integer NOT NULL,
    category_id integer NOT NULL,
    sku character varying(50),
    barcode character varying(50),
    name character varying(200) NOT NULL,
    description text,
    brand character varying(100),
    model character varying(100),
    unit character varying(20) DEFAULT 'pcs'::character varying,
    weight numeric(8,3),
    dimensions character varying(50),
    cost_price numeric(10,2) DEFAULT 0 NOT NULL,
    selling_price numeric(10,2) DEFAULT 0 NOT NULL,
    tax_type public."TaxType" DEFAULT 'IVA_13'::public."TaxType" NOT NULL,
    tax_rate numeric(5,2) DEFAULT 13 NOT NULL,
    min_stock integer DEFAULT 0 NOT NULL,
    max_stock integer,
    reorder_point integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    status public."ProductStatus" DEFAULT 'ACTIVE'::public."ProductStatus" NOT NULL,
    expiry_date timestamp(3) without time zone,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp(3) without time zone,
    created_by integer DEFAULT 0 NOT NULL,
    updated_by integer DEFAULT 0 NOT NULL,
    deleted_by integer
);


--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: purchase_order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_order_items (
    id integer NOT NULL,
    purchase_order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    unit_cost numeric(10,2) NOT NULL,
    received_quantity integer DEFAULT 0 NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: purchase_order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchase_order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchase_order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchase_order_items_id_seq OWNED BY public.purchase_order_items.id;


--
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_orders (
    id integer NOT NULL,
    business_id integer NOT NULL,
    supplier_id integer NOT NULL,
    po_number character varying(20),
    status public."PurchaseOrderStatus" DEFAULT 'DRAFT'::public."PurchaseOrderStatus" NOT NULL,
    order_date timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expected_date timestamp(3) without time zone,
    received_date timestamp(3) without time zone,
    subtotal numeric(12,2) DEFAULT 0 NOT NULL,
    tax_amount numeric(12,2) DEFAULT 0 NOT NULL,
    total_amount numeric(12,2) DEFAULT 0 NOT NULL,
    notes text,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp(3) without time zone,
    created_by integer DEFAULT 0 NOT NULL,
    updated_by integer DEFAULT 0 NOT NULL,
    deleted_by integer,
    approved_by integer,
    "userId" integer
);


--
-- Name: purchase_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchase_orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchase_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchase_orders_id_seq OWNED BY public.purchase_orders.id;


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_permissions (
    id integer NOT NULL,
    role_id integer NOT NULL,
    permission_id integer NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: role_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.role_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: role_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.role_permissions_id_seq OWNED BY public.role_permissions.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(50) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: sale_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sale_items (
    id integer NOT NULL,
    sale_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    tax_rate numeric(5,2) DEFAULT 13 NOT NULL,
    tax_amount numeric(10,2) NOT NULL,
    discount_amount numeric(10,2) DEFAULT 0 NOT NULL,
    total_price numeric(10,2) NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: sale_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sale_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sale_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sale_items_id_seq OWNED BY public.sale_items.id;


--
-- Name: sales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales (
    id integer NOT NULL,
    business_id integer NOT NULL,
    cart_id integer NOT NULL,
    user_id integer NOT NULL,
    customer_id integer,
    invoice_number character varying(20) NOT NULL,
    invoice_type public."InvoiceType" DEFAULT 'FACTURA'::public."InvoiceType" NOT NULL,
    authorization_code character varying(50),
    control_code character varying(50),
    status public."SaleStatus" DEFAULT 'COMPLETED'::public."SaleStatus" NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    tax_amount numeric(12,2) NOT NULL,
    discount_amount numeric(12,2) DEFAULT 0 NOT NULL,
    total_amount numeric(12,2) NOT NULL,
    payment_method public."PaymentMethod" NOT NULL,
    payment_status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    notes text,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp(3) without time zone,
    created_by integer DEFAULT 0 NOT NULL,
    updated_by integer DEFAULT 0 NOT NULL,
    deleted_by integer,
    "cashRegisterId" integer
);


--
-- Name: sales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sales_id_seq OWNED BY public.sales.id;


--
-- Name: supplier_debts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.supplier_debts (
    id integer NOT NULL,
    supplier_id integer NOT NULL,
    purchase_order_id integer,
    amount numeric(12,2) NOT NULL,
    paid_amount numeric(12,2) DEFAULT 0 NOT NULL,
    due_date timestamp(3) without time zone NOT NULL,
    is_paid boolean DEFAULT false NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    paid_at timestamp(3) without time zone
);


--
-- Name: supplier_debts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.supplier_debts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: supplier_debts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.supplier_debts_id_seq OWNED BY public.supplier_debts.id;


--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.suppliers (
    id integer NOT NULL,
    business_id integer NOT NULL,
    code character varying(50),
    name character varying(200) NOT NULL,
    document_type public."DocumentType" DEFAULT 'NIT'::public."DocumentType" NOT NULL,
    document_number character varying(20),
    contact_person character varying(100),
    email character varying(100),
    phone character varying(20),
    address text,
    city character varying(50),
    department public."Department" DEFAULT 'LA_PAZ'::public."Department",
    country character varying(50) DEFAULT 'Bolivia'::character varying NOT NULL,
    postal_code character varying(10),
    payment_terms integer DEFAULT 30 NOT NULL,
    credit_limit numeric(12,2),
    current_balance numeric(12,2) DEFAULT 0 NOT NULL,
    status public."SupplierStatus" DEFAULT 'ACTIVE'::public."SupplierStatus" NOT NULL,
    notes text,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp(3) without time zone,
    created_by integer DEFAULT 0 NOT NULL,
    updated_by integer DEFAULT 0 NOT NULL,
    deleted_by integer
);


--
-- Name: suppliers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.suppliers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: suppliers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.suppliers_id_seq OWNED BY public.suppliers.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password_hash character varying(255) NOT NULL,
    phone character varying(20),
    status public."UserStatus" DEFAULT 'PENDING_VERIFICATION'::public."UserStatus" NOT NULL,
    role_id integer NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_login timestamp(6) with time zone
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: audit_cash_registers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_cash_registers ALTER COLUMN id SET DEFAULT nextval('public.audit_cash_registers_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: business_products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_products ALTER COLUMN id SET DEFAULT nextval('public.business_products_id_seq'::regclass);


--
-- Name: businesses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.businesses ALTER COLUMN id SET DEFAULT nextval('public.businesses_id_seq'::regclass);


--
-- Name: cart_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items ALTER COLUMN id SET DEFAULT nextval('public.cart_items_id_seq'::regclass);


--
-- Name: carts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts ALTER COLUMN id SET DEFAULT nextval('public.carts_id_seq'::regclass);


--
-- Name: cash_registers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_registers ALTER COLUMN id SET DEFAULT nextval('public.cash_registers_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: customer_debts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_debts ALTER COLUMN id SET DEFAULT nextval('public.customer_debts_id_seq'::regclass);


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- Name: fiscal_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiscal_settings ALTER COLUMN id SET DEFAULT nextval('public.fiscal_settings_id_seq'::regclass);


--
-- Name: inventory_transactions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_transactions ALTER COLUMN id SET DEFAULT nextval('public.inventory_transactions_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: purchase_order_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items ALTER COLUMN id SET DEFAULT nextval('public.purchase_order_items_id_seq'::regclass);


--
-- Name: purchase_orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders ALTER COLUMN id SET DEFAULT nextval('public.purchase_orders_id_seq'::regclass);


--
-- Name: role_permissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions ALTER COLUMN id SET DEFAULT nextval('public.role_permissions_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: sale_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_items ALTER COLUMN id SET DEFAULT nextval('public.sale_items_id_seq'::regclass);


--
-- Name: sales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales ALTER COLUMN id SET DEFAULT nextval('public.sales_id_seq'::regclass);


--
-- Name: supplier_debts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier_debts ALTER COLUMN id SET DEFAULT nextval('public.supplier_debts_id_seq'::regclass);


--
-- Name: suppliers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers ALTER COLUMN id SET DEFAULT nextval('public.suppliers_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
f4beaabd-02ee-491d-a4de-b2233b5b512f	11606138f875f5ad76c962feeb3419cc2286d18f69a180063af6b643b86c25ef	2026-11-16 15:33:53.817431+00	20261116153000_init_local	\N	\N	2026-11-16 15:33:52.774563+00	1
\.


--
-- Data for Name: audit_cash_registers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_cash_registers (id, cash_register_id, user_id, action, amount, details, created_at) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, business_id, user_id, action, entity, entity_id, old_values, new_values, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: business_products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.business_products (id, business_id, product_id, custom_price, current_stock, reserved_stock, available_stock, last_restock, created_at, updated_at) FROM stdin;
1	1	1	8.50	100	0	100	\N	2026-11-16 15:42:14.824+00	2026-11-16 15:42:14.824+00
2	2	1	9.00	40	0	40	\N	2026-11-16 15:42:14.826+00	2026-11-16 15:42:14.826+00
3	1	2	15.00	25	0	25	\N	2026-11-16 15:42:14.828+00	2026-11-16 15:42:14.828+00
4	2	3	7.00	60	0	60	\N	2026-11-16 15:42:14.83+00	2026-11-16 16:45:45.548+00
\.


--
-- Data for Name: businesses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.businesses (id, name, legal_name, description, nit, business_type, email, phone, address, city, department, country, postal_code, logo_url, website, timezone, currency, default_tax_rate, status, created_at, updated_at, deleted_at, created_by, updated_by, deleted_by) FROM stdin;
1	Empresa A Dev	Empresa A Dev SRL	\N	9000001016	PERSONA_NATURAL	9000001016@dev.local	70000000	Dirección de prueba	La Paz	LA_PAZ	Bolivia	\N	\N	\N	America/La_Paz	BOB	13.00	ACTIVE	2026-11-16 15:42:14.788+00	2026-11-16 15:42:14.788+00	\N	0	0	\N
2	Empresa B Dev	Empresa B Dev SRL	\N	9000002016	PERSONA_NATURAL	9000002016@dev.local	70000000	Dirección de prueba	La Paz	LA_PAZ	Bolivia	\N	\N	\N	America/La_Paz	BOB	13.00	ACTIVE	2026-11-16 15:42:14.791+00	2026-11-16 15:42:14.791+00	\N	0	0	\N
\.


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cart_items (id, cart_id, product_id, quantity, unit_price, tax_rate, tax_amount, total_price, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.carts (id, business_id, user_id, customer_id, status, subtotal, tax_amount, total_amount, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cash_registers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cash_registers (id, business_id, user_id, register_number, opening_amount, closing_amount, current_amount, opening_date, closing_date, status, notes, created_at, updated_at, deleted_at, created_by, updated_by, deleted_by) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, name, description, parent_id, is_active, sort_order, created_at, updated_at, deleted_at, created_by, updated_by, deleted_by) FROM stdin;
2	Cat P1E Temp Emp	temp	\N	t	99	2026-11-16 18:04:12.353+00	2026-11-16 18:04:12.353+00	2026-11-16 18:04:30.733	1	1	1
1	Abarrotes Dev	Categoría seed P1-B	\N	t	1	2026-11-16 15:42:14.81+00	2026-11-16 15:42:14.81+00	\N	0	0	\N
4	P1H Cat Maestro	suite-edit	\N	t	50	2026-11-16 18:26:31.628+00	2026-11-16 18:26:31.643+00	2026-11-16 18:43:35.081	7	7	\N
\.


--
-- Data for Name: customer_debts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_debts (id, customer_id, sale_id, amount, paid_amount, due_date, is_paid, created_at, paid_at) FROM stdin;
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customers (id, business_id, first_name, last_name, document_type, document_number, email, phone, address, city, department, country, postal_code, credit_limit, current_balance, loyalty_points, is_active, created_at, updated_at, deleted_at, created_by, updated_by, deleted_by) FROM stdin;
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employees (id, user_id, business_id, first_name, last_name, "position", department, start_date, end_date, salary, status, gender, birth_date, email, phone, address, emergency_contact, emergency_phone, ci_number, created_at, updated_at, deleted_at, created_by, updated_by, deleted_by) FROM stdin;
1	1	1	Ada	AdminA	Administradora	Operaciones	2024-01-01 00:00:00	\N	\N	ACTIVE	UNSPECIFIED	\N	admin_a@dev.local	70000001	Dev address	\N	\N	CI-ADMIN-A	2026-11-16 15:42:14.798+00	2026-11-16 15:42:14.798+00	\N	0	0	\N
2	2	2	Bruno	AdminB	Administrador	Operaciones	2024-01-01 00:00:00	\N	\N	ACTIVE	UNSPECIFIED	\N	admin_b@dev.local	70000001	Dev address	\N	\N	CI-ADMIN-B	2026-11-16 15:42:14.804+00	2026-11-16 15:42:14.804+00	\N	0	0	\N
3	3	1	Elena	EmpleadaA	Cajera	Operaciones	2024-01-01 00:00:00	\N	\N	ACTIVE	UNSPECIFIED	\N	employee_a@dev.local	70000001	Dev address	\N	\N	CI-EMP-A	2026-11-16 15:42:14.809+00	2026-11-16 15:42:14.809+00	\N	0	0	\N
\.


--
-- Data for Name: fiscal_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fiscal_settings (id, business_id, authorization_number, activity_code, law_number, invoice_series, invoice_start_number, invoice_current_number, invoice_end_number, is_electronic, siat_url, siat_token, siat_environment, created_at, updated_at, deleted_at, created_by, updated_by, deleted_by) FROM stdin;
\.


--
-- Data for Name: inventory_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inventory_transactions (id, business_id, product_id, user_id, transaction_type, quantity, unit_cost, total_cost, reference_id, reference_type, notes, created_at) FROM stdin;
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.permissions (id, code, name, description, module, is_active, created_at) FROM stdin;
2	products.read	Ver productos	\N	products	t	2026-11-16 15:42:14.757+00
1	products.write	Editar productos	\N	products	t	2026-11-16 15:42:14.757+00
4	suppliers.read	Ver proveedores	\N	suppliers	t	2026-11-16 15:42:14.757+00
5	employees.read	Ver empleados	\N	employees	t	2026-11-16 15:42:14.757+00
3	purchase_orders.read	Ver OC	\N	purchase_orders	t	2026-11-16 15:42:14.757+00
10	platform.health	Health de plataforma	\N	platform	t	2026-11-16 18:20:42.998+00
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, category_id, sku, barcode, name, description, brand, model, unit, weight, dimensions, cost_price, selling_price, tax_type, tax_rate, min_stock, max_stock, reorder_point, is_active, status, expiry_date, created_at, updated_at, deleted_at, created_by, updated_by, deleted_by) FROM stdin;
1	1	SKU-SHARED-001	BC-SKU-SHARED-001	Arroz 1kg (compartido)	\N	\N	\N	pcs	\N	\N	5.00	8.00	IVA_13	13.00	5	\N	5	t	ACTIVE	\N	2026-11-16 15:42:14.815+00	2026-11-16 18:04:12.303+00	\N	0	0	\N
2	1	SKU-A-001	BC-SKU-A-001	Aceite Empresa A	\N	\N	\N	pcs	\N	\N	10.00	15.00	IVA_13	13.00	5	\N	5	t	ACTIVE	\N	2026-11-16 15:42:14.818+00	2026-11-16 15:42:14.818+00	\N	0	0	\N
3	1	SKU-B-001	BC-SKU-B-001	Azúcar Empresa B	\N	\N	\N	pcs	\N	\N	4.00	7.00	IVA_13	13.00	5	\N	5	t	ACTIVE	\N	2026-11-16 15:42:14.82+00	2026-11-16 18:04:12.486+00	\N	0	0	\N
4	1	P1H-SKU-001	\N	P1H Producto Maestro Editado	edit	\N	\N	pcs	\N	\N	3.00	5.00	IVA_13	13.00	0	\N	0	f	ACTIVE	\N	2026-11-16 18:26:31.54+00	2026-11-16 18:26:31.56+00	2026-11-16 18:43:35.081	7	7	\N
\.


--
-- Data for Name: purchase_order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.purchase_order_items (id, purchase_order_id, product_id, quantity, unit_cost, received_quantity, created_at) FROM stdin;
\.


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.purchase_orders (id, business_id, supplier_id, po_number, status, order_date, expected_date, received_date, subtotal, tax_amount, total_amount, notes, created_at, updated_at, deleted_at, created_by, updated_by, deleted_by, approved_by, "userId") FROM stdin;
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.role_permissions (id, role_id, permission_id, created_at) FROM stdin;
1	1	2	2026-11-16 15:42:14.773+00
2	1	1	2026-11-16 15:42:14.776+00
3	1	4	2026-11-16 15:42:14.778+00
4	1	3	2026-11-16 15:42:14.78+00
5	1	5	2026-11-16 15:42:14.782+00
6	2	2	2026-11-16 15:42:14.783+00
7	5	10	2026-11-16 18:20:43.017+00
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (id, code, name, description, is_active, created_at, updated_at) FROM stdin;
1	ADMIN	Administrador	Admin de empresa (dev)	t	2026-11-16 15:42:14.736+00	2026-11-16 15:42:14.736+00
2	EMPLOYEE	Empleado	Empleado operativo (dev)	t	2026-11-16 15:42:14.755+00	2026-11-16 15:42:14.755+00
5	PLATFORM_ADMIN	Administrador de plataforma	CODEMEDIIA — sin empresa (dev)	t	2026-11-16 18:20:42.995+00	2026-11-16 18:20:42.995+00
\.


--
-- Data for Name: sale_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sale_items (id, sale_id, product_id, quantity, unit_price, tax_rate, tax_amount, discount_amount, total_price, created_at) FROM stdin;
\.


--
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sales (id, business_id, cart_id, user_id, customer_id, invoice_number, invoice_type, authorization_code, control_code, status, subtotal, tax_amount, discount_amount, total_amount, payment_method, payment_status, notes, created_at, updated_at, deleted_at, created_by, updated_by, deleted_by, "cashRegisterId") FROM stdin;
\.


--
-- Data for Name: supplier_debts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.supplier_debts (id, supplier_id, purchase_order_id, amount, paid_amount, due_date, is_paid, created_at, paid_at) FROM stdin;
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.suppliers (id, business_id, code, name, document_type, document_number, contact_person, email, phone, address, city, department, country, postal_code, payment_terms, credit_limit, current_balance, status, notes, created_at, updated_at, deleted_at, created_by, updated_by, deleted_by) FROM stdin;
1	1	SUP-A-001	Proveedor Solo A	NIT	A-001	\N	\N	\N	\N	La Paz	LA_PAZ	Bolivia	\N	30	\N	0.00	ACTIVE	\N	2026-11-16 15:42:14.833+00	2026-11-16 15:42:14.833+00	\N	0	0	\N
2	2	SUP-B-001	Proveedor Solo B	NIT	B-001	\N	\N	\N	\N	La Paz	LA_PAZ	Bolivia	\N	30	\N	0.00	ACTIVE	\N	2026-11-16 15:42:14.836+00	2026-11-16 15:42:14.836+00	\N	0	0	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, password_hash, phone, status, role_id, created_at, updated_at, last_login) FROM stdin;
1	admin_a	$2b$12$vE8myQAzLHa0iD1dOOjexerXkoZ4/nJLxXD8rkgv99uTxwV3JNt2q	70000001	ACTIVE	1	2026-11-16 15:42:14.792+00	2026-11-16 15:42:14.792+00	\N
2	admin_b	$2b$12$vE8myQAzLHa0iD1dOOjexerXkoZ4/nJLxXD8rkgv99uTxwV3JNt2q	70000001	ACTIVE	1	2026-11-16 15:42:14.801+00	2026-11-16 15:42:14.801+00	\N
3	employee_a	$2b$12$vE8myQAzLHa0iD1dOOjexerXkoZ4/nJLxXD8rkgv99uTxwV3JNt2q	70000001	ACTIVE	2	2026-11-16 15:42:14.805+00	2026-11-16 15:42:14.805+00	\N
7	platform_admin	$2b$12$vE8myQAzLHa0iD1dOOjexerXkoZ4/nJLxXD8rkgv99uTxwV3JNt2q	\N	ACTIVE	5	2026-11-16 18:20:43.049+00	2026-11-16 18:20:43.049+00	\N
\.


--
-- Name: audit_cash_registers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_cash_registers_id_seq', 1, false);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 1, false);


--
-- Name: business_products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.business_products_id_seq', 7, true);


--
-- Name: businesses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.businesses_id_seq', 2, true);


--
-- Name: cart_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cart_items_id_seq', 1, false);


--
-- Name: carts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.carts_id_seq', 1, false);


--
-- Name: cash_registers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cash_registers_id_seq', 1, false);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categories_id_seq', 4, true);


--
-- Name: customer_debts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.customer_debts_id_seq', 1, false);


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.customers_id_seq', 1, false);


--
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.employees_id_seq', 3, true);


--
-- Name: fiscal_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.fiscal_settings_id_seq', 1, false);


--
-- Name: inventory_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.inventory_transactions_id_seq', 1, false);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.permissions_id_seq', 11, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.products_id_seq', 4, true);


--
-- Name: purchase_order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.purchase_order_items_id_seq', 1, false);


--
-- Name: purchase_orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.purchase_orders_id_seq', 1, false);


--
-- Name: role_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.role_permissions_id_seq', 7, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.roles_id_seq', 5, true);


--
-- Name: sale_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sale_items_id_seq', 1, false);


--
-- Name: sales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sales_id_seq', 1, false);


--
-- Name: supplier_debts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.supplier_debts_id_seq', 1, false);


--
-- Name: suppliers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.suppliers_id_seq', 2, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 7, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: audit_cash_registers audit_cash_registers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_cash_registers
    ADD CONSTRAINT audit_cash_registers_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: business_products business_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_products
    ADD CONSTRAINT business_products_pkey PRIMARY KEY (id);


--
-- Name: businesses businesses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_pkey PRIMARY KEY (id);


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (id);


--
-- Name: cash_registers cash_registers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_registers
    ADD CONSTRAINT cash_registers_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: customer_debts customer_debts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_debts
    ADD CONSTRAINT customer_debts_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: fiscal_settings fiscal_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiscal_settings
    ADD CONSTRAINT fiscal_settings_pkey PRIMARY KEY (id);


--
-- Name: inventory_transactions inventory_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: purchase_order_items purchase_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: sale_items sale_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_pkey PRIMARY KEY (id);


--
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- Name: supplier_debts supplier_debts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier_debts
    ADD CONSTRAINT supplier_debts_pkey PRIMARY KEY (id);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_business_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_business_id_idx ON public.audit_logs USING btree (business_id);


--
-- Name: audit_logs_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_created_at_idx ON public.audit_logs USING btree (created_at);


--
-- Name: audit_logs_entity_entity_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_entity_entity_id_idx ON public.audit_logs USING btree (entity, entity_id);


--
-- Name: business_products_business_id_product_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX business_products_business_id_product_id_key ON public.business_products USING btree (business_id, product_id);


--
-- Name: businesses_nit_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX businesses_nit_key ON public.businesses USING btree (nit);


--
-- Name: cart_items_cart_id_product_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX cart_items_cart_id_product_id_key ON public.cart_items USING btree (cart_id, product_id);


--
-- Name: carts_business_id_user_id_status_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX carts_business_id_user_id_status_key ON public.carts USING btree (business_id, user_id, status);


--
-- Name: cash_registers_register_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX cash_registers_register_number_key ON public.cash_registers USING btree (register_number);


--
-- Name: categories_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX categories_name_key ON public.categories USING btree (name);


--
-- Name: employees_business_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX employees_business_id_idx ON public.employees USING btree (business_id);


--
-- Name: employees_ci_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX employees_ci_number_key ON public.employees USING btree (ci_number);


--
-- Name: employees_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX employees_email_key ON public.employees USING btree (email);


--
-- Name: employees_first_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX employees_first_name_idx ON public.employees USING btree (first_name);


--
-- Name: employees_last_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX employees_last_name_idx ON public.employees USING btree (last_name);


--
-- Name: employees_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX employees_status_idx ON public.employees USING btree (status);


--
-- Name: employees_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX employees_user_id_idx ON public.employees USING btree (user_id);


--
-- Name: employees_user_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX employees_user_id_key ON public.employees USING btree (user_id);


--
-- Name: fiscal_settings_authorization_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX fiscal_settings_authorization_number_key ON public.fiscal_settings USING btree (authorization_number);


--
-- Name: fiscal_settings_business_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX fiscal_settings_business_id_key ON public.fiscal_settings USING btree (business_id);


--
-- Name: inventory_transactions_business_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inventory_transactions_business_id_idx ON public.inventory_transactions USING btree (business_id);


--
-- Name: inventory_transactions_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inventory_transactions_created_at_idx ON public.inventory_transactions USING btree (created_at);


--
-- Name: inventory_transactions_product_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inventory_transactions_product_id_idx ON public.inventory_transactions USING btree (product_id);


--
-- Name: inventory_transactions_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inventory_transactions_user_id_idx ON public.inventory_transactions USING btree (user_id);


--
-- Name: permissions_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX permissions_code_key ON public.permissions USING btree (code);


--
-- Name: products_barcode_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX products_barcode_key ON public.products USING btree (barcode);


--
-- Name: products_sku_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX products_sku_key ON public.products USING btree (sku);


--
-- Name: purchase_orders_po_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX purchase_orders_po_number_key ON public.purchase_orders USING btree (po_number);


--
-- Name: role_permissions_role_id_permission_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX role_permissions_role_id_permission_id_key ON public.role_permissions USING btree (role_id, permission_id);


--
-- Name: roles_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX roles_code_key ON public.roles USING btree (code);


--
-- Name: sales_cart_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX sales_cart_id_key ON public.sales USING btree (cart_id);


--
-- Name: sales_invoice_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX sales_invoice_number_key ON public.sales USING btree (invoice_number);


--
-- Name: suppliers_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX suppliers_code_key ON public.suppliers USING btree (code);


--
-- Name: users_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_created_at_idx ON public.users USING btree (created_at);


--
-- Name: users_role_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_role_id_idx ON public.users USING btree (role_id);


--
-- Name: users_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_status_idx ON public.users USING btree (status);


--
-- Name: users_username_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_username_idx ON public.users USING btree (username);


--
-- Name: users_username_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);


--
-- Name: audit_cash_registers audit_cash_registers_cash_register_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_cash_registers
    ADD CONSTRAINT audit_cash_registers_cash_register_id_fkey FOREIGN KEY (cash_register_id) REFERENCES public.cash_registers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: audit_cash_registers audit_cash_registers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_cash_registers
    ADD CONSTRAINT audit_cash_registers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: audit_logs audit_logs_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: business_products business_products_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_products
    ADD CONSTRAINT business_products_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: business_products business_products_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_products
    ADD CONSTRAINT business_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: cart_items cart_items_cart_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.carts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cart_items cart_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: carts carts_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: carts carts_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: carts carts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: cash_registers cash_registers_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_registers
    ADD CONSTRAINT cash_registers_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cash_registers cash_registers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_registers
    ADD CONSTRAINT cash_registers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: customer_debts customer_debts_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_debts
    ADD CONSTRAINT customer_debts_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customer_debts customer_debts_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_debts
    ADD CONSTRAINT customer_debts_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: customers customers_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: employees employees_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: employees employees_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: fiscal_settings fiscal_settings_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fiscal_settings
    ADD CONSTRAINT fiscal_settings_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inventory_transactions inventory_transactions_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inventory_transactions inventory_transactions_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: inventory_transactions inventory_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: purchase_order_items purchase_order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: purchase_order_items purchase_order_items_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchase_orders purchase_orders_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchase_orders purchase_orders_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: purchase_orders purchase_orders_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT "purchase_orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sale_items sale_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sale_items sale_items_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sales sales_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sales sales_cart_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.carts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sales sales_cashRegisterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT "sales_cashRegisterId_fkey" FOREIGN KEY ("cashRegisterId") REFERENCES public.cash_registers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sales sales_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sales sales_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: supplier_debts supplier_debts_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier_debts
    ADD CONSTRAINT supplier_debts_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: supplier_debts supplier_debts_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier_debts
    ADD CONSTRAINT supplier_debts_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: suppliers suppliers_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict ITiQN8QcZrXWl0mTJucSg4heC0fXK0R99FpYYYdL0KO0fSBzVpuks46wbJv2doJ

