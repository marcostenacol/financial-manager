# Documentação de Modelagem de Dados - Referência API Modular

Este documento descreve a arquitetura de banco de dados recomendada, detalhando os schemas, tabelas, relacionamentos e lógicas embarcadas (funções e triggers). O sistema utiliza **PostgreSQL** com uma organização modular baseada em schemas para separação de domínios.

---

## 📂 Sugestão de Schemas

A organização por schemas facilita a gestão de permissões, backups e clareza do modelo:

1.  **`admin`**: Gestão de usuários, permissões (ACL), sessões e configurações globais.
2.  **`core`**: Cadastro de entidades principais (Pessoas, Produtos, Empresas conforme o domínio).
3.  **`organizational`**: Estrutura institucional (unidades, departamentos), colaboradores e funções.
4.  **`operation`**: Registro das principais operações transacionais do sistema.
5.  **`process`**: Motor de workflow dinâmico (processos, procedimentos e situações).
6.  **`forms`**: Questionários e formulários dinâmicos.
7.  **`public`**: Tabelas de utilidade geral (endereços, tokens de acesso, logs globais).

---

## 🔑 Domínio: Administração (`admin`)

Responsável pela segurança e parametrização do sistema.

| Tabela | Descrição |
| :--- | :--- |
| `users` | Credenciais de acesso, vinculadas a uma entidade principal. |
| `roles` | Papéis do sistema (ex: Admin, Operador). |
| `permissions` | Permissões granulares de acesso. |
| `role_has_permissions` | Pivot de permissões por papel. |
| `settings` | Chaves de configuração global. |

---

## 🛠️ Inteligência no Banco (PL/pgSQL & Triggers)

Esta arquitetura delega lógicas críticas para o PostgreSQL para garantir performance e integridade:

1.  **Autenticação**:
    - `admin.process_login`: Realiza a validação de hash e geração de token em uma única transação atômica.
    - `admin.get_session_data`: Recupera todo o contexto do usuário (permissões, grupos) em uma única chamada.

2.  **Busca Otimizada**:
    - **Triggers**: Utilizar triggers para manter colunas de busca textual (`tsvector` ou strings normalizadas) sempre atualizadas nas tabelas principais.

3.  **Sincronização de Estado**:
    - Usar triggers para manter colunas de "último estado" sincronizadas com tabelas de histórico, evitando JOINs custosos em listagens de alta volumetria.

---

## 📊 Views Otimizadas

| Camada | Finalidade |
| :--- | :--- |
| **Search Views** | Listagens otimizadas para componentes de autocomplete e busca rápida. |
| **Reporting Views** | Consolidam dados complexos para dashboards e relatórios, desacoplando a lógica de visualização da escrita. |

---
> [!TIP]
> O uso de Schemas permite que o `search_path` do PostgreSQL seja configurado para facilitar queries curtas sem perder a organização lógica forte.
