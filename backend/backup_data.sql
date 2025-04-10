PGDMP                       }            tienda    17.2    17.1 :    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            �           1262    77589    tienda    DATABASE     {   CREATE DATABASE tienda WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Spanish_Bolivia.1252';
    DROP DATABASE tienda;
                     postgres    false            �          0    102256    roles 
   TABLE DATA           F   COPY public.roles (id, name, description, parent_role_id) FROM stdin;
    public               postgres    false    244   ]6       �          0    102272    users 
   TABLE DATA           �   COPY public.users (id, username, password, email, first_name, last_name, address, mobile_phone, role_id, parent_user_id, created_at, status) FROM stdin;
    public               postgres    false    246   77       �          0    127178    cash_registers 
   TABLE DATA           �   COPY public.cash_registers (id, user_id, opening_amount, closing_amount, opening_date, closing_date, notes, status) FROM stdin;
    public               postgres    false    254   �:       �          0    127196    audit_cash_registers 
   TABLE DATA           k   COPY public.audit_cash_registers (id, cash_register_id, action, action_date, user_id, details) FROM stdin;
    public               postgres    false    256   q;       �          0    127304    business_types 
   TABLE DATA           2   COPY public.business_types (id, name) FROM stdin;
    public               postgres    false    266   `<       �          0    127313    business 
   TABLE DATA           |   COPY public.business (id, name, description, address, tax_id, business_type_id, status, created_at, updated_at) FROM stdin;
    public               postgres    false    268   �<       �          0    127221 
   businesses 
   TABLE DATA           l   COPY public.businesses (id, name, description, address, tax_id, created_at, updated_at, status) FROM stdin;
    public               postgres    false    258   �<       �          0    127282    business_org_chart 
   TABLE DATA           r   COPY public.business_org_chart (id, business_id, user_id, "position", parent_position_id, created_at) FROM stdin;
    public               postgres    false    264   �<       �          0    86005 
   categories 
   TABLE DATA           F   COPY public.categories (id, name, description, is_active) FROM stdin;
    public               postgres    false    228   =       �          0    77617 	   suppliers 
   TABLE DATA           z   COPY public.suppliers (id, name, contact, phone, email, company_name, tax_id, address, supplier_type, status) FROM stdin;
    public               postgres    false    220   �=       �          0    77624    products 
   TABLE DATA           �   COPY public.products (id, supplier_id, name, price, description, purchase_price, sale_price, sku, barcode, brand, unit, min_stock, max_stock, actual_stock, expiration_date, image, category_id, status, shelf_life_days, is_organic, alert_sent) FROM stdin;
    public               postgres    false    222   �A       �          0    127262    business_products 
   TABLE DATA           p   COPY public.business_products (id, business_id, product_id, custom_price, actual_stock, created_at) FROM stdin;
    public               postgres    false    262   gL       �          0    127236    business_users 
   TABLE DATA           h   COPY public.business_users (id, user_id, business_id, business_role_id, created_at, status) FROM stdin;
    public               postgres    false    260   �L       �          0    77603 	   customers 
   TABLE DATA           �   COPY public.customers (id, first_name, last_name, address, phone, company_name, tax_id, email, status, credit_balance) FROM stdin;
    public               postgres    false    218   �L       �          0    77636    cart 
   TABLE DATA           ;   COPY public.cart (id, customer_id, created_at) FROM stdin;
    public               postgres    false    224   �R       �          0    77649 
   cart_items 
   TABLE DATA           V   COPY public.cart_items (id, cart_id, product_id, quantity, price_at_time) FROM stdin;
    public               postgres    false    226   2S       �          0    102215    consignments 
   TABLE DATA           �   COPY public.consignments (id, supplier_id, start_date, end_date, total_value, sold_value, status, created_at, updated_at, user_id) FROM stdin;
    public               postgres    false    240   vS       �          0    102232    consignment_items 
   TABLE DATA           �   COPY public.consignment_items (id, consignment_id, product_id, quantity_delivered, quantity_sold, price_at_time, created_at, quantity_sent, quantity_returned) FROM stdin;
    public               postgres    false    242   T       �          0    102169    credits 
   TABLE DATA           i   COPY public.credits (id, customer_id, balance, created_at, updated_at, credit_limit, status) FROM stdin;
    public               postgres    false    234   rT       �          0    102188    supplier_debts 
   TABLE DATA           t   COPY public.supplier_debts (id, supplier_id, amount, remaining_amount, created_at, updated_at, user_id) FROM stdin;
    public               postgres    false    236   U       �          0    102202    debt_payments 
   TABLE DATA           H   COPY public.debt_payments (id, debt_id, amount, created_at) FROM stdin;
    public               postgres    false    238   �U       �          0    118979    kardex 
   TABLE DATA           �   COPY public.kardex (id, product_id, movement_type, quantity, unit_price, movement_date, reference_id, reference_type, stock_after) FROM stdin;
    public               postgres    false    250   1V       �          0    86697    mermas 
   TABLE DATA           �   COPY public.mermas (id, product_id, quantity, type, date, value, responsible_id, observations, is_automated, kardex_id) FROM stdin;
    public               postgres    false    232   lW       �          0    86494    purchase_orders 
   TABLE DATA           �   COPY public.purchase_orders (id, product_id, supplier_id, quantity, order_date, status, payment_type, total_amount, created_at) FROM stdin;
    public               postgres    false    230   �Y       �          0    118995    purchase_order_items 
   TABLE DATA           g   COPY public.purchase_order_items (id, purchase_order_id, product_id, quantity, unit_price) FROM stdin;
    public               postgres    false    252   �[       �          0    102571    transactions 
   TABLE DATA           u   COPY public.transactions (id, customer_id, user_id, amount, type, reference, created_at, notes, cart_id) FROM stdin;
    public               postgres    false    248   �[       �          0    168187    transaction_items 
   TABLE DATA           d   COPY public.transaction_items (id, transaction_id, product_id, quantity, price_at_sale) FROM stdin;
    public               postgres    false    270   {\       �           0    0    audit_cash_registers_id_seq    SEQUENCE SET     I   SELECT pg_catalog.setval('public.audit_cash_registers_id_seq', 5, true);
          public               postgres    false    255            �           0    0    business_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.business_id_seq', 1, false);
          public               postgres    false    267            �           0    0    business_org_chart_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('public.business_org_chart_id_seq', 1, false);
          public               postgres    false    263            �           0    0    business_products_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('public.business_products_id_seq', 1, false);
          public               postgres    false    261            �           0    0    business_types_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.business_types_id_seq', 4, true);
          public               postgres    false    265            �           0    0    business_users_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.business_users_id_seq', 1, false);
          public               postgres    false    259            �           0    0    businesses_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.businesses_id_seq', 1, false);
          public               postgres    false    257            �           0    0    cart_id_seq    SEQUENCE SET     9   SELECT pg_catalog.setval('public.cart_id_seq', 5, true);
          public               postgres    false    223            �           0    0    cart_items_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.cart_items_id_seq', 12, true);
          public               postgres    false    225            �           0    0    cash_registers_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.cash_registers_id_seq', 2, true);
          public               postgres    false    253            �           0    0    categories_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.categories_id_seq', 8, true);
          public               postgres    false    227            �           0    0    consignment_items_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.consignment_items_id_seq', 4, true);
          public               postgres    false    241            �           0    0    consignments_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.consignments_id_seq', 7, true);
          public               postgres    false    239            �           0    0    credits_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.credits_id_seq', 5, true);
          public               postgres    false    233            �           0    0    customers_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.customers_id_seq', 28, true);
          public               postgres    false    217            �           0    0    debt_payments_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.debt_payments_id_seq', 1, true);
          public               postgres    false    237            �           0    0    kardex_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.kardex_id_seq', 14, true);
          public               postgres    false    249            �           0    0    mermas_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.mermas_id_seq', 42, true);
          public               postgres    false    231            �           0    0    products_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.products_id_seq', 38, true);
          public               postgres    false    221            �           0    0    purchase_order_items_id_seq    SEQUENCE SET     I   SELECT pg_catalog.setval('public.purchase_order_items_id_seq', 6, true);
          public               postgres    false    251            �           0    0    purchase_orders_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.purchase_orders_id_seq', 23, true);
          public               postgres    false    229            �           0    0    roles_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.roles_id_seq', 1, false);
          public               postgres    false    243                        0    0    supplier_debts_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.supplier_debts_id_seq', 10, true);
          public               postgres    false    235                       0    0    suppliers_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.suppliers_id_seq', 12, true);
          public               postgres    false    219                       0    0    transaction_items_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('public.transaction_items_id_seq', 1, false);
          public               postgres    false    269                       0    0    transactions_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.transactions_id_seq', 13, true);
          public               postgres    false    247                       0    0    users_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.users_id_seq', 13, true);
          public               postgres    false    245            �   �   x���=o�0����+n��V��kI[`��r�j�8��F�ߓ��K��u��S�/q��М�l������z��!>x70:�mHāVov_BC<N�ƺ��W�$(��������=%���	�Kz�ֺV�-�%��Fc�>�'�f���JMn3Gۍ���އ��x�X���%�9ٗrW��7�%,�k���uG����Qq�s�e      �   �  x����n�H�ו��E3���?�H�I�!	騥���qA���m�F����f9y�)�!��H��e�$_���k.��:5�h.�(�xr��C������gy>��8�˶�]V���$�mG� Ͽ�}��Ӗ��1�L��z�$�F��6W<]�iЗ�{Sb�E<6�Ei4��Z T�׈�pL	 �{`���N"��Cy��a��r)(8�u��w,�bF�������̔9��KL��)��e������}s%5��F��;$1��"���
b��Z*����t�S��\M�+���J�sG�L9<��ʔ��1`1��!�8b����3�p� ��P�B�f�**n��wW�{��j�'�/�x�Э��-n�)���O+���˟�xvr��Ne`��X�<����V&�F{z�:ek��L�uV\�<��,�,��$j ��,�({'�q����hSZs�vS̄���X*��T2� c�ʩ���D	] �	]��]Oވ�������EU$�\���\'�Sߜ��r,Tj4�%m�GLY�����G�3�B��5��nq!q��/%l,�@���X�!'7,�Eӕ�<���ukI��ŤK���*XW�W���tܝ����ô6C�)��Ii,�n>T��s�B��$� ���_0xJ� 
#��C7X�@�ÁO�6)��E�����^�Q9���hr��]1M
�=;i6lﲾ����ݷ�,=WO3Y�'��);���}��ÑQ"�)�����x=j�	�I��R
Y~ԀB������q��w	����]˼���h��h|��#*c%ėjVΦ�f�����t�K;h�OZ�j3d���M�o��ֳ��N>�3f��������<J"��6�߽��� ��!e      �   �   x�eͱ�0��ڞ��tg�a�.�i,p�"c1E�")�~�}�H" *A�ЉEo���%q�rg�o�%I��(��YKkŌŬ[�f53�Y�K�r;J� ����3�'f�!��>���s��٬-/f��:��]��@k���65      �   �   x����m�!@�S�@�8�9w�J�T�J "d�N��J�$�ԛO���>�>N��V`V�}0�W��`ד��+K~.�e[��VG���Xx$=�8���j�{�}SZ
����n�8qN��/�^���Y�_������o��Nݵ�k*�����)����zj�qfpj2�㘓�s�)��z�Q�	�*2༾��Wޯ���xc%����r$����w�      �   ;   x�3�����,.-H-�2���L*J-�L�2�LK,�ML2M8�R�KK��JR�b���� ���      �      x������ � �      �      x������ � �      �      x������ � �      �   �   x�-�;
�0D��)t�@��u `Lp���F�؂�֬����XD�n��+���з��:�q���O��\��C�D{�AM�8�������N�(z�F�$Xd'�pُ�drI�%/B�i]��,�Ψh�����5���+J2�      �   �  x�e��n�8���O� '������t+8j�b��Mbal�vz
����/��P���H���7�1���u͖�ng4z�ĕ�Ld3g��#$I2N�/X����'��~�0s~7WW�o3�f@o��{���M���0�:���,���Fѳ�o�����3I�$��{�p��h�/˨����v��B���#6�g��Ȕm�8��%�
<�l��a3�Bm\l�]�02�Z�����0,���\y�����R1)e6�U"���TN[�J�A���k�����p�3�T�*3(Ӽ`W�b�j`�C}�a���������`�Ä]�Wl�YgV�q�'bR�r��U��+!�t4�����t}d�;�f�-9�U��l��"ɓ*Z��vF��bX��8b?����<����C�D�ѿ9�+%�ƥ��I R���{^�X�Ez��<�o��	�̋B$�A�����©�	�����8b˺��[�K?��l1R*�s� e��僋�(�2O2���
�3����ٳ����⒓
.8{f���uK���I	$�#�ܪu��"��H	�6*�}SƕH�2�${	�	�[�
Z�t�Z�( ������,�qʡ(y�;O��������E�	B�vh��뫃�N���@V4'͈ ���c�/� �߂�a����h�Y^I>
6wh��6X9ל�LKE��/�y�l(j���$�䕜�UECZ�'mk�7�#���eĎ�H���p_?��J���AQd[�g�k}N�4Tܑw�1�wrI����A�,�9ˤ`<n���2��rq?$�Ì��R�v��M���d5�\֭zU�W՟��3���=���oxP�U�����*�㇛���DW�I�Gd��Ɋ֔1�%0�wK"����nNG�)IIe9ia��z�=���Fۓ��t(�s�H��2����T0A�� ��_]�~Q����/�Vh�aU}�j���ڬi�<�kM��f��0�O-L����s��i      �   �
  x��X�r�H<�����hԊ��I�f�%�v��IXXh,������,��!M;:B�,R,$��̗�Pr\VsW�upa����Y�D�P���S�T�M�b4ܖŜp�:&Fš2����$=���OD)#�QBj��5�xvU�F�]�Ui� Y�kB51�Ȉ���e�H�E�,����2M�6���)� ^���}P��In�,���cp���X�49'�f����1��:��*I�6���^ʟg�'�g���BR��4�H�d��c��ya�<��-ҩ�9�
�������P��r�,K��*$j ՠ�=�qY$�k\0Y��i&�9۴��*.�貴�G��.�rAK�L9Mn �s�PVN��l6CI'M��w@q�8�?�T�":b����RJI�6�4�����i쓘����ۢY��C�#���qhb��U�0�����J�JǑ��Nn��.� Ǔǹ�$�p�u-��ſ���כ�n<*�?�e0^��pNC%�AZ'哫:�n���6��Ũ�!�͕2O���9ъQ��-���bLʢ�ГED*�U;�����!P�G���6OQ)��e$�<���qe�zT�eS��nB�8���X'{�K=��X��\J����[[L����^V@=IQTM@	�J����y���v�C�&�Cƶj��v��#���rP�Q�&޳w�{YiI$(�F(%Qtr�fK��cp�Ҭ�����>�)8Q�惰o6($|J��}��G�F
�ـ�0�4)��+��q(c�6�<��R|�eN$�ZE��ؕ�?��C��6/�z��آ�o�U5��w���J�+���z�Շ�i\5#Lp/'���4�/��vy?�D"���F*M�*���Q/�5LM����P<l��HC9o�j������i�{�^�*��u��: \�0�t(9�O����h��1�2ZE�����c�WL]�u�zֱT�.c,������e�.���4�O�{*uhX����@ܶ�sW	>�P1��0������̰��	Τ4�KcE�lU�����y��	5�����$�Ut+��N�ZtH�m��\o=Rk� �+��)�u�>`^)N�RTR��_$g�xI�Z�5������jd���'���+��i���e9u��KElB̂W�|.1����Rp��?��o���*p�l��Q0ƥӢS��E���~��r�f���A{�A�#�~T�m�'�F^3�191ፌB���w��|Y=�}8��!�b�$�d���vE�H�ݸ��.�+p
�_p��Ώb��؋�Μ{��ʎf�VU(�����?W_���'�C�@�$އ-�[9T�p6����� ��Wִ#̚7I�X�亲	�Z�Dߡ}�L�Vq]�3W�iY�l4����P��D���ZΎ�jv ��T����[OmR>�]�7ݘ��S��P����;�]�P�n�J��Ƕ"F�,�t�A���-�]/W�uHUg�qD~M����%c1��ƈkOj@=�=f]�bp��u��dJ�q�*�6'6�SP/����b��Q�|������ȩ��D\�����XS����;n.�>��r��.yR.v
z'�K�[V�R�r�$�w��м.����i
�]rd�F�|��;�;��H��Z��������_{9$ҏ�t�T��ҥ��Ͽ�����h$����e���f�>&?,�FQ�5��\Vi��J^���??�����FJA&��bm"!��e������� �~��&e�Gf�e���r�jp�)��~z|��ԧ���-��YS"݁	y�
t�/p���G���#���A�'���A����^��7�y����%��0*����˂Y����6h�O���{��W��7�YK���n_W����t7t{
�G����2s�@PLG~)�|��,��;��!a���\F�E^J� �KS�u�T����L��}rf���F�kG=�T�eX��yY<�ը+.��f��brt�7/H��9UT��܃5��(����>Ve*6���;�~���G��j^���^i7��)!�1�Oe���[���0?��|��׶���0&(�q}�%�N�R�.6뷐n����=������s���'$�{A���J�K�ѷ��.��Vɧ�`)��bN2�1aAv�S]�u��]���p�����5�s�`����$���;҃	q���N4ݷ�#��$]��_�́��Ӟ�.�����ΒoE��w3~�w���HR^@���#�e����گN��1��U������'�����.�m�|�(m���}����|/ʿ�nmݬ6]^��Q���:!��O0(�S��s�pbq�ԘM껗�5a�K��d��D��
��`�#7V��f'�����q����w;�}� ��PQ=Jl&�!1�R�+��E��rR��>� �QH�R!��/���b�.>_��h��E��,8һ�o��w��m�ÖvضI/��xh�q.\����o���X�D��q~m��Ք�n�GJR#@��3��>�5�?'>t�tt����@�6�E��A�>�(���_X?�?��o�[�wQ�{0��q���n�d��72�ݕ���_n��\��Q��X�>��FNN��ί�h�M�+y�P�ܰ��_����&�����XMB�f?�F#o1[����e:^M݁�� 4�+2���nh\۩(4��c�f4G>>�}�3����� v��      �      x������ � �      �      x������ � �      �     x�uV]S�8}��+�6t-�Z�,�o@���;E��������G��6M�������cs��d��X�{�9W��\�]ҧ�YOJ(�.l|h=�v������R&W\r�T�e��]��el���7t}����W�>u�wK�v�<,�·��Q�Ż��m윣_]�]$Q�}���h���*:Be�Y!�`OF	���U2�l|��T)��&����u���	C���T`�k:�]g{ҥ,j�)�t��{�gBj`�Lׅ�it�������$A�s)8m�1�n�NF��MRS@NJ]��[���H*�W��9�cO�^�UXڻ�E��N��n�	��7��î]��joC\$�;����}����]v���KȊ�Z���-�^]���(�a���Fх�������Ύ���nfYԲ�4Ml�r�˯6.��6w��K��vh�A2=*��Rcn�e�&؎�DhL3+���S�4���?�4	�cz	;AU�%�ܬ����ص�p��M�4/��輣Y���I�]7�]��=��d�R�4	Q�է��v�J^}�	��ej�4�N��E������p1��sw�������K����>:p/�Fȸ�{�T�� H3�+W��h~tMg�r��/������K:�w~��,	��%=��]�qp�cb��Ȕ2�)�����R���UB5�.94<�>�(Gšo�H��Et��[�T͞�~�T�2צ�U�%���,�����	���(���.6�Η��]����.�L�����#A���5����'�8�1��SY�H+;�}���_���V��x�k���;�ʦ��� .�X��I�����z2E����T]�4�1�S�lf�$��w�-��?w�{��AB�<�EQ�ew�Q�#�Q�lҌq� ]!Z��"y�R�@��ַ����ςAʡ��N]�שbk�W�4��`v��0�����{7���)�j_��P*pyUtd��`�v����&\^�R�8���!���:��:��N��U4]�����u.��ݡ��U���\*U���9jZ_�7�#n`7G��-o:�&(�پick}J��Hs�+$�̌��!/MI�!����|��ss��eZ#��"�u���-�t�_ߢ�S�uM��ؙ��lҍ7����J�n@������?�~����W#˂�7�����EgwQ9���s�����F�g�d�������ޒ�J䥬��;���Rj�Gl�oBzM���>���p6	˕�w�b^�$I��l_�ٿ�}!Z��f��^
`@�l�51oWXx����y�}J�i��0��>p�n��^s�Ot�Fu�M������&��)��WY]�X�0���%@���Vj�K)Yກބ�4�V����wV��R�8�T����H��Wtx4�c����Ep�ɂ�{=����ɖ��l�?��8���7_N�����������!F?`m�IS�g��Y�"�P����-��Ï-Q����>��̗w����Q�!�_���o1���/��ehUur�64!`��"��ɔ�y	H��q-}��S~��[|�߽{�'��)<      �   V   x�]���0�3T�����C-鿎��(���-ޝ�G���8*���!�@9*�rrj
��9���0����c^���e�6�MU3r      �   4   x�3�4�44 FFzF�\ >����pY��f�Ɯz�\1z\\\ �N�      �   �   x���1
�0Eg��@�"}Ɏ�ҥ�
�jz�z(�d���}�%$�Il�����SXÓ�H�����/��Z�T]�4
��0`AT�Ns���|��Rl�{��b��;.�����9�{m��>�Y^E�1c�>�*�,�sO]�����c�      �   H   x�u���0��34J�����sP��k\ �Y ����Q>�e��t[�fá=���S�3��ŝ� �q\      �   �   x�}�M
�@�יS�/�d��	���FAą��]h��Y���'�N`��#��6���V,�7���ym1sOf�>���4�Dq��T*W�Xb�Η��=�e*�D�Ʈ��r��C�]FB�8��f��3�=4�~���rt���.M���C�i��|�J�      �   �   x�}�˭1 Ϧ�4��@�`���w��Jd	�a�`�-^��>�ğ�O�p;�2�o;"�19��b�/�n��@g���IZ�E�|�(X6
��uk�fj
�K>!�8z4z�Ȋ��&�e*��M���~B9���|�ă�-�5MSO�zAͧ�j)��K��,�*�2~�i�U�h����JLq #� � �k�      �   1   x��Y  �oHax�"d�gBR
�2���`���=;���~�}?      �   +  x���_N�0Ɵ�Sp�E��I�	&�jTb�PW$�=)�����"�����������mH7���j����Z��۰{����ix����H�5h*�y0A� ������^�C��$ 0��������1�jM��cV��35�5�
�T� �c�[�(�~��("�SUjZxjy?�!����^+��e���^�c�z1h��v�r�N_`D����\�;��U!B8'd�Nd�̕��h �hM��!$Ȳ�d"�����F��C�D�ׅp;Ԑ3����C?: �D�@��      �   G  x�m�Mn�0���Sp�,L��vIZt��@�t�+1	IT�#��M��3�b}����-�y��(RI��o=8RBU{�������.Hу�u4��Ƈآ�?����{��e�UK}0�q�{v���1�.Iո�?ؿ`U��[޵�|=Ln�q����WT��dCNQJ.�5z3'��zf����TC�Ig����j������=Аp��z��ol��0�j@EW�N�}0��m���"h}Tݒl�l5�#��<���'����48�^w[P���0L���h�lԁ��ٌ��6�I��,��J���H�)��=t�l��9�`�gC˖�Jpѡ���w�z�ܐ��Q8P,���Ë��l��QO0��Dz����2�8O��R�\�%���&�Gh�»k[V���a�U]��yٹw,!��d�g��
S��yn�r!!�V���uy����w�9�S��^@�B�2��C��n��v�"�h6$�g��8���{e���ۿ
�%��V�E_�RI�kL�覷_��z2��œ�_��fv�=�˥�W��tw�����y�1�ƍv���"�r��w��}�)�      �   �  x���Mn�0���)r��C�=A6E,�5h|���ڒ,��� =~Λ'%P�� �#�#�JUr���B�m���%<�|��$�E��U��K�@,�TK�K(3+�����o[1U�:d�ʅ�w:O�s2h��i��*%�\�?��KUɔۧ���~�p9p��gX����^��[�{�Va������yo��nS	u�9�9���T�9J*�?J�A4H�6qIM�bK��M'�ԭO���q��'�#ƽ	zx����{:M��6�_��i>���y\���)ȲWR1W�>�<,w)���@�lu5b��O��@ŵ�T@G���J)����
	{c+���
����6y"��{��L�^d���>6�ۮv=�U��Wgo����^�*�K�r�4��vAd���ΙȬ��)��������_�Q�|�21нZ���1��Fw      �   @   x�E��  C�s;Y���z���姁H�cY%��fZ:'bwGZ9��kK_��=F��f�      �   �   x�m�1
�0��+���ӝ�R�>/pcD��"�8���q��v�3,@�@"�-y���6�l�~��������&��4�f��:t��: �LcX�h���~x�5����ܴ��<����	|HFsr�Q���0'��Y�ܒB�,!      �      x������ � �     