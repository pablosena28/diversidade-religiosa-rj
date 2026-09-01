# Diversidade Religiosa RJ

Painel responsivo para explorar e comparar a diversidade religiosa entre municípios do estado do Rio de Janeiro.

O projeto foi concebido para portfólio e combina **HTML, CSS, JavaScript, Python, estatística descritiva, tratamento de dados e GitHub Actions**.

> **Atenção:** o repositório acompanha uma base **demonstrativa com valores fictícios**. Ela existe apenas para que a interface funcione imediatamente. Antes de divulgar resultados, gere `data/municipios.json` a partir dos dados oficiais do IBGE.

## O que o projeto demonstra

- interface responsiva sem frameworks;
- carregamento assíncrono de JSON com `fetch`;
- visualização dinâmica com JavaScript;
- comparação entre municípios;
- ranking pesquisável;
- cálculo do índice de diversidade de Shannon normalizado;
- pipeline de preparação de dados em Python;
- testes automatizados com `unittest`;
- validação no GitHub Actions;
- documentação metodológica e separação entre dados brutos e dados de aplicação.

## Funcionalidades

### Perfil municipal

Exibe índice de diversidade, categoria predominante, participação da categoria predominante, margem para a segunda categoria, total classificado e composição percentual.

### Comparador

Permite selecionar dois municípios e comparar o índice e a proporção de cada categoria, incluindo a diferença em pontos percentuais.

### Ranking

Ordena os municípios pelo índice de diversidade e permite busca por nome.

## Metodologia

O indicador principal é a entropia de Shannon normalizada:

```text
H = -Σ(pᵢ × ln pᵢ) / ln(k)
```

Onde `pᵢ` representa a proporção de cada categoria e `k` é o número de categorias consideradas.

A metodologia completa está em [`docs/metodologia.md`](docs/metodologia.md).

## Estrutura

```text
diversidade-religiosa-rj/
├── .github/workflows/validate.yml
├── data/
│   ├── municipios.json
│   └── raw/
│       ├── README.md
│       └── demo_religiao_municipios_rj.csv
├── docs/metodologia.md
├── scripts/prepare_data.py
├── tests/test_prepare_data.py
├── app.js
├── index.html
├── styles.css
├── README.md
├── LICENSE
├── .gitignore
└── .nojekyll
```

## Executar localmente

Como a aplicação carrega JSON com `fetch`, execute um servidor local:

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## Preparar dados

O pipeline recebe um CSV longo com as colunas:

```text
codigo_ibge,municipio,categoria,estimativa
```

Exemplo:

```bash
python scripts/prepare_data.py \
  data/raw/religiao_municipios_rj.csv \
  data/municipios.json \
  --source-label "IBGE — Censo Demográfico 2022" \
  --source-url "https://biblioteca.ibge.gov.br/index.php/biblioteca-catalogo?view=detalhes&id=2102182"
```

O script valida o CSV, agrega registros, calcula proporções, identifica a categoria predominante, calcula a margem, calcula Shannon normalizado e gera o JSON consumido pelo site.

## Testes

```bash
python -m unittest discover -s tests
node --check app.js
```

As mesmas verificações são executadas automaticamente pelo GitHub Actions.

## GitHub Pages

Em **Settings > Pages**, use **Deploy from a branch**, selecione `main` e `/root`.

## Fontes e referência

**Fonte de dados pretendida**

- IBGE — Censo Demográfico 2022:  
  https://biblioteca.ibge.gov.br/index.php/biblioteca-catalogo?view=detalhes&id=2102182

**Referência de visualização estudada**

- Religião no Brasil — Censo 2022:  
  https://medeirosld.github.io/religiao-censo-2022/
- Repositório:  
  https://github.com/MedeirosLD/religiao-censo-2022

A implementação deste repositório é independente. O projeto de referência foi usado como inspiração para boas práticas de visualização, documentação e tratamento de dados públicos.

## Nota metodológica

Religião no Censo 2022 foi investigada na amostra. Portanto, uma análise com dados oficiais deve tratar os valores como estimativas e preservar as informações de precisão e as notas metodológicas disponibilizadas pelo IBGE.

## Autor

**Pablo Sena**  
GitHub: [@pablosena28](https://github.com/pablosena28)
