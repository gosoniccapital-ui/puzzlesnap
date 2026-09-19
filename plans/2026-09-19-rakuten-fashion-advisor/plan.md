# Implementation Plan: Rakuten Fashion Affiliate API & Multi-Source Stylist Engine

- **Slug**: `rakuten-fashion-advisor`
- **Owner**: CunFashion AI Core
- **Created**: 2026-09-19
- **Status**: Draft (Review Required)

## 1. Executive Summary
Tich hop nguon cap san pham thoi trang chinh hang tu Rakuten Advertising Product Search API ket hop Fourthwall Storefront (cute.cunfashion.com) va Amazon Curated Deep-links vao ung dung cunfashion.com/style-advisor. Cat bo hoan toan footer Jigsaw Puzzle tren trang nay de toi uu trai nghiem thoi trang doc lap va tang ty le chuyen doi (CR).

## 2. Technical Findings & Verification Evidence
- **Rakuten Token Verification**: Bien RAKUTEN_ACCESS_TOKEN trong .env.local da duoc verify thanh cong voi HTTP 200 OK tren endpoint https://api.linksynergy.com/productsearch/1.0.
- **Merchant Match Invariant**: TotalMatches: 0 khi tim kiem la do tai khoan Publisher tren Rakuten can tham gia (Apply/Approved) cac Merchant thoi trang cu the (Macy's, ASOS, Nike...) hoac truyen tham so mid.
- **Fourthwall Storefront Verification**: Da verify 100% tai khoan Cun's cute things (Shop ID sh_580fe07d-bf97-46f9-ab60-42d73c9f5cc2) tra ve day du san pham, anh CDN WebP va link mua https://cute.cunfashion.com/products/{slug} voi HTTP 200 OK.
- **Amazon Affiliate Tag Invariant**: Khang dinh ma affiliate tag=cuncute-20 la co dinh cho moi san pham co ma ASIN.

## 3. Phased Execution Roadmap
- [x] Phase 00: Environment & API Audit (Da hoan thanh kiem tra Token & Endpoints)
- [ ] Phase 01: Multi-Source Affiliate Architecture & Rakuten Client
- [ ] Phase 02: Next.js API Route /api/style-advisor/analyze Multi-Source Integration
- [ ] Phase 03: UI Refactor & Footer "Cut" on /style-advisor
- [ ] Phase 04: Verification, Automated Testing, Git & Vercel Production Rollout

## 4. Key Files to Modify / Create
1. src/lib/affiliate/rakuten-client.ts [NEW]
2. src/lib/fourthwall/client.ts [NEW]
3. src/app/api/style-advisor/analyze/route.ts [MODIFY]
4. src/app/style-advisor/page.tsx [MODIFY]
5. src/app/layout.tsx [MODIFY]
6. tests/rakuten-and-multisource.test.mjs [NEW]

## 5. Rollback Anchor
- Current: 495339e