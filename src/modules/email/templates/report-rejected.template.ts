import { ReportRejectedEmailData } from '../email.types';

export function generateReportRejectedTemplate(
  data: ReportRejectedEmailData,
): string {
  const reasonsList = data.reasons
    .map((reason) => `<li style="margin:8px 0;">• ${reason}</li>`)
    .join('');

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório Rejeitado - Mentoriza</title>
  <style type="text/css">
    body { margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9f9f9; }
    .container { max-width: 580px; margin: 20px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { color: white; padding: 40px 24px 32px; text-align: center; }
    .header h1 { margin:0; font-size: 28px; font-weight: 700; }
    .header p { margin: 8px 0 0; font-size: 16px; opacity: 0.95; }
    .content { padding: 32px 24px; color: #333; line-height: 1.6; font-size: 16px; }
    .btn { display: inline-block; background: #A010F9; color: white !important; font-weight: 600; padding: 14px 32px; border-radius: 12px; text-decoration: none; margin: 20px 0; }
    .info-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px; margin: 24px 0; }
    .footer { background: #f4f4f4; padding: 24px; text-align: center; font-size: 13px; color: #666; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
      <h1>❌ Revisão necessária</h1>
      <p>O relatório precisa de ajustes</p>
    </div>

    <div class="content">
      <p>Olá <strong>${data.groupName}</strong>,</p>
      <p>O trabalho não atendeu aos critérios e foi <strong style="color:#ef4444">rejeitado</strong>.</p>

      <div class="info-box" style="text-align:center;">
        <p style="font-size:42px; font-weight:700; color:#ef4444; margin:0;">
          ${data.score.toFixed(1)} /10
        </p>
      </div>

      <h3>Motivos principais</h3>
      <ul style="padding-left:24px; color:#991b1b; line-height:1.7; margin:16px 0;">
        ${reasonsList}
      </ul>

      <h3>Próximos passos</h3>
      <ol style="padding-left:24px; margin:16px 0; line-height:1.7;">
        <li>Leia os motivos com atenção</li>
        <li>Converse com os orientadores</li>
        <li>Faça as correções</li>
        <li>Reenvie o arquivo</li>
      </ol>

      <div style="text-align:center; margin:32px 0;">
        <a href="https://mentoriza.com/dashboard" class="btn">Ver Detalhes Completos</a>
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
