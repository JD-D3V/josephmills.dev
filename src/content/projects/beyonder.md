---
title: beyonder
order: 2
category: AI · MULTI-AGENT
tech: LangGraph · Qdrant · FastAPI · Gemini
stats:
  - ~89% TERM CONSISTENCY
  - GLOSSARY-RAG
  - SPOILER-AWARE
links:
  - label: GitHub
    href: https://github.com/JD-D3V/beyonder
---

<!-- DRAFT -->
A multi-agent LangGraph system for translating Chinese web novels and answering questions about them. A glossary-RAG layer over Qdrant locks terminology at every translation call, reaching about 89% term consistency on a 500-term gold set, and retrieval is spoiler-aware so answers never leak future chapters.
