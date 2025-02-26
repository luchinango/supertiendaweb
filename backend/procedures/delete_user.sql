CREATE OR REPLACE PROCEDURE delete_supplier(p_supplier_id INTEGER)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Verificar si el proveedor existe
    IF NOT EXISTS (SELECT 1 FROM suppliers WHERE id = p_supplier_id) THEN
        RAISE EXCEPTION 'El proveedor con ID % no existe.', p_supplier_id;
    ELSIF EXISTS (SELECT 1 FROM suppliers WHERE id = p_supplier_id AND status = 'inactive') THEN
        RAISE NOTICE 'El proveedor con ID % ya está inactivo.', p_supplier_id;
        RETURN;
    END IF;

    -- Actualizar el status a 'inactive'
    UPDATE suppliers
    SET status = 'inactive'
    WHERE id = p_supplier_id;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE EXCEPTION 'Error al intentar desactivar el proveedor con ID %: %', p_supplier_id, SQLERRM;
END;
$$;