# Documentação de Testes

O projeto utiliza o **Pest PHP** como Framework de testes. Os testes são fundamentais para garantir a integridade da arquitetura modular e das regras de negócio.

---

## 1. Organização dos Testes

Os testes seguem a estrutura padrão do Pest/Laravel:
- `tests/Feature`: Testes de ponta a ponta (End-to-End), validando endpoints, middlewares e respostas HTTP.
- `tests/Unit`: Testes de lógica pura, focados em Services ou Helpers (sem tocar no banco de dados se possível).

---

## 2. Padrões e Convenções ✅

1.  **Nomenclatura**: Arquivos devem terminar com `Test.php` (ex: `RegisterTest.php`).
2.  **Linguagem**: Descrições dos testes devem ser feitas em **inglês** para manter o padrão do ecossistema, embora a documentação seja em PT-BR.
3.  **Setup de Banco**: Utilize a trait `Illuminate\Foundation\Testing\RefreshDatabase` em testes que interagem com o banco de dados.
4.  **Expectations**: Utilize a API de `expect()` do Pest para asserções mais legíveis.

---

## 3. Exemplo de Teste de Feature

```php
use App\Packages\Admin\Users\Models\User;
use function Pest\Laravel\postJson;

test('should register a new user successfully', function () {
    $payload = [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => 'password123',
    ];

    postJson(route('v1.auth.register'), $payload)
        ->assertStatus(201)
        ->assertJsonPath('success', true)
        ->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'id',
                'name',
                'email'
            ]
        ]);

    $this->assertDatabaseHas('admin.users', [
        'email' => 'john@example.com'
    ]);
});
```

---

## 4. Como Executar os Testes

Para rodar todos os testes no ambiente Docker:
```bash
make test
```

Para rodar um teste específico:
```bash
make test f=RegisterTest
```

---

## 5. Ambiente de Banco de Dados de Teste 🧪
O projeto utiliza um banco de dados isolado para testes (`task-manager_testing`). 

**Importante**: Sempre que houver mudanças em Migrations, você deve sincronizar o banco de testes manualmente antes de rodar os testes:
```bash
make migrate-testing
```

Isso garante que as funções PL/pgSQL e schemas customizados estejam presentes no ambiente de execução do Pest.

---

## 6. Diretrizes para IA (Prompting/Agentic) 🤖
- Sempre crie um teste de feature ao implementar uma nova rota.
- Mock de serviços externos é obrigatório.
- Valide sempre o formato da resposta JSON padrão (`success`, `message`, `data`).
