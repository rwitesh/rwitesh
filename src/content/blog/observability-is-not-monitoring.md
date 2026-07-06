---
title: "Observability Is Not Monitoring"
description: "A practical distinction and why it matters for production systems."
pubDate: 2026-06-15
tags: ["observability", "engineering"]
draft: false
---

People use "observability" and "monitoring" interchangeably. They are not the same thing, and the distinction matters when you're building production systems.

## Monitoring vs Observability

**Monitoring** tells you when something is wrong. **Observability** lets you understand *why*.

Monitoring asks: "Is the system healthy?"

Observability asks: "Why is the system behaving this way?"

Monitoring is about known-unknowns — things you anticipated and wrote a check for. Observability is about unknown-unknowns — things you didn't anticipate but can investigate because your system emits enough signal.

## The Three Pillars

Traditional observability rests on three signals:

1. **Metrics** — numeric measurements over time (CPU, request rate, error rate)
2. **Logs** — discrete events with context
3. **Traces** — request-scoped journeys across services

But the pillars are a simplification. What matters is that you can ask arbitrary questions of your system without deploying new code.

## High-Cardinality Dimensions

The real test of observability is high-cardinality cardinality. Can you slice by `user_id`? By `request_id`? By `tenant`?

If your monitoring system can't handle high-cardinality labels, you can do monitoring but you can't do observability.

> You can't alert on what you can't measure, and you can't measure what you can't slice by.

This is why tools like ClickHouse and Prometheus are popular in the observability space — they handle high-cardinality data reasonably well.

## Conclusion

Build for the unknown. Instrument everything. Make sure you can ask questions you haven't thought of yet.