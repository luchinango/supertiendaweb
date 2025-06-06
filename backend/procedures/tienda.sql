PGDMP  ;    1                }            tienda    17.2    17.1 �    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            �           1262    77589    tienda    DATABASE     {   CREATE DATABASE tienda WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Spanish_Bolivia.1252';
    DROP DATABASE tienda;
                     postgres    false            �            1255    93990    update_timestamp()    FUNCTION     �   CREATE FUNCTION public.update_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;
 )   DROP FUNCTION public.update_timestamp();
       public               postgres    false            �            1259    77636    cart    TABLE     �   CREATE TABLE public.cart (
    id integer NOT NULL,
    customer_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.cart;
       public         heap r       postgres    false            �            1259    77635    cart_id_seq    SEQUENCE     �   CREATE SEQUENCE public.cart_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 "   DROP SEQUENCE public.cart_id_seq;
       public               postgres    false    224            �           0    0    cart_id_seq    SEQUENCE OWNED BY     ;   ALTER SEQUENCE public.cart_id_seq OWNED BY public.cart.id;
          public               postgres    false    223            �            1259    77649 
   cart_items    TABLE     �   CREATE TABLE public.cart_items (
    id integer NOT NULL,
    cart_id integer,
    product_id integer,
    quantity integer NOT NULL,
    price_at_time numeric(10,2) NOT NULL
);
    DROP TABLE public.cart_items;
       public         heap r       postgres    false            �            1259    77648    cart_items_id_seq    SEQUENCE     �   CREATE SEQUENCE public.cart_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.cart_items_id_seq;
       public               postgres    false    226            �           0    0    cart_items_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.cart_items_id_seq OWNED BY public.cart_items.id;
          public               postgres    false    225            �            1259    86005 
   categories    TABLE     {   CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    description text
);
    DROP TABLE public.categories;
       public         heap r       postgres    false            �            1259    86004    categories_id_seq    SEQUENCE     �   CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.categories_id_seq;
       public               postgres    false    228            �           0    0    categories_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;
          public               postgres    false    227            �            1259    102232    consignment_items    TABLE     >  CREATE TABLE public.consignment_items (
    id integer NOT NULL,
    consignment_id integer,
    product_id integer,
    quantity_delivered integer NOT NULL,
    quantity_sold integer DEFAULT 0 NOT NULL,
    price_at_time numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
 %   DROP TABLE public.consignment_items;
       public         heap r       postgres    false            �            1259    102231    consignment_items_id_seq    SEQUENCE     �   CREATE SEQUENCE public.consignment_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.consignment_items_id_seq;
       public               postgres    false    242            �           0    0    consignment_items_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public.consignment_items_id_seq OWNED BY public.consignment_items.id;
          public               postgres    false    241            �            1259    102215    consignments    TABLE       CREATE TABLE public.consignments (
    id integer NOT NULL,
    supplier_id integer,
    start_date date NOT NULL,
    end_date date NOT NULL,
    total_value numeric(10,2) NOT NULL,
    sold_value numeric(10,2) DEFAULT 0.00 NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT consignments_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'completed'::character varying, 'canceled'::character varying])::text[])))
);
     DROP TABLE public.consignments;
       public         heap r       postgres    false            �            1259    102214    consignments_id_seq    SEQUENCE     �   CREATE SEQUENCE public.consignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.consignments_id_seq;
       public               postgres    false    240            �           0    0    consignments_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE public.consignments_id_seq OWNED BY public.consignments.id;
          public               postgres    false    239            �            1259    102169    credits    TABLE       CREATE TABLE public.credits (
    id integer NOT NULL,
    customer_id integer,
    balance numeric(10,2) DEFAULT 0.00 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.credits;
       public         heap r       postgres    false            �            1259    102168    credits_id_seq    SEQUENCE     �   CREATE SEQUENCE public.credits_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.credits_id_seq;
       public               postgres    false    234            �           0    0    credits_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.credits_id_seq OWNED BY public.credits.id;
          public               postgres    false    233            �            1259    77603 	   customers    TABLE       CREATE TABLE public.customers (
    id integer NOT NULL,
    user_id integer,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    address text,
    phone character varying(20),
    company_name character varying(100),
    tax_id character varying(20),
    email character varying(100),
    status character varying(10),
    CONSTRAINT customers_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[])))
);
    DROP TABLE public.customers;
       public         heap r       postgres    false            �            1259    77602    customers_id_seq    SEQUENCE     �   CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.customers_id_seq;
       public               postgres    false    218            �           0    0    customers_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;
          public               postgres    false    217            �            1259    102202    debt_payments    TABLE     �   CREATE TABLE public.debt_payments (
    id integer NOT NULL,
    debt_id integer,
    amount numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
 !   DROP TABLE public.debt_payments;
       public         heap r       postgres    false            �            1259    102201    debt_payments_id_seq    SEQUENCE     �   CREATE SEQUENCE public.debt_payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.debt_payments_id_seq;
       public               postgres    false    238            �           0    0    debt_payments_id_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE public.debt_payments_id_seq OWNED BY public.debt_payments.id;
          public               postgres    false    237            �            1259    86697    mermas    TABLE     �  CREATE TABLE public.mermas (
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
    DROP TABLE public.mermas;
       public         heap r       postgres    false            �            1259    86696    mermas_id_seq    SEQUENCE     �   CREATE SEQUENCE public.mermas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.mermas_id_seq;
       public               postgres    false    232            �           0    0    mermas_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.mermas_id_seq OWNED BY public.mermas.id;
          public               postgres    false    231            �            1259    77624    products    TABLE     �  CREATE TABLE public.products (
    id integer NOT NULL,
    supplier_id integer,
    name character varying(100) NOT NULL,
    price numeric(10,2) NOT NULL,
    stock integer NOT NULL,
    description text,
    purchase_price numeric(10,2) DEFAULT 0.00 NOT NULL,
    sale_price numeric(10,2) DEFAULT 0.00 NOT NULL,
    sku character varying(50),
    barcode character varying(50),
    brand character varying(50),
    unit character varying(20),
    min_stock integer DEFAULT 0 NOT NULL,
    max_stock integer DEFAULT 0 NOT NULL,
    actual_stock integer DEFAULT 0 NOT NULL,
    expiration_date date,
    image text,
    category_id integer,
    status character varying(10)
);
    DROP TABLE public.products;
       public         heap r       postgres    false            �            1259    77623    products_id_seq    SEQUENCE     �   CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.products_id_seq;
       public               postgres    false    222            �           0    0    products_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;
          public               postgres    false    221            �            1259    86494    purchase_orders    TABLE       CREATE TABLE public.purchase_orders (
    id integer NOT NULL,
    product_id integer,
    supplier_id integer,
    quantity integer NOT NULL,
    order_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'pending'::character varying
);
 #   DROP TABLE public.purchase_orders;
       public         heap r       postgres    false            �            1259    86493    purchase_orders_id_seq    SEQUENCE     �   CREATE SEQUENCE public.purchase_orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.purchase_orders_id_seq;
       public               postgres    false    230            �           0    0    purchase_orders_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public.purchase_orders_id_seq OWNED BY public.purchase_orders.id;
          public               postgres    false    229            �            1259    102256    roles    TABLE     �   CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    description text,
    parent_role_id integer
);
    DROP TABLE public.roles;
       public         heap r       postgres    false            �            1259    102255    roles_id_seq    SEQUENCE     �   CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.roles_id_seq;
       public               postgres    false    244            �           0    0    roles_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;
          public               postgres    false    243            �            1259    102188    supplier_debts    TABLE     ;  CREATE TABLE public.supplier_debts (
    id integer NOT NULL,
    supplier_id integer,
    total_amount numeric(10,2) NOT NULL,
    remaining_amount numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
 "   DROP TABLE public.supplier_debts;
       public         heap r       postgres    false            �            1259    102187    supplier_debts_id_seq    SEQUENCE     �   CREATE SEQUENCE public.supplier_debts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.supplier_debts_id_seq;
       public               postgres    false    236            �           0    0    supplier_debts_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.supplier_debts_id_seq OWNED BY public.supplier_debts.id;
          public               postgres    false    235            �            1259    77617 	   suppliers    TABLE     I  CREATE TABLE public.suppliers (
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
    DROP TABLE public.suppliers;
       public         heap r       postgres    false            �            1259    77616    suppliers_id_seq    SEQUENCE     �   CREATE SEQUENCE public.suppliers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.suppliers_id_seq;
       public               postgres    false    220            �           0    0    suppliers_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.suppliers_id_seq OWNED BY public.suppliers.id;
          public               postgres    false    219            �            1259    102272    users    TABLE     �  CREATE TABLE public.users (
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
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.users;
       public         heap r       postgres    false            �            1259    102271    users_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public               postgres    false    246            �           0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
          public               postgres    false    245            r           2604    77639    cart id    DEFAULT     b   ALTER TABLE ONLY public.cart ALTER COLUMN id SET DEFAULT nextval('public.cart_id_seq'::regclass);
 6   ALTER TABLE public.cart ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    224    223    224            t           2604    77652    cart_items id    DEFAULT     n   ALTER TABLE ONLY public.cart_items ALTER COLUMN id SET DEFAULT nextval('public.cart_items_id_seq'::regclass);
 <   ALTER TABLE public.cart_items ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    226    225    226            u           2604    86008    categories id    DEFAULT     n   ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);
 <   ALTER TABLE public.categories ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    228    227    228            �           2604    102235    consignment_items id    DEFAULT     |   ALTER TABLE ONLY public.consignment_items ALTER COLUMN id SET DEFAULT nextval('public.consignment_items_id_seq'::regclass);
 C   ALTER TABLE public.consignment_items ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    242    241    242            �           2604    102218    consignments id    DEFAULT     r   ALTER TABLE ONLY public.consignments ALTER COLUMN id SET DEFAULT nextval('public.consignments_id_seq'::regclass);
 >   ALTER TABLE public.consignments ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    240    239    240            z           2604    102172 
   credits id    DEFAULT     h   ALTER TABLE ONLY public.credits ALTER COLUMN id SET DEFAULT nextval('public.credits_id_seq'::regclass);
 9   ALTER TABLE public.credits ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    234    233    234            h           2604    77606    customers id    DEFAULT     l   ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);
 ;   ALTER TABLE public.customers ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    217    218    218            �           2604    102205    debt_payments id    DEFAULT     t   ALTER TABLE ONLY public.debt_payments ALTER COLUMN id SET DEFAULT nextval('public.debt_payments_id_seq'::regclass);
 ?   ALTER TABLE public.debt_payments ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    237    238    238            y           2604    86700 	   mermas id    DEFAULT     f   ALTER TABLE ONLY public.mermas ALTER COLUMN id SET DEFAULT nextval('public.mermas_id_seq'::regclass);
 8   ALTER TABLE public.mermas ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    232    231    232            l           2604    77627    products id    DEFAULT     j   ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);
 :   ALTER TABLE public.products ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    221    222    222            v           2604    86497    purchase_orders id    DEFAULT     x   ALTER TABLE ONLY public.purchase_orders ALTER COLUMN id SET DEFAULT nextval('public.purchase_orders_id_seq'::regclass);
 A   ALTER TABLE public.purchase_orders ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    230    229    230            �           2604    102259    roles id    DEFAULT     d   ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);
 7   ALTER TABLE public.roles ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    243    244    244            ~           2604    102191    supplier_debts id    DEFAULT     v   ALTER TABLE ONLY public.supplier_debts ALTER COLUMN id SET DEFAULT nextval('public.supplier_debts_id_seq'::regclass);
 @   ALTER TABLE public.supplier_debts ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    235    236    236            i           2604    77620    suppliers id    DEFAULT     l   ALTER TABLE ONLY public.suppliers ALTER COLUMN id SET DEFAULT nextval('public.suppliers_id_seq'::regclass);
 ;   ALTER TABLE public.suppliers ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    220    219    220            �           2604    102275    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    246    245    246            n          0    77636    cart 
   TABLE DATA           ;   COPY public.cart (id, customer_id, created_at) FROM stdin;
    public               postgres    false    224   �       p          0    77649 
   cart_items 
   TABLE DATA           V   COPY public.cart_items (id, cart_id, product_id, quantity, price_at_time) FROM stdin;
    public               postgres    false    226   G�       r          0    86005 
   categories 
   TABLE DATA           ;   COPY public.categories (id, name, description) FROM stdin;
    public               postgres    false    228   t�       �          0    102232    consignment_items 
   TABLE DATA           �   COPY public.consignment_items (id, consignment_id, product_id, quantity_delivered, quantity_sold, price_at_time, created_at) FROM stdin;
    public               postgres    false    242   ��       ~          0    102215    consignments 
   TABLE DATA           �   COPY public.consignments (id, supplier_id, start_date, end_date, total_value, sold_value, status, created_at, updated_at) FROM stdin;
    public               postgres    false    240   ��       x          0    102169    credits 
   TABLE DATA           S   COPY public.credits (id, customer_id, balance, created_at, updated_at) FROM stdin;
    public               postgres    false    234   ��       h          0    77603 	   customers 
   TABLE DATA           |   COPY public.customers (id, user_id, first_name, last_name, address, phone, company_name, tax_id, email, status) FROM stdin;
    public               postgres    false    218   ۳       |          0    102202    debt_payments 
   TABLE DATA           H   COPY public.debt_payments (id, debt_id, amount, created_at) FROM stdin;
    public               postgres    false    238   �       v          0    86697    mermas 
   TABLE DATA           k   COPY public.mermas (id, product_id, quantity, type, date, value, responsible_id, observations) FROM stdin;
    public               postgres    false    232   <�       l          0    77624    products 
   TABLE DATA           �   COPY public.products (id, supplier_id, name, price, stock, description, purchase_price, sale_price, sku, barcode, brand, unit, min_stock, max_stock, actual_stock, expiration_date, image, category_id, status) FROM stdin;
    public               postgres    false    222   '�       t          0    86494    purchase_orders 
   TABLE DATA           d   COPY public.purchase_orders (id, product_id, supplier_id, quantity, order_date, status) FROM stdin;
    public               postgres    false    230   ��       �          0    102256    roles 
   TABLE DATA           F   COPY public.roles (id, name, description, parent_role_id) FROM stdin;
    public               postgres    false    244   ��       z          0    102188    supplier_debts 
   TABLE DATA           q   COPY public.supplier_debts (id, supplier_id, total_amount, remaining_amount, created_at, updated_at) FROM stdin;
    public               postgres    false    236   ��       j          0    77617 	   suppliers 
   TABLE DATA           z   COPY public.suppliers (id, name, contact, phone, email, company_name, tax_id, address, supplier_type, status) FROM stdin;
    public               postgres    false    220   ��       �          0    102272    users 
   TABLE DATA           �   COPY public.users (id, username, password, email, first_name, last_name, address, mobile_phone, role_id, parent_user_id, created_at) FROM stdin;
    public               postgres    false    246   ��       �           0    0    cart_id_seq    SEQUENCE SET     9   SELECT pg_catalog.setval('public.cart_id_seq', 4, true);
          public               postgres    false    223            �           0    0    cart_items_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.cart_items_id_seq', 5, true);
          public               postgres    false    225            �           0    0    categories_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.categories_id_seq', 10, true);
          public               postgres    false    227            �           0    0    consignment_items_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('public.consignment_items_id_seq', 1, false);
          public               postgres    false    241            �           0    0    consignments_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.consignments_id_seq', 1, false);
          public               postgres    false    239            �           0    0    credits_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.credits_id_seq', 1, false);
          public               postgres    false    233            �           0    0    customers_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.customers_id_seq', 49, true);
          public               postgres    false    217            �           0    0    debt_payments_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.debt_payments_id_seq', 1, false);
          public               postgres    false    237            �           0    0    mermas_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.mermas_id_seq', 23, true);
          public               postgres    false    231            �           0    0    products_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.products_id_seq', 81, true);
          public               postgres    false    221            �           0    0    purchase_orders_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.purchase_orders_id_seq', 15, true);
          public               postgres    false    229            �           0    0    roles_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.roles_id_seq', 1, false);
          public               postgres    false    243            �           0    0    supplier_debts_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.supplier_debts_id_seq', 1, true);
          public               postgres    false    235            �           0    0    suppliers_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.suppliers_id_seq', 11, true);
          public               postgres    false    219            �           0    0    users_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.users_id_seq', 1, false);
          public               postgres    false    245            �           2606    77654    cart_items cart_items_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.cart_items DROP CONSTRAINT cart_items_pkey;
       public                 postgres    false    226            �           2606    77642    cart cart_pkey 
   CONSTRAINT     L   ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_pkey PRIMARY KEY (id);
 8   ALTER TABLE ONLY public.cart DROP CONSTRAINT cart_pkey;
       public                 postgres    false    224            �           2606    86014    categories categories_name_key 
   CONSTRAINT     Y   ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);
 H   ALTER TABLE ONLY public.categories DROP CONSTRAINT categories_name_key;
       public                 postgres    false    228            �           2606    86012    categories categories_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.categories DROP CONSTRAINT categories_pkey;
       public                 postgres    false    228            �           2606    102239 (   consignment_items consignment_items_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public.consignment_items
    ADD CONSTRAINT consignment_items_pkey PRIMARY KEY (id);
 R   ALTER TABLE ONLY public.consignment_items DROP CONSTRAINT consignment_items_pkey;
       public                 postgres    false    242            �           2606    102225    consignments consignments_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.consignments
    ADD CONSTRAINT consignments_pkey PRIMARY KEY (id);
 H   ALTER TABLE ONLY public.consignments DROP CONSTRAINT consignments_pkey;
       public                 postgres    false    240            �           2606    102179    credits credits_customer_id_key 
   CONSTRAINT     a   ALTER TABLE ONLY public.credits
    ADD CONSTRAINT credits_customer_id_key UNIQUE (customer_id);
 I   ALTER TABLE ONLY public.credits DROP CONSTRAINT credits_customer_id_key;
       public                 postgres    false    234            �           2606    102177    credits credits_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.credits
    ADD CONSTRAINT credits_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.credits DROP CONSTRAINT credits_pkey;
       public                 postgres    false    234            �           2606    85803    customers customers_email_key 
   CONSTRAINT     Y   ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_email_key UNIQUE (email);
 G   ALTER TABLE ONLY public.customers DROP CONSTRAINT customers_email_key;
       public                 postgres    false    218            �           2606    77610    customers customers_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.customers DROP CONSTRAINT customers_pkey;
       public                 postgres    false    218            �           2606    85801    customers customers_tax_id_key 
   CONSTRAINT     [   ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_tax_id_key UNIQUE (tax_id);
 H   ALTER TABLE ONLY public.customers DROP CONSTRAINT customers_tax_id_key;
       public                 postgres    false    218            �           2606    102208     debt_payments debt_payments_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.debt_payments
    ADD CONSTRAINT debt_payments_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.debt_payments DROP CONSTRAINT debt_payments_pkey;
       public                 postgres    false    238            �           2606    86705    mermas mermas_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.mermas
    ADD CONSTRAINT mermas_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.mermas DROP CONSTRAINT mermas_pkey;
       public                 postgres    false    232            �           2606    85787    products products_barcode_key 
   CONSTRAINT     [   ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_barcode_key UNIQUE (barcode);
 G   ALTER TABLE ONLY public.products DROP CONSTRAINT products_barcode_key;
       public                 postgres    false    222            �           2606    77629    products products_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.products DROP CONSTRAINT products_pkey;
       public                 postgres    false    222            �           2606    86501 $   purchase_orders purchase_orders_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);
 N   ALTER TABLE ONLY public.purchase_orders DROP CONSTRAINT purchase_orders_pkey;
       public                 postgres    false    230            �           2606    102265    roles roles_name_key 
   CONSTRAINT     O   ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);
 >   ALTER TABLE ONLY public.roles DROP CONSTRAINT roles_name_key;
       public                 postgres    false    244            �           2606    102263    roles roles_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.roles DROP CONSTRAINT roles_pkey;
       public                 postgres    false    244            �           2606    102195 "   supplier_debts supplier_debts_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public.supplier_debts
    ADD CONSTRAINT supplier_debts_pkey PRIMARY KEY (id);
 L   ALTER TABLE ONLY public.supplier_debts DROP CONSTRAINT supplier_debts_pkey;
       public                 postgres    false    236            �           2606    77622    suppliers suppliers_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.suppliers DROP CONSTRAINT suppliers_pkey;
       public                 postgres    false    220            �           2606    85797    suppliers suppliers_tax_id_key 
   CONSTRAINT     [   ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_tax_id_key UNIQUE (tax_id);
 H   ALTER TABLE ONLY public.suppliers DROP CONSTRAINT suppliers_tax_id_key;
       public                 postgres    false    220            �           2606    102284    users users_email_key 
   CONSTRAINT     Q   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
 ?   ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key;
       public                 postgres    false    246            �           2606    102280    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public                 postgres    false    246            �           2606    102282    users users_username_key 
   CONSTRAINT     W   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);
 B   ALTER TABLE ONLY public.users DROP CONSTRAINT users_username_key;
       public                 postgres    false    246            �           2620    102251 *   consignments update_consignments_timestamp    TRIGGER     �   CREATE TRIGGER update_consignments_timestamp BEFORE UPDATE ON public.consignments FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
 C   DROP TRIGGER update_consignments_timestamp ON public.consignments;
       public               postgres    false    247    240            �           2620    102185     credits update_credits_timestamp    TRIGGER     �   CREATE TRIGGER update_credits_timestamp BEFORE UPDATE ON public.credits FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
 9   DROP TRIGGER update_credits_timestamp ON public.credits;
       public               postgres    false    234    247            �           2620    102250 .   supplier_debts update_supplier_debts_timestamp    TRIGGER     �   CREATE TRIGGER update_supplier_debts_timestamp BEFORE UPDATE ON public.supplier_debts FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
 G   DROP TRIGGER update_supplier_debts_timestamp ON public.supplier_debts;
       public               postgres    false    247    236            �           2606    77643    cart cart_customer_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);
 D   ALTER TABLE ONLY public.cart DROP CONSTRAINT cart_customer_id_fkey;
       public               postgres    false    224    4757    218            �           2606    77655 "   cart_items cart_items_cart_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.cart(id);
 L   ALTER TABLE ONLY public.cart_items DROP CONSTRAINT cart_items_cart_id_fkey;
       public               postgres    false    224    226    4769            �           2606    77660 %   cart_items cart_items_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);
 O   ALTER TABLE ONLY public.cart_items DROP CONSTRAINT cart_items_product_id_fkey;
       public               postgres    false    222    4767    226            �           2606    102240 7   consignment_items consignment_items_consignment_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.consignment_items
    ADD CONSTRAINT consignment_items_consignment_id_fkey FOREIGN KEY (consignment_id) REFERENCES public.consignments(id);
 a   ALTER TABLE ONLY public.consignment_items DROP CONSTRAINT consignment_items_consignment_id_fkey;
       public               postgres    false    242    240    4789            �           2606    102245 3   consignment_items consignment_items_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.consignment_items
    ADD CONSTRAINT consignment_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);
 ]   ALTER TABLE ONLY public.consignment_items DROP CONSTRAINT consignment_items_product_id_fkey;
       public               postgres    false    242    222    4767            �           2606    102226 *   consignments consignments_supplier_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.consignments
    ADD CONSTRAINT consignments_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);
 T   ALTER TABLE ONLY public.consignments DROP CONSTRAINT consignments_supplier_id_fkey;
       public               postgres    false    240    4761    220            �           2606    102180     credits credits_customer_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.credits
    ADD CONSTRAINT credits_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);
 J   ALTER TABLE ONLY public.credits DROP CONSTRAINT credits_customer_id_fkey;
       public               postgres    false    218    234    4757            �           2606    102209 (   debt_payments debt_payments_debt_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.debt_payments
    ADD CONSTRAINT debt_payments_debt_id_fkey FOREIGN KEY (debt_id) REFERENCES public.supplier_debts(id);
 R   ALTER TABLE ONLY public.debt_payments DROP CONSTRAINT debt_payments_debt_id_fkey;
       public               postgres    false    236    238    4785            �           2606    86706    mermas mermas_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.mermas
    ADD CONSTRAINT mermas_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);
 G   ALTER TABLE ONLY public.mermas DROP CONSTRAINT mermas_product_id_fkey;
       public               postgres    false    232    4767    222            �           2606    86015 "   products products_category_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);
 L   ALTER TABLE ONLY public.products DROP CONSTRAINT products_category_id_fkey;
       public               postgres    false    228    222    4775            �           2606    77630 "   products products_supplier_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);
 L   ALTER TABLE ONLY public.products DROP CONSTRAINT products_supplier_id_fkey;
       public               postgres    false    4761    220    222            �           2606    86502 /   purchase_orders purchase_orders_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);
 Y   ALTER TABLE ONLY public.purchase_orders DROP CONSTRAINT purchase_orders_product_id_fkey;
       public               postgres    false    222    4767    230            �           2606    86507 0   purchase_orders purchase_orders_supplier_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);
 Z   ALTER TABLE ONLY public.purchase_orders DROP CONSTRAINT purchase_orders_supplier_id_fkey;
       public               postgres    false    220    4761    230            �           2606    102266    roles roles_parent_role_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_parent_role_id_fkey FOREIGN KEY (parent_role_id) REFERENCES public.roles(id) ON DELETE SET NULL;
 I   ALTER TABLE ONLY public.roles DROP CONSTRAINT roles_parent_role_id_fkey;
       public               postgres    false    244    244    4795            �           2606    102196 .   supplier_debts supplier_debts_supplier_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.supplier_debts
    ADD CONSTRAINT supplier_debts_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);
 X   ALTER TABLE ONLY public.supplier_debts DROP CONSTRAINT supplier_debts_supplier_id_fkey;
       public               postgres    false    236    4761    220            �           2606    102290    users users_parent_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_parent_user_id_fkey FOREIGN KEY (parent_user_id) REFERENCES public.users(id) ON DELETE SET NULL;
 I   ALTER TABLE ONLY public.users DROP CONSTRAINT users_parent_user_id_fkey;
       public               postgres    false    246    246    4799            �           2606    102285    users users_role_id_fkey    FK CONSTRAINT     w   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);
 B   ALTER TABLE ONLY public.users DROP CONSTRAINT users_role_id_fkey;
       public               postgres    false    244    4795    246            n   U   x�mɱ� �Z�p}�E���?GLe�kO�0�1���i�t��$���U"y|#���WztC�Y�u֓����/ڝ�^@_      p      x�3�4�44�4�473�30����� !�      r      x�E�KNC1E��*��ϰ�V�$&LL�Z���q*u�6�+!�o�(�}s��9�S�*<ҞU�9��@V��E"�"$�E%��Ǘ�Lb;��*NK6���g�0��0��D)�Q��{�f2��`����V�_E������
O��hM��Acɘ���ʘ�-��f�B��qN�v������ө���K�.��>�Co7��q)���W9TX�8E����S}Ix�r~�A9�t��Qǉd"i&�VJ�*��:�� .[}�      �      x������ � �      ~      x������ � �      x      x������ � �      h   4	  x��X�n�8}f���	`	�&�o���%q�N�i4P`U1.�U�AI��4�1?6������0@��v�û�{n��"4݆|��BC�)�Mx��^�$�ԙ�6ZH���0�|��8�}���2zB�����MQ�j6@}ܸU�"��[tՃ'�u���59��k�',S�^�>V��ߚ
_�Vg�ҙ`��OF�&����f1Q� �&$c>ޮ]U�J��"GaqG�B�f?����:��B���,C3��2-U�L�I�,}�E��e�~��x�ㆺfI���y�����%a��o�=��UX�����6\1z��I��+�H/sS����#��qM.�x���~�9{�6�h0��#�b��H�`��z��#|.m��ɴ��37R"�a}�G�*�!�!���7����S���༚�7�$���� �V-����z�z��ۖX�r��J��h�r{|�5f3B���6Z��!Gޓ�8�<�hj��<u��~@���d!2�,�,�1�z���k_���ÑH�ɷ8J�%�D ����t��X9"�h��U-J��V,ׂ�L0���i�09���U��#� �-��>�B�{ZY��:rHw$� e�3Y�c]\R���#H�df����hT�D�^y|֣��֮�-&��g�N^���7�8��[��L�{Ã'�ITP�V˒�U�Ԏ{�_��n�swW5%��i'ݧY g9inIYZzܷ�]xl�*�F"y_��Ml�@YQ
r��Z��e����6�  g�Nb����X��v�5���^�x7�)˔*�B�.QS��&�5һG������S�iƶ�/��Wo���T^_�=�G��o��V�3�1��W��7}*�<��d�2�3��y�&Yȏ�7r�-�l���Y��kק�s�b����kWH���o���)�x�1F���W�^�4��e7Q�/�yB���� �j��@H���^D�L��=���s��
�2%��Gj�z$:l���l�ّ[C8���'�?�
c�ih\�B\�e5*�\�6/RF]{���͐՛�1m���L�3@��B����W�sh����f��51�,5=�:��h����c�"Ze2��tOZ�h���7i�����&������^9�����'�4�=�?������}�Am:
+�>�� �������u��m1%�A͐�/!��Ǫ�<E�r	�Iz|�7I�Y�b�)�V{�������=�깃h��l�6�v0rt�~��ε�����n0��ȷ¤7>�ڗ��)�A�2|���Q�n��գc��k��۾����F��m�����c�9�q��W��j��}�[�4ϤV��pc)A~TͲN���v@�lGh½��x���l��%c\��|��2Y�r��8&�4�����P�a�4���:X!"�J�#��1�!T�䄜���؎l(����uR��\�ԀH��{���Ayoy��3�17���_#X\����yz�ڂ�&��%��)8D�UrLhz�och���7����:�tL��|�7�f�N�0ڟ��'��u6��`��>�[� ���E؜�A"���}Bm��j�'rk/��h���mռ�]���^���Y{�����@�`$����޷��d)��&��Ԡ\{�!���a8G���o3!�	qG�6E�d�~��M�ü����l���Bߥ����T�3.
��Q��(�[,«��l���H��_�vX����:�[�����;�~��Rq	��sau���ÔH�
}���ݎ[?_�o���Fԝ�,I��&��ϥ��"i�O|��a�2�f�Z����?�,Q�Gj\��H���= �/�o%Op��?{tl哀����٦v��w�`d��'��9a�X5�2x��\j�@��X���3�Jؤ�%=��8�`5�Uee�a=�N[Ĥ��C|�pf�H ���L��w��y\�d�%�� V�[��X���h��B�S�� `f#�,w�)l�3����c���1,w�L�s��$�̼,u��F�Nr�n�ҏ4j�|>|�팈��kX~�{�,RD��g���S�`�pt[��B����8bq�e������O`v���$��;�"Ό4� �z,a�).�2�Y��A|����2b���;�,��y���"ݤuj�����dQ��<L�3Q����:�tC�{�Ɛ���8'����[�}�`ژ�~�+���JM����mX`�^rL�В��;^
{���^�ԁ���_L79�۪ʖ�)�bՅR��t��	�z���N*c˒ �s�@f���T�H�����������3�X���L��%Qhx�	)}
΅����<~���?��e���j���ɭ�k��k��߽{�_�Ƀ�      |      x������ � �      v   �  x��TK��6\ӧ�L��>ֲ1�	0�&3�lh�vH��e�#��RO62v;� ��-��Uիz�)���4�)2ը��ȣX�ь�ľ�sLu��k�[���/qv�x��A��NM��/�ouT-�Q�'T�����\�p���k����[�A��C��Q�fJBS��i�6�:[� �9�?��O~��%>��˹fn�%����šeCǺG���A��JM�?��WQ #U��5���B�(z����_c��i}��3�4bh�f?|� ]�i�Pa�'HX<Q��г�c�3���:i1hֲo�Z7�59 ��������߄�N
9�����I�<&\ݽ��2��L
-P��d�d�:��(1�xK�%��$�Z�w�(/�1|��u�pS�0:�L������Gp�~M~�&N���p��� ���w�#
j���Z����'fv)���i���d��6?� �;�bΎޙ)W�-��� ������a�P���ɀ>n�9�a��X8�f������Ԩ�l�,N"6H�s���[�hr�<�sL4o��#�SU(UaO��_@���2�P�?�}7�`���Z��L*�}1��@��{���*��\(zq�I"�D>7�G��mwK�gJ6���g܂ړ�`�;��k�x����#R��0�]�N����Ac1���%o�7��4ܽR���q���l؈���)��$�Z<m��#�9�%�G������cf�p:�����"�F��T�P���]�4���A�6J��y� ��pd
,��?��:�qvdϾ��n"G�f?��C%���|#��+�J������6-d�����=��F�]���o.eGW���A�2�m�A�Pn(�^�"��t]
�z����)�g�(��yƐQוJ��օRZ1]�-g:�a����G�����*� ��k�S�e_Rt��Қ�Լ��� _6�҈���0�b�����������p�C�P�      l      x��|�r�H�3�+�6/��Wm�Ɔ%�֖��mww�DB",`�m��+���dU�B]艍p�-[* +�N�<�E���mV��Mv��W��]����u���ӹu�LM�!�1�m��촸�g?��z�7�uUo��l���m5���ٶ)6�lYo��.њ�Sׯs���4e	��T*�K���.o�����b]%]U�:�&M�U	O�:I�	��z�۶�c�(�&�ܔ���9�%[Xe�WY/���p?�Rˌ���IQe�]�=���o��6��vv�5�e>�ğ�D�f�T"���^ee��m�������������3.���n����[7�-�z����ٮk�6Q�͍��f��)��M�a�J>�Eu�7/f��i�O��e>ð�2ۇ]�	s&�.�;ab؃m�l��|��wu�h�|�؟�w�-�BX�3Z-�����5�ɰv>��UYb�#��7z��e�#����a�-�w��\�~-o�H�rN�T����n���w;��E�ە�ڷx\�$�ly�0�0i�+I�j�v��'���x�Իr�R����z�W��o���e��Sw}�7>l���s�Щ7�}�������V���=�tS���hf�\�~]o�L�o�Y�@>Ϻ�u�������Fs�T�碵�'숵���V�&���M�h��s_g����M�M]�G�r��4��{5��#���m�U<���_��<Ye�ٲ��.n��\�R5�8z+^�q��� ����;��k_W�.�d�Ӯ�'"}�����t2�cF� S��V*��$Z�ۯ���ٛ�\�"���B����kf˦^֫��On(V%v�����,�Zr�,�Ի�����~�5~x��Z����R\כ�W`��e�a���r�]�`��ص�u��%�&��=k��j!��ŘS�9��RZ 6��f���<��]|��2y�8&�i�H<�]�k�U���v�|v���E�9)�v[�?��_���jE�t��G���x���&��u�M�������$��T
���?Uv����y��1�9�� m�'�h��Z���o��`Q.�4�-�U�KX!�C�:͖u�()�J�4V�e��@P/�#��v7�V߳j��H���庪��v?+�e�g-����-�e��(�]A(.�\���n���Sk$�,b`S�vӣ�ԅ�ی�0�|��.���4uZr$�c�b�S~ST0㬦���.�ub$�K ��ɫ�ۜ�}�{�G8�n�+�����Q�_e]@C$��o��>��k؍�ȫ�vy�l��\��C� >q,-W�k˓�a�<��ɾ-�;�3 >N�M�@���g��0�Ұ\�:�q.�!����_o�
�.ggy���v%"��~���?���Ƌ���#��w�i6�Ԇ8���&���i����|-��w�����P��c�������~�/X1��O�1��'p��-�Y�	����R�Gڒ�G���p�q(��Oͥ���2e�ӰW���:�g�?�G'?��8�d�Y�M�%%�қaۧ��b	����,~Vo��9���JH��uy3B=e��79�m�Ay��������'&�@tK
��ݪ�	���2��e	rQ���	��T����]�1�8��0iȥ��F��������������x%'���	�β�}���y�~�ؽ�Ɲ������P��ڴJ�L��9mݻjSQ��������;���.��r��)�Z�&���7k�������i��xVl�phKY�(K❒`�����?�0 �)~�P��C,<��\�(<�.� �s��IN��hw���"_�	9ٝE��<��܅v1�A���N ���~�����dt�$(�g_RU�K
�k|;{Ӂ��x?�����a/�j@;����uFh�5��{�sl�l�����V1$7��O�m��^ �6;$_���ǭ�A�)�M6���4.�ۡS���Aj�<6�JzO�_�ZhGZφ��6E{�+"8���<�C��~[�.^�co�>6�m�jX m��\��1~_�(��8.8*��M^�z��6k��"��X ���>v,�n�:���|�G�B����.�����6�:��g J���4�qZ��o^��G������on�u�6k@��ߋ��>��͆~4GQT�'y�M��!a*}���k��WumG��>
�	���( �.��b��P�r���9���8t�Z�D��z-B����Iis��s����y����p� ���p_��E��`��KD��x��}}��'��3 2������� �B�����X��磸�փs&W��ps]��FS�-j��&�ayrې�!���n�o����&+*�_��b�C�O�g8a}���I��թJ�VwE��X޿��E���y���>-����G��z���˿//��02j�<[�߁4�I�����j��z���>#LM/���f���;ݯMf�4��r��w� �n���$v��h��"G �ރ�p=�;�x �	U(���0E!��D*N>)�8	8T�����~�T�S�������ę|�����𷻮�1~$BJ��!~OH�Ac��IUV�b���c� ����0�0$T~�X0�j
�.8Ko����F�RҔx����e�)�nsp�����=j����xk%P�J)I�8��bu��?�뾠���K�Jy�q��^}k�wwD|�B	��M����\�Z��3�C�R~�����kp�)�Ʃt��y��@m���:�PR1����H3�Qx����7HbZ������ڂ�(��TMbZ��iQy
���'8 ��n���gz0vWÿ��A��uuUJT4լ������j�^�fG�KB��E������>�!�f*_���{�{{��K��ݰi�F$ �	rAN�L��$�4m;�؍g�A�:��vE��t�T��7T'�2�=�Ar2�D���..΢W�^o-FE��l�e��ۅ0(��e�N�1�3�o�T`���IT��S��
��� 1?Y����P!BRW���D�=h�8�4�|���S�D�HJ�cB:zDk�/�VjN�b�Jy�7�0�uP��v��%�c*𨯎�aC���,�Gz��SK����$U�8em*q&�t���G{W�t���:�P��qTr�����v����%�D0ى���ϲ�:����o�	 ���EV⟈Q�`�M��O�OI!d*�����8���W'~��G��:ƺ��cQ�>ˢ��UB4�_���6�2�XSf�]����&|@P��gC����w��:,$7%�)�<[<�=��U	N��;Ȕ(�P0u���������&	�_uD��Pm|��i`�ʉ/x��"&m*��������M��2�O����"�(�wG�<� <��Yf*��>Jy쉋�.`]�P�#H�K$�]�>}?9�a�^��Y��z�S�*�)[��a���2�-��O�r�,G��E�sK���wUU��'"��ET�7yu�
{3nR1����	Π/�ú�nPW �VJ�����:2��\Z�|d�A��7@p��B�4N�B�(P#39M��3I2}�xPb�o׈TLҌ���Hp1Øe�`�����<Aj�R�㓯��;$��]]f]E2���y��؟����8�B鍲05n���д��àj#}�;�����.�(�����uV�䟇z��H@��jm��ս�_���0�n��Y��?dO@1G����Q>��U�������0�%i���.q}+�SD��q(�ٓ�lb��U�ͫ���1>�A�K���fXܛ,����A~Y������4_UY ��&/Pp��n} �8-�b�qul>��W�ۂ��Xp�#>IEBa.�O���c9���8�;�ܯ=˟�|YTT*��P����n��+�<� ( z�������3�F(�V�+�]?��ظzC���z����8��\��[`�L,����q�h.��
����:t��_�kO�!2�#{����E��uʞ�Aݴ�W�f�5�9doF:ߔ��!���c�    �&n,83h@TŅ�`94R�Q�D����1�p�~J
-�i�{��%h� ��z��x!��xC	�ȑν��"�W#�>���"ӏ���,��J�&lS� �����P�A{���
fBgk�55P��G2�M��8��&�bJX��kI��L��:��i�}S7���ڏ�2* caϦ��c�]n���\��:������3���b�Bx�u�5'%5q�[н�A���FQ�t޹M����7.�ͥ
�:+�d(����7xOs*ÔӔ��A�cG��T���i�+�u��40@����$i\}벗�#�i�)��Bm�������Z��Zf�e�dgK
?�$��\M�!�#���)��G4Ѻ�e�85J7Gg��F���N���H��"&Z�$k��y��'��o�#|���(�HQ��;�D�����IC!H��6݊t��t@�uC�{�-���4�6�YT���%}�W�|h�㵘vF9n@��?�@c��yu_�{��M�u��9+ޠn���k��0
���(jI������лV�"4�Q�ʳ뺹��ڟ͓Z[�~�&e��#>��
��)үvD=6�Nf��)w�Ե��2�����އ���¤�=iؘ�$5�R�?�r�v빥�����(�Mi��zw�	����9�G\�����Tmc,M�u~ri��&AH����(�����߬}�i!%�����HX�7tz,�3K sAY[�C���Ha^�!ݞ@ܧ�8�ٻ�X1��џ��5� ��G�J|�7\��C��ڄ�7V+>�� ���帋������5<l΀3/#/N 쁮�N�iF�f������t�MP_:V�u��弉�4*j�����gk�*�>fk>-��0N|h������]��>ː� ���2�'0���	��T�s��2�$ğ�
⸬7T'����)�u/�(U9����X��T��i��TJ�ٜ��^�� �qK���s�K9��8��ڏ
g�h3��S>���)���C+}��)D��!�JKm��=K{߭�M/�#�)��An�G��M����5�.f{�bB����@Lc|�jm�uBb)����a��9mU��~��b��5��
I����H��TW�������7+�)ʵ:��6��6�bP�]�!�?��Ʃ k����`�t��u�rC�� �
�0F~�-�̀Gx+8�aDG7���7�% 6��JÑ����������~�:G��z���MP� PbZ���w�UQ��Y�r�-P~��>o�4�2�� ȉ���9q*%��3���o��0�M�;�����WwEs���rM��� �͝~���R�I_��د�H�L:z܉	���y�D[~�>���Н�4N�ל���o��y.��Sdf�m2W�&�ٹN�G��a	�A.C���q/�!�|7��ǌO%��#��h��6� '���E6u��9�2�8���	LF�7t���
��̾��|I�1(V�ߊk���#���+���!]���p�r�EmK|�f���Q�d��Q��s<�k7ҏ^q1m�?�\��Ǜ�[相87�SS�|�����e�7�ͮ���]�D/�m�;,�)�ɪ^vԿ�Vt�i3h�7<��հ �R��mN3�A�؈�"7ҿ�>�ł)CA!�R�QU"5Ӵ�D�U9�jC��1�e,�'�Dd��;� �R���T7���ds���T�k� T���e��^�>���_����+Uוn���^i`�e���L521�X
b�2����l[�~�+*H�ۮٖ�����O5{גz�"��H�xx*�dU�z�X(M�����Ny�,��rmQ����Diw����� }�G��w�����-�%N��Ļ&{Aqq����n KO���a2�O��@�G�>j%S���o�at��Z�R��|\;Β��]. L{�>)�4d��(ObZ~�CwoZ�)ؤ�U����w֒(��w�{t���d�m����s�$�:>�m���oP��&y��ߛ]q�4�Ƭ'��#�\�H��bfd\&��2�4�6�p�l��;�l�p�$uёv;j <���{O��qط�R��z��{̆z�|�S�௿q7��Z���xޏvʛw_>��М-���>,H�˽����f̏���|
oN������`�����-���C�+&�Z�K��@��^��"h����m)���=����(���A��U�>�Lh�H}��#�9���Q)��O���{Q>*���C�A�X3Z)Nצκ^趝��X�x�Oȓ��4����A�02�� �9�\���|Sik��ڒa�^�p�������F_p�s �'��TƑ=�r->P�;�����V�5���_�8�?��]XP�N�3U=�~\�w�q���qy�Z7q�`�l�ܼAP���XR����Z�XW�{�I�����ƙ.:�X�>�E��nz2O���}��}����sq�	9��i1�7ۏ��FypK�uK}���g��ٌ���K��=���d�zZT7���F�\�oX�ۍ�u*BO�[�A� ��;�=w�/�o�=ugz��7N�yu��Ji�	�_��!=M�OaqhD�|��I�S0�j�.T�͞�i���p$�91��1~@�@_A19WHЃFp��E_���S�\C�j�ѩ�o���o�/+hJ���=�i��\]%i���~��B���T]�F�p���9�N\�۪h�e�V����u^�I���,��}���E����_��r��raj'ի7r2d9Sd4W`}�؞.�>���A1�d�H�w~��=�ۄ%����4ת���U���5�(dyMڍg���X����/�Njԩ�4����݃'
T�Y����]V�R�q�HQ"�Q-�x�\�vNbSX�n��x�7UI�5X;�UC�&�{�nc�`��Q�~E�Ͽ�SQ"�_0&ط���b��A������e�lz�84Y�K�>j��Гw�S�3BX������iU�~���|��5�Pm`$���	�燆(9�
��Y�������' �b����c��S�˶Y����
����B�_�]�dť�We���|��t RR [�伦{�'3��E�)��?)F��!��ϳ_��.������f(�c���b�c�?��$��n9� D�㏈��cO��B�}@��sU�1�; ��ڍ��4w�}#�'ڍ���d���8�8@i�p���d��b�p;և7id4�!����(?-2�������c����O�'CQ�����d����I�
L�{|0�+���Dq*=6h._X֏�hͬ��P�\ʔ����zTZ��Ĝ�r��c�~]�M��h��'/Q5���Jn��O���譅&�l����h=ί��u�;��.T��4�!��/�b������_[���"ào4;��-�g�K��h@�^�;��}˖K�����$j����FhA�����Aڛ�	`���}}�?�%_W��HjP:�N�41���R3�r�����&��] -oZ��$j�K"%v�,�?��(ᕫ����W睿_�棖0'$��B�&�NX����d�H&#m�Go�:��닎�t�>�HY���#6�>�E%�.��<�N>%��?5�ɶ�͕�����'@�ht�y�T���Jq@�ߣ:^��b��9S�4Y��e6�}j|�(l�Z�P쓝Y��ǟ��A����;K��jR<_ �K��k��it���>��s߈9zs�YpV�}�E:D��TR;g7~�l�lz:�O�
�g���
uӲ'��=�9��.�e��*%<������qx�@7B%_�7�Q� ��F�C�k�z;���`����8��E���o�s6w�~��7�B���l���Q�����J:��Ǉx��&�J�( v�}�_�}�v2cF0�Ɗ_�{�_�e�� ��jZ�7ȋ�X	�:��T�bb?JL��]u���0
���ca=o E��%��9��Gǧ|���j�M�r�7�#�2���!����yN�&eڢqz��1���ç �   <i1������(3��.97�A��%�}P~KI�+.G��c�SI�}��ӏ��N Ac��ql�x?�����Z�/��B�I��'ސ�v�o��Ή:���j�0S��|n�N sR�j$�pG��/^~<9uqo�0���������p�������_��z'�      t   �   x�u�;n!D�S�vD���Ж�d��G�q ,=����`Npc{6~�>ȇ� =;'%~�^�?��A�����5��������'|y@�B��*�c��2N�Z=�owt�N�Z.�T ��2��uئ�<��	�؈FM'\={ٸ��4u]]S�Al���f)W
ڌɼ��R��(����U]���K�p����.=nk�:���A6���\,���y��"��      �   �   x���=o�0����+n��V��kI[`��r�j�8��F�ߓ��K��u��S�/q��М�l������z��!>x70:�mHāVov_BC<N�ƺ��W�$(��������=%���	�Kz�ֺV�-�%��Fc�>�'�f���JMn3Gۍ���އ��x�X���%�9ٗrW��7�%,�k���uG����Qq�s�e      z   5   x�3�4�440�30�QFF��F�F�
FV��V�z�榖&�x��b���� �      j   �  x�}�[o�6��'�b޺�](�zK�4���q�ۇ-,��RR���țM��o�o朡c���#�g����5*[�J�a�C~�d�;5����&�3fq��\�H¹k��*���[�MX�����V!ܟ�E1�$������j\�S�n��ZWʀ�z�H'	\*K����;h����+)��^�-^]A��A����J��I��j���;{�yG�o�	]B����{����;PC�Z7r����)ܐ7Ö~��l����?�;;��� �QP�%�N���1���w��b�b��QoB�2�3�!�c�m	���j0��'\Tsy�ûa���	C]*� ��H�@
���8r�0=:)/ KS���pN���>���L��`�\��~o���ڨ
��E"��,�2�p��?�8�vd8���*�dZ��y�����P�{�9��{�aF���Ͱkp��v�CےW���,�,��8J"�f;�����k�G��(6��!���7�r��Rݎ��_#���y=�X8?,W�	W���§<�>c!2N���Y�b�������u���ґ�GB*�\������☨���[���h,8��s��6U��q�C�|$E �$�1�~>F٘��W��2��HoBSB�ǒC�>4|?�"л�K���vmԞ���{��+gT����jz���[B"� I� /%�Q��ц��O��q� �/�w��rt��ˆ>f7������q�:��U�����v���[k�^g�X`�g'��ѽ;Uf��Ω��5���b��s���JS�����ͼ��sW5<�v�xS�� ��b����^���
�"h=��X���5�f�e�(E��e(��E]Fc��-�M��6Ei�5�����b�P5�����&��h�'''? �       �      x������ � �     