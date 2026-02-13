import { ReportApprovedEmailData } from '../email.types';

export function generateReportApprovedTemplate(
  data: ReportApprovedEmailData,
): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório Aprovado - Mentoriza</title>
  <style type="text/css">
    body { margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9f9f9; }
    .container { max-width: 580px; margin: 20px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { color: white; padding: 40px 24px 32px; text-align: center; }
    .header h1 { margin:0; font-size: 28px; font-weight: 700; }
    .header p { margin: 8px 0 0; font-size: 16px; opacity: 0.95; }
    .content { padding: 32px 24px; color: #333; line-height: 1.6; font-size: 16px; }
    .btn { display: inline-block; background: #A010F9; color: white !important; font-weight: 600; padding: 14px 32px; border-radius: 12px; text-decoration: none; margin: 20px 0; }
    .info-box { background: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center; }
    .footer { background: #f4f4f4; padding: 24px; text-align: center; font-size: 13px; color: #666; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
      <h1>✅ Aprovado!</h1>
      <p>Parabéns pelo excelente trabalho</p>
    </div>

    <div class="content">
      <p>Olá <strong>${data.groupName}</strong>,</p>
      <p>Seu relatório foi <strong style="color:#10b981">aprovado</strong> com sucesso.</p>

      <div class="info-box">
        <h3 style="margin:0 0 12px; color:#065f46;">Pontuação Final</h3>
        <p style="font-size:48px; font-weight:700; color:#10b981; margin:0;">
          ${data.score.toFixed(1)} <span style="font-size:28px;">/10</span>
        </p>
      </div>

      ${
        data.observations
          ? `
      <p style="margin-top:24px;"><strong>Observações:</strong> ${data.observations}</p>
      `
          : ''
      }

      <div style="text-align:center; margin:32px 0;">
        <a href="https://mentoriza.com/dashboard" class="btn">Ver Detalhes</a>
      </div>
    </div>

    <div class="footer">
      © 2026 Mentoriza – Gestão Inteligente de Submissões
    </div>
  </div>
</body>
</html>
  `;
}
