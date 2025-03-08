--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.1

-- Started on 2025-03-08 09:47:33

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 224 (class 1259 OID 77636)
-- Name: cart; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart (
    id integer NOT NULL,
    customer_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.cart OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 77635)
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
-- TOC entry 5033 (class 0 OID 0)
-- Dependencies: 223
-- Name: cart_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cart_id_seq OWNED BY public.cart.id;


--
-- TOC entry 226 (class 1259 OID 77649)
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
-- TOC entry 225 (class 1259 OID 77648)
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
-- TOC entry 5034 (class 0 OID 0)
-- Dependencies: 225
-- Name: cart_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cart_items_id_seq OWNED BY public.cart_items.id;


--
-- TOC entry 228 (class 1259 OID 86005)
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    description text
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 86004)
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
-- TOC entry 5035 (class 0 OID 0)
-- Dependencies: 227
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- TOC entry 242 (class 1259 OID 102232)
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
-- TOC entry 241 (class 1259 OID 102231)
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
-- TOC entry 5036 (class 0 OID 0)
-- Dependencies: 241
-- Name: consignment_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.consignment_items_id_seq OWNED BY public.consignment_items.id;


--
-- TOC entry 240 (class 1259 OID 102215)
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
-- TOC entry 239 (class 1259 OID 102214)
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
-- TOC entry 5037 (class 0 OID 0)
-- Dependencies: 239
-- Name: consignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.consignments_id_seq OWNED BY public.consignments.id;


--
-- TOC entry 234 (class 1259 OID 102169)
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
-- TOC entry 233 (class 1259 OID 102168)
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
-- TOC entry 5038 (class 0 OID 0)
-- Dependencies: 233
-- Name: credits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.credits_id_seq OWNED BY public.credits.id;


--
-- TOC entry 218 (class 1259 OID 77603)
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
-- TOC entry 217 (class 1259 OID 77602)
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
-- TOC entry 5039 (class 0 OID 0)
-- Dependencies: 217
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- TOC entry 238 (class 1259 OID 102202)
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
-- TOC entry 237 (class 1259 OID 102201)
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
-- TOC entry 5040 (class 0 OID 0)
-- Dependencies: 237
-- Name: debt_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.debt_payments_id_seq OWNED BY public.debt_payments.id;


--
-- TOC entry 250 (class 1259 OID 118979)
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
-- TOC entry 249 (class 1259 OID 118978)
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
-- TOC entry 5041 (class 0 OID 0)
-- Dependencies: 249
-- Name: kardex_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.kardex_id_seq OWNED BY public.kardex.id;


--
-- TOC entry 232 (class 1259 OID 86697)
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
    CONSTRAINT mermas_type_check CHECK (((type)::text = ANY ((ARRAY['vendido'::character varying, 'dañado'::character varying, 'perdido'::character varying])::text[])))
);


ALTER TABLE public.mermas OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 86696)
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
-- TOC entry 5042 (class 0 OID 0)
-- Dependencies: 231
-- Name: mermas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mermas_id_seq OWNED BY public.mermas.id;


--
-- TOC entry 222 (class 1259 OID 77624)
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    supplier_id integer,
    name character varying(100) NOT NULL,
    price numeric(10,2) NOT NULL,
    description text,
    purchase_price numeric(10,2) DEFAULT 0.00 NOT NULL,
    sale_price numeric(10,2) DEFAULT 0.00 NOT NULL,
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
    status character varying(10)
);


ALTER TABLE public.products OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 77623)
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
-- TOC entry 5043 (class 0 OID 0)
-- Dependencies: 221
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- TOC entry 252 (class 1259 OID 118995)
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
-- TOC entry 251 (class 1259 OID 118994)
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
-- TOC entry 5044 (class 0 OID 0)
-- Dependencies: 251
-- Name: purchase_order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.purchase_order_items_id_seq OWNED BY public.purchase_order_items.id;


--
-- TOC entry 230 (class 1259 OID 86494)
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
-- TOC entry 229 (class 1259 OID 86493)
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
-- TOC entry 5045 (class 0 OID 0)
-- Dependencies: 229
-- Name: purchase_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.purchase_orders_id_seq OWNED BY public.purchase_orders.id;


--
-- TOC entry 244 (class 1259 OID 102256)
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
-- TOC entry 243 (class 1259 OID 102255)
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
-- TOC entry 5046 (class 0 OID 0)
-- Dependencies: 243
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- TOC entry 236 (class 1259 OID 102188)
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
-- TOC entry 235 (class 1259 OID 102187)
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
-- TOC entry 5047 (class 0 OID 0)
-- Dependencies: 235
-- Name: supplier_debts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.supplier_debts_id_seq OWNED BY public.supplier_debts.id;


--
-- TOC entry 220 (class 1259 OID 77617)
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
-- TOC entry 219 (class 1259 OID 77616)
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
-- TOC entry 5048 (class 0 OID 0)
-- Dependencies: 219
-- Name: suppliers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.suppliers_id_seq OWNED BY public.suppliers.id;


--
-- TOC entry 248 (class 1259 OID 102571)
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
    CONSTRAINT transactions_type_check CHECK (((type)::text = ANY ((ARRAY['cash'::character varying, 'credit'::character varying])::text[])))
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 102570)
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
-- TOC entry 5049 (class 0 OID 0)
-- Dependencies: 247
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- TOC entry 246 (class 1259 OID 102272)
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
-- TOC entry 245 (class 1259 OID 102271)
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
-- TOC entry 5050 (class 0 OID 0)
-- Dependencies: 245
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4720 (class 2604 OID 77639)
-- Name: cart id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart ALTER COLUMN id SET DEFAULT nextval('public.cart_id_seq'::regclass);


--
-- TOC entry 4722 (class 2604 OID 77652)
-- Name: cart_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items ALTER COLUMN id SET DEFAULT nextval('public.cart_items_id_seq'::regclass);


--
-- TOC entry 4723 (class 2604 OID 86008)
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- TOC entry 4744 (class 2604 OID 102235)
-- Name: consignment_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consignment_items ALTER COLUMN id SET DEFAULT nextval('public.consignment_items_id_seq'::regclass);


--
-- TOC entry 4739 (class 2604 OID 102218)
-- Name: consignments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consignments ALTER COLUMN id SET DEFAULT nextval('public.consignments_id_seq'::regclass);


--
-- TOC entry 4730 (class 2604 OID 102172)
-- Name: credits id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credits ALTER COLUMN id SET DEFAULT nextval('public.credits_id_seq'::regclass);


--
-- TOC entry 4709 (class 2604 OID 77606)
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- TOC entry 4737 (class 2604 OID 102205)
-- Name: debt_payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.debt_payments ALTER COLUMN id SET DEFAULT nextval('public.debt_payments_id_seq'::regclass);


--
-- TOC entry 4755 (class 2604 OID 118982)
-- Name: kardex id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kardex ALTER COLUMN id SET DEFAULT nextval('public.kardex_id_seq'::regclass);


--
-- TOC entry 4729 (class 2604 OID 86700)
-- Name: mermas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mermas ALTER COLUMN id SET DEFAULT nextval('public.mermas_id_seq'::regclass);


--
-- TOC entry 4714 (class 2604 OID 77627)
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- TOC entry 4757 (class 2604 OID 118998)
-- Name: purchase_order_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items ALTER COLUMN id SET DEFAULT nextval('public.purchase_order_items_id_seq'::regclass);


--
-- TOC entry 4724 (class 2604 OID 86497)
-- Name: purchase_orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders ALTER COLUMN id SET DEFAULT nextval('public.purchase_orders_id_seq'::regclass);


--
-- TOC entry 4749 (class 2604 OID 102259)
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- TOC entry 4734 (class 2604 OID 102191)
-- Name: supplier_debts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_debts ALTER COLUMN id SET DEFAULT nextval('public.supplier_debts_id_seq'::regclass);


--
-- TOC entry 4711 (class 2604 OID 77620)
-- Name: suppliers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers ALTER COLUMN id SET DEFAULT nextval('public.suppliers_id_seq'::regclass);


--
-- TOC entry 4753 (class 2604 OID 102574)
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- TOC entry 4750 (class 2604 OID 102275)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4999 (class 0 OID 77636)
-- Dependencies: 224
-- Data for Name: cart; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart (id, customer_id, created_at) FROM stdin;
2	9	2025-03-06 09:56:33.53242
3	3	2025-03-06 11:21:48.655757
4	15	2025-03-06 11:46:56.581719
\.


--
-- TOC entry 5001 (class 0 OID 77649)
-- Dependencies: 226
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_items (id, cart_id, product_id, quantity, price_at_time) FROM stdin;
7	2	10	2	202.25
8	2	1	1	524.34
9	2	16	3	800.50
\.


--
-- TOC entry 5003 (class 0 OID 86005)
-- Dependencies: 228
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, description) FROM stdin;
1	Electrónicos	\N
2	Hogar	\N
3	Ropa	\N
4	Alimentos	\N
5	Juguetes	\N
6	Herramientas	\N
\.


--
-- TOC entry 5017 (class 0 OID 102232)
-- Dependencies: 242
-- Data for Name: consignment_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consignment_items (id, consignment_id, product_id, quantity_delivered, quantity_sold, price_at_time, created_at, quantity_sent, quantity_returned) FROM stdin;
4	7	2	5	10	226.21	2025-03-05 22:55:00.545333	5	-5
3	7	1	10	5	524.34	2025-03-05 22:55:00.543244	10	5
\.


--
-- TOC entry 5015 (class 0 OID 102215)
-- Dependencies: 240
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
-- TOC entry 5009 (class 0 OID 102169)
-- Dependencies: 234
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
-- TOC entry 4993 (class 0 OID 77603)
-- Dependencies: 218
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
21	Juan	Pérez	Las Canicas 654, Tja	65217445	n/a	6512247	jperez@algo.com	active	0.00
25	Juan Nicanor	Pérez Compang	Las Canicas 654, Tja	85217445	n/a	TAX6512247	jperezCompang@algo.com	inactive	0.00
26	Franz	Sánchez	123 Calle Principal	123456789	\N	\N	PanchoSancho@ejemplo.com	active	0.00
3	Kaleb	Steuber	81509 Raphaelle Cove	484-316-9525 x4081	Wiegand - Satterfiel	TAX6664071	Nico.Hoppe19@yahoo.c	inactive	0.00
27	John	Doe	\N	+1234567890	Doe Corp	ABC123	john.doe@example.com	active	0.00
28	Jane	Smith	\N	\N	\N	\N	jane.smith@example.com	active	0.00
4	Henderson	Nolan	83176 Russel Mountai	(489) 494-0789 x6015	Kemmer Group	TAX8919425	Makenna98@gmail.com	inactive	0.00
2	Juan	Pérez	Avenida Siempre Viva 456	591-5678	Supermercado JCP	tax654321	juancarlos.perez.gomez@example.com	active	0.00
\.


--
-- TOC entry 5013 (class 0 OID 102202)
-- Dependencies: 238
-- Data for Name: debt_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.debt_payments (id, debt_id, amount, created_at) FROM stdin;
1	3	50.00	2025-03-05 22:02:22.649871
\.


--
-- TOC entry 5025 (class 0 OID 118979)
-- Dependencies: 250
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
\.


--
-- TOC entry 5007 (class 0 OID 86697)
-- Dependencies: 232
-- Data for Name: mermas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mermas (id, product_id, quantity, type, date, value, responsible_id, observations) FROM stdin;
1	9	7	perdido	2025-01-30	427.81	5	Supplanto caries vul
2	23	1	dañado	2025-02-04	481.63	2	Voluptates versus pa
3	20	4	dañado	2025-01-13	246.28	5	Deleo vergo pariatur
4	26	5	perdido	2025-01-25	168.98	2	Admoneo admoveo abso
5	30	6	dañado	2025-02-20	341.02	3	Strenuus cogo deprec
6	27	9	perdido	2025-02-10	227.06	1	Avarus super capio.
7	24	4	perdido	2025-01-06	395.92	1	Velociter vetus depo
8	17	3	vendido	2025-01-23	81.21	5	Derideo amplitudo ta
9	23	1	vendido	2025-01-15	273.76	1	Aequitas angelus abs
10	1	10	dañado	2025-01-15	428.24	4	Autus acer suus alte
11	12	8	perdido	2025-01-18	350.09	1	Tolero commodo venia
12	13	10	dañado	2025-01-17	374.90	2	Clam defetiscor crus
13	22	3	dañado	2025-01-22	314.18	5	Earum collum venusta
14	25	4	dañado	2025-02-04	264.37	1	Vinco uterque tergiv
15	8	4	dañado	2025-02-18	308.01	3	Caveo casso patior s
\.


--
-- TOC entry 4997 (class 0 OID 77624)
-- Dependencies: 222
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, supplier_id, name, price, description, purchase_price, sale_price, sku, barcode, brand, unit, min_stock, max_stock, actual_stock, expiration_date, image, category_id, status) FROM stdin;
5	1	Gorgeous Marble Glov	446.81	Introducing the Tong	347.87	967.69	YTFSiKUayI	6697494596458	Altenwerth - Ullrich	litros	18	91	50	2025-12-06	https://picsum.photo	4	\N
6	2	Small Silk Pizza	282.33	Stylish Pizza design	392.65	889.88	aN5qKJHDuQ	8195451886590	Mitchell, Bergnaum a	unidades	14	89	55	2025-09-30	https://loremflickr.	6	\N
7	7	Ergonomic Cotton Bal	803.94	Featuring Mercury-en	103.72	322.12	Er3PaO8Od1	8822706519416	Swaniawski and Sons	unidades	19	80	189	2025-10-07	https://picsum.photo	3	\N
8	10	Unbranded Silk Fish	747.91	Stylish Hat designed	247.77	98.61	VR9Pg4uw0n	8457420226243	Hessel - VonRueden	kg	6	94	43	2025-03-19	https://picsum.photo	1	\N
9	1	Small Concrete Shoes	149.44	Featuring Berkelium-	152.65	459.34	Eo8e9odik6	8803933424583	Wolff - Stokes	unidades	19	177	17	2026-01-21	https://picsum.photo	2	\N
11	7	Incredible Ceramic B	732.14	Featuring Lanthanum-	70.14	587.97	cC6rbdqIXD	1647687053687	Rolfson Inc	kg	14	180	199	2025-08-27	https://picsum.photo	2	\N
12	2	Rustic Bamboo Chicke	331.64	Discover the negligi	449.60	115.59	tRO69vfOTg	8621485920285	Ebert and Sons	litros	20	56	186	2025-08-25	https://loremflickr.	3	\N
13	2	Fresh Aluminum Towel	713.35	The Grass-roots real	335.04	827.27	pnHAPp8gmx	7558335542361	Yundt, Stoltenberg a	kg	8	83	46	2025-11-25	https://loremflickr.	3	\N
14	7	Licensed Concrete Sa	298.22	Stylish Soap designe	493.28	847.96	R7AaUJAloa	0412594665449	Hilpert, Feil and Wy	kg	17	143	69	2025-08-19	https://picsum.photo	6	\N
17	6	Gorgeous Rubber Fish	927.32	Featuring Silicon-en	417.57	89.38	vB3o4Q4Wom	5258849791001	Hayes, Lubowitz and 	litros	7	143	122	2025-08-18	https://loremflickr.	2	\N
18	10	Bespoke Ceramic Shoe	935.83	Discover the butterf	243.14	604.39	ctwzCnTpWf	4504054379568	Kreiger Inc	litros	8	77	69	2026-02-01	https://loremflickr.	2	\N
19	9	Luxurious Rubber Glo	871.85	The Myrtice Fish is 	364.03	48.42	LmJP3CNFpj	2990698609907	Kub, Anderson and Ka	kg	5	100	174	2025-12-27	https://picsum.photo	4	\N
20	5	Handmade Gold Bike	158.92	The teal Sausages co	403.62	37.73	LJRKK92uEv	1668237666576	Farrell - Mohr	unidades	5	109	192	2025-05-14	https://picsum.photo	4	\N
21	6	Luxurious Concrete B	713.84	The purple Towels co	425.55	932.22	ouGd3xOub5	8631566151168	McKenzie, Armstrong 	kg	7	198	82	2026-02-12	https://loremflickr.	4	\N
22	1	Rustic Wooden Chicke	479.11	Discover the worthwh	73.66	58.49	4q8Dv3unz6	1832743558221	Upton - Cremin	kg	15	143	185	2026-02-18	https://picsum.photo	5	\N
24	8	Small Metal Pizza	305.77	Innovative Chicken f	352.88	950.90	pZ5pNzykeB	8957795367577	Schumm Inc	kg	10	99	42	2026-01-27	https://loremflickr.	5	\N
26	7	Rustic Concrete Fish	790.15	The sleek and old-fa	296.52	406.28	mqyVcHqHdE	0143666296849	Dare - Effertz	unidades	14	127	188	2025-04-13	https://picsum.photo	1	\N
27	8	Practical Cotton Bac	236.01	Professional-grade C	375.11	106.90	fFC6fD5BD9	0601063848257	Jacobson - McKenzie	litros	5	184	191	2025-11-28	https://picsum.photo	5	\N
28	1	Unbranded Gold Car	988.82	New cyan Car with er	138.16	417.70	jFSo0UsYV0	7349391221730	Dickens - Fadel	kg	11	149	162	2025-09-19	https://picsum.photo	3	\N
29	6	Recycled Gold Salad	95.54	The indigo Computer 	52.18	882.46	CRc4NA1fDo	4627718188956	Schuppe Group	unidades	9	55	134	2026-02-11	https://picsum.photo	5	\N
30	6	Unbranded Rubber Chi	151.03	Featuring Polonium-e	393.53	81.07	wUhUGUE34W	5989391288227	Howe, D'Amore and Wi	unidades	13	75	180	2025-12-30	https://loremflickr.	4	\N
31	1	Laptop Dell XPS 13	1200.50	Laptop de alto rendimiento	900.00	1300.00	LAP-DELL-XPS13	123456789012	Dell	piece	5	50	10	2025-12-31	http://example.com/laptop.jpg	2	\N
25	3	Calzones	12.50	Especiales para el frío	110.00	1500.00	CAL-ZONS-XPS13	123456789012aa	Pil Tja	piece	5	50	10	2025-12-31	http://example.com/laptop.jpg	2	\N
4	6	Gorgeous Metal Pizza	105.45	New violet Computer 	280.49	686.42	TNonFUeVk2	6959040415393	Streich, Franecki an	unidades	7	131	111	2025-11-29	https://loremflickr.	3	\N
23	7	Recycled Cotton Hat	557.68	Discover the monkey-	110.90	659.86	SFJ7Y8Rzmx	0373161637156	Walter - Zemlak	litros	18	140	10	2026-01-22	https://loremflickr.	1	\N
3	6	Soft Plastic Compute	779.51	Professional-grade G	410.99	751.71	86LpiCydeD	5248850814970	Kemmer - Padberg	unidades	12	184	120	2025-06-02	https://loremflickr.	4	\N
1	1	Tasty Bronze Compute	524.34	New purple Gloves wi	44.67	847.74	l6C2SsUzZC	8502175284994	Rowe - Price	unidades	11	105	1102	2025-07-22	https://loremflickr.	3	\N
16	10	Incredible Bronze To	800.50	Discover the grippin	123.42	287.57	44mQ6McIX3	1395612725423	Hirthe, Mosciski and	kg	18	189	55	2025-08-31	https://picsum.photo	6	\N
33	3	Laptop ASUS XYZ	999.99	\N	0.00	0.00	\N	\N	\N	\N	5	0	10	\N	\N	1	\N
10	5	Ergonomic Granite Fi	202.25	Savor the savory ess	232.15	917.47	JmSe8XusqI	2241170264417	Lesch - Kuphal	kg	8	199	5	2025-11-11	https://picsum.photo	4	\N
34	3	Lavadsora GEn	999.99	\N	0.00	0.00	\N	\N	\N	\N	5	0	5	\N	\N	1	\N
15	3	Practical Aluminum C	83.24	New Chicken model wi	418.32	48.16	737aOcmX0g	1479714360390	Weimann - Hayes	litros	12	161	38	2025-09-27	https://picsum.photo	1	\N
2	10	Refined Aluminum Tab	226.21	Ergonomic Gloves mad	275.89	497.60	h0VNSnJJbR	0110261145463	Christiansen, Von an	unidades	20	126	1201	2025-11-21	https://picsum.photo	2	inactive
\.


--
-- TOC entry 5027 (class 0 OID 118995)
-- Dependencies: 252
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
-- TOC entry 5005 (class 0 OID 86494)
-- Dependencies: 230
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
\.


--
-- TOC entry 5019 (class 0 OID 102256)
-- Dependencies: 244
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
-- TOC entry 5011 (class 0 OID 102188)
-- Dependencies: 236
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
-- TOC entry 4995 (class 0 OID 77617)
-- Dependencies: 220
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
\.


--
-- TOC entry 5023 (class 0 OID 102571)
-- Dependencies: 248
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transactions (id, customer_id, user_id, amount, type, reference, created_at, notes) FROM stdin;
11	9	1	22605.79	cash	Checkout cart 2	2025-03-06 11:19:52.597148	\N
\.


--
-- TOC entry 5021 (class 0 OID 102272)
-- Dependencies: 246
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password, email, first_name, last_name, address, mobile_phone, role_id, parent_user_id, created_at, status) FROM stdin;
2	Rolando.Skiles34	$2b$10$eM.gN6Ka/jpiLOYwkz/iD..TOy2KRG9XDQSF6mmEKIRe3.nr51KW2	Shemar.Schroeder@yah	John	Nicolas	90586 Hermiston Pine	1-212-312-2943	3	\N	2025-02-28 10:51:58.230779	active
3	Darby_Leuschke3	$2b$10$eM.gN6Ka/jpiLOYwkz/iD..TOy2KRG9XDQSF6mmEKIRe3.nr51KW2	Alicia.Flatley-Reill	Weldon	McDermott	3729 Schaefer Mounta	856-251-2555 x064	1	\N	2025-02-28 10:51:58.230779	active
4	Katrine_Franey78	$2b$10$eM.gN6Ka/jpiLOYwkz/iD..TOy2KRG9XDQSF6mmEKIRe3.nr51KW2	Clare47@hotmail.com	Rosina	Cronin	31618 N Franklin Str	(330) 391-3558 x057	3	\N	2025-02-28 10:51:58.230779	active
9	Danilo	$2b$10$eM.gN6Ka/jpiLOYwkz/iD..TOy2KRG9XDQSF6mmEKIRe3.nr51KW2	qiuntadan@algo.com	Dany	Quintana	Avda Las Pelotas 999	591 62 754285	3	\N	2025-03-05 20:56:36.117573	active
5	usuario_actualizado	$2b$10$eM.gN6Ka/jpiLOYwkz/iD..TOy2KRG9XDQSF6mmEKIRe3.nr51KW2	actualizado@example.com	Juan Carlos	Pérez Gómez	Avenida 456	555-5678	2	\N	2025-02-28 10:51:58.230779	active
1	Shaniya.Effertz	$2b$10$eM.gN6Ka/jpiLOYwkz/iD..TOy2KRG9XDQSF6mmEKIRe3.nr51KW2	otro_mail@ejemplo.com	Bill	Bogisich	4792 Heller Glens	123456789	1	\N	2025-02-28 10:51:58.230779	inactive
10	ricky21	$2b$10$eM.gN6Ka/jpiLOYwkz/iD..TOy2KRG9XDQSF6mmEKIRe3.nr51KW2	qricky@algo.com	Ricardo	Umacata	Avda Las Pelotas 999	591 62 754285	2	\N	2025-03-07 10:38:12.957845	active
11	marymar	$2b$10$vmMdNOcSvnZA49Bm6kqA4eOWleeEujtjgrVgcaUFyHSntrODWGCpu	marymar@algo.com	Maria	Mercedes	Avda Las Caanicas 999	591 62 951368	2	\N	2025-03-07 10:43:01.438424	active
\.


--
-- TOC entry 5051 (class 0 OID 0)
-- Dependencies: 223
-- Name: cart_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cart_id_seq', 4, true);


--
-- TOC entry 5052 (class 0 OID 0)
-- Dependencies: 225
-- Name: cart_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cart_items_id_seq', 9, true);


--
-- TOC entry 5053 (class 0 OID 0)
-- Dependencies: 227
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 6, true);


--
-- TOC entry 5054 (class 0 OID 0)
-- Dependencies: 241
-- Name: consignment_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.consignment_items_id_seq', 4, true);


--
-- TOC entry 5055 (class 0 OID 0)
-- Dependencies: 239
-- Name: consignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.consignments_id_seq', 7, true);


--
-- TOC entry 5056 (class 0 OID 0)
-- Dependencies: 233
-- Name: credits_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.credits_id_seq', 5, true);


--
-- TOC entry 5057 (class 0 OID 0)
-- Dependencies: 217
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customers_id_seq', 28, true);


--
-- TOC entry 5058 (class 0 OID 0)
-- Dependencies: 237
-- Name: debt_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.debt_payments_id_seq', 1, true);


--
-- TOC entry 5059 (class 0 OID 0)
-- Dependencies: 249
-- Name: kardex_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.kardex_id_seq', 12, true);


--
-- TOC entry 5060 (class 0 OID 0)
-- Dependencies: 231
-- Name: mermas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mermas_id_seq', 15, true);


--
-- TOC entry 5061 (class 0 OID 0)
-- Dependencies: 221
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 34, true);


--
-- TOC entry 5062 (class 0 OID 0)
-- Dependencies: 251
-- Name: purchase_order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.purchase_order_items_id_seq', 6, true);


--
-- TOC entry 5063 (class 0 OID 0)
-- Dependencies: 229
-- Name: purchase_orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.purchase_orders_id_seq', 17, true);


--
-- TOC entry 5064 (class 0 OID 0)
-- Dependencies: 243
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 1, false);


--
-- TOC entry 5065 (class 0 OID 0)
-- Dependencies: 235
-- Name: supplier_debts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.supplier_debts_id_seq', 10, true);


--
-- TOC entry 5066 (class 0 OID 0)
-- Dependencies: 219
-- Name: suppliers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.suppliers_id_seq', 11, true);


--
-- TOC entry 5067 (class 0 OID 0)
-- Dependencies: 247
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transactions_id_seq', 11, true);


--
-- TOC entry 5068 (class 0 OID 0)
-- Dependencies: 245
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 11, true);


--
-- TOC entry 4785 (class 2606 OID 77654)
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4783 (class 2606 OID 77642)
-- Name: cart cart_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_pkey PRIMARY KEY (id);


--
-- TOC entry 4787 (class 2606 OID 86014)
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- TOC entry 4789 (class 2606 OID 86012)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 4805 (class 2606 OID 102239)
-- Name: consignment_items consignment_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consignment_items
    ADD CONSTRAINT consignment_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4803 (class 2606 OID 102225)
-- Name: consignments consignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consignments
    ADD CONSTRAINT consignments_pkey PRIMARY KEY (id);


--
-- TOC entry 4795 (class 2606 OID 102179)
-- Name: credits credits_customer_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credits
    ADD CONSTRAINT credits_customer_id_key UNIQUE (customer_id);


--
-- TOC entry 4797 (class 2606 OID 102177)
-- Name: credits credits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credits
    ADD CONSTRAINT credits_pkey PRIMARY KEY (id);


--
-- TOC entry 4769 (class 2606 OID 85803)
-- Name: customers customers_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_email_key UNIQUE (email);


--
-- TOC entry 4771 (class 2606 OID 77610)
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- TOC entry 4773 (class 2606 OID 85801)
-- Name: customers customers_tax_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_tax_id_key UNIQUE (tax_id);


--
-- TOC entry 4801 (class 2606 OID 102208)
-- Name: debt_payments debt_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.debt_payments
    ADD CONSTRAINT debt_payments_pkey PRIMARY KEY (id);


--
-- TOC entry 4819 (class 2606 OID 118988)
-- Name: kardex kardex_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kardex
    ADD CONSTRAINT kardex_pkey PRIMARY KEY (id);


--
-- TOC entry 4793 (class 2606 OID 86705)
-- Name: mermas mermas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mermas
    ADD CONSTRAINT mermas_pkey PRIMARY KEY (id);


--
-- TOC entry 4779 (class 2606 OID 85787)
-- Name: products products_barcode_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_barcode_key UNIQUE (barcode);


--
-- TOC entry 4781 (class 2606 OID 77629)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 4821 (class 2606 OID 119002)
-- Name: purchase_order_items purchase_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4791 (class 2606 OID 86501)
-- Name: purchase_orders purchase_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);


--
-- TOC entry 4807 (class 2606 OID 102265)
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- TOC entry 4809 (class 2606 OID 102263)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 4799 (class 2606 OID 102195)
-- Name: supplier_debts supplier_debts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_debts
    ADD CONSTRAINT supplier_debts_pkey PRIMARY KEY (id);


--
-- TOC entry 4775 (class 2606 OID 77622)
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- TOC entry 4777 (class 2606 OID 85797)
-- Name: suppliers suppliers_tax_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_tax_id_key UNIQUE (tax_id);


--
-- TOC entry 4817 (class 2606 OID 102580)
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 4811 (class 2606 OID 102284)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4813 (class 2606 OID 102280)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4815 (class 2606 OID 102282)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4846 (class 2620 OID 102251)
-- Name: consignments update_consignments_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_consignments_timestamp BEFORE UPDATE ON public.consignments FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- TOC entry 4844 (class 2620 OID 102185)
-- Name: credits update_credits_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_credits_timestamp BEFORE UPDATE ON public.credits FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- TOC entry 4845 (class 2620 OID 102250)
-- Name: supplier_debts update_supplier_debts_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_supplier_debts_timestamp BEFORE UPDATE ON public.supplier_debts FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- TOC entry 4824 (class 2606 OID 77643)
-- Name: cart cart_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- TOC entry 4825 (class 2606 OID 77655)
-- Name: cart_items cart_items_cart_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.cart(id);


--
-- TOC entry 4826 (class 2606 OID 77660)
-- Name: cart_items cart_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 4836 (class 2606 OID 102240)
-- Name: consignment_items consignment_items_consignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consignment_items
    ADD CONSTRAINT consignment_items_consignment_id_fkey FOREIGN KEY (consignment_id) REFERENCES public.consignments(id);


--
-- TOC entry 4837 (class 2606 OID 102245)
-- Name: consignment_items consignment_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consignment_items
    ADD CONSTRAINT consignment_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 4834 (class 2606 OID 102226)
-- Name: consignments consignments_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consignments
    ADD CONSTRAINT consignments_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- TOC entry 4835 (class 2606 OID 102600)
-- Name: consignments consignments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consignments
    ADD CONSTRAINT consignments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4830 (class 2606 OID 102180)
-- Name: credits credits_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credits
    ADD CONSTRAINT credits_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- TOC entry 4833 (class 2606 OID 102209)
-- Name: debt_payments debt_payments_debt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.debt_payments
    ADD CONSTRAINT debt_payments_debt_id_fkey FOREIGN KEY (debt_id) REFERENCES public.supplier_debts(id);


--
-- TOC entry 4841 (class 2606 OID 118989)
-- Name: kardex kardex_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kardex
    ADD CONSTRAINT kardex_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4829 (class 2606 OID 86706)
-- Name: mermas mermas_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mermas
    ADD CONSTRAINT mermas_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 4822 (class 2606 OID 86015)
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- TOC entry 4823 (class 2606 OID 77630)
-- Name: products products_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- TOC entry 4842 (class 2606 OID 119008)
-- Name: purchase_order_items purchase_order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- TOC entry 4843 (class 2606 OID 119003)
-- Name: purchase_order_items purchase_order_items_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE;


--
-- TOC entry 4827 (class 2606 OID 86502)
-- Name: purchase_orders purchase_orders_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 4828 (class 2606 OID 86507)
-- Name: purchase_orders purchase_orders_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- TOC entry 4831 (class 2606 OID 102196)
-- Name: supplier_debts supplier_debts_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_debts
    ADD CONSTRAINT supplier_debts_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- TOC entry 4832 (class 2606 OID 102594)
-- Name: supplier_debts supplier_debts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_debts
    ADD CONSTRAINT supplier_debts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4839 (class 2606 OID 102581)
-- Name: transactions transactions_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- TOC entry 4840 (class 2606 OID 102586)
-- Name: transactions transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4838 (class 2606 OID 102285)
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


-- Completed on 2025-03-08 09:47:33

--
-- PostgreSQL database dump complete
--

