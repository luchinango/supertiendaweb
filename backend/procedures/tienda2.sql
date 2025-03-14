PGDMP      7                }            tienda    17.2    17.1 m    i           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            j           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            k           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            l           1262    77589    tienda    DATABASE     {   CREATE DATABASE tienda WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Spanish_Bolivia.1252';
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
       public               postgres    false    224            m           0    0    cart_id_seq    SEQUENCE OWNED BY     ;   ALTER SEQUENCE public.cart_id_seq OWNED BY public.cart.id;
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
       public               postgres    false    226            n           0    0    cart_items_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.cart_items_id_seq OWNED BY public.cart_items.id;
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
       public               postgres    false    228            o           0    0    categories_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;
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
       public               postgres    false    242            p           0    0    consignment_items_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public.consignment_items_id_seq OWNED BY public.consignment_items.id;
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
       public               postgres    false    240            q           0    0    consignments_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE public.consignments_id_seq OWNED BY public.consignments.id;
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
       public               postgres    false    234            r           0    0    credits_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.credits_id_seq OWNED BY public.credits.id;
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
       public               postgres    false    218            s           0    0    customers_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;
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
       public               postgres    false    238            t           0    0    debt_payments_id_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE public.debt_payments_id_seq OWNED BY public.debt_payments.id;
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
       public               postgres    false    232            u           0    0    mermas_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.mermas_id_seq OWNED BY public.mermas.id;
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
       public               postgres    false    222            v           0    0    products_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;
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
       public               postgres    false    230            w           0    0    purchase_orders_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public.purchase_orders_id_seq OWNED BY public.purchase_orders.id;
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
       public               postgres    false    244            x           0    0    roles_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;
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
       public               postgres    false    236            y           0    0    supplier_debts_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.supplier_debts_id_seq OWNED BY public.supplier_debts.id;
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
       public               postgres    false    220            z           0    0    suppliers_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.suppliers_id_seq OWNED BY public.suppliers.id;
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
       public               postgres    false    246            {           0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
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
       public               postgres    false    246    245    246            �           2606    77654    cart_items cart_items_pkey 
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
       public               postgres    false    244    4795    246           