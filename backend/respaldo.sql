--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: update_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_timestamp() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_cash_registers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_cash_registers (
    id integer NOT NULL,
    cash_register_id integer NOT NULL,
    action character varying(50) NOT NULL,
    action_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_id integer NOT NULL,
    details text
);


ALTER TABLE public.audit_cash_registers OWNER TO postgres;

--
-- Name: audit_cash_registers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_cash_registers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_cash_registers_id_seq OWNER TO postgres;

--
-- Name: audit_cash_registers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_cash_registers_id_seq OWNED BY public.audit_cash_registers.id;


--
-- Name: business; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.business (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    address text,
    tax_id character varying(50) NOT NULL,
    business_type_id integer NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.business OWNER TO postgres;

--
-- Name: business_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.business_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.business_id_seq OWNER TO postgres;

--
-- Name: business_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.business_id_seq OWNED BY public.business.id;


--
-- Name: business_org_chart; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.business_org_chart (
    id integer NOT NULL,
    business_id integer NOT NULL,
    user_id integer NOT NULL,
    "position" character varying(100) NOT NULL,
    parent_position_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.business_org_chart OWNER TO postgres;

--
-- Name: business_org_chart_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.business_org_chart ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.business_org_chart_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: business_products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.business_products (
    id integer NOT NULL,
    business_id integer NOT NULL,
    product_id integer NOT NULL,
    custom_price numeric(10,2),
    actual_stock integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.business_products OWNER TO postgres;

--
-- Name: business_products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.business_products ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.business_products_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: business_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.business_types (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.business_types OWNER TO postgres;

--
-- Name: business_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.business_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.business_types_id_seq OWNER TO postgres;

--
-- Name: business_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.business_types_id_seq OWNED BY public.business_types.id;


--
-- Name: business_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.business_users (
    id integer NOT NULL,
    user_id integer NOT NULL,
    business_id integer NOT NULL,
    business_role_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    CONSTRAINT business_users_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[])))
);


ALTER TABLE public.business_users OWNER TO postgres;

--
-- Name: business_users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.business_users ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.business_users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: businesses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.businesses (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    address text,
    tax_id character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    CONSTRAINT businesses_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[])))
);


ALTER TABLE public.businesses OWNER TO postgres;

--
-- Name: businesses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.businesses ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.businesses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: cart; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart (
    id integer NOT NULL,
    customer_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.cart OWNER TO postgres;

--
-- Name: cart_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cart_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cart_id_seq OWNER TO postgres;

--
-- Name: cart_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cart_id_seq OWNED BY public.cart.id;


--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_items (
    id integer NOT NULL,
    cart_id integer,
    product_id integer,
    quantity integer NOT NULL,
    price_at_time numeric(10,2) NOT NULL
);


ALTER TABLE public.cart_items OWNER TO postgres;

--
-- Name: cart_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cart_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cart_items_id_seq OWNER TO postgres;

--
-- Name: cart_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cart_items_id_seq OWNED BY public.cart_items.id;


--
-- Name: cash_registers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cash_registers (
    id integer NOT NULL,
    user_id integer,
    opening_amount numeric(10,2) NOT NULL,
    closing_amount numeric(10,2) NOT NULL,
    opening_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    closing_date timestamp with time zone,
    notes text,
    status character varying(20) DEFAULT 'abierta'::character varying NOT NULL,
    CONSTRAINT cash_registers_status_check CHECK (((status)::text = ANY ((ARRAY['abierta'::character varying, 'cerrada'::character varying, 'pendiente'::character varying])::text[])))
);


ALTER TABLE public.cash_registers OWNER TO postgres;

--
-- Name: cash_registers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cash_registers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cash_registers_id_seq OWNER TO postgres;

--
-- Name: cash_registers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cash_registers_id_seq OWNED BY public.cash_registers.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: consignment_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consignment_items (
    id integer NOT NULL,
    consignment_id integer,
    product_id integer,
    quantity_delivered integer NOT NULL,
    quantity_sold integer DEFAULT 0 NOT NULL,
    price_at_time numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    quantity_sent integer DEFAULT 0 NOT NULL,
    quantity_returned integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.consignment_items OWNER TO postgres;

--
-- Name: consignment_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.consignment_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.consignment_items_id_seq OWNER TO postgres;

--
-- Name: consignment_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.consignment_items_id_seq OWNED BY public.consignment_items.id;


--
-- Name: consignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consignments (
    id integer NOT NULL,
    supplier_id integer,
    start_date date NOT NULL,
    end_date date NOT NULL,
    total_value numeric(10,2) NOT NULL,
    sold_value numeric(10,2) DEFAULT 0.00 NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_id integer NOT NULL,
    CONSTRAINT consignments_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'pending'::character varying, 'completed'::character varying, 'settled'::character varying])::text[])))
);


ALTER TABLE public.consignments OWNER TO postgres;

--
-- Name: consignments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.consignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.consignments_id_seq OWNER TO postgres;

--
-- Name: consignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.consignments_id_seq OWNED BY public.consignments.id;


--
-- Name: credits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.credits (
    id integer NOT NULL,
    customer_id integer,
    balance numeric(10,2) DEFAULT 0.00 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    credit_limit numeric(10,0),
    status character varying(30)
);


ALTER TABLE public.credits OWNER TO postgres;

--
-- Name: credits_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.credits_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.credits_id_seq OWNER TO postgres;

--
-- Name: credits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.credits_id_seq OWNED BY public.credits.id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    address text,
    phone character varying(20),
    company_name character varying(100),
    tax_id character varying(20),
    email character varying(100),
    status character varying(10),
    credit_balance numeric(10,2) DEFAULT 0,
    CONSTRAINT customers_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[])))
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customers_id_seq OWNER TO postgres;

--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: debt_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.debt_payments (
    id integer NOT NULL,
    debt_id integer,
    amount numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.debt_payments OWNER TO postgres;

--
-- Name: debt_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.debt_payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.debt_payments_id_seq OWNER TO postgres;

--
-- Name: debt_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.debt_payments_id_seq OWNED BY public.debt_payments.id;


--
-- Name: kardex; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kardex (
    id integer NOT NULL,
    product_id integer NOT NULL,
    movement_type character varying(50) NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2),
    movement_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    reference_id integer,
    reference_type character varying(50),
    stock_after integer NOT NULL,
    CONSTRAINT kardex_movement_type_check CHECK (((movement_type)::text = ANY ((ARRAY['entry'::character varying, 'exit'::character varying])::text[]))),
    CONSTRAINT kardex_quantity_check CHECK ((quantity >= 0)),
    CONSTRAINT kardex_stock_after_check CHECK ((stock_after >= 0))
);


ALTER TABLE public.kardex OWNER TO postgres;

--
-- Name: kardex_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.kardex_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.kardex_id_seq OWNER TO postgres;

--
-- Name: kardex_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.kardex_id_seq OWNED BY public.kardex.id;


--
-- Name: mermas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mermas (
    id integer NOT NULL,
    product_id integer,
    quantity integer NOT NULL,
    type character varying(20) NOT NULL,
    date date NOT NULL,
    value numeric(10,2) NOT NULL,
    responsible_id integer,
    observations text,
    is_automated boolean DEFAULT false,
    kardex_id integer,
    CONSTRAINT mermas_type_check CHECK (((type)::text = ANY ((ARRAY['vendido'::character varying, 'da├▒ado'::character varying, 'perdido'::character varying, 'vencido'::character varying])::text[])))
);


ALTER TABLE public.mermas OWNER TO postgres;

--
-- Name: mermas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mermas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mermas_id_seq OWNER TO postgres;

--
-- Name: mermas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mermas_id_seq OWNED BY public.mermas.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    supplier_id integer,
    name character varying(100) NOT NULL,
    price numeric(10,2) NOT NULL,
    description text,
    purchase_price numeric(10,2) DEFAULT 0.00,
    sale_price numeric(10,2) DEFAULT 0.00,
    sku character varying(50),
    barcode character varying(50),
    brand character varying(50),
    unit character varying(20),
    min_stock integer DEFAULT 0 NOT NULL,
    max_stock integer DEFAULT 0,
    actual_stock integer DEFAULT 0 NOT NULL,
    expiration_date date,
    image text,
    category_id integer,
    status character varying(10),
    shelf_life_days integer,
    is_organic boolean DEFAULT false NOT NULL,
    alert_sent boolean DEFAULT false
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: purchase_order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_order_items (
    id integer NOT NULL,
    purchase_order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    CONSTRAINT purchase_order_items_quantity_check CHECK ((quantity > 0)),
    CONSTRAINT purchase_order_items_unit_price_check CHECK ((unit_price >= (0)::numeric))
);


ALTER TABLE public.purchase_order_items OWNER TO postgres;

--
-- Name: purchase_order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.purchase_order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.purchase_order_items_id_seq OWNER TO postgres;

--
-- Name: purchase_order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.purchase_order_items_id_seq OWNED BY public.purchase_order_items.id;


--
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_orders (
    id integer NOT NULL,
    product_id integer,
    supplier_id integer,
    quantity integer NOT NULL,
    order_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'pending'::character varying,
    payment_type character varying(20) DEFAULT 'cash'::character varying,
    total_amount numeric(10,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.purchase_orders OWNER TO postgres;

--
-- Name: purchase_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.purchase_orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.purchase_orders_id_seq OWNER TO postgres;

--
-- Name: purchase_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.purchase_orders_id_seq OWNED BY public.purchase_orders.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    description text,
    parent_role_id integer
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: supplier_debts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.supplier_debts (
    id integer NOT NULL,
    supplier_id integer,
    amount numeric(10,2) NOT NULL,
    remaining_amount numeric(10,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_id integer
);


ALTER TABLE public.supplier_debts OWNER TO postgres;

--
-- Name: supplier_debts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.supplier_debts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.supplier_debts_id_seq OWNER TO postgres;

--
-- Name: supplier_debts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.supplier_debts_id_seq OWNED BY public.supplier_debts.id;


--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suppliers (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    contact character varying(100),
    phone character varying(20),
    email character varying(100),
    company_name character varying(100) DEFAULT ''::character varying NOT NULL,
    tax_id character varying(20),
    address text,
    supplier_type character varying(50),
    status character varying(20) DEFAULT 'active'::character varying,
    CONSTRAINT check_status CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[])))
);


ALTER TABLE public.suppliers OWNER TO postgres;

--
-- Name: suppliers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.suppliers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.suppliers_id_seq OWNER TO postgres;

--
-- Name: suppliers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.suppliers_id_seq OWNED BY public.suppliers.id;


--
-- Name: transaction_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transaction_items (
    id integer NOT NULL,
    transaction_id integer,
    product_id integer,
    quantity integer NOT NULL,
    price_at_sale numeric NOT NULL
);


ALTER TABLE public.transaction_items OWNER TO postgres;

--
-- Name: transaction_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transaction_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transaction_items_id_seq OWNER TO postgres;

--
-- Name: transaction_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transaction_items_id_seq OWNED BY public.transaction_items.id;


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id integer NOT NULL,
    customer_id integer NOT NULL,
    user_id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    type character varying(10) NOT NULL,
    reference character varying(250),
    created_at timestamp without time zone DEFAULT now(),
    notes text,
    cart_id integer,
    CONSTRAINT transactions_type_check CHECK (((type)::text = ANY ((ARRAY['cash'::character varying, 'credit'::character varying])::text[])))
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transactions_id_seq OWNER TO postgres;

--
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    email character varying(100) NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    address character varying(255),
    mobile_phone character varying(20),
    role_id integer NOT NULL,
    parent_user_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'active'::character varying
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: audit_cash_registers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_cash_registers ALTER COLUMN id SET DEFAULT nextval('public.audit_cash_registers_id_seq'::regclass);


--
-- Name: business id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business ALTER COLUMN id SET DEFAULT nextval('public.business_id_seq'::regclass);


--
-- Name: business_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_types ALTER COLUMN id SET DEFAULT nextval('public.business_types_id_seq'::regclass);


--
-- Name: cart id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart ALTER COLUMN id SET DEFAULT nextval('public.cart_id_seq'::regclass);


--
-- Name: cart_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items ALTER COLUMN id SET DEFAULT nextval('public.cart_items_id_seq'::regclass);


--
-- Name: cash_registers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cash_registers ALTER COLUMN id SET DEFAULT nextval('public.cash_registers_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: consignment_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consignment_items ALTER COLUMN id SET DEFAULT nextval('public.consignment_items_id_seq'::regclass);


--
-- Name: consignments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consignments ALTER COLUMN id SET DEFAULT nextval('public.consignments_id_seq'::regclass);


--
-- Name: credits id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credits ALTER COLUMN id SET DEFAULT nextval('public.credits_id_seq'::regclass);


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: debt_payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.debt_payments ALTER COLUMN id SET DEFAULT nextval('public.debt_payments_id_seq'::regclass);


--
-- Name: kardex id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kardex ALTER COLUMN id SET DEFAULT nextval('public.kardex_id_seq'::regclass);


--
-- Name: mermas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mermas ALTER COLUMN id SET DEFAULT nextval('public.mermas_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: purchase_order_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items ALTER COLUMN id SET DEFAULT nextval('public.purchase_order_items_id_seq'::regclass);


--
-- Name: purchase_orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders ALTER COLUMN id SET DEFAULT nextval('public.purchase_orders_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: supplier_debts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_debts ALTER COLUMN id SET DEFAULT nextval('public.supplier_debts_id_seq'::regclass);


--
-- Name: suppliers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers ALTER COLUMN id SET DEFAULT nextval('public.suppliers_id_seq'::regclass);


--
-- Name: transaction_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction_items ALTER COLUMN id SET DEFAULT nextval('public.transaction_items_id_seq'::regclass);


--
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: audit_cash_registers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_cash_registers (id, cash_register_id, action, action_date, user_id, details) FROM stdin;
1	1	apertura	2025-03-11 19:35:49.196046	1	Caja abierta con monto inicial: 100
2	1	cierre_normal	2025-03-11 19:45:59.017217	1	Caja cerrada con monto final: 150.5
3	2	apertura	2025-03-11 19:51:31.072598	1	Caja abierta con monto inicial: 1000
4	2	cierre_pendiente	2025-03-11 19:51:37.401204	1	Cierre inesperado detectado
5	2	auditoria	2025-03-11 19:58:44.530792	1	Caja pendiente cerrada tras auditor├¡a. Monto final: 145.75
\.


--
-- Data for Name: business; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.business (id, name, description, address, tax_id, business_type_id, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: business_org_chart; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.business_org_chart (id, business_id, user_id, "position", parent_position_id, created_at) FROM stdin;
\.


--
-- Data for Name: business_products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.business_products (id, business_id, product_id, custom_price, actual_stock, created_at) FROM stdin;
\.


--
-- Data for Name: business_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.business_types (id, name) FROM stdin;
1	minisuper
2	libreria
3	farmacia
4	restaurante
\.


--
-- Data for Name: business_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.business_users (id, user_id, business_id, business_role_id, created_at, status) FROM stdin;
\.


--
-- Data for Name: businesses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.businesses (id, name, description, address, tax_id, created_at, updated_at, status) FROM stdin;
\.


--
-- Data for Name: cart; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart (id, customer_id, created_at) FROM stdin;
2	9	2025-03-06 09:56:33.53242
3	3	2025-03-06 11:21:48.655757
4	15	2025-03-06 11:46:56.581719
5	13	2025-03-17 15:48:18.489511
\.


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_items (id, cart_id, product_id, quantity, price_at_time) FROM stdin;
7	2	10	2	202.25
8	2	1	1	524.34
9	2	16	3	800.50
\.


--
-- Data for Name: cash_registers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cash_registers (id, user_id, opening_amount, closing_amount, opening_date, closing_date, notes, status) FROM stdin;
1	1	100.00	150.50	2025-03-11 19:35:49.196046-04	2025-03-11 19:45:59.017217-04	Cierre de turno	cerrada
2	1	1000.00	145.75	2025-03-11 19:51:31.072598-04	2025-03-11 19:58:44.530792-04	Auditor├¡a tras cierre inesperado	cerrada
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, description, is_active) FROM stdin;
2	Hogar	\N	t
3	Ropa	\N	t
4	Alimentos	\N	t
5	Juguetes	\N	t
6	Herramientas	\N	t
8	Licores	Bebidas con alcohol	t
1	Electr├│nicos	Art├│iculos para el hogar	f
\.


--
-- Data for Name: consignment_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consignment_items (id, consignment_id, product_id, quantity_delivered, quantity_sold, price_at_time, created_at, quantity_sent, quantity_returned) FROM stdin;
4	7	2	5	10	226.21	2025-03-05 22:55:00.545333	5	-5
3	7	1	10	5	524.34	2025-03-05 22:55:00.543244	10	5
\.


--
-- Data for Name: consignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consignments (id, supplier_id, start_date, end_date, total_value, sold_value, status, created_at, updated_at, user_id) FROM stdin;
3	4	2025-03-06	2025-04-05	6374.45	0.00	active	2025-03-05 22:38:29.326843	2025-03-05 22:38:29.326843	4
4	4	2025-03-06	2025-04-05	6374.45	0.00	active	2025-03-05 22:46:22.007769	2025-03-05 22:46:22.007769	4
5	4	2025-03-06	2025-04-05	6374.45	0.00	active	2025-03-05 22:50:54.355849	2025-03-05 22:50:54.355849	4
6	4	2025-03-06	2025-04-05	6374.45	0.00	active	2025-03-05 22:52:48.807724	2025-03-05 22:52:48.807724	4
7	4	2025-03-06	2025-04-05	6374.45	0.00	settled	2025-03-05 22:55:00.541413	2025-03-05 23:43:49.206106	4
\.


--
-- Data for Name: credits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.credits (id, customer_id, balance, created_at, updated_at, credit_limit, status) FROM stdin;
1	25	0.00	2025-03-01 19:14:24.484605	2025-03-02 10:59:37.815644	0	frozen
2	26	0.00	2025-03-03 16:21:09.924383	2025-03-03 16:21:09.924383	0	active
3	27	0.00	2025-03-05 10:16:27.447659	2025-03-05 10:16:27.447659	1000	active
4	1	1500.00	2025-03-05 10:18:47.257002	2025-03-05 10:18:47.257002	\N	active
5	28	0.00	2025-03-05 10:21:02.481493	2025-03-05 10:21:02.481493	\N	active
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, first_name, last_name, address, phone, company_name, tax_id, email, status, credit_balance) FROM stdin;
1	Bertram	Nolan	6367 Larkin Plaza	913.568.6141 x92296	Fadel - Pollich	TAX9170154	Owen10@gmail.com	active	0.00
5	Karlee	Wehner	3975 Gulgowski Expre	336-723-0373 x86371	Ebert and Sons	TAX6246638	Clarabelle18@hotmail	active	0.00
6	Noemy	Douglas	72409 Noble Knolls	1-347-728-7903	Predovic LLC	TAX7911431	Noble88@gmail.com	active	0.00
7	Eunice	Collier	44752 Elm Street	461.512.1911 x6633	Romaguera, Heaney an	TAX5581889	Aliya.Rutherford@hot	active	0.00
8	Dejon	Feil-Kessler	4618 Stanley Street	(958) 866-1411 x786	Leffler, Zulauf and 	TAX9094257	Casper_Ward13@hotmai	active	0.00
9	Michale	Wilkinson	5366 Karina Shoal	(308) 373-0465 x067	Borer, O'Connell and	TAX3628174	Abby_Schulist@yahoo.	active	0.00
10	Corene	Simonis	601 The Mews	358-456-4865 x733	Hand LLC	TAX6731005	Forest_Pacocha37@gma	active	0.00
11	Esta	Parker-Macejkovic	352 Kimberly Straven	509-917-1610 x5606	Miller - Ryan	TAX5666679	Jimmy.Mayer2@hotmail	active	0.00
12	Angelica	Prohaska	3037 Ruthie Route	(614) 840-6688 x8036	Kovacek Group	TAX8792131	Sanford.Strosin38@ho	active	0.00
13	Ellis	Parker	587 Fadel Lock	962.782.6574 x76842	Romaguera Inc	TAX2943237	Gerhard_Grimes@hotma	active	0.00
14	Pasquale	Von	488 Ivy Ranch	(331) 229-8809 x202	Beatty, Kessler and 	TAX5676086	Noelia67@hotmail.com	active	0.00
15	Bobby	Moen	973 The Paddocks	802-325-6992	Stokes - Hahn	TAX6417796	Alden.Olson-Feest72@	active	0.00
16	Delfina	Braun	529 Church Lane	709-941-9736 x9805	Daniel, Gulgowski an	TAX6384324	Hershel60@yahoo.com	active	0.00
17	Darby	Heller	856 Morissette Hills	938-473-5096 x1520	Balistreri, Senger a	TAX1242333	Donato49@hotmail.com	active	0.00
18	Janae	Bayer	835 Chester Road	293.697.4016	Cassin - Sporer	TAX2565851	Kristin54@gmail.com	active	0.00
19	Merle	Tremblay	202 Bashirian Statio	1-568-344-8740 x1282	Torp, Kohler and Lan	TAX7872638	Audrey57@yahoo.com	active	0.00
20	Jennyfer	Haley	795 Jarret Club	344-999-3461 x6816	Thiel, Ankunding and	TAX9046201	Rosanna94@hotmail.co	active	0.00
21	Juan	P├®rez	Las Canicas 654, Tja	65217445	n/a	6512247	jperez@algo.com	active	0.00
25	Juan Nicanor	P├®rez Compang	Las Canicas 654, Tja	85217445	n/a	TAX6512247	jperezCompang@algo.com	inactive	0.00
26	Franz	S├ínchez	123 Calle Principal	123456789	\N	\N	PanchoSancho@ejemplo.com	active	0.00
3	Kaleb	Steuber	81509 Raphaelle Cove	484-316-9525 x4081	Wiegand - Satterfiel	TAX6664071	Nico.Hoppe19@yahoo.c	inactive	0.00
27	John	Doe	\N	+1234567890	Doe Corp	ABC123	john.doe@example.com	active	0.00
28	Jane	Smith	\N	\N	\N	\N	jane.smith@example.com	active	0.00
4	Henderson	Nolan	83176 Russel Mountai	(489) 494-0789 x6015	Kemmer Group	TAX8919425	Makenna98@gmail.com	inactive	0.00
2	Juan	P├®rez	Avenida Siempre Viva 456	591-5678	Supermercado JCP	tax654321	juancarlos.perez.gomez@example.com	active	0.00
\.


--
-- Data for Name: debt_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.debt_payments (id, debt_id, amount, created_at) FROM stdin;
1	3	50.00	2025-03-05 22:02:22.649871
\.


--
-- Data for Name: kardex; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kardex (id, product_id, movement_type, quantity, unit_price, movement_date, reference_id, reference_type, stock_after) FROM stdin;
1	1	entry	10	5.00	2025-03-07 18:33:24.639999	1	purchase_order	42
2	1	entry	10	5.00	2025-03-07 18:36:13.369378	1	purchase_order	52
3	1	exit	5	\N	2025-03-07 18:37:21.676102	2	transaction	47
4	1	entry	1000	5.00	2025-03-07 18:48:43.59079	1	purchase_order	1047
5	2	entry	1000	5.00	2025-03-07 18:49:01.208492	1	purchase_order	1156
6	34	entry	5	1100.00	2025-03-07 22:16:35.353915	2	purchase_order	5
7	1	entry	20	4.75	2025-03-07 23:08:15.608272	15	purchase_order	1067
8	2	entry	15	3.50	2025-03-07 23:08:15.608272	15	purchase_order	1171
9	1	entry	10	5.70	2025-03-07 23:08:47.745121	16	purchase_order	1077
10	2	entry	15	3.50	2025-03-07 23:08:47.745121	16	purchase_order	1186
11	1	entry	25	3.70	2025-03-07 23:09:03.070459	17	purchase_order	1102
12	2	entry	15	3.50	2025-03-07 23:09:03.070459	17	purchase_order	1201
14	8	exit	42	98.61	2025-03-24 18:41:37.881966	42	merma	0
\.


--
-- Data for Name: mermas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mermas (id, product_id, quantity, type, date, value, responsible_id, observations, is_automated, kardex_id) FROM stdin;
2	23	1	da├▒ado	2025-02-04	481.63	2	Voluptates versus pa	f	\N
3	20	4	da├▒ado	2025-01-13	246.28	5	Deleo vergo pariatur	f	\N
4	26	5	perdido	2025-01-25	168.98	2	Admoneo admoveo abso	f	\N
5	30	6	da├▒ado	2025-02-20	341.02	3	Strenuus cogo deprec	f	\N
6	27	9	perdido	2025-02-10	227.06	1	Avarus super capio.	f	\N
7	24	4	perdido	2025-01-06	395.92	1	Velociter vetus depo	f	\N
8	17	3	vendido	2025-01-23	81.21	5	Derideo amplitudo ta	f	\N
9	23	1	vendido	2025-01-15	273.76	1	Aequitas angelus abs	f	\N
10	1	10	da├▒ado	2025-01-15	428.24	4	Autus acer suus alte	f	\N
11	12	8	perdido	2025-01-18	350.09	1	Tolero commodo venia	f	\N
12	13	10	da├▒ado	2025-01-17	374.90	2	Clam defetiscor crus	f	\N
13	22	3	da├▒ado	2025-01-22	314.18	5	Earum collum venusta	f	\N
14	25	4	da├▒ado	2025-02-04	264.37	1	Vinco uterque tergiv	f	\N
15	8	4	da├▒ado	2025-02-18	308.01	3	Caveo casso patior s	f	\N
16	1	3	da├▒ado	2025-03-08	524.34	1	Tasty Bronze Compute da├▒ada durante transporte	f	\N
42	8	42	vencido	2025-03-24	4141.62	\N	Producto vencido autom├íticamente (fecha: Wed Mar 19 2025 00:00:00 GMT-0400 (hora de Bolivia))	t	14
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, supplier_id, name, price, description, purchase_price, sale_price, sku, barcode, brand, unit, min_stock, max_stock, actual_stock, expiration_date, image, category_id, status, shelf_life_days, is_organic, alert_sent) FROM stdin;
5	1	Gorgeous Marble Glov	446.81	Introducing the Tong	347.87	967.69	YTFSiKUayI	6697494596458	Altenwerth - Ullrich	litros	18	91	50	2025-12-06	https://picsum.photo	4	\N	\N	f	f
6	2	Small Silk Pizza	282.33	Stylish Pizza design	392.65	889.88	aN5qKJHDuQ	8195451886590	Mitchell, Bergnaum a	unidades	14	89	55	2025-09-30	https://loremflickr.	6	\N	\N	f	f
9	1	Small Concrete Shoes	149.44	Featuring Berkelium-	152.65	459.34	Eo8e9odik6	8803933424583	Wolff - Stokes	unidades	19	177	17	2026-01-21	https://picsum.photo	2	\N	\N	f	f
11	7	Incredible Ceramic B	732.14	Featuring Lanthanum-	70.14	587.97	cC6rbdqIXD	1647687053687	Rolfson Inc	kg	14	180	199	2025-08-27	https://picsum.photo	2	\N	\N	f	f
12	2	Rustic Bamboo Chicke	331.64	Discover the negligi	449.60	115.59	tRO69vfOTg	8621485920285	Ebert and Sons	litros	20	56	186	2025-08-25	https://loremflickr.	3	\N	\N	f	f
13	2	Fresh Aluminum Towel	713.35	The Grass-roots real	335.04	827.27	pnHAPp8gmx	7558335542361	Yundt, Stoltenberg a	kg	8	83	46	2025-11-25	https://loremflickr.	3	\N	\N	f	f
14	7	Licensed Concrete Sa	298.22	Stylish Soap designe	493.28	847.96	R7AaUJAloa	0412594665449	Hilpert, Feil and Wy	kg	17	143	69	2025-08-19	https://picsum.photo	6	\N	\N	f	f
17	6	Gorgeous Rubber Fish	927.32	Featuring Silicon-en	417.57	89.38	vB3o4Q4Wom	5258849791001	Hayes, Lubowitz and 	litros	7	143	122	2025-08-18	https://loremflickr.	2	\N	\N	f	f
18	10	Bespoke Ceramic Shoe	935.83	Discover the butterf	243.14	604.39	ctwzCnTpWf	4504054379568	Kreiger Inc	litros	8	77	69	2026-02-01	https://loremflickr.	2	\N	\N	f	f
19	9	Luxurious Rubber Glo	871.85	The Myrtice Fish is 	364.03	48.42	LmJP3CNFpj	2990698609907	Kub, Anderson and Ka	kg	5	100	174	2025-12-27	https://picsum.photo	4	\N	\N	f	f
20	5	Handmade Gold Bike	158.92	The teal Sausages co	403.62	37.73	LJRKK92uEv	1668237666576	Farrell - Mohr	unidades	5	109	192	2025-05-14	https://picsum.photo	4	\N	\N	f	f
21	6	Luxurious Concrete B	713.84	The purple Towels co	425.55	932.22	ouGd3xOub5	8631566151168	McKenzie, Armstrong 	kg	7	198	82	2026-02-12	https://loremflickr.	4	\N	\N	f	f
22	1	Rustic Wooden Chicke	479.11	Discover the worthwh	73.66	58.49	4q8Dv3unz6	1832743558221	Upton - Cremin	kg	15	143	185	2026-02-18	https://picsum.photo	5	\N	\N	f	f
24	8	Small Metal Pizza	305.77	Innovative Chicken f	352.88	950.90	pZ5pNzykeB	8957795367577	Schumm Inc	kg	10	99	42	2026-01-27	https://loremflickr.	5	\N	\N	f	f
26	7	Rustic Concrete Fish	790.15	The sleek and old-fa	296.52	406.28	mqyVcHqHdE	0143666296849	Dare - Effertz	unidades	14	127	188	2025-04-13	https://picsum.photo	1	\N	\N	f	f
27	8	Practical Cotton Bac	236.01	Professional-grade C	375.11	106.90	fFC6fD5BD9	0601063848257	Jacobson - McKenzie	litros	5	184	191	2025-11-28	https://picsum.photo	5	\N	\N	f	f
28	1	Unbranded Gold Car	988.82	New cyan Car with er	138.16	417.70	jFSo0UsYV0	7349391221730	Dickens - Fadel	kg	11	149	162	2025-09-19	https://picsum.photo	3	\N	\N	f	f
29	6	Recycled Gold Salad	95.54	The indigo Computer 	52.18	882.46	CRc4NA1fDo	4627718188956	Schuppe Group	unidades	9	55	134	2026-02-11	https://picsum.photo	5	\N	\N	f	f
30	6	Unbranded Rubber Chi	151.03	Featuring Polonium-e	393.53	81.07	wUhUGUE34W	5989391288227	Howe, D'Amore and Wi	unidades	13	75	180	2025-12-30	https://loremflickr.	4	\N	\N	f	f
35	5	Queso Azul La Granja	1500.50	Queso de primera	900.00	1300.00	QUE-BLU-667	123456789045	La Granja	piece	5	50	0	2025-12-31	http://example.com/laptop.jpg	2	\N	\N	f	f
31	1	Laptop Dell XPS 13	1200.50	Laptop de alto rendimiento	900.00	1300.00	LAP-DELL-XPS13	123456789012	Dell	piece	5	50	10	2025-12-31	http://example.com/laptop.jpg	2	\N	\N	f	f
25	3	Calzones	12.50	Especiales para el fr├¡o	110.00	1500.00	CAL-ZONS-XPS13	123456789012aa	Pil Tja	piece	5	50	10	2025-12-31	http://example.com/laptop.jpg	2	\N	\N	f	f
4	6	Gorgeous Metal Pizza	105.45	New violet Computer 	280.49	686.42	TNonFUeVk2	6959040415393	Streich, Franecki an	unidades	7	131	111	2025-11-29	https://loremflickr.	3	\N	\N	f	f
23	7	Recycled Cotton Hat	557.68	Discover the monkey-	110.90	659.86	SFJ7Y8Rzmx	0373161637156	Walter - Zemlak	litros	18	140	10	2026-01-22	https://loremflickr.	1	\N	\N	f	f
10	5	Ergonomic Granite Fi	202.25	Savor the savory ess	232.15	917.47	JmSe8XusqI	2241170264417	Lesch - Kuphal	kg	8	199	2	2025-11-11	https://picsum.photo	4	\N	\N	f	f
16	10	Incredible Bronze To	800.50	Discover the grippin	123.42	287.57	44mQ6McIX3	1395612725423	Hirthe, Mosciski and	kg	18	189	55	2025-08-31	https://picsum.photo	6	\N	\N	f	f
33	3	Laptop ASUS XYZ	999.99	\N	0.00	0.00	\N	\N	\N	\N	5	0	10	\N	\N	1	\N	\N	f	f
34	3	Lavadsora GEn	999.99	\N	0.00	0.00	\N	\N	\N	\N	5	0	5	\N	\N	1	\N	\N	f	f
15	3	Practical Aluminum C	83.24	New Chicken model wi	418.32	48.16	737aOcmX0g	1479714360390	Weimann - Hayes	litros	12	161	38	2025-09-27	https://picsum.photo	1	\N	\N	f	f
1	1	Tasty Bronze Compute	524.34	New purple Gloves wi	44.67	847.74	l6C2SsUzZC	8502175284994	Rowe - Price	unidades	11	105	0	2025-07-22	https://loremflickr.	3	\N	\N	f	t
2	10	Refined Aluminum Tab	226.21	Ergonomic Gloves mad	275.89	497.60	h0VNSnJJbR	0110261145463	Christiansen, Von an	unidades	20	126	1201	2025-11-21	https://picsum.photo	2	inactive	\N	f	f
7	7	Ergonomic Cotton Bal	803.94	Featuring Mercury-en	103.72	322.12	Er3PaO8Od1	8822706519416	Swaniawski and Sons	unidades	19	80	187	2025-10-07	https://picsum.photo	3	\N	\N	f	f
38	3	Plancha liviana	247.00	\N	\N	\N	\N	\N	\N	\N	5	\N	7	\N	\N	1	\N	\N	f	f
8	10	Unbranded Silk Fish	747.91	Stylish Hat designed	247.77	98.61	VR9Pg4uw0n	8457420226243	Hessel - VonRueden	kg	6	94	0	2025-03-19	https://picsum.photo	1	\N	\N	f	f
3	6	Soft Plastic Compute	779.51	Professional-grade G	410.99	751.71	86LpiCydeD	5248850814970	Kemmer - Padberg	unidades	12	184	110	2025-06-02	https://loremflickr.	4	\N	\N	f	f
\.


--
-- Data for Name: purchase_order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_order_items (id, purchase_order_id, product_id, quantity, unit_price) FROM stdin;
1	15	1	20	4.75
2	15	2	15	3.50
3	16	1	10	5.70
4	16	2	15	3.50
5	17	1	25	3.70
6	17	2	15	3.50
\.


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_orders (id, product_id, supplier_id, quantity, order_date, status, payment_type, total_amount, created_at) FROM stdin;
2	9	1	21	2025-03-06 16:38:37.642731	pending	cash	3138.24	2025-03-07 22:41:50.150373
4	10	5	11	2025-03-06 16:38:37.644998	pending	cash	2224.75	2025-03-07 22:41:50.150373
5	1	1	15	2025-03-06 16:43:47.822969	pending	credit	7865.10	2025-03-07 22:41:50.150373
6	1	1	15	2025-03-06 16:48:31.289504	pending	credit	7865.10	2025-03-07 22:41:50.150373
7	1	1	15	2025-03-06 16:48:44.381815	pending	cash	\N	2025-03-07 22:41:50.150373
8	2	10	15	2025-03-06 16:50:12.528223	pending	cash	\N	2025-03-07 22:41:50.150373
9	9	1	21	2025-03-06 17:46:46.608905	pending	cash	3138.24	2025-03-07 22:41:50.150373
10	23	7	26	2025-03-06 17:46:46.61048	pending	cash	14499.68	2025-03-07 22:41:50.150373
11	10	5	11	2025-03-06 17:46:46.611108	pending	cash	2224.75	2025-03-07 22:41:50.150373
12	34	3	10	2025-03-06 17:46:46.611648	pending	cash	9999.90	2025-03-07 22:41:50.150373
13	34	10	15	2025-03-06 17:47:57.299374	pending	cash	\N	2025-03-07 22:41:50.150373
3	1	1	20	2025-03-06 16:38:37.644307	completed	consignment	10486.80	2025-03-07 22:41:50.150373
15	\N	1	35	2025-03-07 23:08:15.608272	pending	cash	\N	2025-03-07 23:08:15.608272
16	\N	1	25	2025-03-07 23:08:47.745121	pending	cash	\N	2025-03-07 23:08:47.745121
17	\N	1	40	2025-03-07 23:09:03.070459	pending	cash	\N	2025-03-07 23:09:03.070459
18	1	1	105	2025-03-10 22:10:01.913338	pending	cash	4690.35	2025-03-10 22:10:01.913338
19	9	1	21	2025-03-17 16:49:12.600793	pending	cash	3138.24	2025-03-17 16:49:12.600793
20	35	5	10	2025-03-17 16:49:12.613379	pending	cash	15005.00	2025-03-17 16:49:12.613379
21	23	7	26	2025-03-17 16:49:12.614226	pending	cash	14499.68	2025-03-17 16:49:12.614226
22	10	5	14	2025-03-17 16:49:12.615595	pending	cash	2831.50	2025-03-17 16:49:12.615595
23	1	1	22	2025-03-17 16:49:12.616149	pending	cash	11535.48	2025-03-17 16:49:12.616149
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, description, parent_role_id) FROM stdin;
1	superuser	Superusuario - Sistema en Servidor de Internet (A)	\N
2	system_admin	Sistema en Servidor de Internet (B)	1
3	client_supermarket_1	Cliente Supermercado 1 (C)	2
4	client_supermarket_2	Cliente Supermercado 2 (D)	2
5	branch_1_supermarket_1	Sucursal 1 de Supermercado 1 (E)	3
6	branch_2_supermarket_1	Sucursal 2 de Supermercado 1 (F)	3
7	branch_1_supermarket_2	Sucursal 1 de Supermercado 2 (G)	4
8	branch_2_supermarket_2	Sucursal 2 de Supermercado 2 (H)	4
\.


--
-- Data for Name: supplier_debts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.supplier_debts (id, supplier_id, amount, remaining_amount, created_at, updated_at, user_id) FROM stdin;
4	1	275.89	275.89	2025-03-05 21:51:31.957464	2025-03-05 21:51:31.957464	2
3	1	50.50	100.50	2025-03-05 21:49:56.513634	2025-03-05 22:02:22.652334	2
5	4	10127.20	\N	2025-03-05 23:10:06.392481	2025-03-05 23:10:06.392481	4
6	4	10127.20	\N	2025-03-05 23:36:00.011687	2025-03-05 23:36:00.011687	4
7	4	4883.80	\N	2025-03-05 23:43:49.204815	2025-03-05 23:43:49.204815	4
8	1	7865.10	\N	2025-03-06 16:48:44.384383	2025-03-06 16:48:44.384383	\N
9	10	3393.15	\N	2025-03-06 16:50:12.53238	2025-03-06 16:50:12.53238	\N
10	10	14999.85	\N	2025-03-06 17:47:57.30106	2025-03-06 17:47:57.30106	\N
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suppliers (id, name, contact, phone, email, company_name, tax_id, address, supplier_type, status) FROM stdin;
1	Generic Supplier	Default Contact	000-0000000	generic@supplier.com	Generic Corp	GENERIC123	123 Generic St	supplier	active
2	Murazik - Connelly	Ada Stark	1-791-361-3003 x001	Brenden_Stiedemann@h	Raynor, McClure and 	TAX8581371	146 Mill Close	clothing	active
3	Effertz, Metz and Em	Marie Legros	325.863.6905	Dayna26@hotmail.com	Langosh, Kunze and H	TAX4146983	8247 Elena Ways	misc	active
4	Rutherford LLC	Mrs. Debra Runolfsdo	405.946.0490 x9565	Citlalli_Von@gmail.c	Koelpin - Harber	TAX5150404	990 Poplar Close	misc	active
5	Rowe, Trantow and Ho	Sue Vandervort	1-819-866-3660 x6567	Morris_Kutch72@hotma	Hills Inc	TAX1647750	826 Considine Roads	misc	active
6	McDermott, Schumm an	Dr. Emmett Crooks	890-591-1530 x88403	Myles_Kassulke@hotma	Grady Group	TAX8291614	9151 W Church Street	misc	active
8	Bailey, Romaguera an	Freda Flatley	405-952-6096 x50110	Anastasia74@yahoo.co	Schulist LLC	TAX6800004	7817 Purdy Port	clothing	active
9	Nader, Rath and Abbo	Luis Jast	387-799-3050 x57138	Bessie8@hotmail.com	Flatley, Osinski and	TAX5234756	917 Moen Hills	food	active
10	Sauer and Sons	Maria Emard	604.496.2993 x7129	Vincenzo.Kessler@hot	Steuber - McDermott	TAX3389686	38604 Hahn Run	food	active
11	Rolando Flores	Julia Redondo	54 214 365 12	rolito@algo.com	Roadster SRL	TAX11	Calle Siemprevivas 69, Cochabamba	Vinos, licores y cedrvezas	active
7	Boyle, Carter and Bo	Wendell Boyer	54 123 456 78	greengoes@algo.com	Hermann, Funk and Ho	TAX2896263	4386 N Jackson Stree	food	inactive
12	Juan Carlos Salazar	Julia Redondo	54 625 554 35	nepo@algo.com	El Salchich├│n feliz	TAX19	Calle de la Nostalgia 44	Fiambres y quesos	active
\.


--
-- Data for Name: transaction_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transaction_items (id, transaction_id, product_id, quantity, price_at_sale) FROM stdin;
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transactions (id, customer_id, user_id, amount, type, reference, created_at, notes, cart_id) FROM stdin;
11	9	1	22605.79	cash	Checkout cart 2	2025-03-06 11:19:52.597148	\N	\N
12	13	2	2962.54	cash	Checkout cart 5	2025-03-17 15:55:16.457546	\N	\N
13	1	1	7517.10	cash	\N	2025-03-24 22:48:18.430732	\N	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password, email, first_name, last_name, address, mobile_phone, role_id, parent_user_id, created_at, status) FROM stdin;
2	Rolando.Skiles34	$2b$10$eM.gN6Ka/jpiLOYwkz/iD..TOy2KRG9XDQSF6mmEKIRe3.nr51KW2	Shemar.Schroeder@yah	John	Nicolas	90586 Hermiston Pine	1-212-312-2943	3	\N	2025-02-28 10:51:58.230779	active
4	Katrine_Franey78	$2b$10$eM.gN6Ka/jpiLOYwkz/iD..TOy2KRG9XDQSF6mmEKIRe3.nr51KW2	Clare47@hotmail.com	Rosina	Cronin	31618 N Franklin Str	(330) 391-3558 x057	3	\N	2025-02-28 10:51:58.230779	active
9	Danilo	$2b$10$eM.gN6Ka/jpiLOYwkz/iD..TOy2KRG9XDQSF6mmEKIRe3.nr51KW2	qiuntadan@algo.com	Dany	Quintana	Avda Las Pelotas 999	591 62 754285	3	\N	2025-03-05 20:56:36.117573	active
5	usuario_actualizado	$2b$10$eM.gN6Ka/jpiLOYwkz/iD..TOy2KRG9XDQSF6mmEKIRe3.nr51KW2	actualizado@example.com	Juan Carlos	P├®rez G├│mez	Avenida 456	555-5678	2	\N	2025-02-28 10:51:58.230779	active
10	ricky21	$2b$10$eM.gN6Ka/jpiLOYwkz/iD..TOy2KRG9XDQSF6mmEKIRe3.nr51KW2	qricky@algo.com	Ricardo	Umacata	Avda Las Pelotas 999	591 62 754285	2	\N	2025-03-07 10:38:12.957845	active
1	condorito	$2b$10$eM.gN6Ka/jpiLOYwkz/iD..TOy2KRG9XDQSF6mmEKIRe3.nr51KW2	otro_mail@ejemplo.com	Bill	Bogisich	4792 Heller Glens	123456789	1	\N	2025-02-28 10:51:58.230779	inactive
3	Darby_Leuschke3	$2b$10$eM.gN6Ka/jpiLOYwkz/iD..TOy2KRG9XDQSF6mmEKIRe3.nr51KW2	panchito@gmail.com	Weldon	McDermott	3729 Schaefer Mounta	856-251-2555 x064	1	\N	2025-02-28 10:51:58.230779	active
12	elCobra	$2b$10$3V5hX1gyiWC.0sSaFUCv3.XpbJ4sDIu6psTXTasrtgWJkt/wWqgt6	elCobra@algo.com	Victor	Velasque	Calle del Pecado N┬║ 69	591 71 178 966	2	\N	2025-03-09 19:57:14.260415	active
13	asuncion	$2b$10$//28tj6wv8OAbUyaJegcse.wQFdhQDQZhNl4HjJZYFjdLlxji//cS	asuncion@gmail.com	Mar├¡a Soledad	Panzafr├¡a Caba	Las Pelotas N┬║ 69	591 63 744 587	2	\N	2025-03-17 09:32:58.09728	active
11	marymar	$2b$10$vmMdNOcSvnZA49Bm6kqA4eOWleeEujtjgrVgcaUFyHSntrODWGCpu	marymar@algo.com	Maria	Mercedes	Avda Las Caanicas 999	591 62 951368	2	\N	2025-03-07 10:43:01.438424	inactive
\.


--
-- Name: audit_cash_registers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_cash_registers_id_seq', 5, true);


--
-- Name: business_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.business_id_seq', 1, false);


--
-- Name: business_org_chart_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.business_org_chart_id_seq', 1, false);


--
-- Name: business_products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.business_products_id_seq', 1, false);


--
-- Name: business_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.business_types_id_seq', 4, true);


--
-- Name: business_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.business_users_id_seq', 1, false);


--
-- Name: businesses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.businesses_id_seq', 1, false);


--
-- Name: cart_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cart_id_seq', 5, true);


--
-- Name: cart_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cart_items_id_seq', 12, true);


--
-- Name: cash_registers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cash_registers_id_seq', 2, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 8, true);


--
-- Name: consignment_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.consignment_items_id_seq', 4, true);


--
-- Name: consignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.consignments_id_seq', 7, true);


--
-- Name: credits_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.credits_id_seq', 5, true);


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customers_id_seq', 28, true);


--
-- Name: debt_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.debt_payments_id_seq', 1, true);


--
-- Name: kardex_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.kardex_id_seq', 14, true);


--
-- Name: mermas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mermas_id_seq', 42, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 38, true);


--
-- Name: purchase_order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.purchase_order_items_id_seq', 6, true);


--
-- Name: purchase_orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.purchase_orders_id_seq', 23, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 1, false);


--
-- Name: supplier_debts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.supplier_debts_id_seq', 10, true);


--
-- Name: suppliers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.suppliers_id_seq', 12, true);


--
-- Name: transaction_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transaction_items_id_seq', 1, false);


--
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transactions_id_seq', 13, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 13, true);


--
-- Name: audit_cash_registers audit_cash_registers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_cash_registers
    ADD CONSTRAINT audit_cash_registers_pkey PRIMARY KEY (id);


--
-- Name: business_org_chart business_org_chart_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_org_chart
    ADD CONSTRAINT business_org_chart_pkey PRIMARY KEY (id);


--
-- Name: business business_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business
    ADD CONSTRAINT business_pkey PRIMARY KEY (id);


--
-- Name: business_products business_products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_products
    ADD CONSTRAINT business_products_pkey PRIMARY KEY (id);


--
-- Name: business_products business_products_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_products
    ADD CONSTRAINT business_products_unique UNIQUE (business_id, product_id);


--
-- Name: business_types business_types_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_types
    ADD CONSTRAINT business_types_name_key UNIQUE (name);


--
-- Name: business_types business_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_types
    ADD CONSTRAINT business_types_pkey PRIMARY KEY (id);


--
-- Name: business_users business_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_users
    ADD CONSTRAINT business_users_pkey PRIMARY KEY (id);


--
-- Name: business_users business_users_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_users
    ADD CONSTRAINT business_users_unique UNIQUE (user_id, business_id);


--
-- Name: businesses businesses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_pkey PRIMARY KEY (id);


--
-- Name: businesses businesses_tax_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_tax_id_key UNIQUE (tax_id);


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: cart cart_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_pkey PRIMARY KEY (id);


--
-- Name: cash_registers cash_registers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cash_registers
    ADD CONSTRAINT cash_registers_pkey PRIMARY KEY (id);


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: consignment_items consignment_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consignment_items
    ADD CONSTRAINT consignment_items_pkey PRIMARY KEY (id);


--
-- Name: consignments consignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consignments
    ADD CONSTRAINT consignments_pkey PRIMARY KEY (id);


--
-- Name: credits credits_customer_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credits
    ADD CONSTRAINT credits_customer_id_key UNIQUE (customer_id);


--
-- Name: credits credits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credits
    ADD CONSTRAINT credits_pkey PRIMARY KEY (id);


--
-- Name: customers customers_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_email_key UNIQUE (email);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: customers customers_tax_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_tax_id_key UNIQUE (tax_id);


--
-- Name: debt_payments debt_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.debt_payments
    ADD CONSTRAINT debt_payments_pkey PRIMARY KEY (id);


--
-- Name: kardex kardex_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kardex
    ADD CONSTRAINT kardex_pkey PRIMARY KEY (id);


--
-- Name: mermas mermas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mermas
    ADD CONSTRAINT mermas_pkey PRIMARY KEY (id);


--
-- Name: products products_barcode_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_barcode_key UNIQUE (barcode);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: purchase_order_items purchase_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: supplier_debts supplier_debts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_debts
    ADD CONSTRAINT supplier_debts_pkey PRIMARY KEY (id);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: suppliers suppliers_tax_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_tax_id_key UNIQUE (tax_id);


--
-- Name: transaction_items transaction_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction_items
    ADD CONSTRAINT transaction_items_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: businesses update_businesses_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_businesses_timestamp BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: consignments update_consignments_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_consignments_timestamp BEFORE UPDATE ON public.consignments FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: credits update_credits_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_credits_timestamp BEFORE UPDATE ON public.credits FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: supplier_debts update_supplier_debts_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_supplier_debts_timestamp BEFORE UPDATE ON public.supplier_debts FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: audit_cash_registers audit_cash_registers_cash_register_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_cash_registers
    ADD CONSTRAINT audit_cash_registers_cash_register_id_fkey FOREIGN KEY (cash_register_id) REFERENCES public.cash_registers(id);


--
-- Name: audit_cash_registers audit_cash_registers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_cash_registers
    ADD CONSTRAINT audit_cash_registers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: business business_business_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business
    ADD CONSTRAINT business_business_type_id_fkey FOREIGN KEY (business_type_id) REFERENCES public.business_types(id);


--
-- Name: business_org_chart business_org_chart_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_org_chart
    ADD CONSTRAINT business_org_chart_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE;


--
-- Name: business_org_chart business_org_chart_parent_position_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_org_chart
    ADD CONSTRAINT business_org_chart_parent_position_id_fkey FOREIGN KEY (parent_position_id) REFERENCES public.business_org_chart(id) ON DELETE SET NULL;


--
-- Name: business_org_chart business_org_chart_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_org_chart
    ADD CONSTRAINT business_org_chart_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: business_products business_products_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_products
    ADD CONSTRAINT business_products_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE;


--
-- Name: business_products business_products_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_products
    ADD CONSTRAINT business_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: business_users business_users_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_users
    ADD CONSTRAINT business_users_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE;


--
-- Name: business_users business_users_business_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_users
    ADD CONSTRAINT business_users_business_role_id_fkey FOREIGN KEY (business_role_id) REFERENCES public.roles(id);


--
-- Name: business_users business_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_users
    ADD CONSTRAINT business_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: cart cart_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: cart_items cart_items_cart_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.cart(id);


--
-- Name: cart_items cart_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: cash_registers cash_registers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cash_registers
    ADD CONSTRAINT cash_registers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: consignment_items consignment_items_consignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consignment_items
    ADD CONSTRAINT consignment_items_consignment_id_fkey FOREIGN KEY (consignment_id) REFERENCES public.consignments(id);


--
-- Name: consignment_items consignment_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consignment_items
    ADD CONSTRAINT consignment_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: consignments consignments_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consignments
    ADD CONSTRAINT consignments_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- Name: consignments consignments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consignments
    ADD CONSTRAINT consignments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: credits credits_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credits
    ADD CONSTRAINT credits_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: debt_payments debt_payments_debt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.debt_payments
    ADD CONSTRAINT debt_payments_debt_id_fkey FOREIGN KEY (debt_id) REFERENCES public.supplier_debts(id);


--
-- Name: kardex kardex_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kardex
    ADD CONSTRAINT kardex_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: mermas mermas_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mermas
    ADD CONSTRAINT mermas_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: products products_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- Name: purchase_order_items purchase_order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- Name: purchase_order_items purchase_order_items_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE;


--
-- Name: purchase_orders purchase_orders_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: purchase_orders purchase_orders_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- Name: supplier_debts supplier_debts_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_debts
    ADD CONSTRAINT supplier_debts_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- Name: supplier_debts supplier_debts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_debts
    ADD CONSTRAINT supplier_debts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: transaction_items transaction_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction_items
    ADD CONSTRAINT transaction_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: transaction_items transaction_items_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction_items
    ADD CONSTRAINT transaction_items_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id);


--
-- Name: transactions transactions_carrt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_carrt_id_fkey FOREIGN KEY (cart_id) REFERENCES public.cart(id);


--
-- Name: transactions transactions_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: transactions transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- PostgreSQL database dump complete
--

