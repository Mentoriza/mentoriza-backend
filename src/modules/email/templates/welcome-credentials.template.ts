import { WelcomeCredentialsEmailData } from '../email.types';

export function generateWelcomeCredentialsTemplate(
  data: WelcomeCredentialsEmailData,
): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Credenciais de Acesso - Mentoriza</title>
  <style type="text/css">
    body { margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9f9f9; }
    .container { max-width: 580px; margin: 20px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #A010F9 0%, #7a0ac2 100%); color: white; padding: 40px 24px 32px; text-align: center; }
    .header h1 { margin:0; font-size: 28px; font-weight: 700; }
    .header p { margin: 8px 0 0; font-size: 16px; opacity: 0.95; }
    .content { padding: 32px 24px; color: #333; line-height: 1.6; font-size: 16px; }
    .btn { display: inline-block; background: #A010F9; color: white !important; font-weight: 600; padding: 14px 32px; border-radius: 12px; text-decoration: none; margin: 20px 0; }
    .info-box { background: #f8f5ff; border: 1px solid #d9ccff; border-radius: 12px; padding: 24px; margin: 24px 0; }
    .warning { color: #dc2626; font-weight: 600; font-size: 14px; margin-top: 12px; }
    .footer { background: #f4f4f4; padding: 24px; text-align: center; font-size: 13px; color: #666; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>👤 Suas credenciais Mentoriza</h1>
      <p>Acesso à plataforma liberado</p>
    </div>

    <div class="content">
      <p>Olá <strong>${data.studentName}</strong>,</p>
      <p>Seu grupo foi criado e você já pode acessar a plataforma.</p>

      <div class="info-box">
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Senha temporária:</strong> ${data.password}</p>
        <p class="warning">⚠️ Altere a senha no primeiro acesso por segurança</p>
      </div>

      <h3>Dados do grupo</h3>
      <p style="margin:8px 0;">
        <strong>Grupo:</strong> ${data.groupName}<br>
        <strong>Curso:</strong> ${data.courseCode}<br>
        ${data.studentRA ? `<strong>RA:</strong> ${data.studentRA}<br>` : ''}
      </p>

      <div style="text-align:center; margin:32px 0;">
        <a href="https://mentoriza.com/login" class="btn">Entrar na Plataforma</a>
      </div>

      <p style="text-align:center; font-size:14px; color:#555;">
        Guarde estas informações. Qualquer dúvida fale com o coordenador.
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
