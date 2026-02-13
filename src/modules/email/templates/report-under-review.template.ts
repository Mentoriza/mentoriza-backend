import { ReportUnderReviewEmailData } from '../email.types';

export function generateReportUnderReviewTemplate(
  data: ReportUnderReviewEmailData,
): string {
  const today = new Date().toLocaleDateString('pt-BR');

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório em Avaliação - Mentoriza</title>
  <style type="text/css">
    body { margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9f9f9; }
    .container { max-width: 580px; margin: 20px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { color: white; padding: 40px 24px 32px; text-align: center; }
    .header h1 { margin:0; font-size: 28px; font-weight: 700; }
    .header p { margin: 8px 0 0; font-size: 16px; opacity: 0.95; }
    .content { padding: 32px 24px; color: #333; line-height: 1.6; font-size: 16px; }
    .btn { display: inline-block; background: #A010F9; color: white !important; font-weight: 600; padding: 14px 32px; border-radius: 12px; text-decoration: none; margin: 20px 0; }
    .info-box { background: #f8f5ff; border: 1px solid #d9ccff; border-radius: 12px; padding: 20px; margin: 24px 0; }
    .status-item { display: flex; align-items: center; margin: 16px 0; }
    .circle { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 16px; font-size: 20px; flex-shrink: 0; }
    .footer { background: #f4f4f4; padding: 24px; text-align: center; font-size: 13px; color: #666; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
      <h1>Seu relatório está em análise</h1>
      <p>Recebemos com sucesso</p>
    </div>

    <div class="content">
      <p>Olá <strong>${data.groupName}</strong>,</p>
      <p>O relatório foi recebido e está sendo avaliado automaticamente.</p>

      <div class="info-box">
        <div class="status-item">
          <div class="circle" style="background:#10b981; color:white;">✓</div>
          <span><strong>Recebido:</strong> ${today}</span>
        </div>
        <div class="status-item">
          <div class="circle" style="background:#f59e0b; color:white;"></div>
          <span><strong>Em análise:</strong> Aguardando IA</span>
        </div>
        <div class="status-item">
          <div class="circle" style="background:#d1d5db; color:#666;">?</div>
          <span><strong>Resultado:</strong> Em breve por email</span>
        </div>
      </div>

      <p style="text-align:center; font-weight:600; color:#f59e0b; margin:24px 0;">
        Tempo estimado: 24–48 horas
      </p>

      <div style="text-align:center;">
        <a href="https://mentoriza.com/dashboard" class="btn">Acompanhar Status</a>
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
