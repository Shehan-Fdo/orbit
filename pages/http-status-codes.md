---
title: HTTP Status Codes
description: Complete reference for HTTP response codes
---

# HTTP Status Codes

## 2xx — Success

| Code | Name | Meaning |
|------|------|---------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created |
| 204 | No Content | Success, no body |

## 3xx — Redirection

| Code | Name | Meaning |
|------|------|---------|
| 301 | Moved Permanently | URL changed forever |
| 302 | Found | Temporary redirect |
| 304 | Not Modified | Use cached version |

## 4xx — Client Errors

| Code | Name | Meaning |
|------|------|---------|
| 400 | Bad Request | Malformed request |
| 401 | Unauthorized | Auth required |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource missing |
| 429 | Too Many Requests | Rate limited |

## 5xx — Server Errors

| Code | Name | Meaning |
|------|------|---------|
| 500 | Internal Server Error | Generic server fail |
| 502 | Bad Gateway | Upstream error |
| 503 | Service Unavailable | Server overloaded |

> **Rule of thumb:** 4xx = your fault, 5xx = their fault.
