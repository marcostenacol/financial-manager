---
name: sql-optimizer
description: >
  Otimiza consultas SQL complexas utilizando CTEs (Common Table Expressions) para PostgreSQL. Ative esta skill quando houver problemas de performance em listagens ou queries lentas no backend.
---

# Skill: Otimizador de SQL (CTEs)

Esta skill fornece instruções para transformar consultas Eloquent complexas em consultas de alta performance no PostgreSQL usando Common Table Expressions (CTEs).

## 🧐 Quando Usar
- Quando uma listagem envolve mais de 2 JOINs.
- Quando há necessidade de cálculos agregados (`count`, `sum`) em listagens paginadas.
- Quando o tempo de resposta da API exceder 200ms.

## 🛠️ Instruções de Execução

1.  **Analise a Query Atual**: Identifique os gargalos usando `EXPLAIN ANALYZE` (via psql).
2.  **Estruture a CTE**:
    - Mova os filtros principais para a primeira CTE.
    - Realize agregações em sub-CTEs isoladas.
    - Faça o JOIN final apenas com os dados necessários para o Resource.
3.  **Implementação no Repository**:
    - Use `DB::select` ou `fromRaw`.
    - Garanta a tipagem do retorno.

## 📝 Exemplo de Padrão
```sql
WITH filtered_tasks AS (
    SELECT id, title, user_id FROM task.tasks WHERE last_status_id = ?
),
user_data AS (
    SELECT id, name FROM admin.users WHERE id IN (SELECT user_id FROM filtered_tasks)
)
SELECT ft.*, ud.name as user_name FROM filtered_tasks ft JOIN user_data ud ON ft.user_id = ud.id;
```

---
> [!TIP]
> CTEs tornam o código SQL muito mais legível e fácil de debugar do que subqueries aninhadas.
