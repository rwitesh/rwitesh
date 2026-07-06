---
title: "What Happens When You Upgrade Your Embedding Model in RAG?"
description: "Embeddings are meaningful only in the context of the model that produced them. Here's what breaks and how to migrate safely."
pubDate: 2026-06-28
tags: ["rag", "embeddings", "ai"]
draft: false
---

One of the easiest mistakes to make in RAG is thinking of embeddings as just "vectors". In reality, an embedding is meaningful only in the context of the model that produced it.

Imagine you have a document A, embedding model A produces chunks from it and added in a vector db but months later a new model (embedding model B) is released. Now it's trained a bit differently and produces different vectors.

These vectors represent the same document, but they exist in different vector spaces.

The numbers themselves are not directly related.

Embeddings work the same way, but they have their own way of representation.

Suppose your vector database contains one million document embeddings created by model A.

```
Chunk 1 → Model A embedding
Chunk 2 → Model A embedding
Chunk 3 → Model A embedding
...
```

Now you upgrade your application so that user queries are embedded using Model B. Your vector database still contains Model A embeddings. When cosine similarity is computed, it is comparing vectors that don't belong to the same coordinate system. The similarity scores become essentially meaningless. Retrieval quality often drops dramatically, even though nothing shows broken.

## Gradual Migration

Since re-embedding millions of documents can take hours or even days, production systems usually don't replace the index all at once. Instead, they perform a gradual migration.

First, build a **shadow index**.

| Current Index (Model A) | Shadow Index (Model B) |
|---|---|
| Serves all user queries | Being populated in background |
| Contains all existing vectors | Gradually re-embeds documents |

The application continues serving users from the current index while the shadow index is being populated. Next, send a small percentage of user queries to both indexes and compare the results. If the new index consistently returns equal or better results, you slowly increase the percentage of traffic going to it. All traffic uses the new index, but the old one remains available in case you discover unexpected problems.

## Record the Embedding Model

A small but important safeguard is to record which embedding model created each vector. For example, store metadata like:

```json
{
  "model": "text-embedding-3-large",
  "version": "2026-04",
  "source": "oauth.md"
}
```

When a query arrives, your application knows which embedding model it used. Before searching, it verifies that the stored vectors were produced by the same model.

Without this check, the system might continue returning poor search results for weeks, and it can be difficult to realize that the root cause is simply a mismatch between embedding models.