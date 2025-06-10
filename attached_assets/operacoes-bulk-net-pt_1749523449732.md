### Título:
Operações BULK com SQL Server e PostgreSQL em .NET: Um Guia Completo para Upserts Eficientes

### Subtítulo:
Como eliminar gargalos de performance com operações massivas de Merge, Insert e Upsert usando .NET e SQL

### Tags:
.NET, C#, SQL Server, PostgreSQL, Entity Framework, ORM, Bulk Insert, Merge, Performance, NuGet

### Categorias:
- Bancos de Dados
- Desenvolvimento .NET
- Performance
- Open Source

---

## Introdução: O problema das operações em massa

Quem já trabalhou com importações de dados, integrações ou sincronizações sabe como pode ser doloroso inserir ou atualizar milhares de registros em um banco relacional. Normalmente começa assim:

- Um loop `foreach` chamando `Add` ou `Update` para cada item
- Um único `SaveChanges` no final — ou pior, dentro do loop
- Esperas longas, bloqueios, timeouts, uso alto de CPU/disk

### Exemplo clássico de ineficiência:

```csharp
foreach (var item in records)
{
    var existing = await _context.Table.FindAsync(item.Id);
    if (existing != null)
    {
        existing.Name = item.Name;
    }
    else
    {
        _context.Table.Add(item);
    }
}
await _context.SaveChangesAsync();
```

Isso até funciona para poucos dados, mas se torna um gargalo sério com grandes volumes.

---

## SQL Nativo: MERGE e COPY/INSERT ON CONFLICT

A forma mais eficiente de lidar com upserts em massa é usar os recursos nativos do banco de dados:

### SQL Server: `MERGE`

```sql
MERGE INTO Products AS target
USING (VALUES (1, 'Camiseta', 39.9)) AS source (Id, Name, Price)
ON target.Id = source.Id
WHEN MATCHED THEN
    UPDATE SET Name = source.Name, Price = source.Price
WHEN NOT MATCHED THEN
    INSERT (Id, Name, Price) VALUES (source.Id, source.Name, source.Price);
```

### PostgreSQL: `INSERT ... ON CONFLICT`

```sql
INSERT INTO products (id, name, price)
VALUES (1, 'Camiseta', 39.9)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, price = EXCLUDED.price;
```

Essas abordagens reduzem o tráfego SQL e utilizam o próprio otimizador do banco para processar grandes volumes de dados.

---

## O que o Entity Framework oferece nativamente

O Entity Framework (EF) não suporta nativamente `MERGE` ou `INSERT ON CONFLICT`. O que temos:

- `AddRange` + `SaveChanges`: bom para inserções, não para atualizações
- `UpdateRange`: exige saber o que é novo ou existente
- `ExecuteSqlRaw`: permite usar SQL puro, mas perde tipagem e segurança do EF

### Solução parcial com `ExecuteSqlRaw`:

```csharp
await context.Database.ExecuteSqlRawAsync(@"
    INSERT INTO products (id, name)
    VALUES (1, 'Exemplo')
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
");
```

Funciona, mas vira um caos conforme a lógica cresce.

---

## SqlComplexOperations: Abstração fluente para .NET

Para resolver isso, criei a biblioteca [**SqlComplexOperations**](https://www.nuget.org/packages/SqlComplexOperations/), que permite operações de merge/upsert massivas de forma fluente, reutilizável e performática.

### Instalação:
```bash
Install-Package SqlComplexOperations
```

### Exemplo de uso:
```csharp
await connection.BulkMergeAsync(
    tableName: "Products",
    entities: products,
    matchColumns: new[] { "Id" },
    insertColumns: new[] { "Id", "Name", "Price" },
    updateColumns: new[] { "Name", "Price" }
);
```

Sem SQL bruto, sem condicionais, sem dores de serialização.

---

## Benchmarks

Testei 100.000 registros no SQL Server e PostgreSQL, localmente com .NET 8 e SSD:

| Estratégia              | SQL Server | PostgreSQL |
|-------------------------|------------|------------|
| EF com foreach          | ~120s      | ~90s       |
| EFCore.BulkExtensions   | ~12s       | ~8s        |
| SqlComplexOperations    | ~2.5s      | ~2s        |

> **Nota**: O ganho de performance vem do uso de uma única instrução SQL otimizada por lote, em vez de milhares de interações ORM.

---

## Recursos principais do SqlComplexOperations

- Abstração fluente para `MERGE` e `UPSERT`
- Suporte nativo a SQL Server e PostgreSQL
- Compatível com `IDbConnection` (funciona com Dapper)
- Geração automática de SQL
- Modo debug para pré-visualizar o SQL

---

## Casos de uso reais

- Integrações com sistemas legados
- Importadores de dados CSV/Excel
- Microserviços sincronizando dados compartilhados
- Migrações de dados e atualizações versionadas

---

## Conclusão

Operações em massa não precisam ser um pesadelo. Usar SQL avançado como `MERGE` e `INSERT ON CONFLICT` é essencial para aplicações escaláveis, e o `SqlComplexOperations` traz essa eficiência para seu projeto .NET de forma limpa e sustentável.

> Teste com seus próprios dados — o ganho de performance e clareza no código será visível.

🔗 [Pacote no NuGet](https://www.nuget.org/packages/SqlComplexOperations/)  
🔗 [Repositório no GitHub](https://github.com/gustavomarty/sql-merge-netcore)
