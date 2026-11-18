# P2-C1.G2 — Piloto DEMO supervisado (producción local)

**Fecha:** 17 de noviembre de 2026  
**Entorno:** Docker `supertienda_dev` + FE `supertienda-fe-prod-local:g2` en `127.0.0.1:3001`  
**Dev FE:** `:3000` sin mezclar `.next`  
**Dinero real / FactuBO / SIAT / commit / deploy:** **no**

---

## Veredicto

### **GO** para la siguiente etapa (piloto DEMO ampliado / endurecimiento de campo)

Problemas operativos G1 cerrados en lab: **COM visible en POS**, **login con redirect estable**, **login malformado → HTTP 400**, flujo vendedor online/offline y multiempresa validados en navegador real sobre `next start`.

---

## 1. Correcciones realizadas

| Problema G1 | Causa | Fix |
|-------------|-------|-----|
| COM en DB pero no en lista POS | Tras sync, `listPendingLocalSales` quitaba la venta y **no había UI de confirmadas** | `listRecentConfirmedLocalSales` + bloque «Últimas confirmadas» + mensaje con COM; ticket vía «Ver ticket» |
| Redirect post-login intermitente | Soft `router.push` a veces dejaba `/login` pese a tokens | `router.replace` + fallback `window.location.assign` si sigue en `/login`; respeta `?redirect=` |
| Login `{}` → HTTP **500** | `ValidateError` de TSOA no manejado (prototype/`instanceof`) | `errorHandler` trata `ValidateError` / `name==='ValidateError'` → **400**; `AuthController` usa `ValidationError` |
| CORS `:3001` | Solo `:3000` en allowlist | `app.ts` incluye `127.0.0.1:3001` / `localhost:3001`; compose `CORS_ORIGIN` |
| Impresión 80/58 | Solo CSS genérico | Toggle **80 mm / 58 mm** en `PosReceipt` + `data-paper-mm` en print CSS |

Archivos tocados (entre otros):  
`frontend/app/ventas/page.tsx`, `frontend/lib/pos/posSaleOfflineService.ts`, `frontend/hooks/useAuth.ts`, `frontend/app/(auth)/login/page.tsx`, `frontend/components/features/pos/PosReceipt.tsx`, `frontend/styles/globals.css`, `backend/src/middlewares/errorHandler.ts`, `backend/src/controllers/AuthController.ts`, `backend/src/app.ts`.

---

## 2. Pruebas del vendedor (PASS real, Chromium host → `:3001`)

| Paso | Resultado | Evidencia |
|------|-----------|-----------|
| Login → dashboard | **PASS real** | URL `…/dashboard` (ya no queda en `/login`) |
| Sync catálogo + abrir caja | **PASS real** | 4 productos; `OPEN ·` |
| Cobro online + ticket COM | **PASS real** | Receipt + `COM-00000006`; lista confirmadas |
| Vista 58 mm / 80 mm | **PASS real** | `data-paper-mm=58` → `80` |
| Leyenda no fiscal | **PASS real** | `COMPROBANTE NO FISCAL` |
| Venta offline LOCAL | **PASS real** | Provisional / LOCAL |
| Sync → COM en lista | **PASS real** | «Últimas confirmadas (2)» + `COM-00000007…` |
| Cierre caja (gate) | **PASS real** | Botón evaluado; sin pendientes tras sync |

---

## 3. Pruebas multiempresa (PASS real)

| Escenario | Resultado | Evidencia |
|-----------|-----------|-----------|
| `admin_a` ve Aceite Empresa A | **PASS real** | Catálogo A |
| Logout → `admin_b` | **PASS real** | Bruno AdminB |
| B no ve Aceite A / SKU-A | **PASS real** | Body B sin leak A; sí Arroz compartido |
| Lista confirmadas B vacía (otro scope) | **PASS real** | Sin COM de A |
| Volver a A | **PASS real** | Ada AdminA |

**Nota:** Un check de persistencia de COM al volver a A falló en el harness porque el script de logout de prueba hizo `localStorage.clear()` (nuevo `deviceId`). El logout de producto **no** borra IndexedDB ni `supertienda_device_id`. No se usó borrado de IDB para simular aislamiento.

---

## 4. Ventas online / offline

| Flujo | Resultado |
|-------|-----------|
| Online → COM + ticket | **PASS real** |
| Offline → LOCAL → sync → COM en «Últimas confirmadas» | **PASS real** |
| Sin duplicar venta para “arreglar” UI | Cumplido (misma `LocalSale` / outbox) |

---

## 5. Sincronización

| Ítem | Resultado |
|------|-----------|
| `applyPushResults` → `confirmed` + `commercialNumber` | **PASS unitario** (+ lista reciente) |
| UI post-sync muestra COM | **PASS real** |
| Reconexión anuncia confirmadas | **PASS código** (mensaje + refresh lista) |

---

## 6. Impresión

| Ítem | Resultado |
|------|-----------|
| Preview ticket LOCAL / COM | **PASS real** (COM en corrida; LOCAL en offline) |
| Toggle 80 mm / 58 mm | **PASS real** |
| Hardware térmico | **PENDIENTE** |

---

## 7. Regresiones

| Suite | Resultado |
|-------|-----------|
| B2-A HTTP | **16/16 PASS** |
| B2-B HTTP | **5/5 PASS** |
| F1 cash lease HTTP | **11/11 PASS** |
| Sync P2-C0.1 HTTP | **24/25** — 1 FAIL ambiental: seed stocks ids 1–4 alterados por ventas del piloto DEMO (no reset) |
| FE `test:offline` | **56/56 PASS** |
| `tsc` FE / BE | **PASS** |
| Login `{}` / sin username | **PASS real** HTTP **400** |

---

## 8. Pendientes

1. Impresora física 80/58 mm.  
2. Re-seed / normalizar stocks DEMO si se re-ejecuta la aserción Sync S25.  
3. Capacitación: no usar `localStorage.clear()` en soporte (rompe scope de dispositivo).  
4. FactuBO/SIAT: fuera de alcance.

---

## 9. GO/NO-GO siguiente etapa

| Criterio | Estado |
|----------|--------|
| COM visible tras sync en POS prod local | **PASS real** |
| Login + redirect en `next start` | **PASS real** |
| Login inválido ≠ 500 | **PASS real** (400) |
| Multiempresa sin leak A→B | **PASS real** |
| Flujo vendedor online/offline | **PASS real** |
| Regresiones motor | **PASS** (salvo S25 ambiental) |

### Veredicto: **GO**

Siguiente etapa sugerida: piloto DEMO con impresora física + procedimiento de cierre de día; integración Facto sigue NO-GO fiscal.

Sin commit, push ni deploy en esta fase.
