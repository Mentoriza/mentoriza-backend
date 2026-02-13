import { StudentGroupChangedData } from '../email.types';

export function generateStudentGroupChangedTemplate(
  data: StudentGroupChangedData,
): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mudança de Grupo - Mentoriza</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: #d81b60; color: white; padding: 30px 20px; text-align: center; }
    .content { padding: 30px 20px; line-height: 1.6; }
    .btn { display: inline-block; background: #d81b60; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { background: #f8f8f8; padding: 15px; text-align: center; font-size: 13px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Sua grupo foi alterado</h1>
    </div>
    <div class="content">
      <p>Olá <strong>${data.studentName}</strong>,</p>
      <p>Informamos que você foi transferido do grupo <strong>${data.oldGroupName}</strong> para o grupo <strong>${data.newGroupName}</strong>.</p>
      <p>Essa mudança foi realizada pela coordenação. Agora você fará parte deste novo grupo para as próximas atividades e submissões.</p>
      
      <div style="text-align: center;">
        <a href="https://mentoriza.com/login" class="btn">Acessar Plataforma</a>
      </div>
      
      <p>Qualquer dúvida sobre essa alteração, entre em contato com seu coordenador.</p>
    </div>
    <div class="footer">
      © 2026 Mentoriza – Sistema de Gestão de Submissões
    </div>
  </div>
</body>
</html>
  `;
}
