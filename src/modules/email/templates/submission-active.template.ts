import { SubmissionActiveEmailData } from '../email.types';

export function generateSubmissionActiveTemplate(
  data: SubmissionActiveEmailData,
): string {
  const deadlineFormatted = new Date(data.deadlineDate).toLocaleDateString(
    'pt-BR',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
  );

  const daysUntilDeadline = Math.ceil(
    (new Date(data.deadlineDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24),
  );

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nova Submissão Aberta - Mentoriza</title>
  <style type="text/css">
    body { margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9f9f9; }
    .container { max-width: 580px; margin: 20px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #A010F9 0%, #7a0ac2 100%); color: white; padding: 40px 24px 32px; text-align: center; }
    .header h1 { margin:0; font-size: 28px; font-weight: 700; }
    .header p { margin: 8px 0 0; font-size: 16px; opacity: 0.95; }
    .content { padding: 32px 24px; color: #333; line-height: 1.6; font-size: 16px; }
    .btn { display: inline-block; background: #A010F9; color: white !important; font-weight: 600; padding: 14px 32px; border-radius: 12px; text-decoration: none; margin: 20px 0; }
    .info-box { background: #f8f5ff; border: 1px solid #d9ccff; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center; }
    .footer { background: #f4f4f4; padding: 24px; text-align: center; font-size: 13px; color: #666; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📤 Nova Submissão Aberta!</h1>
      <p>Período de envio disponível</p>
    </div>

    <div class="content">
      <p>Olá pessoal,</p>
      <p>Uma nova oportunidade de submissão foi aberta. Enviem seus relatórios na plataforma.</p>

      <div class="info-box">
        <h3 style="margin:0 0 8px;">${data.submissionName}</h3>
        <p style="font-size:20px; font-weight:700; color:#A010F9; margin:8px 0;">
          Prazo: ${deadlineFormatted}
        </p>
        <p style="color:#e11d48; font-weight:600; font-size:18px;">
           Restam ${daysUntilDeadline} dias
        </p>
      </div>

      ${
        data.description
          ? `
      <div style="margin:24px 0;">
        <h3>Descrição da tarefa</h3>
        <p>${data.description}</p>
      </div>
      `
          : ''
      }

      <h3>Pontos importantes</h3>
      <ul style="padding-left:24px; margin:16px 0; line-height:1.7;">
        <li> Arquivo apenas em PDF</li>
        <li>Verifique normas ABNT e referências</li>
        <li>Sem prorrogação de prazo</li>
        <li>Avaliação automática por IA</li>
      </ul>

      <div style="text-align:center;">
        <a href="https://mentoriza.com/submissions" class="btn">Acessar Plataforma</a>
      </div>

      <p style="text-align:center; font-size:14px; color:#555; margin-top:32px;">
        Dúvidas? Fale com o coordenador do curso.
      </p>
    </div>

    <div class="footer">
      © 2026 Mentoriza – Gestão Inteligente de Submissões
    </div>
  </div>
</body>
</html>
  `;
}
