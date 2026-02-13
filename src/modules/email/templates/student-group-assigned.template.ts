import { StudentGroupAssignedData } from '../email.types';

export function generateStudentGroupAssignedTemplate(
  data: StudentGroupAssignedData,
): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vinculação ao Grupo - Mentoriza</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: #6a1b9a; color: white; padding: 30px 20px; text-align: center; }
    .content { padding: 30px 20px; line-height: 1.6; }
    .btn { display: inline-block; background: #6a1b9a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { background: #f8f8f8; padding: 15px; text-align: center; font-size: 13px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Você foi vinculado a um grupo!</h1>
    </div>
    <div class="content">
      <p>Olá <strong>${data.studentName}</strong>,</p>
      <p>Informamos que você foi adicionado ao grupo <strong>${data.groupName}</strong> (${data.course || 'curso não informado'}).</p>
      <p>Agora você pode acessar a plataforma, visualizar relatórios, submissões e interagir com seu orientador e colegas.</p>
      
      <div style="text-align: center;">
        <a href="https://mentoriza.com/login" class="btn">Acessar Plataforma</a>
      </div>
      
      <p>Qualquer dúvida, entre em contato com seu coordenador ou orientador.</p>
    </div>
    <div class="footer">
      © 2026 Mentoriza – Sistema de Gestão de Submissões
    </div>
  </div>
</body>
</html>
  `;
}
