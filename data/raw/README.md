# Dados brutos

`demo_religiao_municipios_rj.csv` contém valores fictícios usados somente para demonstrar a interface.

## Formato esperado

O pipeline recebe um CSV em formato longo:

```text
codigo_ibge,municipio,categoria,estimativa
3300000,Município exemplo,Católica Apostólica Romana,10000
3300000,Município exemplo,Evangélicas,8000
```

As quatro colunas são obrigatórias: `codigo_ibge`, `municipio`, `categoria` e `estimativa`.

## Usar a base oficial

Prepare a tabela oficial do IBGE no formato acima, preserve as categorias e estimativas da fonte e execute:

```bash
python scripts/prepare_data.py \
  data/raw/religiao_municipios_rj.csv \
  data/municipios.json \
  --source-label "IBGE — Censo Demográfico 2022" \
  --source-url "https://biblioteca.ibge.gov.br/index.php/biblioteca-catalogo?view=detalhes&id=2102182"
```

Não publique interpretações substantivas usando o arquivo de demonstração.
