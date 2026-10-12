---
title: The Boring Web Browser
order: 1
category: SHIPPED SOFTWARE
tech: Chromium · C++ · Rust · Python · GitHub Actions
stats:
  - 37 C++ CHANGES
  - 2 PUBLIC RELEASES
  - SIGNED AUTO-UPDATES
links:
  - label: GitHub
    href: https://github.com/JD-D3V/boring-web-browser
  - label: Website
    href: https://jd-d3v.github.io/boring-web-browser
  - label: Download
    href: https://github.com/JD-D3V/boring-web-browser/releases
media:
  - type: image
    src: ../../assets/projects/boring-web-browser/browsing.png
    alt: The Boring Web Browser showing a web page with the calm toolbar and shield
  - type: image
    src: ../../assets/projects/boring-web-browser/welcome.png
    alt: The first-run welcome page of The Boring Web Browser
  - type: image
    src: ../../assets/projects/boring-web-browser/ntp-light.png
    alt: The new tab page in the light theme with a search picker
  - type: image
    src: ../../assets/projects/boring-web-browser/protection-dark.png
    alt: The Protection page in the dark theme listing blocking and privacy defaults
  - type: image
    src: ../../assets/projects/boring-web-browser/settings-menu.png
    alt: The browser menu with Senior Safe Mode and reader view
---

<!-- DRAFT wording -->
A privacy-focused web browser built on Chromium, with 37 C++ changes to its source and 2 public releases. I interviewed seniors who had fallen for online scams and surveyed Reddit users to decide which safety features to build, then added a Rust ad-blocking engine that blocks trackers disguised as part of the site you're visiting, opt-in AI page summaries from 5 LLM providers with encrypted storage of users' API keys, and a GitHub Actions pipeline that automates releases, including signed automatic updates, with 30+ Python end-to-end test suites run on every build.
