#!/bin/bash

# Script para popular a API com 300 funcionários usando curl
# Uso: ./populate-api.sh [URL_DA_API]

API_URL="${1:-http://localhost:8080/funcionarios}"

echo "======================================================"
echo "  Script de População da API (Bash/Curl)"
echo "======================================================"
echo ""
echo "URL da API: $API_URL"
echo ""

# Arrays de dados
PRIMEIRO_NOMES=(
  "Ana" "Bruno" "Carlos" "Diana" "Eduardo" "Fernanda" "Gabriel" "Helena"
  "Igor" "Juliana" "Kevin" "Larissa" "Marcos" "Natalia" "Otávio" "Paula"
  "Rafael" "Sabrina" "Thiago" "Vanessa" "Wagner" "Yasmin" "André" "Beatriz"
  "Caio" "Daniela" "Elias" "Flávia" "Gustavo" "Isabela" "João" "Kamila"
  "Leonardo" "Mariana" "Nicolas" "Olivia" "Pedro" "Raquel" "Samuel" "Tatiana"
  "Lucas" "Amanda" "Felipe" "Carolina" "Rodrigo" "Patrícia" "Ricardo" "Renata"
)

SOBRENOMES=(
  "Silva" "Santos" "Oliveira" "Costa" "Souza" "Lima" "Pereira" "Ferreira"
  "Rodrigues" "Alves" "Nascimento" "Araújo" "Carvalho" "Ribeiro" "Barbosa"
  "Martins" "Rocha" "Gomes" "Mendes" "Cardoso" "Monteiro" "Teixeira" "Castro"
  "Pinto" "Dias" "Moreira" "Ramos" "Campos" "Nunes" "Pires" "Freitas"
)

CARGOS=(
  "Desenvolvedor Junior" "Desenvolvedor Pleno" "Desenvolvedor Senior"
  "Designer Junior" "Designer Pleno" "Designer Senior"
  "Gerente de Projetos" "Gerente de TI" "Analista de Sistemas"
  "Analista de Dados" "Coordenador de TI" "Assistente Administrativo"
  "Supervisor de Vendas" "Diretor de TI" "Especialista em UX"
  "Consultor de TI" "Engenheiro de Software" "Product Owner"
  "Scrum Master" "Analista de Qualidade"
)

DEPARTAMENTOS=(
  "TI" "Marketing" "Vendas" "RH" "Financeiro" 
  "Operações" "Jurídico" "Compras"
)

# Função para gerar número aleatório
random_number() {
  echo $((RANDOM % $1))
}

# Função para gerar salário baseado no cargo
gerar_salario() {
  local cargo="$1"
  
  if [[ "$cargo" == *"Junior"* ]]; then
    echo $((2500 + RANDOM % 2500))
  elif [[ "$cargo" == *"Pleno"* ]]; then
    echo $((5000 + RANDOM % 3000))
  elif [[ "$cargo" == *"Senior"* ]]; then
    echo $((7000 + RANDOM % 5000))
  elif [[ "$cargo" == *"Diretor"* ]]; then
    echo $((15000 + RANDOM % 10000))
  elif [[ "$cargo" == *"Gerente"* ]] || [[ "$cargo" == *"Coordenador"* ]]; then
    echo $((8000 + RANDOM % 7000))
  elif [[ "$cargo" == *"Especialista"* ]] || [[ "$cargo" == *"Consultor"* ]]; then
    echo $((6000 + RANDOM % 6000))
  else
    echo $((4000 + RANDOM % 4000))
  fi
}

# Verificar se a API está disponível
echo "Verificando conexão com a API..."
if ! curl -s -f "$API_URL" > /dev/null 2>&1; then
  echo "❌ Erro: Não foi possível conectar à API"
  echo ""
  echo "Verifique se:"
  echo "  1. A API está rodando"
  echo "  2. A URL está correta: $API_URL"
  echo ""
  exit 1
fi

echo "✓ Conexão estabelecida!"
echo ""
echo "Criando 300 funcionários..."
echo ""

SUCESSOS=0
FALHAS=0

# Criar 300 funcionários
for i in {1..300}; do
  # Gerar dados aleatórios
  primeiro_idx=$((RANDOM % ${#PRIMEIRO_NOMES[@]}))
  sobrenome_idx=$((RANDOM % ${#SOBRENOMES[@]}))
  nome="${PRIMEIRO_NOMES[$primeiro_idx]} ${SOBRENOMES[$sobrenome_idx]}"
  
  cargo_idx=$((RANDOM % ${#CARGOS[@]}))
  cargo="${CARGOS[$cargo_idx]}"
  
  dept_idx=$((RANDOM % ${#DEPARTAMENTOS[@]}))
  departamento="${DEPARTAMENTOS[$dept_idx]}"
  
  salario=$(gerar_salario "$cargo")
  
  ano=$((2018 + RANDOM % 8))
  mes=$(printf "%02d" $((RANDOM % 12 + 1)))
  dia=$(printf "%02d" $((RANDOM % 28 + 1)))
  data_admissao="$ano-$mes-$dia"
  
  # Criar JSON
  json=$(cat <<EOF
{
  "nome": "$nome",
  "cargo": "$cargo",
  "departamento": "$departamento",
  "salario": $salario,
  "dataAdmissao": "$data_admissao"
}
EOF
)
  
  # Fazer requisição POST
  response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "$json")
  
  http_code=$(echo "$response" | tail -n 1)
  
  if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    SUCESSOS=$((SUCESSOS + 1))
    echo -ne "✓ $i/300 criados        \r"
  else
    FALHAS=$((FALHAS + 1))
    echo ""
    echo "✗ Falha no funcionário $i (HTTP $http_code)"
  fi
  
  # Pequeno delay a cada 10 requisições
  if [ $((i % 10)) -eq 0 ]; then
    sleep 0.1
  fi
done

echo ""
echo ""
echo "======================================================"
echo "  Resultado Final"
echo "======================================================"
echo ""
echo "✓ Sucessos: $SUCESSOS"
echo "✗ Falhas: $FALHAS"
echo ""
echo "Total: $((SUCESSOS + FALHAS))/300"

if [ $SUCESSOS -eq 300 ]; then
  echo ""
  echo "🎉 Todos os funcionários foram criados com sucesso!"
elif [ $SUCESSOS -gt 0 ]; then
  echo ""
  echo "⚠️  Alguns funcionários não foram criados."
else
  echo ""
  echo "❌ Falha ao criar funcionários."
fi

echo ""
echo "======================================================"
echo ""
