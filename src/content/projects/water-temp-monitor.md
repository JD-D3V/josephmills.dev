---
title: WaterTempProject
order: 3
category: IOT · CLOUD
tech: ESP32 · AWS · Go · C#
stats:
  - CELLULAR
  - SMS + VOICE ALERTS
media:
  - type: image
    src: ../../assets/projects/water-temp-monitor/dashboard-warning.png
    alt: Frostline dashboard with a warning that the pump house air is too cold, next to six sensor readings
  - type: image
    src: ../../assets/projects/water-temp-monitor/sensor-chart.png
    alt: A pipe temperature sensor's 24-hour chart with warning and emergency threshold lines
  - type: image
    src: ../../assets/projects/water-temp-monitor/power-outage.png
    alt: Emergency banner saying the power is out at the pump house and the box is on battery
  - type: image
    src: ../../assets/projects/water-temp-monitor/incidents.png
    alt: An open power-loss incident showing texts sent and calls escalating through contacts
---

<!-- DRAFT -->
A cellular freeze monitor for a farm pump house. An ESP32 reports temperature to an AWS backend written in Go and C#, which escalates from SMS to voice calls if the temperature keeps falling and nobody responds.
