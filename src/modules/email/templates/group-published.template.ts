import { GroupPublishedEmailData } from '../email.types';

export function generateGroupPublishedTemplate(
  data: GroupPublishedEmailData,
): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Grupo Publicado – Bem-vindo ao Mentoriza</title>
  <style type="text/css">
    body { margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9f9f9; }
    .container { max-width: 580px; margin: 20px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #A010F9 0%, #7a0ac2 100%); color: white; padding: 40px 24px 32px; text-align: center; }
    .header h1 { margin:0; font-size: 28px; font-weight: 700; }
    .header p { margin: 8px 0 0; font-size: 16px; opacity: 0.95; }
    .content { padding: 32px 24px; color: #333; line-height: 1.6; font-size: 16px; }
    .btn { display: inline-block; background: #A010F9; color: white !important; font-weight: 600; padding: 14px 32px; border-radius: 12px; text-decoration: none; margin: 24px 0; }
    .info-box { background: #f8f5ff; border: 1px solid #d9ccff; border-radius: 12px; padding: 24px; margin: 24px 0; }
    .warning { color: #dc2626; font-size: 14px; font-weight: 600; margin-top: 12px; }
    .label { font-size: 13px; color: #666; font-weight: 600; margin-bottom: 4px; }
    .value { font-size: 17px; color: #111; margin: 0; }
    .footer { background: #f4f4f4; padding: 24px; text-align: center; font-size: 13px; color: #666; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Bem-vindo ao Mentoriza!</h1>
      <p>Sua conta e grupo já estão ativos</p>
    </div>

    <div class="content">
      <p>Olá <strong>${data.studentName}</strong>,</p>

      <p>Parabéns! Seu grupo foi publicado com sucesso. Agora você já pode acessar a plataforma usando as credenciais abaixo.</p>

      <div class="info-box">
        <h3 style="margin:0 0 20px; color:#A010F9;">Suas Credenciais de Acesso</h3>
        
        <div style="margin-bottom: 20px;">
          <div class="label">Email</div>
          <p class="value" style="font-family: monospace;">${data.email}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <div class="label">Senha Temporária</div>
          <p class="value" style="font-family: monospace;">${data.password}</p>
        </div>
        
        <p class="warning"> Altere sua senha imediatamente após o primeiro login por segurança.</p>
      </div>

      <div class="info-box">
        <h3 style="margin:0 0 20px; color:#444;">Informações do Grupo</h3>
        
        <div style="display: flex; flex-wrap: wrap; gap: 20px;">
          <div style="flex: 1; min-width: 200px;">
            <div class="label">Grupo</div>
            <p class="value">${data.groupName}</p>
          </div>
          
          <div style="flex: 1; min-width: 200px;">
            <div class="label">Curso</div>
            <p class="value">${data.courseCode}</p>
          </div>
          
          ${
            data.studentRA
              ? `
          <div style="flex: 1; min-width: 200px;">
            <div class="label">RA</div>
            <p class="value">${data.studentRA}</p>
          </div>
          `
              : ''
          }
        </div>
      </div>

      ${
        data.advisorName
          ? `
      <div class="info-box">
        <h3 style="margin:0 0 20px; color:#444;">Orientador${data.coAdvisorName ? 'es' : ''}</h3>
        
        <div style="margin-bottom: 16px;">
          <div style="font-weight: 600; color: #222;">${data.advisorName}</div>
          <div style="font-size: 14px; color: #555;">Orientador</div>
          ${data.advisorEmail ? `<div style="font-size: 14px; color: #A010F9;">${data.advisorEmail}</div>` : ''}
        </div>
        
        ${
          data.coAdvisorName
            ? `
        <div>
          <div style="font-weight: 600; color: #222;">${data.coAdvisorName}</div>
          <div style="font-size: 14px; color: #555;">Co-orientador</div>
          ${data.coAdvisorEmail ? `<div style="font-size: 14px; color: #A010F9;">${data.coAdvisorEmail}</div>` : ''}
        </div>
        `
            : ''
        }
      </div>
      `
          : ''
      }

      <div style="text-align: center;">
        <a href="https://mentoriza.com/login" class="btn">Acessar a Plataforma Agora</a>
      </div>

      <p style="text-align: center; font-size: 14px; color: #555; margin-top: 32px;">
        Alguma dúvida? Entre em contato com o coordenador do seu curso.
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
