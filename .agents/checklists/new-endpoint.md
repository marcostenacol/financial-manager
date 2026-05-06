# Checklist New Endpoint

- a rota esta em arquivo de dominio correto?
- a rota esta versionada?
- a rota tem nome explicito?
- existe `FormRequest` para validar entrada?
- o controller apenas recebe, delega e responde?
- existe `Service` para a regra de negocio?
- existe `Repository` para persistencia ou consulta?
- existe `Resource` para padronizar saida?
- o status code esta correto?
- o contrato segue `data`, `message`, `success` quando aplicavel?
- se for listagem, existe paginacao?
- se for listagem, filtros e ordenacao estao no repository?
- existem testes de sucesso?
- existem testes de validacao ou falha principal?
