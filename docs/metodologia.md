# Metodologia

## Objetivo

O projeto mede o grau de distribuição relativa das categorias religiosas consideradas em cada município. O indicador não avalia religião, qualidade de vida ou desenvolvimento: ele descreve apenas concentração e dispersão das proporções.

## Índice de Shannon normalizado

Para cada município, as estimativas são convertidas em proporções `pᵢ`.

```text
H = -Σ(pᵢ × ln pᵢ) / ln(k)
```

Onde:

- `pᵢ` é a proporção da categoria `i`;
- `k` é o número total de categorias configuradas;
- `H` varia entre 0 e 1.

Interpretação estatística:

- próximo de `0`: distribuição concentrada;
- próximo de `1`: distribuição mais equilibrada.

A normalização por `ln(k)` permite comparar municípios usando a mesma régua, desde que todos usem o mesmo conjunto de categorias.

## Margem de predominância

A margem é a proporção da primeira categoria menos a proporção da segunda categoria, exibida em pontos percentuais.

## Censo 2022

Religião foi investigada na amostra do Censo Demográfico 2022. Portanto, os valores divulgados são estimativas expandidas, não contagens integrais de todos os moradores.

Uma análise substantiva deve preservar as notas metodológicas do IBGE e, quando possível, incorporar medidas de precisão amostral, como o coeficiente de variação.

## Dados demonstrativos

O arquivo incluído em `data/municipios.json` é demonstrativo e foi criado apenas para validar a interface. Os valores não representam municípios reais.

Para gerar o JSON com dados oficiais, use `scripts/prepare_data.py`.
