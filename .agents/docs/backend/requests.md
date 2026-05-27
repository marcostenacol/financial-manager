# Camada de Request

As **Form Requests** são responsáveis pela **Validação e Autorização** de dados de entrada. Elas garantem que apenas dados válidos e seguros cheguem aos Controllers e Services.

## 1. Conceito e Utilização
Utilizamos Form Requests customizadas para cada endpoint de escrita (`POST`, `PUT`, `PATCH`) ou busca complexa. Isso mantém os Controllers limpos e centraliza as regras de integridade dos dados.

---

## 2. Responsabilidades (O que FAZER) ✅
1.  **Herança**: Estender sempre `Illuminate\Foundation\Http\FormRequest`.
2.  **Trait de Resposta**: Usar obrigatoriamente a trait `App\Base\Traits\Response`.
3.  **Falha de Validação**: Sobrescrever o método `failedValidation` para retornar `self::failedValidationResponse($validator)`. Isso garante que erros de validação sigam o padrão JSON do projeto.
4.  **Regras Claras**: Definir regras de validação no método `rules()`.
5.  **Atributos Amigáveis**: Definir nomes legíveis para os campos no método `attributes()`, facilitando mensagens de erro para o usuário final.
6.  **Localização**: Devem ser criadas dentro da pasta `Requests` de cada Package/Módulo.

---

## 3. Proibições (O que NÃO FAZER) ❌
1.  **Regra de Negócio Complexa**: Não inclua lógica de negócio pesada. Se a validação exige consultar vários schemas ou regras complexas, considere mover para um Service ou Custom Rule.
2.  **Modificação de Dados**: O Request serve para validar, não para transformar dados (como mascarar strings ou converter tipos). Isso é papel do Service.
3.  **Persistência**: Jamais realize operações de `INSERT`, `UPDATE` ou `DELETE` dentro de um Request.

---

## 4. Diretrizes de Desenvolvimento 🛠️
Ao criar ou revisar uma Request, verifique:
- Se a trait `Response` está presente.
- Se o método `failedValidation` está utilizando o padrão do projeto.
- Se os atributos estão traduzidos para português no método `attributes()`.
- Se campos obrigatórios estão marcados como `required`.

---

## 5. Exemplo de Implementação Padrão

Este exemplo demonstra a estrutura obrigatória para todas as Requests do projeto.

```php
namespace App\Packages\Domain\Module\Requests;

use App\Base\Traits\Response;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class StoreEntityRequest extends FormRequest
{
    use Response; // Obrigatório para padronização de erro

    /**
     * @return bool
     */
    public function authorize(): bool
    {
        return true; // Autorização básica ou delegada via Policy
    }

    /**
     * @return array
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'field_one' => 'required|string',
            'related_id' => 'required|integer|exists:schema.table,id',
        ];
    }

    /**
     * Nomes amigáveis para os campos
     * @return array
     */
    public function attributes(): array
    {
        return [
            'name' => 'Nome',
            'field_one' => 'Campo Um',
            'related_id' => 'ID Relacionado',
        ];
    }

    /**
     * Padroniza a resposta de erro de validação (Obrigatório)
     * @param Validator $validator
     */
    protected function failedValidation(Validator $validator)
    {
        return self::failedValidationResponse($validator);
    }
}
```

---

## 6. Boas Práticas
- **Reuso**: Se dois endpoints usam validações quase idênticas (ex: Store e Update), você pode criar uma base ou usar lógica condicional no método `rules()` baseada no método HTTP (`$this->isMethod('post')`).
- **Sanitização Básica**: Embora a transformação pesada ocorra no Service, validações como `numeric`, `email` e `exists` devem ser exaustivamente usadas no Request.
