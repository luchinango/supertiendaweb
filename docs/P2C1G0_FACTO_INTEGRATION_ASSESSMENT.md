# P2-C1.G0 — Evaluación Facto / integración SIAT (diseño)

**Fecha:** 17 de noviembre de 2026  
**Alcance:** Evaluación + diseño de integración futura  
**No incluye:** SOAP SIAT embebido en SuperTienda, deploy, emisión real, migraciones

Documento hermano: [`P2C1G0_PILOT_READINESS_REPORT.md`](./P2C1G0_PILOT_READINESS_REPORT.md)

---

## 1. Resumen ejecutivo

| Pregunta | Respuesta |
|----------|-----------|
| ¿ST debe hablar SOAP/SIAT? | **No.** Facto (FactuBO) es el emisor. |
| ¿Piloto comercial ST usa Facto? | **No.** Tickets = comprobante comercial no fiscal. |
| Modalidad recomendada | **Factura computarizada en línea** (hash SIAT; sin certificado en POS). |
| Integración futura | API ST → API Facto (HTTP). Cuerpo mínimo + mapeo comercial. |
| Riesgo principal | Confundir `commercialNumber` (COM-…) con `numeroFactura` SIAT. |

---

## 2. Qué es Facto en este ecosistema

- Repo de referencia: `C:\Proyectos\Facto` (FactuBO).
- Rol: **emisor fiscal** hacia SIAT (Bolivia).
- SuperTienda: **POS comercial** (caja, stock, outbox, PWA, IVA comercial aditivo).
- Estrategia ya documentada en el ecosistema: no fusionar el stack SOAP/firma en el POS; integrar por API cuando el negocio lo pida.

### Modalidades SIAT (orientación)

| Modalidad | Firma / hash | Adecuado para POS web |
|-----------|--------------|------------------------|
| Computarizada en línea | Hash / protocolo SIAT vía Facto | **Sí (preferida)** |
| Electrónica en línea | Certificado / firma digital | Más fricción operativa; no meta en piloto |

**Recomendación G0:** diseñar contra **computarizada**. Electrónica solo si el cliente lo exige y Facto ya la opera de punta a punta.

---

## 3. Hallazgos Facto (API / huecos)

Basado en auditoría del código Facto y notas de integración previas (sin ejecutar SIAT):

| Área | Estado observado | Impacto ST |
|------|------------------|------------|
| Emitir factura | Endpoint de emisión; body de piloto tiende a campos acotados (`puntoVentaId`, `numeroFactura`, `cafc`, …) | ST debe mapear venta → payload Facto, no inventar SOAP |
| Montos | En escenarios piloto pueden aparecer montos hardcodeados / incompletos | **Bloqueante** hasta que Facto acepte montos/líneas reales de ST |
| Anulación | Sin anulación REST clara en superficie revisada | ST no debe “anular fiscal” solo en POS; proceso Facto/SIAT aparte |
| Idempotencia | Emisión sin clave de idempotencia evidente | Riesgo de doble factura si se reintenta el mismo saleId |
| Numeración | `numeroFactura` SIAT ≠ `commercialNumber` ST | Mantener ambos; nunca reutilizar COM- como N° fiscal |

Cualquier cifra concreta de rutas/campos debe revalidarse en el commit Facto vigente **antes** de implementar el cliente ST.

---

## 4. Diseño de integración (futuro)

### 4.1 Principios

1. **ST no incluye** clientes SOAP, CUIS/CUFD, ni certificados.
2. **Un saleId ST → como máximo una emisión fiscal** (idempotency-key = `saleId` o `commercialNumber` + `companyId`).
3. El ticket POS sigue siendo **no fiscal** hasta que Facto confirme emisión OK.
4. Fallo Facto/SIAT **no** debe revertir stock/caja comercial automáticamente sin política explícita.

### 4.2 Flujo propuesto

```
[POS] SALE_CREATE (comercial) → stock + cash + commercialNumber
        │
        ▼ (opcional, post-piloto)
[ST Backend] FiscalDispatchJob / endpoint admin
        │  POST /api/facto/emit { saleId, puntoVentaId, … }
        ▼
[Facto] valida CUIS/CUFD / punto de venta → SIAT
        │
        ▼
[ST] guarda FiscalDocument { saleId, numeroFactura, cuf, estado, pdfUrl? }
[POS] UI: “Facturado” vs “Solo comprobante comercial”
```

### 4.3 Contrato mínimo sugerido (ST → Facto)

| Campo ST | Destino Facto (conceptual) |
|----------|----------------------------|
| `companyId` / config | Tenant / NIT / sucursal Facto |
| `saleId` | Idempotency / referencia externa |
| `commercialNumber` | Solo auditoría; **no** como numeroFactura |
| líneas + totales (net + IVA aditivo F3) | Detalle / montos factura |
| cliente (NIT/CI/nombre) | Datos comprador |
| `puntoVentaId` / `cafc` | Config Facto, no hardcode en FE |

Respuesta esperada: `numeroFactura`, `cuf`/`cufd`, estado SIAT, URL PDF si aplica.

### 4.4 Modelo de datos ST (borrador; **no migrar en G0**)

```
FiscalEmission {
  id, companyId, saleId (unique),
  provider: 'FACTO',
  status: PENDING | SENT | ACCEPTED | REJECTED | VOID_PENDING | VOIDED,
  numeroFactura?, cuf?, rawResponse?,
  createdAt, updatedAt
}
```

### 4.5 Anulación / notas

- Anulación fiscal = operación Facto/SIAT, no “delete sale” en POS.
- Devoluciones comerciales ST pueden existir sin anulación fiscal; políticas deben separarse.

---

## 5. IVA comercial vs IVA fiscal

| Concepto | SuperTienda (hoy) | Facto / SIAT |
|----------|-------------------|--------------|
| Base | Precio neto + IVA **aditivo** en totales F3 | Base imponible / leyenda fiscal según modalidad |
| Ticket | “COMPROBANTE NO FISCAL” | Factura con N° y CUF |
| Autoridad | Ninguna | SIAT |

Regla: **no** copiar ciegamente el string del ticket POS al XML/JSON fiscal. El mapeo de alícuotas y códigos de producto debe vivir en Facto + catálogo fiscal, no solo en `taxRate` comercial del POS.

---

## 6. Checklist previo a cualquier integración real

- [ ] Facto acepta montos/líneas dinámicas (no hardcode de piloto)  
- [ ] Idempotencia de emisión por `saleId`  
- [ ] Estrategia de anulación documentada  
- [ ] Credenciales / punto de venta por `companyId`  
- [ ] Ambiente homologación SIAT (nunca producción fiscal en lab ST)  
- [ ] Build FE producción ST validado (ver informe piloto)  
- [ ] Capacitación: ticket COM ≠ factura  

---

## 7. Decisión G0

| Tema | Decisión |
|------|----------|
| Emisión en piloto comercial ST | **Fuera de alcance** |
| Modalidad a diseñar | Computarizada vía Facto |
| SOAP en repo ST | **Prohibido** en esta fase |
| Próximo trabajo de producto | Cerrar NO-GO de build/PWA prod; luego épica “Fiscal bridge” separada |

**No hay GO fiscal.** Solo diseño listo para una épica posterior.
