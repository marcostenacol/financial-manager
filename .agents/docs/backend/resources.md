# Camada de Resource

Os Resources (API Resources) são responsáveis pela **Transformação de Dados**. Eles atuam como uma camada de apresentação entre os modelos/objetos do sistema e o JSON final entregue pela API.

## 1. Conceito e Utilização
O Resource isola a estrutura interna do banco de dados da interface pública da API. Utilizamos `JsonResource` para garantir que mudanças no banco (nomes de colunas, por exemplo) não quebrem o contrato com o frontend sem uma alteração explícita no Resource.

---

## 2. Responsabilidades (O que FAZER) ✅
1.  **Herança**: Estender sempre `Illuminate\Http\Resources\Json\JsonResource`.
2.  **Mapeamento Explícito**: Definir cada chave do array de retorno manualmente.
3.  **Padronização de Listas (Combos)**: Para listagens simples (usadas em Selects/Combos), retornar obrigatoriamente apenas as chaves `id` e `name`.
4.  **Tratamento de Nulos**: Utilizar o operador null-safe (`?? null`) para campos opcionais.
5.  **Nomenclatura**:
    - Listagens: `List + Entidade + Resource` (ex: `ListSexResource`).
    - Detalhes: `Show + Entidade + Resource` ou `Entidade + Resource` (ex: `PersonResource`).

---

## 3. Proibições (O que NÃO FAZER) ❌
1.  **Regra de Negócio**: Jamais inclua cálculos complexos ou validações de permissão no Resource.
2.  **Queries de Banco**: O Resource nunca deve realizar consultas (evite `Model::find()` ou chamadas a Repositories).
3.  **Encadeamento N+1**: Tome cuidado ao acessar relações (`$this->relation`). Garanta que o Service/Repository já tenha carregado os dados via `eager loading`.
4.  **Retorno Direto do Model**: Nunca faça `return $this->resource->toArray()`. Isso expõe campos sensíveis como `password` ou `deleted_at`.

---

## 4. Diretrizes para IA (Prompting/Agentic) 🤖
Ao criar ou revisar um Resource, verifique:
- Se campos de data estão sendo formatados adequadamente (se necessário no frontend).
- Se chaves estrangeiras (`_id`) estão sendo transformadas em nomes amigáveis quando o contexto é detalhamento.
- Se o padrão "id, name" para listagens está sendo rigorosamente seguido.

---

## 5. Exemplo de Implementação: Listagem (Enxuta)

Obrigatoriamente enxuto para máxima performance e economia de banda.

```php
namespace App\Packages\Domain\Module\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ListEntityResource extends JsonResource
{
    /**
     * @param Request $request
     * @return array
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
        ];
    }
}
```

---

## 6. Exemplo de Implementação: Detalhamento (Show)

Pode conter objetos aninhados e transformações de tipos.

```php
namespace App\Packages\Domain\Module\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EntityResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'status' => [
                'is_active' => (bool) $this->active,
                'label' => $this->active ? 'Ativo' : 'Inativo'
            ],
            // Relações já carregadas (Eager Loading)
            'related' => [
                'id' => $this->related->id ?? null,
                'name' => $this->related->name ?? null
            ]
        ];
    }
}
```

---

## 7. Boas Práticas
- **Collections**: Use `ListEntityResource::collection($data)` nos Services para retornar listas de objetos transformados.
- **Campos Opcionais**: Use `$this->when($this->relationLoaded('relation'), ...)` para incluir dados apenas quando explicitamente solicitados/carregados.
