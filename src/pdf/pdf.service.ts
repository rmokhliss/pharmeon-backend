import { Injectable } from '@nestjs/common';

type InvoiceData = {
  reference: string;
  issued_at: Date | null;
  total_ht: number;
  total_ttc: number;
  statut: string;
  commande: {
    reference: string;
    client: { nom: string; ville: string | null; telephone: string | null; adresse: string | null };
    items: { quantite: number; prixUnitaire: number; final_price: number | null; product: { nom: string; reference: string; unite: string } }[];
  };
};

type DeliveryNoteData = {
  reference: string;
  delivery_date: Date | null;
  tracking_number: string | null;
  statut: string;
  commande: {
    reference: string;
    client: { nom: string; ville: string | null; telephone: string | null; adresse: string | null };
    items: { quantite: number; product: { nom: string; reference: string; unite: string } }[];
  };
};

@Injectable()
export class PdfService {
  private escHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  private baseStyle(): string {
    return `
      body { font-family: Arial, sans-serif; font-size: 13px; color: #1a1a2e; margin: 0; padding: 40px; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
      .logo { font-size: 24px; font-weight: 800; color: #2563eb; letter-spacing: -1px; }
      .doc-title { font-size: 18px; font-weight: 700; color: #374151; margin: 0; }
      .doc-ref { font-size: 13px; color: #6b7280; margin: 4px 0 0; }
      .meta { display: flex; gap: 32px; margin-bottom: 28px; }
      .meta-block { flex: 1; }
      .meta-block h4 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; margin: 0 0 6px; }
      .meta-block p { margin: 2px 0; font-size: 13px; }
      .badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; }
      .badge-green { background: #d1fae5; color: #065f46; }
      .badge-blue { background: #dbeafe; color: #1e40af; }
      .badge-gray { background: #f3f4f6; color: #374151; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; }
      th { background: #f9fafb; border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; font-size: 12px; color: #6b7280; }
      td { border: 1px solid #e5e7eb; padding: 8px 12px; font-size: 13px; }
      tr:nth-child(even) td { background: #f9fafb; }
      .totals { margin-top: 20px; text-align: right; }
      .totals table { width: auto; margin-left: auto; }
      .totals td { border: none; padding: 3px 12px; }
      .totals .total-ttc { font-weight: 700; font-size: 16px; border-top: 2px solid #2563eb; }
      .footer { margin-top: 48px; border-top: 1px solid #e5e7eb; padding-top: 12px; text-align: center; color: #9ca3af; font-size: 11px; }
    `;
  }

  generateInvoiceHtml(data: InvoiceData): string {
    const date = data.issued_at ? new Date(data.issued_at).toLocaleDateString('fr-FR') : '—';
    const badgeClass = data.statut === 'PAYEE' ? 'badge-green' : data.statut === 'EMISE' ? 'badge-blue' : 'badge-gray';
    const rows = data.commande.items.map((item) => {
      const pu = item.final_price ?? item.prixUnitaire;
      const total = Math.round(pu * item.quantite * 100) / 100;
      return `
        <tr>
          <td>${this.escHtml(item.product.reference)}</td>
          <td>${this.escHtml(item.product.nom)}</td>
          <td style="text-align:center">${item.quantite} ${this.escHtml(item.product.unite)}</td>
          <td style="text-align:right">${pu.toFixed(2)} €</td>
          <td style="text-align:right">${total.toFixed(2)} €</td>
        </tr>`;
    }).join('');

    return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
      <style>${this.baseStyle()}</style></head><body>
      <div class="header">
        <div>
          <div class="logo">Pharmeon</div>
          <p style="color:#6b7280;font-size:12px;margin:4px 0 0">Grossiste pharmaceutique</p>
        </div>
        <div style="text-align:right">
          <p class="doc-title">FACTURE</p>
          <p class="doc-ref">${this.escHtml(data.reference)}</p>
          <p class="doc-ref">Émise le ${date}</p>
          <span class="badge ${badgeClass}">${data.statut}</span>
        </div>
      </div>
      <div class="meta">
        <div class="meta-block">
          <h4>Facturé à</h4>
          <p><strong>${this.escHtml(data.commande.client.nom)}</strong></p>
          ${data.commande.client.adresse ? `<p>${this.escHtml(data.commande.client.adresse)}</p>` : ''}
          ${data.commande.client.ville ? `<p>${this.escHtml(data.commande.client.ville)}</p>` : ''}
          ${data.commande.client.telephone ? `<p>${this.escHtml(data.commande.client.telephone)}</p>` : ''}
        </div>
        <div class="meta-block">
          <h4>Commande liée</h4>
          <p>${this.escHtml(data.commande.reference)}</p>
        </div>
      </div>
      <table>
        <thead><tr><th>Réf.</th><th>Désignation</th><th>Qté</th><th>PU HT</th><th>Total HT</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="totals">
        <table>
          <tr><td>Total HT</td><td>${data.total_ht.toFixed(2)} €</td></tr>
          <tr><td>TVA (20%)</td><td>${(data.total_ttc - data.total_ht).toFixed(2)} €</td></tr>
          <tr class="total-ttc"><td><strong>Total TTC</strong></td><td><strong>${data.total_ttc.toFixed(2)} €</strong></td></tr>
        </table>
      </div>
      <div class="footer">Pharmeon — Document généré automatiquement — ${new Date().toLocaleDateString('fr-FR')}</div>
    </body></html>`;
  }

  generateDeliveryNoteHtml(data: DeliveryNoteData): string {
    const date = data.delivery_date ? new Date(data.delivery_date).toLocaleDateString('fr-FR') : '—';
    const badgeClass = data.statut === 'LIVRE' ? 'badge-green' : 'badge-blue';
    const rows = data.commande.items.map((item) => `
      <tr>
        <td>${this.escHtml(item.product.reference)}</td>
        <td>${this.escHtml(item.product.nom)}</td>
        <td style="text-align:center">${item.quantite} ${this.escHtml(item.product.unite)}</td>
        <td style="text-align:center">☐</td>
      </tr>`).join('');

    return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
      <style>${this.baseStyle()}</style></head><body>
      <div class="header">
        <div>
          <div class="logo">Pharmeon</div>
          <p style="color:#6b7280;font-size:12px;margin:4px 0 0">Grossiste pharmaceutique</p>
        </div>
        <div style="text-align:right">
          <p class="doc-title">BON DE LIVRAISON</p>
          <p class="doc-ref">${this.escHtml(data.reference)}</p>
          <p class="doc-ref">Livraison le ${date}</p>
          <span class="badge ${badgeClass}">${data.statut}</span>
        </div>
      </div>
      <div class="meta">
        <div class="meta-block">
          <h4>Livré à</h4>
          <p><strong>${this.escHtml(data.commande.client.nom)}</strong></p>
          ${data.commande.client.adresse ? `<p>${this.escHtml(data.commande.client.adresse)}</p>` : ''}
          ${data.commande.client.ville ? `<p>${this.escHtml(data.commande.client.ville)}</p>` : ''}
          ${data.commande.client.telephone ? `<p>${this.escHtml(data.commande.client.telephone)}</p>` : ''}
        </div>
        <div class="meta-block">
          <h4>Commande</h4>
          <p>${this.escHtml(data.commande.reference)}</p>
          ${data.tracking_number ? `<h4 style="margin-top:12px">N° suivi</h4><p>${this.escHtml(data.tracking_number)}</p>` : ''}
        </div>
      </div>
      <table>
        <thead><tr><th>Réf.</th><th>Désignation</th><th>Qté</th><th>Réceptionné ✓</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="margin-top:40px;display:flex;justify-content:space-between">
        <div><p style="color:#6b7280;font-size:12px">Signature livreur</p><div style="border-top:1px solid #9ca3af;width:200px;margin-top:40px"></div></div>
        <div><p style="color:#6b7280;font-size:12px">Signature client</p><div style="border-top:1px solid #9ca3af;width:200px;margin-top:40px"></div></div>
      </div>
      <div class="footer">Pharmeon — Bon de livraison généré automatiquement — ${new Date().toLocaleDateString('fr-FR')}</div>
    </body></html>`;
  }
}
