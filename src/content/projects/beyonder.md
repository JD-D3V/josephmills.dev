---
title: beyonder
order: 2
category: AI · MULTI-AGENT
tech: Python · LangGraph · Gemini · FastAPI · Next.js · Qdrant · Docker
stats:
  - ~89% TERM CONSISTENCY
  - GLOSSARY-RAG
  - SPOILER-AWARE
links:
  - label: GitHub
    href: https://github.com/JD-D3V/beyonder
  - label: Live demo
    href: https://jd-d3v.github.io/beyonder
---

<!-- DRAFT wording -->
A web-novel translation app built around a LangGraph AI agent on Gemini that reviews and corrects its own translations. A glossary-RAG layer over Qdrant locks terminology at every translation call (about 89% term consistency on a 500-term gold set), and readers can ask questions without spoilers because retrieval only searches the chapters they have finished. Long chapters translate in resumable chunks, so the whole app runs on a 512 MB server.
