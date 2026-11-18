# OPEN_QUESTIONS — Preguntas pendientes

**Versión:** 1.1 — 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA

---

## Hechos verificados

- Sin cliente piloto confirmado.
- Red Enlace / FactuBo / Payments no están en este repo (decisión: repos independientes).
- Residuos de naming en código: `eGrocery System`, posibles strings `Super Tienda` / `CodeMedia`.
- Offline, WordPress y multicaja aprobados a nivel de intención; faltan precisiones operativas.

---

## Decisiones aprobadas (ya no son preguntas)

- Marca: **CODEMEDIIA**, **SuperTienda**, presentación **SuperTienda by CODEMEDIIA**.
- No renombrar automáticamente IDs técnicos/repos/paquetes.
- Payments, FactuBo, Alicia, Analytics, menús = proyectos independientes.
- No implementar Red Enlace dentro de SuperTienda.
- Prisma Migrate en P1; primer paquete de código P0–P3 cuando se apruebe implementación.
- Plugin WordPress fuera del MVP.

---

## Recomendaciones técnicas

Defaults mientras no haya respuesta:

| Tema | Default |
|------|---------|
| Vertical demo | Minimarket/abarrotes genérico |
| Pedidos online en primer corte | Diferir; foco POS + catálogo + stock |
| Offline vs primer cobro | Online E2E (P0–P3) primero; offline P5 en release comercial siguiente |
| Sucursales | Solo `Business` hasta Empresarial |
| Conflictos stock offline | Aceptar venta con `clientOperationId`; ajustar con auditoría |
| PWA | Evaluar en P5; no app nativa aún |
| Copy UI | Corregir a SuperTienda/CODEMEDIIA al tocar pantallas |

---

## Decisiones pendientes

### Bloqueantes para iniciar código Fase 1 (P0–P3)

1. **Aprobación explícita** de CODEMEDIIA para implementar (este paquete documental no autoriza código).
2. Vertical de demo/piloto prioritario.
3. ¿Hosting/despliegue del entorno de desarrollo compartido (quién administra la IP histórica del rewrite)?

### Bloqueantes de ecosistema (no bloquean P0–P3)

4. Estado real onboarding Red Enlace (equipo Payments).
5. ¿FactuBo ya tiene API o se diseña desde cero? Modalidad SIN del piloto.
6. Nombres de repos Git para Payments / FactuBo / Alicia.

### Diferibles (Fase 1 en curso)

7. ¿Offline bloquea el primer release vendible?
8. PWA vs Capacitor.
9. ¿Cuándo modelar `Branch`?
10. Política fina de conflictos offline.
11. ¿Import CSV / variantes / pedidos online antes del piloto?
12. Límites concretos Emprendedor/Negocios/Empresarial.
13. Realtime del auxiliar QR.
14. Workspaces monorepo.
15. Retención de datos / privacidad del piloto.
16. Key management JWT/RSA entre entornos.
17. Motivo histórico de mounts legacy comentados (para no repetir el patrón).

---

## Próximo paso sugerido

Aprobar [`PHASE_1_IMPLEMENTATION_PLAN.md`](./PHASE_1_IMPLEMENTATION_PLAN.md) y autorizar implementación empezando por **P0 seguridad/tenancy** + **P1 Prisma Migrate**.
