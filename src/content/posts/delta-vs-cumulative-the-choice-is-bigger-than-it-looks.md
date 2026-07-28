---
title: 'OpenTelemetry Metrics: Delta vs Cumulative Temporality'
description: Should OpenTelemetry metrics be emitted as Delta or Cumulative?
pubDate: 2026-07-28
tags:
  - observability
  - prometheus
  - opentelemetry
draft: false
---

While building an observability backend, one simple question kept coming back:

**Should metrics be stored as Delta or Cumulative?**

At first, it felt like a simple SDK configuration. The deeper I went, the more I realized it influences almost every part of the pipeline- how data is stored, aggregated, recovered after failures, how resets are detected, and how much logic the backend needs to maintain.

There isn't a universally correct answer. Both temporalities solve different problems, and understanding those trade-offs is far more important than simply choosing one.

## Every Counter Starts the Same Way

Imagine an application serving HTTP requests. Every request increments an internal counter.

```plain
Request 1
Request 2
Request 3
...
Counter = 3
```

A few seconds later the counter becomes **10**, then **18**, then **30**. Internally, the application only knows one thing:

"I've processed 30 requests."

The interesting question isn't how the application counts. The interesting question is **what gets exported every collection interval**.

That's what metric temporality defines.

## Two Ways to Represent the Same Data

Suppose our application processed 30 requests.

| Time | Cumulative | Delta |
| --- | --- | --- |
| 0s | 5 | 5 |
| 10s | 10 | 5 |
| 20s | 18 | 8 |
| 30s | 30 | 12 |

Both columns describe exactly the same workload.

A cumulative counter emits **5 → 10 → 18 → 30**. Every sample contains everything that happened since the application started.

A delta counter emits **5 → 5 → 8 → 12**. Every sample only contains what happened during the previous reporting interval.

An easy way to think about it is:

| Cumulative | Delta |
| --- | --- |
| Bank balance | Money spent today |
| Car odometer | Distance travelled today |
| Total requests since startup | Requests during the last interval |

Neither representation is more accurate. The difference is simply **where history lives**.

With cumulative, every sample carries history forward.

With delta, history disappears once that interval has been exported.

That one difference explains almost every trade-off that follows.

## Collector Failures

One of the first things I noticed while building a metrics pipeline was how differently the two temporalities behave when something fails.

Imagine the collector goes down after receiving delta values **5 → 8 → 12**. During the outage, the application continues processing requests, but those interval values are never received. Since delta only reports changes for a single interval, that information is permanently lost.

Now imagine the same situation with cumulative values **100 → 120 → 145**, and after the collector recovers the next sample is **210**. You lose the intermediate resolution, but you don't lose the total count. The latest sample already contains everything that happened while the collector was unavailable. This resilience is one of the biggest advantages of cumulative metrics.

## Counter Resets

Counters don't increase forever. Applications restart, pods get recreated, containers crash, and eventually the counter starts over.

A cumulative series might look like this: **990 → 1005 → 0 → 8 → 15**

The drop from **1005** to **0** immediately tells us that the counter reset. Since cumulative counters are expected to increase monotonically, a decrease is an explicit signal that the process restarted.

Delta doesn't carry that information.

A delta series might simply be: **15 → 12 → 9 → 8 → 20**

These are just interval values. There's no notion of a lifetime counter, so there's nothing to indicate that a reset occurred. Even if you continuously sum every delta sample, you still can't reliably reconstruct where the reset happened because the reset information never existed in the exported data.

## Why Prometheus Changes the Decision

Prometheus stores counters as cumulative time series and functions such as `rate()`, `increase()` and `irate()` are designed around that model.

More importantly, Prometheus detects counter resets by looking at the cumulative series before calculating rates.

If all you receive is delta values, reconstructing the original cumulative counter isn't always possible. Consider the sequence: **5 → 8 → 7 → 10**

Did the original cumulative counter start from **0**? **1,000**? Was there a restart somewhere? Without an initial value and reset information, multiple cumulative series could produce exactly the same delta sequence.

This is why systems built around Prometheus naturally prefer cumulative counters, and why OpenTelemetry recommends choosing the temporality expected by your backend whenever possible.

## Backend Aggregation Looks Different

Now let's ignore Prometheus for a moment and look at backend processing.

Most analytics operate on intervals rather than lifetime totals. Calculating averages, throughput, histogram aggregations, or windowed statistics all work with "what happened during this time window."

Delta already provides exactly that.

Suppose a latency metric exports:

> Count = 100
> Sum = 2400 ms

The average is simply **2400 ÷ 100 = 24 ms**.

With cumulative metrics, you would first receive something like:

> Count: **100 → 180**
> Sum: **2400 → 4300**

Before calculating anything, you first derive the delta:

> Count Δ = 80
> Sum Δ = 1900

Only then can you compute the average.

This isn't a limitation of cumulative metrics- it's simply how most interval-based calculations work. In many backends, cumulative metrics are converted back into delta internally before aggregation begins.

## Should You Keep Both?

Supporting both temporalities sounds attractive, but in practice it often means more edge cases, and higher maintenance overhead.

Unless there's a clear product requirement, keeping both representations usually introduces more complexity than value.

## Final Thoughts

There isn't a universally correct choice.

If your backend is built around Prometheus, cumulative counters fit naturally. They preserve reset information, tolerate missing samples better, and align with how Prometheus expects counters to behave.

If you're building a custom metrics backend focused on interval-based aggregation, delta can simplify many backend operations because the data already represents changes over each reporting window.

It's that choosing between Delta and Cumulative is really choosing how you want your backend to represent history and that decision influences much more than the instrumentation where it all begins.
