#!/bin/bash

# Script de Teste da API
# Certifique-se de que a API está rodando antes de executar

API_URL="http://localhost:8080/funcionarios"

echo "=========================================="
echo "  Testando comunicação com a API"
echo "=========================================="
echo ""

# Teste 1: GET todos os funcionários
echo "1. Testando GET /funcionarios"
echo "--------------------------------------"
response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL")
http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ]; then
    echo "✓ Sucesso! Status: $http_code"
    echo "Resposta:"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
else
    echo "✗ Falhou! Status: $http_code"
    echo "Resposta: $body"
fi
echo ""

# Teste 2: POST criar funcionário
echo "2. Testando POST /funcionarios"
echo "--------------------------------------"
test_funcionario='{
  "nome": "Teste API Frontend",
  "cargo": "Desenvolvedor",
  "departamento": "TI",
  "salario": 5500.00,
  "dataAdmissao": "2025-01-15"
}'

response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "$test_funcionario")
http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    echo "✓ Sucesso! Status: $http_code"
    echo "Resposta:"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
    
    # Extrai o ID do funcionário criado
    created_id=$(echo "$body" | jq -r '.id' 2>/dev/null)
    
    if [ ! -z "$created_id" ] && [ "$created_id" != "null" ]; then
        echo ""
        echo "ID criado: $created_id"
        
        # Teste 3: GET por ID
        echo ""
        echo "3. Testando GET /funcionarios/$created_id"
        echo "--------------------------------------"
        response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/$created_id")
        http_code=$(echo "$response" | tail -n 1)
        body=$(echo "$response" | head -n -1)
        
        if [ "$http_code" = "200" ]; then
            echo "✓ Sucesso! Status: $http_code"
            echo "Resposta:"
            echo "$body" | jq '.' 2>/dev/null || echo "$body"
        else
            echo "✗ Falhou! Status: $http_code"
            echo "Resposta: $body"
        fi
        
        # Teste 4: PUT atualizar
        echo ""
        echo "4. Testando PUT /funcionarios/$created_id"
        echo "--------------------------------------"
        update_funcionario='{
          "nome": "Teste API Atualizado",
          "cargo": "Desenvolvedor Senior",
          "departamento": "TI",
          "salario": 7500.00,
          "dataAdmissao": "2025-01-15"
        }'
        
        response=$(curl -s -w "\n%{http_code}" -X PUT "$API_URL/$created_id" \
          -H "Content-Type: application/json" \
          -d "$update_funcionario")
        http_code=$(echo "$response" | tail -n 1)
        body=$(echo "$response" | head -n -1)
        
        if [ "$http_code" = "200" ]; then
            echo "✓ Sucesso! Status: $http_code"
            echo "Resposta:"
            echo "$body" | jq '.' 2>/dev/null || echo "$body"
        else
            echo "✗ Falhou! Status: $http_code"
            echo "Resposta: $body"
        fi
        
        # Teste 5: DELETE
        echo ""
        echo "5. Testando DELETE /funcionarios/$created_id"
        echo "--------------------------------------"
        response=$(curl -s -w "\n%{http_code}" -X DELETE "$API_URL/$created_id")
        http_code=$(echo "$response" | tail -n 1)
        body=$(echo "$response" | head -n -1)
        
        if [ "$http_code" = "200" ] || [ "$http_code" = "204" ]; then
            echo "✓ Sucesso! Status: $http_code"
        else
            echo "✗ Falhou! Status: $http_code"
            echo "Resposta: $body"
        fi
    fi
else
    echo "✗ Falhou! Status: $http_code"
    echo "Resposta: $body"
fi

echo ""
echo "=========================================="
echo "  Testes concluídos!"
echo "=========================================="
