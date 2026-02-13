import { AdvisorGroupRemovedData } from '../email.types';

export function generateAdvisorGroupRemovedTemplate(
  data: AdvisorGroupRemovedData,
): string {
  const role = data.isCoAdvisor ? 'co-orientador' : 'orientador';
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Vinculação ao Grupo - Mentoriza</title>
  <style> /* mesmo estilo que os anteriores */ </style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: #1976d2;">
      <h1>Você foi removido como ${role}</h1>
    </div>
    <div class="content">
      <p>Olá <strong>${data.advisorName}</strong>,</p>
      <p>Você foi vinculado ao grupo <strong>${data.groupName}</strong> como ${role}.</p>
      <p>A partir de agora poderá acompanhar as submissões, relatórios e orientar os estudantes desse grupo.</p>
      <div style="text-align: center;">
        <a href="https://mentoriza.com/login" class="btn">Acessar Plataforma</a>
      </div>
    </div>
    <div class="footer">© 2026 Mentoriza</div>
  </div>
</body>
</html>
  `;
}
