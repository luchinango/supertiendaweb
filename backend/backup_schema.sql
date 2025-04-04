PGDMP  )                     }            tienda    17.2    17.1 �               0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false                       0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false                       0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false                       1262    77589    tienda    DATABASE     {   CREATE DATABASE tienda WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Spanish_Bolivia.1252';
    DROP DATABASE tienda;
                     postgres    false                       1255    93990    update_timestamp()    FUNCTION     �   CREATE FUNCTION public.update_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;
 )   DROP FUNCTION public.update_timestamp();
       public               postgres    false                        1259    127196    audit_cash_registers    TABLE       CREATE TABLE public.audit_cash_registers (
    id integer NOT NULL,
    cash_register_id integer NOT NULL,
    action character varying(50) NOT NULL,
    action_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_id integer NOT NULL,
    details text
);
 (   DROP TABLE public.audit_cash_registers;
       public         heap r       postgres    false            �            1259    127195    audit_cash_registers_id_seq    SEQUENCE     �   CREATE SEQUENCE public.audit_cash_registers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 2   DROP SEQUENCE public.audit_cash_registers_id_seq;
       public               postgres    false    256            	           0    0    audit_cash_registers_id_seq    SEQUENCE OWNED BY     [   ALTER SEQUENCE public.audit_cash_registers_id_seq OWNED BY public.audit_cash_registers.id;
          public               postgres    false    255                       1259    127313    business    TABLE     �  CREATE TABLE public.business (
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
    DROP TABLE public.business;
       public         heap r       postgres    false                       1259    127312    business_id_seq    SEQUENCE     �   CREATE SEQUENCE public.business_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.business_id_seq;
       public               postgres    false    268            
           0    0    business_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.business_id_seq OWNED BY public.business.id;
          public               postgres    false    267                       1259    127282    business_org_chart    TABLE       CREATE TABLE public.business_org_chart (
    id integer NOT NULL,
    business_id integer NOT NULL,
    user_id integer NOT NULL,
    "position" character varying(100) NOT NULL,
    parent_position_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
 &   DROP TABLE public.business_org_chart;
       public         heap r       postgres    false                       1259    127281    business_org_chart_id_seq    SEQUENCE     �   ALTER TABLE public.business_org_chart ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.business_org_chart_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public               postgres    false    264                       1259    127262    business_products    TABLE       CREATE TABLE public.business_products (
    id integer NOT NULL,
    business_id integer NOT NULL,
    product_id integer NOT NULL,
    custom_price numeric(10,2),
    actual_stock integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
 %   DROP TABLE public.business_products;
       public         heap r       postgres    false                       1259    127261    business_products_id_seq    SEQUENCE     �   ALTER TABLE public.business_products ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.business_products_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public               postgres    false    262            
           1259    127304    business_types    TABLE     i   CREATE TABLE public.business_types (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);
 "   DROP TABLE public.business_types;
       public         heap r       postgres    false            	           1259    127303    business_types_id_seq    SEQUENCE     �   CREATE SEQUENCE public.business_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.business_types_id_seq;
       public               postgres    false    266                       0    0    business_types_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.business_types_id_seq OWNED BY public.business_types.id;
          public               postgres    false    265                       1259    127236    business_users    TABLE     �  CREATE TABLE public.business_users (
    id integer NOT NULL,
    user_id integer NOT NULL,
    business_id integer NOT NULL,
    business_role_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    CONSTRAINT business_users_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[])))
);
 "   DROP TABLE public.business_users;
       public         heap r       postgres    false                       1259    127235    business_users_id_seq    SEQUENCE     �   ALTER TABLE public.business_users ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.business_users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public               postgres    false    260                       1259    127221 
   businesses    TABLE        CREATE TABLE public.businesses (
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
    DROP TABLE public.businesses;
       public         heap r       postgres    false                       1259    127220    businesses_id_seq    SEQUENCE     �   ALTER TABLE public.businesses ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.businesses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public               postgres    false    258            �            1259    77636    cart    TABLE     �   CREATE TABLE public.cart (
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
       public               postgres    false    224                       0    0    cart_id_seq    SEQUENCE OWNED BY     ;   ALTER SEQUENCE public.cart_id_seq OWNED BY public.cart.id;
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
       public               postgres    false    226                       0    0    cart_items_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.cart_items_id_seq OWNED BY public.cart_items.id;
          public               postgres    false    225            �            1259    127178    cash_registers    TABLE     4  CREATE TABLE public.cash_registers (
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
 "   DROP TABLE public.cash_registers;
       public         heap r       postgres    false            �            1259    127177    cash_registers_id_seq    SEQUENCE     �   CREATE SEQUENCE public.cash_registers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.cash_registers_id_seq;
       public               postgres    false    254                       0    0    cash_registers_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.cash_registers_id_seq OWNED BY public.cash_registers.id;
          public               postgres    false    253            �            1259    86005 
   categories    TABLE     �   CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL
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
       public               postgres    false    228                       0    0    categories_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;
          public               postgres    false    227            �            1259    102232    consignment_items    TABLE     �  CREATE TABLE public.consignment_items (
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
 %   DROP TABLE public.consignment_items;
       public         heap r       postgres    false            �            1259    102231    consignment_items_id_seq    SEQUENCE     �   CREATE SEQUENCE public.consignment_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.consignment_items_id_seq;
       public               postgres    false    242                       0    0    consignment_items_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public.consignment_items_id_seq OWNED BY public.consignment_items.id;
          public               postgres    false    241            �            1259    102215    consignments    TABLE     �  CREATE TABLE public.consignments (
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
     DROP TABLE public.consignments;
       public         heap r       postgres    false            �            1259    102214    consignments_id_seq    SEQUENCE     �   CREATE SEQUENCE public.consignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.consignments_id_seq;
       public               postgres    false    240                       0    0    consignments_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE public.consignments_id_seq OWNED BY public.consignments.id;
          public               postgres    false    239            �            1259    102169    credits    TABLE     Q  CREATE TABLE public.credits (
    id integer NOT NULL,
    customer_id integer,
    balance numeric(10,2) DEFAULT 0.00 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    credit_limit numeric(10,0),
    status character varying(30)
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
       public               postgres    false    234                       0    0    credits_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.credits_id_seq OWNED BY public.credits.id;
          public               postgres    false    233            �            1259    77603 	   customers    TABLE       CREATE TABLE public.customers (
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
    DROP TABLE public.customers;
       public         heap r       postgres    false            �            1259    77602    customers_id_seq    SEQUENCE     �   CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.customers_id_seq;
       public               postgres    false    218                       0    0    customers_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;
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
       public               postgres    false    238                       0    0    debt_payments_id_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE public.debt_payments_id_seq OWNED BY public.debt_payments.id;
          public               postgres    false    237            �            1259    118979    kardex    TABLE     �  CREATE TABLE public.kardex (
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
    DROP TABLE public.kardex;
       public         heap r       postgres    false            �            1259    118978    kardex_id_seq    SEQUENCE     �   CREATE SEQUENCE public.kardex_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.kardex_id_seq;
       public               postgres    false    250                       0    0    kardex_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.kardex_id_seq OWNED BY public.kardex.id;
          public               postgres    false    249            �            1259    86697    mermas    TABLE       CREATE TABLE public.mermas (
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
    CONSTRAINT mermas_type_check CHECK (((type)::text = ANY ((ARRAY['vendido'::character varying, 'dañado'::character varying, 'perdido'::character varying, 'vencido'::character varying])::text[])))
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
       public               postgres    false    232                       0    0    mermas_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.mermas_id_seq OWNED BY public.mermas.id;
          public               postgres    false    231            �            1259    77624    products    TABLE     �  CREATE TABLE public.products (
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
    DROP TABLE public.products;
       public         heap r       postgres    false            �            1259    77623    products_id_seq    SEQUENCE     �   CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.products_id_seq;
       public               postgres    false    222                       0    0    products_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;
          public               postgres    false    221            �            1259    118995    purchase_order_items    TABLE     {  CREATE TABLE public.purchase_order_items (
    id integer NOT NULL,
    purchase_order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    CONSTRAINT purchase_order_items_quantity_check CHECK ((quantity > 0)),
    CONSTRAINT purchase_order_items_unit_price_check CHECK ((unit_price >= (0)::numeric))
);
 (   DROP TABLE public.purchase_order_items;
       public         heap r       postgres    false            �            1259    118994    purchase_order_items_id_seq    SEQUENCE     �   CREATE SEQUENCE public.purchase_order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 2   DROP SEQUENCE public.purchase_order_items_id_seq;
       public               postgres    false    252                       0    0    purchase_order_items_id_seq    SEQUENCE OWNED BY     [   ALTER SEQUENCE public.purchase_order_items_id_seq OWNED BY public.purchase_order_items.id;
          public               postgres    false    251            �            1259    86494    purchase_orders    TABLE     �  CREATE TABLE public.purchase_orders (
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
 #   DROP TABLE public.purchase_orders;
       public         heap r       postgres    false            �            1259    86493    purchase_orders_id_seq    SEQUENCE     �   CREATE SEQUENCE public.purchase_orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.purchase_orders_id_seq;
       public               postgres    false    230                       0    0    purchase_orders_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public.purchase_orders_id_seq OWNED BY public.purchase_orders.id;
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
       public               postgres    false    244                       0    0    roles_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;
          public               postgres    false    243            �            1259    102188    supplier_debts    TABLE     A  CREATE TABLE public.supplier_debts (
    id integer NOT NULL,
    supplier_id integer,
    amount numeric(10,2) NOT NULL,
    remaining_amount numeric(10,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_id integer
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
       public               postgres    false    236                       0    0    supplier_debts_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.supplier_debts_id_seq OWNED BY public.supplier_debts.id;
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
       public               postgres    false    220                       0    0    suppliers_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.suppliers_id_seq OWNED BY public.suppliers.id;
          public               postgres    false    219                       1259    168187    transaction_items    TABLE     �   CREATE TABLE public.transaction_items (
    id integer NOT NULL,
    transaction_id integer,
    product_id integer,
    quantity integer NOT NULL,
    price_at_sale numeric NOT NULL
);
 %   DROP TABLE public.transaction_items;
       public         heap r       postgres    false                       1259    168186    transaction_items_id_seq    SEQUENCE     �   CREATE SEQUENCE public.transaction_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.transaction_items_id_seq;
       public               postgres    false    270                       0    0    transaction_items_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public.transaction_items_id_seq OWNED BY public.transaction_items.id;
          public               postgres    false    269            �            1259    102571    transactions    TABLE     �  CREATE TABLE public.transactions (
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
     DROP TABLE public.transactions;
       public         heap r       postgres    false            �            1259    102570    transactions_id_seq    SEQUENCE     �   CREATE SEQUENCE public.transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.transactions_id_seq;
       public               postgres    false    248                       0    0    transactions_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;
          public               postgres    false    247            �            1259    102272    users    TABLE     ,  CREATE TABLE public.users (
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
    DROP TABLE public.users;
       public         heap r       postgres    false            �            1259    102271    users_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public               postgres    false    246                       0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
          public               postgres    false    245            �           2604    176390    audit_cash_registers id    DEFAULT     �   ALTER TABLE ONLY public.audit_cash_registers ALTER COLUMN id SET DEFAULT nextval('public.audit_cash_registers_id_seq'::regclass);
 F   ALTER TABLE public.audit_cash_registers ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    255    256    256            �           2604    176391    business id    DEFAULT     j   ALTER TABLE ONLY public.business ALTER COLUMN id SET DEFAULT nextval('public.business_id_seq'::regclass);
 :   ALTER TABLE public.business ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    267    268    268            �           2604    176392    business_types id    DEFAULT     v   ALTER TABLE ONLY public.business_types ALTER COLUMN id SET DEFAULT nextval('public.business_types_id_seq'::regclass);
 @   ALTER TABLE public.business_types ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    265    266    266            �           2604    176393    cart id    DEFAULT     b   ALTER TABLE ONLY public.cart ALTER COLUMN id SET DEFAULT nextval('public.cart_id_seq'::regclass);
 6   ALTER TABLE public.cart ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    224    223    224            �           2604    176394    cart_items id    DEFAULT     n   ALTER TABLE ONLY public.cart_items ALTER COLUMN id SET DEFAULT nextval('public.cart_items_id_seq'::regclass);
 <   ALTER TABLE public.cart_items ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    225    226    226            �           2604    176395    cash_registers id    DEFAULT     v   ALTER TABLE ONLY public.cash_registers ALTER COLUMN id SET DEFAULT nextval('public.cash_registers_id_seq'::regclass);
 @   ALTER TABLE public.cash_registers ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    254    253    254            �           2604    176396    categories id    DEFAULT     n   ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);
 <   ALTER TABLE public.categories ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    227    228    228            �           2604    176397    consignment_items id    DEFAULT     |   ALTER TABLE ONLY public.consignment_items ALTER COLUMN id SET DEFAULT nextval('public.consignment_items_id_seq'::regclass);
 C   ALTER TABLE public.consignment_items ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    242    241    242            �           2604    176398    consignments id    DEFAULT     r   ALTER TABLE ONLY public.consignments ALTER COLUMN id SET DEFAULT nextval('public.consignments_id_seq'::regclass);
 >   ALTER TABLE public.consignments ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    240    239    240            �           2604    176399 
   credits id    DEFAULT     h   ALTER TABLE ONLY public.credits ALTER COLUMN id SET DEFAULT nextval('public.credits_id_seq'::regclass);
 9   ALTER TABLE public.credits ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    233    234    234            �           2604    176400    customers id    DEFAULT     l   ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);
 ;   ALTER TABLE public.customers ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    218    217    218            �           2604    176401    debt_payments id    DEFAULT     t   ALTER TABLE ONLY public.debt_payments ALTER COLUMN id SET DEFAULT nextval('public.debt_payments_id_seq'::regclass);
 ?   ALTER TABLE public.debt_payments ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    238    237    238            �           2604    176402 	   kardex id    DEFAULT     f   ALTER TABLE ONLY public.kardex ALTER COLUMN id SET DEFAULT nextval('public.kardex_id_seq'::regclass);
 8   ALTER TABLE public.kardex ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    249    250    250            �           2604    176403 	   mermas id    DEFAULT     f   ALTER TABLE ONLY public.mermas ALTER COLUMN id SET DEFAULT nextval('public.mermas_id_seq'::regclass);
 8   ALTER TABLE public.mermas ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    232    231    232            �           2604    176404    products id    DEFAULT     j   ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);
 :   ALTER TABLE public.products ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    222    221    222            �           2604    176405    purchase_order_items id    DEFAULT     �   ALTER TABLE ONLY public.purchase_order_items ALTER COLUMN id SET DEFAULT nextval('public.purchase_order_items_id_seq'::regclass);
 F   ALTER TABLE public.purchase_order_items ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    252    251    252            �           2604    176406    purchase_orders id    DEFAULT     x   ALTER TABLE ONLY public.purchase_orders ALTER COLUMN id SET DEFAULT nextval('public.purchase_orders_id_seq'::regclass);
 A   ALTER TABLE public.purchase_orders ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    229    230    230            �           2604    176407    roles id    DEFAULT     d   ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);
 7   ALTER TABLE public.roles ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    244    243    244            �           2604    176408    supplier_debts id    DEFAULT     v   ALTER TABLE ONLY public.supplier_debts ALTER COLUMN id SET DEFAULT nextval('public.supplier_debts_id_seq'::regclass);
 @   ALTER TABLE public.supplier_debts ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    235    236    236            �           2604    176409    suppliers id    DEFAULT     l   ALTER TABLE ONLY public.suppliers ALTER COLUMN id SET DEFAULT nextval('public.suppliers_id_seq'::regclass);
 ;   ALTER TABLE public.suppliers ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    219    220    220            �           2604    176410    transaction_items id    DEFAULT     |   ALTER TABLE ONLY public.transaction_items ALTER COLUMN id SET DEFAULT nextval('public.transaction_items_id_seq'::regclass);
 C   ALTER TABLE public.transaction_items ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    270    269    270            �           2604    176411    transactions id    DEFAULT     r   ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);
 >   ALTER TABLE public.transactions ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    248    247    248            �           2604    176412    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    245    246    246            2           2606    127204 .   audit_cash_registers audit_cash_registers_pkey 
   CONSTRAINT     l   ALTER TABLE ONLY public.audit_cash_registers
    ADD CONSTRAINT audit_cash_registers_pkey PRIMARY KEY (id);
 X   ALTER TABLE ONLY public.audit_cash_registers DROP CONSTRAINT audit_cash_registers_pkey;
       public                 postgres    false    256            @           2606    127287 *   business_org_chart business_org_chart_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public.business_org_chart
    ADD CONSTRAINT business_org_chart_pkey PRIMARY KEY (id);
 T   ALTER TABLE ONLY public.business_org_chart DROP CONSTRAINT business_org_chart_pkey;
       public                 postgres    false    264            F           2606    127323    business business_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.business
    ADD CONSTRAINT business_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.business DROP CONSTRAINT business_pkey;
       public                 postgres    false    268            <           2606    127268 (   business_products business_products_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public.business_products
    ADD CONSTRAINT business_products_pkey PRIMARY KEY (id);
 R   ALTER TABLE ONLY public.business_products DROP CONSTRAINT business_products_pkey;
       public                 postgres    false    262            >           2606    127270 *   business_products business_products_unique 
   CONSTRAINT     x   ALTER TABLE ONLY public.business_products
    ADD CONSTRAINT business_products_unique UNIQUE (business_id, product_id);
 T   ALTER TABLE ONLY public.business_products DROP CONSTRAINT business_products_unique;
       public                 postgres    false    262    262            B           2606    127311 &   business_types business_types_name_key 
   CONSTRAINT     a   ALTER TABLE ONLY public.business_types
    ADD CONSTRAINT business_types_name_key UNIQUE (name);
 P   ALTER TABLE ONLY public.business_types DROP CONSTRAINT business_types_name_key;
       public                 postgres    false    266            D           2606    127309 "   business_types business_types_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public.business_types
    ADD CONSTRAINT business_types_pkey PRIMARY KEY (id);
 L   ALTER TABLE ONLY public.business_types DROP CONSTRAINT business_types_pkey;
       public                 postgres    false    266            8           2606    127243 "   business_users business_users_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public.business_users
    ADD CONSTRAINT business_users_pkey PRIMARY KEY (id);
 L   ALTER TABLE ONLY public.business_users DROP CONSTRAINT business_users_pkey;
       public                 postgres    false    260            :           2606    127245 $   business_users business_users_unique 
   CONSTRAINT     o   ALTER TABLE ONLY public.business_users
    ADD CONSTRAINT business_users_unique UNIQUE (user_id, business_id);
 N   ALTER TABLE ONLY public.business_users DROP CONSTRAINT business_users_unique;
       public                 postgres    false    260    260            4           2606    127231    businesses businesses_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.businesses DROP CONSTRAINT businesses_pkey;
       public                 postgres    false    258            6           2606    127233     businesses businesses_tax_id_key 
   CONSTRAINT     ]   ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_tax_id_key UNIQUE (tax_id);
 J   ALTER TABLE ONLY public.businesses DROP CONSTRAINT businesses_tax_id_key;
       public                 postgres    false    258            
           2606    77654    cart_items cart_items_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.cart_items DROP CONSTRAINT cart_items_pkey;
       public                 postgres    false    226                       2606    77642    cart cart_pkey 
   CONSTRAINT     L   ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_pkey PRIMARY KEY (id);
 8   ALTER TABLE ONLY public.cart DROP CONSTRAINT cart_pkey;
       public                 postgres    false    224            0           2606    127186 "   cash_registers cash_registers_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public.cash_registers
    ADD CONSTRAINT cash_registers_pkey PRIMARY KEY (id);
 L   ALTER TABLE ONLY public.cash_registers DROP CONSTRAINT cash_registers_pkey;
       public                 postgres    false    254                       2606    86014    categories categories_name_key 
   CONSTRAINT     Y   ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);
 H   ALTER TABLE ONLY public.categories DROP CONSTRAINT categories_name_key;
       public                 postgres    false    228                       2606    86012    categories categories_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.categories DROP CONSTRAINT categories_pkey;
       public                 postgres    false    228                       2606    102239 (   consignment_items consignment_items_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public.consignment_items
    ADD CONSTRAINT consignment_items_pkey PRIMARY KEY (id);
 R   ALTER TABLE ONLY public.consignment_items DROP CONSTRAINT consignment_items_pkey;
       public                 postgres    false    242                       2606    102225    consignments consignments_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.consignments
    ADD CONSTRAINT consignments_pkey PRIMARY KEY (id);
 H   ALTER TABLE ONLY public.consignments DROP CONSTRAINT consignments_pkey;
       public                 postgres    false    240                       2606    102179    credits credits_customer_id_key 
   CONSTRAINT     a   ALTER TABLE ONLY public.credits
    ADD CONSTRAINT credits_customer_id_key UNIQUE (customer_id);
 I   ALTER TABLE ONLY public.credits DROP CONSTRAINT credits_customer_id_key;
       public                 postgres    false    234                       2606    102177    credits credits_pkey 
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
       public                 postgres    false    218                       2606    102208     debt_payments debt_payments_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.debt_payments
    ADD CONSTRAINT debt_payments_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.debt_payments DROP CONSTRAINT debt_payments_pkey;
       public                 postgres    false    238            ,           2606    118988    kardex kardex_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.kardex
    ADD CONSTRAINT kardex_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.kardex DROP CONSTRAINT kardex_pkey;
       public                 postgres    false    250                       2606    86705    mermas mermas_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.mermas
    ADD CONSTRAINT mermas_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.mermas DROP CONSTRAINT mermas_pkey;
       public                 postgres    false    232                       2606    85787    products products_barcode_key 
   CONSTRAINT     [   ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_barcode_key UNIQUE (barcode);
 G   ALTER TABLE ONLY public.products DROP CONSTRAINT products_barcode_key;
       public                 postgres    false    222                       2606    77629    products products_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.products DROP CONSTRAINT products_pkey;
       public                 postgres    false    222            .           2606    119002 .   purchase_order_items purchase_order_items_pkey 
   CONSTRAINT     l   ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_pkey PRIMARY KEY (id);
 X   ALTER TABLE ONLY public.purchase_order_items DROP CONSTRAINT purchase_order_items_pkey;
       public                 postgres    false    252                       2606    86501 $   purchase_orders purchase_orders_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);
 N   ALTER TABLE ONLY public.purchase_orders DROP CONSTRAINT purchase_orders_pkey;
       public                 postgres    false    230                        2606    102265    roles roles_name_key 
   CONSTRAINT     O   ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);
 >   ALTER TABLE ONLY public.roles DROP CONSTRAINT roles_name_key;
       public                 postgres    false    244            "           2606    102263    roles roles_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.roles DROP CONSTRAINT roles_pkey;
       public                 postgres    false    244                       2606    102195 "   supplier_debts supplier_debts_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public.supplier_debts
    ADD CONSTRAINT supplier_debts_pkey PRIMARY KEY (id);
 L   ALTER TABLE ONLY public.supplier_debts DROP CONSTRAINT supplier_debts_pkey;
       public                 postgres    false    236                        2606    77622    suppliers suppliers_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.suppliers DROP CONSTRAINT suppliers_pkey;
       public                 postgres    false    220                       2606    85797    suppliers suppliers_tax_id_key 
   CONSTRAINT     [   ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_tax_id_key UNIQUE (tax_id);
 H   ALTER TABLE ONLY public.suppliers DROP CONSTRAINT suppliers_tax_id_key;
       public                 postgres    false    220            H           2606    168194 (   transaction_items transaction_items_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public.transaction_items
    ADD CONSTRAINT transaction_items_pkey PRIMARY KEY (id);
 R   ALTER TABLE ONLY public.transaction_items DROP CONSTRAINT transaction_items_pkey;
       public                 postgres    false    270            *           2606    102580    transactions transactions_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);
 H   ALTER TABLE ONLY public.transactions DROP CONSTRAINT transactions_pkey;
       public                 postgres    false    248            $           2606    102284    users users_email_key 
   CONSTRAINT     Q   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
 ?   ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key;
       public                 postgres    false    246            &           2606    102280    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public                 postgres    false    246            (           2606    102282    users users_username_key 
   CONSTRAINT     W   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);
 B   ALTER TABLE ONLY public.users DROP CONSTRAINT users_username_key;
       public                 postgres    false    246            q           2620    127234 &   businesses update_businesses_timestamp    TRIGGER     �   CREATE TRIGGER update_businesses_timestamp BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
 ?   DROP TRIGGER update_businesses_timestamp ON public.businesses;
       public               postgres    false    271    258            p           2620    102251 *   consignments update_consignments_timestamp    TRIGGER     �   CREATE TRIGGER update_consignments_timestamp BEFORE UPDATE ON public.consignments FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
 C   DROP TRIGGER update_consignments_timestamp ON public.consignments;
       public               postgres    false    240    271            n           2620    102185     credits update_credits_timestamp    TRIGGER     �   CREATE TRIGGER update_credits_timestamp BEFORE UPDATE ON public.credits FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
 9   DROP TRIGGER update_credits_timestamp ON public.credits;
       public               postgres    false    271    234            o           2620    102250 .   supplier_debts update_supplier_debts_timestamp    TRIGGER     �   CREATE TRIGGER update_supplier_debts_timestamp BEFORE UPDATE ON public.supplier_debts FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
 G   DROP TRIGGER update_supplier_debts_timestamp ON public.supplier_debts;
       public               postgres    false    271    236            a           2606    127205 ?   audit_cash_registers audit_cash_registers_cash_register_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.audit_cash_registers
    ADD CONSTRAINT audit_cash_registers_cash_register_id_fkey FOREIGN KEY (cash_register_id) REFERENCES public.cash_registers(id);
 i   ALTER TABLE ONLY public.audit_cash_registers DROP CONSTRAINT audit_cash_registers_cash_register_id_fkey;
       public               postgres    false    256    254    4912            b           2606    127210 6   audit_cash_registers audit_cash_registers_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.audit_cash_registers
    ADD CONSTRAINT audit_cash_registers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
 `   ALTER TABLE ONLY public.audit_cash_registers DROP CONSTRAINT audit_cash_registers_user_id_fkey;
       public               postgres    false    4902    246    256            k           2606    127324 '   business business_business_type_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.business
    ADD CONSTRAINT business_business_type_id_fkey FOREIGN KEY (business_type_id) REFERENCES public.business_types(id);
 Q   ALTER TABLE ONLY public.business DROP CONSTRAINT business_business_type_id_fkey;
       public               postgres    false    4932    268    266            h           2606    127288 6   business_org_chart business_org_chart_business_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.business_org_chart
    ADD CONSTRAINT business_org_chart_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE;
 `   ALTER TABLE ONLY public.business_org_chart DROP CONSTRAINT business_org_chart_business_id_fkey;
       public               postgres    false    258    264    4916            i           2606    127298 =   business_org_chart business_org_chart_parent_position_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.business_org_chart
    ADD CONSTRAINT business_org_chart_parent_position_id_fkey FOREIGN KEY (parent_position_id) REFERENCES public.business_org_chart(id) ON DELETE SET NULL;
 g   ALTER TABLE ONLY public.business_org_chart DROP CONSTRAINT business_org_chart_parent_position_id_fkey;
       public               postgres    false    264    4928    264            j           2606    127293 2   business_org_chart business_org_chart_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.business_org_chart
    ADD CONSTRAINT business_org_chart_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 \   ALTER TABLE ONLY public.business_org_chart DROP CONSTRAINT business_org_chart_user_id_fkey;
       public               postgres    false    264    4902    246            f           2606    127271 4   business_products business_products_business_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.business_products
    ADD CONSTRAINT business_products_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE;
 ^   ALTER TABLE ONLY public.business_products DROP CONSTRAINT business_products_business_id_fkey;
       public               postgres    false    4916    258    262            g           2606    127276 3   business_products business_products_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.business_products
    ADD CONSTRAINT business_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
 ]   ALTER TABLE ONLY public.business_products DROP CONSTRAINT business_products_product_id_fkey;
       public               postgres    false    262    222    4870            c           2606    127251 .   business_users business_users_business_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.business_users
    ADD CONSTRAINT business_users_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE;
 X   ALTER TABLE ONLY public.business_users DROP CONSTRAINT business_users_business_id_fkey;
       public               postgres    false    4916    260    258            d           2606    127256 3   business_users business_users_business_role_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.business_users
    ADD CONSTRAINT business_users_business_role_id_fkey FOREIGN KEY (business_role_id) REFERENCES public.roles(id);
 ]   ALTER TABLE ONLY public.business_users DROP CONSTRAINT business_users_business_role_id_fkey;
       public               postgres    false    4898    244    260            e           2606    127246 *   business_users business_users_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.business_users
    ADD CONSTRAINT business_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 T   ALTER TABLE ONLY public.business_users DROP CONSTRAINT business_users_user_id_fkey;
       public               postgres    false    260    4902    246            K           2606    77643    cart cart_customer_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);
 D   ALTER TABLE ONLY public.cart DROP CONSTRAINT cart_customer_id_fkey;
       public               postgres    false    224    4860    218            L           2606    77655 "   cart_items cart_items_cart_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.cart(id);
 L   ALTER TABLE ONLY public.cart_items DROP CONSTRAINT cart_items_cart_id_fkey;
       public               postgres    false    224    226    4872            M           2606    77660 %   cart_items cart_items_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);
 O   ALTER TABLE ONLY public.cart_items DROP CONSTRAINT cart_items_product_id_fkey;
       public               postgres    false    222    226    4870            `           2606    127187 *   cash_registers cash_registers_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cash_registers
    ADD CONSTRAINT cash_registers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
 T   ALTER TABLE ONLY public.cash_registers DROP CONSTRAINT cash_registers_user_id_fkey;
       public               postgres    false    246    254    4902            W           2606    102240 7   consignment_items consignment_items_consignment_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.consignment_items
    ADD CONSTRAINT consignment_items_consignment_id_fkey FOREIGN KEY (consignment_id) REFERENCES public.consignments(id);
 a   ALTER TABLE ONLY public.consignment_items DROP CONSTRAINT consignment_items_consignment_id_fkey;
       public               postgres    false    242    240    4892            X           2606    102245 3   consignment_items consignment_items_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.consignment_items
    ADD CONSTRAINT consignment_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);
 ]   ALTER TABLE ONLY public.consignment_items DROP CONSTRAINT consignment_items_product_id_fkey;
       public               postgres    false    222    4870    242            U           2606    102226 *   consignments consignments_supplier_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.consignments
    ADD CONSTRAINT consignments_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);
 T   ALTER TABLE ONLY public.consignments DROP CONSTRAINT consignments_supplier_id_fkey;
       public               postgres    false    240    4864    220            V           2606    102600 &   consignments consignments_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.consignments
    ADD CONSTRAINT consignments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
 P   ALTER TABLE ONLY public.consignments DROP CONSTRAINT consignments_user_id_fkey;
       public               postgres    false    246    4902    240            Q           2606    102180     credits credits_customer_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.credits
    ADD CONSTRAINT credits_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);
 J   ALTER TABLE ONLY public.credits DROP CONSTRAINT credits_customer_id_fkey;
       public               postgres    false    234    218    4860            T           2606    102209 (   debt_payments debt_payments_debt_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.debt_payments
    ADD CONSTRAINT debt_payments_debt_id_fkey FOREIGN KEY (debt_id) REFERENCES public.supplier_debts(id);
 R   ALTER TABLE ONLY public.debt_payments DROP CONSTRAINT debt_payments_debt_id_fkey;
       public               postgres    false    238    236    4888            ]           2606    118989    kardex kardex_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.kardex
    ADD CONSTRAINT kardex_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
 G   ALTER TABLE ONLY public.kardex DROP CONSTRAINT kardex_product_id_fkey;
       public               postgres    false    250    4870    222            P           2606    86706    mermas mermas_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.mermas
    ADD CONSTRAINT mermas_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);
 G   ALTER TABLE ONLY public.mermas DROP CONSTRAINT mermas_product_id_fkey;
       public               postgres    false    222    232    4870            I           2606    86015 "   products products_category_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);
 L   ALTER TABLE ONLY public.products DROP CONSTRAINT products_category_id_fkey;
       public               postgres    false    228    222    4878            J           2606    77630 "   products products_supplier_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);
 L   ALTER TABLE ONLY public.products DROP CONSTRAINT products_supplier_id_fkey;
       public               postgres    false    4864    220    222            ^           2606    119008 9   purchase_order_items purchase_order_items_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;
 c   ALTER TABLE ONLY public.purchase_order_items DROP CONSTRAINT purchase_order_items_product_id_fkey;
       public               postgres    false    252    222    4870            _           2606    119003 @   purchase_order_items purchase_order_items_purchase_order_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE;
 j   ALTER TABLE ONLY public.purchase_order_items DROP CONSTRAINT purchase_order_items_purchase_order_id_fkey;
       public               postgres    false    230    252    4880            N           2606    86502 /   purchase_orders purchase_orders_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);
 Y   ALTER TABLE ONLY public.purchase_orders DROP CONSTRAINT purchase_orders_product_id_fkey;
       public               postgres    false    222    4870    230            O           2606    86507 0   purchase_orders purchase_orders_supplier_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);
 Z   ALTER TABLE ONLY public.purchase_orders DROP CONSTRAINT purchase_orders_supplier_id_fkey;
       public               postgres    false    230    220    4864            R           2606    102196 .   supplier_debts supplier_debts_supplier_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.supplier_debts
    ADD CONSTRAINT supplier_debts_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);
 X   ALTER TABLE ONLY public.supplier_debts DROP CONSTRAINT supplier_debts_supplier_id_fkey;
       public               postgres    false    236    220    4864            S           2606    102594 *   supplier_debts supplier_debts_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.supplier_debts
    ADD CONSTRAINT supplier_debts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
 T   ALTER TABLE ONLY public.supplier_debts DROP CONSTRAINT supplier_debts_user_id_fkey;
       public               postgres    false    236    4902    246            l           2606    168200 3   transaction_items transaction_items_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.transaction_items
    ADD CONSTRAINT transaction_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);
 ]   ALTER TABLE ONLY public.transaction_items DROP CONSTRAINT transaction_items_product_id_fkey;
       public               postgres    false    222    270    4870            m           2606    168195 7   transaction_items transaction_items_transaction_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.transaction_items
    ADD CONSTRAINT transaction_items_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id);
 a   ALTER TABLE ONLY public.transaction_items DROP CONSTRAINT transaction_items_transaction_id_fkey;
       public               postgres    false    270    248    4906            Z           2606    127172 '   transactions transactions_carrt_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_carrt_id_fkey FOREIGN KEY (cart_id) REFERENCES public.cart(id);
 Q   ALTER TABLE ONLY public.transactions DROP CONSTRAINT transactions_carrt_id_fkey;
       public               postgres    false    248    224    4872            [           2606    102581 *   transactions transactions_customer_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);
 T   ALTER TABLE ONLY public.transactions DROP CONSTRAINT transactions_customer_id_fkey;
       public               postgres    false    248    4860    218            \           2606    102586 &   transactions transactions_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
 P   ALTER TABLE ONLY public.transactions DROP CONSTRAINT transactions_user_id_fkey;
       public               postgres    false    4902    246    248            Y           2606    102285    users users_role_id_fkey    FK CONSTRAINT     w   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);
 B   ALTER TABLE ONLY public.users DROP CONSTRAINT users_role_id_fkey;
       public               postgres    false    244    246    4898           