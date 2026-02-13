import { PasswordResetEmailData } from '../email.types';

export function generatePasswordResetTemplate(
  data: PasswordResetEmailData,
): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinir Senha - Mentoriza</title>
  <style type="text/css">
    body { margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9f9f9; }
    .container { max-width: 580px; margin: 20px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #A010F9 0%, #7a0ac2 100%); color: white; padding: 40px 24px 32px; text-align: center; }
    .header h1 { margin:0; font-size: 28px; font-weight: 700; }
    .header p { margin: 8px 0 0; font-size: 16px; opacity: 0.95; }
    .content { padding: 32px 24px; color: #333; line-height: 1.6; font-size: 16px; }
    .btn { display: inline-block; background: #A010F9; color: white !important; font-weight: 600; padding: 14px 32px; border-radius: 12px; text-decoration: none; margin: 24px 0; }
    .btn:hover { background: #8a0dd4; }
    .info-box { background: #f8f5ff; border: 1px solid #d9ccff; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center; }
    .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 24px 0; border-radius: 4px; color: #444; font-size: 15px; }
    .small { font-size: 14px; color: #555; }
    .footer { background: #f4f4f4; padding: 24px; text-align: center; font-size: 13px; color: #666; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔑 Redefinir sua senha</h1>
      <p>Pedido recebido com sucesso</p>
    </div>

    <div class="content">
      <p>Olá <strong>${data.name || data.email.split('@')[0]}</strong>,</p>

      <p>Recebemos um pedido para redefinir a senha da sua conta no Mentoriza. Clique no botão abaixo para criar uma nova senha:</p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${data.resetLink}" class="btn" style="font-size: 18px; padding: 16px 40px;">
          Criar Nova Senha
        </a>
      </div>

      <div class="info-box">
        <p style="margin: 0 0 16px; font-weight: 600; color: #A010F9;">Link válido por ${data.expiresIn || '60 minutos'}</p>
        <p class="small">Se o botão não funcionar, copie e cole este link no seu navegador:</p>
        <p class="small" style="word-break: break-all; font-family: monospace; color: #A010F9; margin: 12px 0;">
          ${data.resetLink}
        </p>
      </div>

      <div class="warning">
        <strong>Atenção:</strong> Nunca compartilhe este link ou sua senha com ninguém. 
        Se você não solicitou esta redefinição, ignore este email — sua conta permanece segura.
      </div>

      <p style="margin-top: 32px;">Após definir a nova senha, você poderá acessar a plataforma normalmente.</p>

      <p style="text-align: center; margin-top: 32px;" class="small">
        Alguma dúvida? Entre em contato com o suporte ou coordenador do curso.
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
