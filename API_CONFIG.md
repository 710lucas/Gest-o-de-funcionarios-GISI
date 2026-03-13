# Configuração da API

## Formato de Dados

A aplicação agora suporta alternância entre **LocalStorage** e **API Externa**.

### Formato da API (Backend Spring Boot)

A API deve retornar e receber dados no formato **camelCase**:

```json
[
  {
    "id": 1,
    "nome": "João Silva",
    "cargo": "Desenvolvedor",
    "departamento": "TI",
    "salario": 5000.0,
    "dataAdmissao": "2024-01-15"
  }
]
```

### Formato do Frontend

Internamente, o frontend usa **snake_case**:

```json
{
  "id": 1,
  "nome": "João Silva",
  "cargo": "Desenvolvedor",
  "departamento": "TI",
  "salario": 5000,
  "data_admissao": "2024-01-15"
}
```

## Conversão Automática

O serviço `api.js` faz a conversão automática entre os dois formatos:

- **`toApiFormat()`**: Converte `data_admissao` → `dataAdmissao` antes de enviar para a API
- **`fromApiFormat()`**: Converte `dataAdmissao` → `data_admissao` ao receber da API

## Endpoints da API

A API deve implementar os seguintes endpoints:

| Método | Endpoint | Descrição | Body |
|--------|----------|-----------|------|
| GET | `/funcionarios` | Lista todos os funcionários | - |
| GET | `/funcionarios/{id}` | Busca funcionário por ID | - |
| POST | `/funcionarios` | Cria novo funcionário | FuncionarioCreateDTO |
| PUT | `/funcionarios/{id}` | Atualiza funcionário | FuncionarioCreateDTO |
| DELETE | `/funcionarios/{id}` | Deleta funcionário | - |

### FuncionarioCreateDTO (Backend)

```java
{
    "nome": "String",
    "cargo": "String",
    "departamento": "String",
    "salario": "Double",
    "dataAdmissao": "String" // Formato: "YYYY-MM-DD"
}
```

## Como Configurar

1. **Acesse a aba "Configurações"** no menu
2. **Configure a URL da API**:
   - Padrão: `http://localhost:8080/funcionarios`
   - Produção: `https://sua-api.com/funcionarios`
3. **Clique em "Salvar URL"**
4. **Clique em "Usar API Externa"**
5. A página será recarregada e todas as operações usarão a API

## Testando a Integração

### 1. Verificar se a API está rodando

```bash
curl http://localhost:8080/funcionarios
```

### 2. Criar um funcionário de teste

```bash
curl -X POST http://localhost:8080/funcionarios \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Teste Frontend",
    "cargo": "Desenvolvedor",
    "departamento": "TI",
    "salario": 5000,
    "dataAdmissao": "2024-01-15"
  }'
```

### 3. Verificar CORS

Certifique-se de que o backend tem CORS configurado:

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*");
            }
        };
    }
}
```

## Solução de Problemas

### Erro: "Erro na API: ..."
- Verifique se a API está rodando
- Verifique a URL configurada
- Verifique o console do navegador para mais detalhes

### CORS Error
- Configure CORS no backend
- Adicione a origem do frontend nas allowed origins

### Dados não aparecem
- Abra o console do navegador (F12)
- Veja a aba Network para verificar as requisições
- Verifique se a API está retornando dados no formato correto

### Formato de data incorreto
- A API deve retornar `dataAdmissao` no formato `YYYY-MM-DD`
- Exemplo: `"2024-01-15"` ou `"2024-01-15T10:30:00"`
