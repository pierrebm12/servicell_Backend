import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont } from 'pdf-lib';
import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as pathLib from 'path';
import sharp from 'sharp';

const MARGIN = 45;
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MID = PAGE_W / 2;
const COL_W = MID - MARGIN - 8;
const SEC_H = 20;
const GAP_AFTER_SECTION = 6;
const SEC_BOTTOM_PAD = 12;

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  private readonly uploadDir = pathLib.resolve(process.cwd(), 'uploads');
  private accentR = 0.83;
  private accentG = 0.18;
  private accentB = 0.18;

  constructor(private prisma: PrismaService) {}

  private get accent() { return rgb(this.accentR, this.accentG, this.accentB); }
  private get accentLight() { return rgb(this.accentR * 0.85, this.accentG * 0.85, this.accentB * 0.85); }
  private get accentBg() { return rgb(
    this.accentR + (1 - this.accentR) * 0.65,
    this.accentG + (1 - this.accentG) * 0.65,
    this.accentB + (1 - this.accentB) * 0.65,
  ); }

  async generateOrderPdf(orderId: number, type: 'INGRESO' | 'ENTREGA'): Promise<string> {
    const order = await this.prisma.serviceOrder.findUnique({
      where: { id: orderId },
      include: {
        client: true, equipment: true, createdBy: true, assignedTo: true,
        diagnostics: { include: { user: true } },
        photographs: true, signatures: true,
        statusChanges: { include: { user: true }, orderBy: { createdAt: 'asc' } },
        checklists: true, parts: true,
        repairNotes: { include: { user: true }, orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
    if (!order) throw new NotFoundException('Order not found');

    const config = await this.prisma.companyConfig.findFirst();

    // Use hardcoded red accent regardless of config primaryColor
    this.accentR = 0.83;
    this.accentG = 0.18;
    this.accentB = 0.18;

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    let y = PAGE_H - MARGIN;

    // ── HEADER (only Logo + QR; company info appears in footer) ──
    const HEADER_TOP = PAGE_H;

    // Left: Logo
    const logoH = await this.tryDrawLogo(pdfDoc, page, config?.pdfLogoUrl || config?.logoUrl, MARGIN, HEADER_TOP - 12, 80);

    // Right: QR code
    const qrRightX = PAGE_W - MARGIN - 72;
    try {
      const apiUrl = process.env.API_URL || 'http://localhost:3000';
      const qrUrl = `${apiUrl}/api/v1/pdf/public/${order.orderNumber}`;
      const qrBuf = Buffer.from((await QRCode.toDataURL(qrUrl, { width: 180, margin: 1 })).split(',')[1], 'base64');
      const qrImg = await pdfDoc.embedPng(qrBuf);
      const qrTop = HEADER_TOP - 16;
      page.drawRectangle({ x: qrRightX, y: qrTop - 66, width: 72, height: 72, color: rgb(1, 1, 1) });
      page.drawRectangle({ x: qrRightX, y: qrTop - 66, width: 72, height: 72, borderColor: rgb(0.85, 0.85, 0.85), borderWidth: 0.5 });
      page.drawImage(qrImg, { x: qrRightX + 3, y: qrTop - 63, width: 66, height: 66 });
    } catch { /* skip QR */ }

    y = HEADER_TOP - Math.max(logoH > 0 ? logoH + 20 : 0, 96);

    // Separator line
    page.drawRectangle({ x: MARGIN, y: y - 2, width: PAGE_W - MARGIN * 2, height: 2, color: this.accent });

    y -= 20;
    this.drawSafe(page, `ORDEN DE SERVICIO — ${type === 'INGRESO' ? 'INGRESO / RECIBIDO' : 'ENTREGA / DEVOLUCIÓN'}`, {
      x: MARGIN, y, size: 15, font: boldFont, color: this.accent,
    });
    y -= 16;
    this.drawSafe(page, `No. ${order.orderNumber}     Fecha: ${order.createdAt.toLocaleDateString('es-CO')}     Estado: ${order.status}`, {
      x: MARGIN, y, size: 9, font,
    });
    y -= 18;
    page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.5, color: rgb(0.75, 0.75, 0.75) });
    y -= 10;

    // ── TWO-COLUMN ──────────────────────────────────────────
    const colX = (c: 'left' | 'right') => c === 'left' ? MARGIN : MID + 5;
    const colTx = (c: 'left' | 'right') => c === 'left' ? MARGIN + 6 : MID + 11;

    let ly = y, ry = y;

    // ── LEFT ────────────────────────────────────────────────
    ly = this.drawSectionBox(page, 'DATOS DEL CLIENTE', colX('left'), ly, boldFont);
    const clientLines = [
      `${order.client.name}`, `CC: ${order.client.document}`, `Tel: ${order.client.phone}`,
      ...(order.client.email ? [`Email: ${order.client.email}`] : []),
    ];
    for (const line of clientLines) {
      this.drawSafe(page, line, { x: colTx('left'), y: ly, size: 9, font }); ly -= 14;
    }
    if (order.clientPhotoUrl) {
      const photoX = MID - 130;
      const photoY = ly + clientLines.length * 10;
      page.drawRectangle({ x: photoX - 2, y: photoY - 82, width: 124, height: 84, borderColor: rgb(0.7, 0.7, 0.7), borderWidth: 0.5 });
      await this.tryDrawImage(pdfDoc, page, order.clientPhotoUrl, photoX, photoY, 120, 80);
      ly = Math.min(ly, photoY - 86);
    }
    ly -= SEC_BOTTOM_PAD;

    ly = this.ensureSpaceAndSync(page, ly, 80, pdfDoc, (v) => ly = v, (v, p) => { ry = v; if (p) page = p; });
    ly = this.drawSectionBox(page, 'FALLA REPORTADA', colX('left'), ly, boldFont);
    ly = this.drawLines(page, this.wrapText(order.reportedFault || 'No reportada', 38), colTx('left'), ly, 9, font) - 6;
    ly -= SEC_BOTTOM_PAD;

    if (order.physicalState) {
      ly = this.ensureSpaceAndSync(page, ly, 60, pdfDoc, (v) => ly = v, (v, p) => { ry = v; if (p) page = p; });
      ly = this.drawSectionBox(page, 'ESTADO FÍSICO', colX('left'), ly, boldFont);
      ly = this.drawLines(page, this.wrapText(order.physicalState, 38), colTx('left'), ly, 9, font) - 6;
      ly -= SEC_BOTTOM_PAD;
    }

    if (order.checklists?.length > 0) {
      ly = this.ensureSpaceAndSync(page, ly, 60 + order.checklists.length * 11, pdfDoc, (v) => ly = v, (v, p) => { ry = v; if (p) page = p; });
      ly = this.drawSectionBox(page, 'CHECKLIST DE COMPONENTES', colX('left'), ly, boldFont);
      if (order.checklists.every((c: any) => c.notTestable)) {
        this.drawSafe(page, 'DISPOSITIVO APAGADO — No fue posible realizar pruebas', { x: colTx('left'), y: ly, size: 7, font: boldFont, color: rgb(0.7, 0.35, 0) });
        ly -= 12;
      }
      for (const c of order.checklists) {
        ly = this.ensureSpaceAndSync(page, ly, 13, pdfDoc, (v) => ly = v, (v, p) => { ry = v; if (p) page = p; });
        const icon = c.checked ? '✓' : c.notTestable ? '–' : '✗';
        const clr = c.checked ? rgb(0, 0.5, 0) : c.notTestable ? rgb(0.6, 0.6, 0.6) : rgb(0.8, 0, 0);
        this.drawSafe(page, `${icon}  ${c.componentName}`, { x: colTx('left'), y: ly, size: 8, font, color: clr });
        ly -= 13;
      }
      ly -= SEC_BOTTOM_PAD;
    }

    // ── RIGHT ───────────────────────────────────────────────
    ry = this.drawSectionBox(page, 'DATOS DEL EQUIPO', colX('right'), ry, boldFont);
    const eq = [`Marca: ${order.equipment.brand}    Modelo: ${order.equipment.model}`];
    if (order.equipment.imei) eq.push(`IMEI: ${order.equipment.imei}`);
    if (order.equipment.serial) eq.push(`Serial: ${order.equipment.serial}`);
    if (order.equipment.color) eq.push(`Color: ${order.equipment.color}`);
    for (const line of eq) { this.drawSafe(page, line, { x: colTx('right'), y: ry, size: 9, font }); ry -= 14; }
    ry -= SEC_BOTTOM_PAD;

    // Accessories
    if (order.equipment.accessories) {
      let accs: any[] = [];
      try { accs = typeof order.equipment.accessories === 'string' ? JSON.parse(order.equipment.accessories) : order.equipment.accessories; } catch { accs = []; }
      const present = accs.filter((a: any) => a.present);
      if (present.length > 0) {
        ry = this.ensureSpaceAndSync(page, ry, 40, pdfDoc, (v, p) => { ly = v; if (p) page = p; }, (v) => ry = v);
        ry = this.drawSectionBox(page, 'ACCESORIOS INGRESADOS', colX('right'), ry, boldFont);
        this.drawSafe(page, present.map((a: any) => `${a.label}`).join('  ·  '), { x: colTx('right'), y: ry, size: 8, font, maxWidth: COL_W - 10 });
        ry -= 15;
        ry -= SEC_BOTTOM_PAD;
      }
    }

    // Observations
    if (order.observations) {
      ry = this.ensureSpaceAndSync(page, ry, 50, pdfDoc, (v, p) => { ly = v; if (p) page = p; }, (v) => ry = v);
      ry = this.drawSectionBox(page, 'OBSERVACIONES', colX('right'), ry, boldFont);
      ry = this.drawLines(page, this.wrapText(order.observations, 38), colTx('right'), ry, 9, font) - 6;
      ry -= SEC_BOTTOM_PAD;
    }

    // Security
    if (order.lockCode || order.devicePassword || order.devicePattern) {
      ry = this.ensureSpaceAndSync(page, ry, 80, pdfDoc, (v, p) => { ly = v; if (p) page = p; }, (v) => ry = v);
      ry = this.drawSectionBox(page, 'SEGURIDAD', colX('right'), ry, boldFont);
      if (order.lockCode) { this.drawSafe(page, `Bloqueo (${order.lockCodeType || 'N/A'}): ${order.lockCode}`, { x: colTx('right'), y: ry, size: 9, font }); ry -= 14; }
      if (order.devicePassword) { this.drawSafe(page, `Contraseña: ${order.devicePassword}`, { x: colTx('right'), y: ry, size: 9, font }); ry -= 14; }
      if (order.devicePattern) {
        this.drawSafe(page, 'Patrón:', { x: colTx('right'), y: ry, size: 9, font });
        ry -= 2;
        this.drawPatternLock(page, colTx('right'), ry - 65, order.devicePattern, this.accent);
        ry -= 78;
      }
      ry -= SEC_BOTTOM_PAD;
    }

    // Sync
    y = Math.min(ly, ry);

    // ── FULL-WIDTH ──────────────────────────────────────────

    // Diagnostics
    if (order.diagnostics.length > 0) {
      y = this.ensureSpace(page, y, 40 + order.diagnostics.length * 40, pdfDoc, (r) => { page = r.page; return r.y; });
      y = this.drawSectionBox(page, 'DIAGNÓSTICO TÉCNICO', MARGIN, y, boldFont);
      for (const diag of order.diagnostics) {
        y = this.ensureSpace(page, y, 40, pdfDoc, (r) => r.y);
        this.drawSafe(page, diag.diagnosis, { x: MARGIN + 10, y, size: 9, font: boldFont, maxWidth: 480 });
        y -= 12;
        const parts: string[] = [];
        if (diag.neededParts) parts.push(`Repuestos: ${diag.neededParts}`);
        if (diag.estimatedCost) parts.push(`Costo: $${Number(diag.estimatedCost).toLocaleString('es-CO')}`);
        if (diag.estimatedTime) parts.push(`Tiempo: ${diag.estimatedTime}`);
        if (diag.user?.name) parts.push(`Técnico: ${diag.user.name}`);
        if (parts.length > 0) {
          this.drawSafe(page, parts.join('  |  '), { x: MARGIN + 14, y, size: 7, font, color: rgb(0.4, 0.4, 0.4) });
          y -= 12;
        }
        page.drawLine({ start: { x: MARGIN + 10, y }, end: { x: PAGE_W - MARGIN - 10, y }, thickness: 0.3, color: rgb(0.85, 0.85, 0.85) });
        y -= 6;
      }
      y -= SEC_BOTTOM_PAD;
    }

    // Parts
    if (order.parts?.length > 0) {
      y = this.ensureSpace(page, y, 40 + order.parts.length * 15, pdfDoc, (r) => { page = r.page; return r.y; });
      y = this.drawSectionBox(page, 'REPUESTOS Y MATERIALES', MARGIN, y, boldFont);
      // Table header
      page.drawRectangle({ x: MARGIN + 6, y: y - 1, width: PAGE_W - MARGIN * 2 - 12, height: 13, color: this.accentBg });
      this.drawSafe(page, 'DESCRIPCIÓN', { x: MARGIN + 10, y: y + 2, size: 8, font: boldFont, color: this.accent });
      this.drawSafe(page, 'VALOR', { x: PAGE_W - MARGIN - 70, y: y + 2, size: 8, font: boldFont, color: this.accent });
      y -= 16;
      let partsTotal = 0;
      for (const part of order.parts) {
        y = this.ensureSpace(page, y, 14, pdfDoc, (r) => r.y);
        this.drawSafe(page, part.partName || 'Repuesto', { x: MARGIN + 10, y, size: 9, font, maxWidth: 320 });
        if (part.cost) {
          this.drawSafe(page, `$${Number(part.cost).toLocaleString('es-CO')}`, { x: PAGE_W - MARGIN - 70, y, size: 9, font });
          partsTotal += Number(part.cost);
        }
        y -= 14;
      }
      if (partsTotal > 0) {
        page.drawLine({ start: { x: MARGIN + 6, y }, end: { x: PAGE_W - MARGIN - 6, y }, thickness: 0.5, color: rgb(0.6, 0.6, 0.6) });
        y -= 4;
        this.drawSafe(page, 'TOTAL REPUESTOS', { x: MARGIN + 10, y, size: 10, font: boldFont });
        this.drawSafe(page, `$${partsTotal.toLocaleString('es-CO')}`, { x: PAGE_W - MARGIN - 70, y, size: 10, font: boldFont });
        y -= 16;
      }
      y -= SEC_BOTTOM_PAD;
    }

    // Status history
    if (order.statusChanges.length > 0) {
      y = this.ensureSpace(page, y, 40 + order.statusChanges.length * 20, pdfDoc, (r) => { page = r.page; return r.y; });
      y = this.drawSectionBox(page, 'HISTORIAL DE CAMBIOS', MARGIN, y, boldFont);
      for (const sc of order.statusChanges) {
        y = this.ensureSpace(page, y, 22, pdfDoc, (r) => r.y);
        page.drawCircle({ x: MARGIN + 5, y: y - 3, size: 3, color: this.accent });
        page.drawLine({ start: { x: MARGIN + 5, y: y - 3 }, end: { x: MARGIN + 5, y: y - 18 }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
        this.drawSafe(page, `${sc.createdAt.toLocaleString('es-CO')}  —  ${sc.toStatus}`, { x: MARGIN + 14, y, size: 8, font: boldFont });
        y -= 11;
        if (sc.user?.name || sc.reason) {
          this.drawSafe(page, [sc.user?.name, sc.reason].filter(Boolean).join(' · '), { x: MARGIN + 14, y, size: 7, font, color: rgb(0.4, 0.4, 0.4) });
          y -= 13;
        }
      }
      y -= SEC_BOTTOM_PAD;
    }

    // ── EVIDENCE (two-column grid: Ingreso | Entrega) ──────
    const ingresos = order.photographs.filter((p) => p.type !== 'ENTREGA');
    const entregas = order.photographs.filter((p) => p.type === 'ENTREGA');
    const showIngreso = ingresos.length > 0;
    const showEntrega = type === 'ENTREGA' && entregas.length > 0;
    if (showIngreso || showEntrega) {
      const r = this.newPage(pdfDoc); page = r.page; y = r.y;
      y = this.drawSectionBox(page, 'EVIDENCIAS FOTOGRÁFICAS', MARGIN, y, boldFont);

      const evColW = (PAGE_W - MARGIN * 2 - 16) / 2;
      const evGap = 4;
      const evInnerCol = (evColW - evGap) / 2;
      const evImgMaxH = 80;
      const evRowH = evImgMaxH + 10;

      const drawPhotoGrid = async (photos: typeof ingresos, colX: number, maxRows: number) => {
        let rowY = y - 6;
        for (let i = 0; i < photos.length && i < maxRows * 2; i += 2) {
          if (rowY - evRowH < 60) { /* skip remaining if overflow */ break; }
          const leftPhoto = photos[i];
          const rightPhoto = i + 1 < photos.length ? photos[i + 1] : null;

          await this.tryDrawImage(pdfDoc, page, leftPhoto.url, colX, rowY - 4, evInnerCol - 6, evImgMaxH);
          this.drawSafe(page, leftPhoto.type || 'Foto', { x: colX, y: rowY - evImgMaxH - 4, size: 6, font: boldFont, color: rgb(0.4, 0.4, 0.4) });

          if (rightPhoto) {
            await this.tryDrawImage(pdfDoc, page, rightPhoto.url, colX + evInnerCol + evGap, rowY - 4, evInnerCol - 6, evImgMaxH);
            this.drawSafe(page, rightPhoto.type || 'Foto', { x: colX + evInnerCol + evGap, y: rowY - evImgMaxH - 4, size: 6, font: boldFont, color: rgb(0.4, 0.4, 0.4) });
          }
          rowY -= evRowH + 4;
        }
        return rowY;
      };

      if (showIngreso) {
        page.drawRectangle({ x: MARGIN + 8, y: y - 14, width: evColW, height: 13, color: this.accentBg });
        this.drawSafe(page, 'EVIDENCIAS DE INGRESO', { x: MARGIN + 12, y: y - 3, size: 8, font: boldFont, color: this.accent });
      }
      if (showEntrega) {
        const entregaColX = MID + 8;
        page.drawRectangle({ x: entregaColX, y: y - 14, width: evColW, height: 13, color: this.accentBg });
        this.drawSafe(page, 'EVIDENCIAS DE ENTREGA', { x: entregaColX + 4, y: y - 3, size: 8, font: boldFont, color: this.accent });
      }

      let ingresoY = y - 6;
      let entregaY = y - 6;

      if (showIngreso) {
        ingresoY = await drawPhotoGrid(ingresos, MARGIN + 10, 20);
      }
      if (showEntrega) {
        entregaY = await drawPhotoGrid(entregas, MID + 10, 20);
      }

      y = Math.min(ingresoY, entregaY) - SEC_BOTTOM_PAD;
    }

    // ── SIGNATURES (two-column: Cliente | Técnico) ─────────
    const sigIngreso = order.signatures.find((s) => s.type === 'INGRESO');
    const sigEntrega = order.signatures.find((s) => s.type === 'ENTREGA');
    if (sigIngreso || sigEntrega) {
      const r = this.newPage(pdfDoc); page = r.page; y = r.y;
      y = this.drawSectionBox(page, 'FIRMAS', MARGIN, y, boldFont);

      const sigColW = (PAGE_W - MARGIN * 2 - 16) / 2 - 10;
      const sigBoxH = 70;

      y = this.ensureSpace(page, y, sigBoxH + 40, pdfDoc, (r) => { page = r.page; return r.y; });

      // CLIENTE column shows the signature for THIS document type (ingreso or entrega)
      // TÉCNICO column shows the other signature if available
      const sigCliente = type === 'INGRESO' ? sigIngreso : sigEntrega;
      const sigTecnico = type === 'INGRESO' ? sigEntrega : sigIngreso;
      const labelCliente = type === 'INGRESO' ? 'Firma de Ingreso' : 'Firma de Entrega';
      const labelTecnico = type === 'INGRESO' ? 'Firma de Entrega' : 'Firma de Ingreso';
      const missingCliente = type === 'INGRESO' ? 'Sin firma de ingreso' : 'Sin firma de entrega';
      const missingTecnico = type === 'INGRESO' ? 'Sin firma de entrega' : 'Sin firma de ingreso';

      // ── Columna CLIENTE (izquierda) ──
      const cx1 = MARGIN + 8;
      page.drawRectangle({ x: cx1, y: y - 14, width: sigColW + 10, height: 13, color: this.accentBg });
      this.drawSafe(page, 'CLIENTE', { x: cx1 + 6, y: y - 3, size: 9, font: boldFont, color: this.accent });

      let sigY = y - 16;
      if (sigCliente) {
        page.drawRectangle({ x: cx1 + 2, y: sigY - sigBoxH, width: sigColW + 6, height: sigBoxH, color: rgb(1, 1, 1) });
        page.drawRectangle({ x: cx1 + 2, y: sigY - sigBoxH, width: sigColW + 6, height: sigBoxH, borderColor: rgb(0.7, 0.7, 0.7), borderWidth: 0.5 });
        await this.tryDrawImage(pdfDoc, page, sigCliente.url, cx1 + 6, sigY - 4, sigColW - 4, sigBoxH - 6);
        this.drawSafe(page, labelCliente, { x: cx1 + 6, y: sigY - sigBoxH - 10, size: 7, font: boldFont, color: rgb(0.4, 0.4, 0.4) });
      } else {
        this.drawSafe(page, missingCliente, { x: cx1 + 6, y: sigY - 4, size: 8, font, color: rgb(0.5, 0.5, 0.5) });
      }

      // ── Columna TÉCNICO (derecha) ──
      const cx2 = MID + 5;
      page.drawRectangle({ x: cx2, y: y - 14, width: sigColW + 10, height: 13, color: this.accentBg });
      this.drawSafe(page, 'TÉCNICO', { x: cx2 + 6, y: y - 3, size: 9, font: boldFont, color: this.accent });

      if (sigTecnico) {
        page.drawRectangle({ x: cx2 + 2, y: sigY - sigBoxH, width: sigColW + 6, height: sigBoxH, color: rgb(1, 1, 1) });
        page.drawRectangle({ x: cx2 + 2, y: sigY - sigBoxH, width: sigColW + 6, height: sigBoxH, borderColor: rgb(0.7, 0.7, 0.7), borderWidth: 0.5 });
        await this.tryDrawImage(pdfDoc, page, sigTecnico.url, cx2 + 6, sigY - 4, sigColW - 4, sigBoxH - 6);
        this.drawSafe(page, labelTecnico, { x: cx2 + 6, y: sigY - sigBoxH - 10, size: 7, font: boldFont, color: rgb(0.4, 0.4, 0.4) });
      } else {
        this.drawSafe(page, missingTecnico, { x: cx2 + 6, y: sigY - 4, size: 8, font, color: rgb(0.5, 0.5, 0.5) });
      }

      y = Math.min(y, sigY - sigBoxH - 20) - SEC_BOTTOM_PAD;
    }

    // ── COSTS ───────────────────────────────────────────────
    const partsTotalCosts = (order.parts || []).reduce((s, p) => s + Number(p.cost || 0), 0);
    const laborCosts = order.laborCost ? Number(order.laborCost) : 0;
    const hasPartsCosts = partsTotalCosts > 0;
    const hasLaborCosts = laborCosts > 0;
    if (hasPartsCosts || hasLaborCosts || order.estimatedCost || order.finalCost) {
      y = this.ensureSpace(page, y, 60, pdfDoc, (r) => { page = r.page; return r.y; });
      y = this.drawSectionBox(page, 'RESUMEN DE COSTOS', MARGIN, y, boldFont);
      const costData: { label: string; value: string; bold?: boolean }[] = [];
      if (hasPartsCosts) costData.push({ label: 'Repuestos y materiales', value: `$${partsTotalCosts.toLocaleString('es-CO')}` });
      if (hasLaborCosts) costData.push({ label: 'Mano de obra', value: `$${laborCosts.toLocaleString('es-CO')}` });
      const calcTotalCosts = partsTotalCosts + laborCosts;
      if (order.finalCost) {
        costData.push({ label: 'TOTAL', value: `$${Number(order.finalCost).toLocaleString('es-CO')}`, bold: true });
      } else if (calcTotalCosts > 0) {
        costData.push({ label: 'TOTAL', value: `$${calcTotalCosts.toLocaleString('es-CO')}`, bold: true });
      }
      for (const cd of costData) {
        this.drawSafe(page, cd.label, { x: MARGIN + 12, y, size: cd.bold ? 11 : 9, font: cd.bold ? boldFont : font });
        this.drawSafe(page, cd.value, { x: PAGE_W - MARGIN - 100, y, size: cd.bold ? 11 : 9, font: cd.bold ? boldFont : font });
        y -= 16;
      }
      // Down payment section
      if (order.downPayment && Number(order.downPayment) > 0) {
        y = this.ensureSpace(page, y, 20, pdfDoc, (r) => { page = r.page; return r.y; });
        const totalForDownPayment = order.finalCost || calcTotalCosts;
        this.drawSafe(page, 'Abono / Anticipo', { x: MARGIN + 12, y, size: 9, font });
        this.drawSafe(page, `-$${Number(order.downPayment).toLocaleString('es-CO')}`, { x: PAGE_W - MARGIN - 100, y, size: 9, font });
        y -= 16;
        this.drawSafe(page, 'Saldo pendiente', { x: MARGIN + 12, y, size: 10, font: boldFont });
        this.drawSafe(page, `$${Math.max(0, totalForDownPayment - Number(order.downPayment)).toLocaleString('es-CO')}`, { x: PAGE_W - MARGIN - 100, y, size: 10, font: boldFont });
        y -= 16;
      } else {
        y -= 4;
        this.drawSafe(page, 'No se realizaron abonos', { x: MARGIN + 12, y, size: 8, font, color: rgb(0.5, 0.5, 0.5) });
        y -= 16;
      }
      y -= SEC_BOTTOM_PAD;
    }

    // ── TERMS (at bottom of last page as footer text) ─────
    if (config?.terms) {
      if (y - 40 > 60) {
        page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.3, color: rgb(0.7, 0.7, 0.7) });
        y -= 10;
        const termsLabel = 'TÉRMINOS Y CONDICIONES';
        const termsLabelW = boldFont.widthOfTextAtSize(termsLabel, 8);
        this.drawSafe(page, termsLabel, { x: (PAGE_W - termsLabelW) / 2, y, size: 8, font: boldFont, color: rgb(0.4, 0.4, 0.4) });
        y -= 12;
        y = this.drawJustifiedText(page, config.terms, MARGIN, y, PAGE_W - MARGIN * 2, 7, font);
      }
    }

    // ── FOOTER ──────────────────────────────────────────────
    const pages = pdfDoc.getPages();
    for (const [idx, p] of pages.entries()) {
      const { width: pw } = p.getSize();
      p.drawLine({ start: { x: MARGIN, y: 42 }, end: { x: pw - MARGIN, y: 42 }, thickness: 0.3, color: rgb(0.7, 0.7, 0.7) });
      const ft = `${config?.companyName || 'ServiCell'}  |  ${config?.address || 'Cra 4 #12-34, Yopal'}  |  Tel: ${config?.phone || '3222570665'}  |  ${config?.email || ''}`;
      this.drawSafe(p, ft, { x: MARGIN, y: 30, size: 6, font, color: rgb(0.5, 0.5, 0.5) });
      this.drawSafe(p, `Página ${idx + 1} de ${pages.length}`, { x: pw - MARGIN - 60, y: 30, size: 6, font, color: rgb(0.5, 0.5, 0.5) });
    }

    // ── SAVE ──────────────────────────────────────────────
    const pdfBytes = await pdfDoc.save();
    const filename = `order-${order.orderNumber}-${type.toLowerCase()}.pdf`;
    const uploadsDir = pathLib.resolve(process.cwd(), 'uploads/pdfs');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    fs.writeFileSync(pathLib.join(uploadsDir, filename), pdfBytes);
    const pdfUrl = `/uploads/pdfs/${filename}`;
    await this.prisma.pdf.create({ data: { url: pdfUrl, type, orderId: order.id } });
    return pdfUrl;
  }

  async getPdfByOrderNumber(orderNumber: string, type: 'INGRESO' | 'ENTREGA' = 'INGRESO'): Promise<Buffer> {
    const order = await this.prisma.serviceOrder.findUnique({ where: { orderNumber } });
    if (!order) throw new NotFoundException('Order not found');
    const pdfUrl = await this.generateOrderPdf(order.id, type);
    const filePath = pathLib.join(this.uploadDir, 'pdfs', pdfUrl.replace('/uploads/pdfs/', ''));
    if (!fs.existsSync(filePath)) throw new NotFoundException('PDF file not found');
    return fs.readFileSync(filePath);
  }

  // ── HELPERS ──────────────────────────────────────────────

  private newPage(pdfDoc: PDFDocument) {
    const page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    return { page, y: PAGE_H - 50 };
  }

  private ensureSpace(page: PDFPage, y: number, needed: number, pdfDoc: PDFDocument, onBreak: (r: { page: PDFPage; y: number }) => number): number {
    if (y - needed < 65) {
      const r = this.newPage(pdfDoc);
      return onBreak(r);
    }
    return y;
  }

  private ensureSpaceAndSync(page: PDFPage, y: number, needed: number, pdfDoc: PDFDocument, setLy: (v: number, p?: PDFPage) => void, setRy: (v: number, p?: PDFPage) => void): number {
    if (y - needed < 65) {
      const r = this.newPage(pdfDoc);
      setLy(r.y, r.page);
      setRy(r.y, r.page);
      return r.y;
    }
    return y;
  }

  private drawSectionBox(page: PDFPage, title: string, x: number, y: number, boldFont: PDFFont): number {
    page.drawRectangle({ x, y: y - 3, width: 3, height: SEC_H - 2, color: this.accent });
    page.drawRectangle({ x: x + 3, y: y - 3, width: PAGE_W - MARGIN * 2 - 3, height: SEC_H - 2, color: this.accentBg });
    this.drawSafe(page, title, { x: x + 10, y: y + 1, size: 9, font: boldFont, color: this.accent });
    return y - SEC_H - GAP_AFTER_SECTION;
  }

  private async tryDrawLogo(pdfDoc: PDFDocument, page: PDFPage, logoUrl: string | null | undefined, x: number, y: number, maxH: number): Promise<number> {
    if (!logoUrl) return 0;
    try {
      const buf = await this.fetchImageBuffer(logoUrl);
      if (!buf) return 0;
      const isSvg = buf[0] === 0x3C;
      const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47;
      let img;
      if (isSvg || isPng) { img = await pdfDoc.embedPng(await sharp(buf).flatten({ background: { r: 255, g: 255, b: 255 } }).png().toBuffer()); }
      else { img = await pdfDoc.embedJpg(buf); }
      const drawH = Math.min(img.height, maxH);
      const drawW = img.width * (drawH / img.height);
      page.drawImage(img, { x, y: y - drawH, width: drawW, height: drawH });
      return drawH;
    } catch (e) { this.logger.warn(`tryDrawLogo failed: ${e.message}`); return 0; }
  }

  private async tryDrawImage(pdfDoc: PDFDocument, page: PDFPage, url: string, x: number, y: number, maxW: number, maxH: number): Promise<number> {
    if (!url) return 0;
    try {
      const buf = await this.fetchImageBuffer(url);
      if (!buf || buf.length < 20) return 0;
      const isSvg = buf[0] === 0x3C;
      const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47;
      let img;
      if (isSvg || isPng) { img = await pdfDoc.embedPng(await sharp(buf).flatten({ background: { r: 255, g: 255, b: 255 } }).png().toBuffer()); }
      else { img = await pdfDoc.embedJpg(buf); }
      const scale = Math.min(maxW / img.width, maxH / img.height, 1);
      const dw = img.width * scale;
      const dh = img.height * scale;
      page.drawImage(img, { x: x || 0, y: y - dh, width: dw, height: dh });
      return dh;
    } catch { return 0; }
  }

  private async fetchImageBuffer(url: string): Promise<Buffer | null> {
    try {
      if (url.startsWith('data:')) return Buffer.from(url.split(',')[1], 'base64');
      if (url.startsWith('/uploads/')) {
        const filePath = pathLib.join(this.uploadDir, url.replace('/uploads/', ''));
        if (fs.existsSync(filePath)) return fs.readFileSync(filePath);
        const oldPath = pathLib.resolve(process.cwd(), 'dist/uploads', url.replace('/uploads/', ''));
        if (fs.existsSync(oldPath)) return fs.readFileSync(oldPath);
        return null;
      }
      if (url.startsWith('file://')) {
        const filePath = url.replace('file://', '');
        if (fs.existsSync(filePath)) return fs.readFileSync(filePath);
      }
      const resp = await fetch(url);
      if (!resp.ok) return null;
      return Buffer.from(await resp.arrayBuffer());
    } catch { return null; }
  }

  private drawJustifiedText(page: PDFPage, text: string, x: number, startY: number, maxWidth: number, size: number, font: PDFFont): number {
    text = this.sanitizeText(text).replace(/[\n\r]+/g, ' ');
    const words = text.split(' ');
    let y = startY;
    let lineWords: string[] = [];
    let lineWidth = 0;
    const spaceW = font.widthOfTextAtSize(' ', size);

    const flushLine = (isLast: boolean) => {
      if (lineWords.length === 0) return;
      if (lineWords.length === 1 || isLast) {
        this.drawSafe(page, lineWords.join(' '), { x, y, size, font, maxWidth });
      } else {
        const lineW = font.widthOfTextAtSize(lineWords.join(' '), size);
        const extra = maxWidth - lineW;
        const gap = extra / (lineWords.length - 1);
        let cx = x;
        for (let i = 0; i < lineWords.length; i++) {
          this.drawSafe(page, lineWords[i], { x: cx, y, size, font });
          cx += font.widthOfTextAtSize(lineWords[i], size) + spaceW + gap;
        }
      }
      y -= size + 4;
    };

    for (const word of words) {
      const w = font.widthOfTextAtSize(word, size);
      if (lineWidth + w + (lineWords.length > 0 ? spaceW : 0) > maxWidth) {
        flushLine(false);
        lineWords = [word];
        lineWidth = w;
      } else {
        lineWords.push(word);
        lineWidth += w + (lineWords.length > 1 ? spaceW : 0);
      }
    }
    if (lineWords.length > 0) flushLine(true);
    return y;
  }

  private drawLines(page: PDFPage, lines: string[], x: number, startY: number, size: number, font: PDFFont): number {
    let y = startY;
    for (const line of lines) { this.drawSafe(page, line, { x, y, size, font, maxWidth: 480 }); y -= size + 5; }
    return y;
  }

  private drawPatternLock(page: PDFPage, x: number, y: number, patternStr: string, color: any) {
    const indices = patternStr.split(',').map(Number).filter(n => n >= 0 && n <= 8);
    if (indices.length < 2) return;
    const dotR = 4;
    const gap = 20;
    const ox = x;
    const oy = y;
    const dotPositions = Array.from({ length: 9 }, (_, i) => ({
      cx: ox + (i % 3) * gap,
      cy: oy + Math.floor(i / 3) * gap,
    }));
    // Lines
    const accent = this.accent;
    for (let i = 0; i < indices.length - 1; i++) {
      const from = dotPositions[indices[i]];
      const to = dotPositions[indices[i + 1]];
      page.drawLine({ start: { x: from.cx, y: from.cy }, end: { x: to.cx, y: to.cy }, thickness: 2, color: accent });
    }
    // Dots
    for (let i = 0; i < 9; i++) {
      const dot = dotPositions[i];
      const selected = indices.includes(i);
      page.drawCircle({ x: dot.cx, y: dot.cy, size: selected ? dotR : dotR - 1, color: selected ? accent : rgb(0.7, 0.7, 0.7) });
    }
  }

  private sanitizeText(text: string): string {
    if (!text) return '';
    const winAnsiRange = (c: string) => {
      const code = c.charCodeAt(0);
      if (code >= 32 && code <= 126) return true;
      if (code >= 160 && code <= 255) return true;
      if (code === 10 || code === 13) return true;
      return false;
    };
    const replacements: Record<string, string> = {
      'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
      'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U',
      'ñ': 'n', 'Ñ': 'N', 'ü': 'u', 'Ü': 'U',
      '¿': '', '¡': '', '€': 'EUR', '—': '-', '–': '-',
      [String.fromCharCode(0x201C)]: '"',
      [String.fromCharCode(0x201D)]: '"',
      [String.fromCharCode(0x2018)]: "'",
      [String.fromCharCode(0x2019)]: "'",
      [String.fromCharCode(0x2022)]: '*',
      [String.fromCharCode(0x2026)]: '...',
      [String.fromCharCode(0xFFFD)]: '',
      '\t': ' ',
    };
    return text.split('').map(c => {
      if (winAnsiRange(c)) return c;
      if (replacements[c] !== undefined) return replacements[c];
      return c.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7E\xA0-\xFF]/g, '');
    }).join('').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
  }

  private drawSafe(page: any, text: string, options: any) {
    page.drawText(this.sanitizeText(text), options);
  }

  private wrapText(text: string, maxChars: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
      if ((current + ' ' + word).trim().length > maxChars) {
        lines.push(current.trim());
        current = word;
      } else {
        current += ' ' + word;
      }
    }
    if (current.trim()) lines.push(current.trim());
    return lines;
  }
}
