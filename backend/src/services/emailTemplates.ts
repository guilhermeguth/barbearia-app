export interface EmailTemplate {
  subject: string;
  html: string;
}

/**
 * Templates de email modernos e elegantes para o sistema de barbearia
 */
export class EmailTemplates {
  /**
   * Template de teste de conexão SMTP
   */
  static testConnection(testData?: any): EmailTemplate {
    return {
      subject: "✅ Teste de Conexão SMTP - Sistema de Barbearia",
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Teste de Conexão SMTP</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            
            <!-- Header com gradiente -->
            <div style="background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); padding: 40px 30px; text-align: center;">
              <div style="margin: 0 auto 20px; font-size: 60px; line-height: 1;">
                ✂️
              </div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 300;">Sistema de Barbearia</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Teste de Conexão SMTP</p>
            </div>
            
            <!-- Conteúdo principal -->
            <div style="padding: 40px 30px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="margin: 0 auto 15px; font-size: 50px; line-height: 1;">
                  ✅
                </div>
                <h2 style="color: #2e7d32; margin: 0; font-size: 24px;">Conexão Estabelecida!</h2>
                <p style="color: #666; margin: 10px 0 0; font-size: 16px;">Seu servidor SMTP está funcionando perfeitamente.</p>
              </div>
              
              <!-- Card de informações -->
              <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 4px solid #1976d2;">
                <h3 style="color: #1976d2; margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center;">
                  <span style="margin-right: 10px;">📧</span> Detalhes do Teste
                </h3>
                <div style="color: #495057;">
                  <p style="margin: 8px 0; display: flex; justify-content: space-between;">
                    <strong>Data/Hora:</strong> 
                    <span>${new Date().toLocaleString("pt-BR")}</span>
                  </p>
                  <p style="margin: 8px 0; display: flex; justify-content: space-between;">
                    <strong>Status:</strong> 
                    <span style="color: #4caf50; font-weight: 600;">✅ Sucesso</span>
                  </p>
                  ${
        testData
          ? `
                  <p style="margin: 8px 0;">
                    <strong>Dados adicionais:</strong><br>
                    <code style="background-color: #f1f3f4; padding: 8px; border-radius: 4px; font-size: 12px; display: block; margin-top: 5px;">${
            JSON.stringify(testData, null, 2)
          }</code>
                  </p>
                  `
          : ""
      }
                </div>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #dee2e6;">
              <p style="color: #6c757d; font-size: 12px; margin: 0;">
                Este é um email automático do Sistema de Barbearia.<br>
                Não responda a este email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  }

  /**
   * Template de agendamento confirmado
   */
  static appointmentConfirmed(appointment: any): EmailTemplate {
    // Formatar data e hora do agendamento
    const appointmentDate = new Date(appointment.scheduledDateTime);
    const formattedDate = appointmentDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const formattedTime = appointmentDate.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Formatar preço
    const servicePrice = typeof appointment.service?.price === "string"
      ? parseFloat(appointment.service.price)
      : appointment.service?.price || 0;
    const formattedPrice = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(servicePrice);

    return {
      subject: `Agendamento Confirmado - ${
        appointment.service?.name || "Serviço"
      }`,
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Agendamento Confirmado</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            
            <!-- Header com gradiente -->
            <div style="background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%); padding: 40px 30px; text-align: center;">
              <div style="margin: 0 auto 20px; font-size: 60px; line-height: 1;">
                ✂️
              </div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 300;">Barbearia Premium</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Agendamento Confirmado</p>
            </div>
            
            <!-- Conteúdo principal -->
            <div style="padding: 40px 30px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="margin: 0 auto 15px; font-size: 50px; line-height: 1;">
                  ✅
                </div>
                <h2 style="color: #2e7d32; margin: 0; font-size: 24px;">Agendamento Confirmado!</h2>
                <p style="color: #666; margin: 10px 0 0; font-size: 16px;">Olá <strong style="color: #1976d2;">${
        appointment.customer?.name || "Cliente"
      }</strong>, seu agendamento foi confirmado com sucesso!</p>
              </div>
              
              <!-- Card de detalhes do agendamento -->
              <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 4px solid #1976d2;">
                <h3 style="color: #1976d2; margin: 0 0 20px 0; font-size: 20px; display: flex; align-items: center;">
                  <span style="margin-right: 10px;">📅</span> Detalhes do Agendamento
                </h3>
                
                <div style="display: grid; gap: 15px;">
                  <div style="display: flex; align-items: center; padding: 12px; background-color: rgba(255,255,255,0.7); border-radius: 8px;">
                    <span style="margin-right: 12px; font-size: 20px;">💼</span>
                    <div>
                      <strong style="color: #1976d2;">Serviço:</strong><br>
                      <span style="color: #495057;">${
        appointment.service?.name || "N/A"
      }</span>
                    </div>
                  </div>
                  
                  <div style="display: flex; align-items: center; padding: 12px; background-color: rgba(255,255,255,0.7); border-radius: 8px;">
                    <span style="margin-right: 12px; font-size: 20px;">✂️</span>
                    <div>
                      <strong style="color: #1976d2;">Barbeiro:</strong><br>
                      <span style="color: #495057;">${
        appointment.barber?.name || "N/A"
      }</span>
                    </div>
                  </div>
                  
                  <div style="display: flex; align-items: center; padding: 12px; background-color: rgba(255,255,255,0.7); border-radius: 8px;">
                    <span style="margin-right: 12px; font-size: 20px;">📅</span>
                    <div>
                      <strong style="color: #1976d2;">Data:</strong><br>
                      <span style="color: #495057;">${formattedDate}</span>
                    </div>
                  </div>
                  
                  <div style="display: flex; align-items: center; padding: 12px; background-color: rgba(255,255,255,0.7); border-radius: 8px;">
                    <span style="margin-right: 12px; font-size: 20px;">⏰</span>
                    <div>
                      <strong style="color: #1976d2;">Horário:</strong><br>
                      <span style="color: #495057;">${formattedTime}</span>
                    </div>
                  </div>
                  
                  <div style="display: flex; align-items: center; padding: 12px; background-color: rgba(255,255,255,0.7); border-radius: 8px;">
                    <span style="margin-right: 12px; font-size: 20px;">💰</span>
                    <div>
                      <strong style="color: #1976d2;">Valor:</strong><br>
                      <span style="color: #495057; font-size: 18px; font-weight: 600;">${formattedPrice}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Dicas importantes -->
              <div style="background-color: #fff3e0; border-radius: 12px; padding: 20px; margin: 25px 0; border-left: 4px solid #ff9800;">
                <h4 style="color: #f57c00; margin: 0 0 15px 0; display: flex; align-items: center;">
                  <span style="margin-right: 10px;">💡</span> Lembrete Importante
                </h4>
                <ul style="color: #5d4037; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;">Chegue com 10 minutos de antecedência</li>
                  <li style="margin-bottom: 8px;">Em caso de cancelamento, avise com 24h de antecedência</li>
                </ul>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #dee2e6;">
              <p style="color: #1976d2; font-size: 16px; font-weight: 600; margin: 0 0 10px;">Obrigado por escolher nossa barbearia!</p>
              <p style="color: #6c757d; font-size: 12px; margin: 0;">
                Este é um email automático do Sistema de Barbearia.<br>
                Para cancelar ou reagendar, acesse nosso sistema ou entre em contato.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  }

  /**
   * Template de agendamento cancelado
   */
  static appointmentCancelled(appointment: any): EmailTemplate {
    // Formatar data e hora do agendamento
    const appointmentDate = new Date(appointment.scheduledDateTime);
    const formattedDate = appointmentDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const formattedTime = appointmentDate.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return {
      subject: `Agendamento Cancelado - ${
        appointment.service?.name || "Serviço"
      }`,
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Agendamento Cancelado</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            
            <!-- Header com gradiente -->
            <div style="background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%); padding: 40px 30px; text-align: center;">
              <div style="margin: 0 auto 20px; font-size: 60px; line-height: 1;">
                ✂️
              </div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 300;">Barbearia Premium</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Agendamento Cancelado</p>
            </div>
            
            <!-- Conteúdo principal -->
            <div style="padding: 40px 30px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="margin: 0 auto 15px; font-size: 50px; line-height: 1;">
                  ❌
                </div>
                <h2 style="color: #d32f2f; margin: 0; font-size: 24px;">Agendamento Cancelado</h2>
                <p style="color: #666; margin: 10px 0 0; font-size: 16px;">Olá <strong style="color: #1976d2;">${
        appointment.customer?.name || "Cliente"
      }</strong>, informamos que seu agendamento foi cancelado.</p>
              </div>
              
              <!-- Card de detalhes do agendamento -->
              <div style="background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 4px solid #f44336;">
                <h3 style="color: #d32f2f; margin: 0 0 20px 0; font-size: 20px; display: flex; align-items: center;">
                  <span style="margin-right: 10px;">📅</span> Agendamento Cancelado
                </h3>
                
                <div style="display: grid; gap: 15px;">
                  <div style="display: flex; align-items: center; padding: 12px; background-color: rgba(255,255,255,0.7); border-radius: 8px;">
                    <span style="margin-right: 12px; font-size: 20px;">💼</span>
                    <div>
                      <strong style="color: #d32f2f;">Serviço:</strong><br>
                      <span style="color: #495057;">${
        appointment.service?.name || "N/A"
      }</span>
                    </div>
                  </div>
                  
                  <div style="display: flex; align-items: center; padding: 12px; background-color: rgba(255,255,255,0.7); border-radius: 8px;">
                    <span style="margin-right: 12px; font-size: 20px;">✂️</span>
                    <div>
                      <strong style="color: #d32f2f;">Barbeiro:</strong><br>
                      <span style="color: #495057;">${
        appointment.barber?.name || "N/A"
      }</span>
                    </div>
                  </div>
                  
                  <div style="display: flex; align-items: center; padding: 12px; background-color: rgba(255,255,255,0.7); border-radius: 8px;">
                    <span style="margin-right: 12px; font-size: 20px;">📅</span>
                    <div>
                      <strong style="color: #d32f2f;">Data:</strong><br>
                      <span style="color: #495057;">${formattedDate}</span>
                    </div>
                  </div>
                  
                  <div style="display: flex; align-items: center; padding: 12px; background-color: rgba(255,255,255,0.7); border-radius: 8px;">
                    <span style="margin-right: 12px; font-size: 20px;">⏰</span>
                    <div>
                      <strong style="color: #d32f2f;">Horário:</strong><br>
                      <span style="color: #495057;">${formattedTime}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Novo agendamento -->
              <div style="background-color: #e3f2fd; border-radius: 12px; padding: 20px; margin: 25px 0; border-left: 4px solid #1976d2;">
                <h4 style="color: #1976d2; margin: 0 0 15px 0; display: flex; align-items: center;">
                  <span style="margin-right: 10px;">💡</span> Fazer Novo Agendamento
                </h4>
                <p style="color: #495057; margin: 0;">
                  Você pode fazer um novo agendamento a qualquer momento através do nosso sistema. 
                  Estamos sempre prontos para atendê-lo com a excelência que você merece!
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #dee2e6;">
              <p style="color: #1976d2; font-size: 16px; font-weight: 600; margin: 0 0 10px;">Esperamos vê-lo em breve!</p>
              <p style="color: #6c757d; font-size: 12px; margin: 0;">
                Este é um email automático do Sistema de Barbearia.<br>
                Para fazer um novo agendamento, acesse nosso sistema ou entre em contato.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  }

  /**
   * Template de lembrete de agendamento
   */
  static appointmentReminder(appointment: any): EmailTemplate {
    // Formatar data e hora do agendamento
    const appointmentDate = new Date(appointment.scheduledDateTime);
    const formattedDate = appointmentDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const formattedTime = appointmentDate.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Formatar preço
    const servicePrice = typeof appointment.service?.price === "string"
      ? parseFloat(appointment.service.price)
      : appointment.service?.price || 0;
    const formattedPrice = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(servicePrice);

    return {
      subject: `Lembrete: Agendamento amanhã - ${
        appointment.service?.name || "Serviço"
      }`,
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Lembrete de Agendamento</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            
            <!-- Header com gradiente -->
            <div style="background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); padding: 40px 30px; text-align: center;">
              <div style="margin: 0 auto 20px; font-size: 60px; line-height: 1;">
                ✂️
              </div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 300;">Barbearia Premium</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Lembrete de Agendamento</p>
            </div>
            
            <!-- Conteúdo principal -->
            <div style="padding: 40px 30px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="margin: 0 auto 15px; font-size: 50px; line-height: 1;">
                  ⏰
                </div>
                <h2 style="color: #f57c00; margin: 0; font-size: 24px;">Lembrete do Seu Agendamento</h2>
                <p style="color: #666; margin: 10px 0 0; font-size: 16px;">Olá <strong style="color: #1976d2;">${
        appointment.customer?.name || "Cliente"
      }</strong>, não esqueça do seu agendamento!</p>
              </div>
              
              <!-- Card de detalhes do agendamento -->
              <div style="background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 4px solid #ff9800;">
                <h3 style="color: #f57c00; margin: 0 0 20px 0; font-size: 20px; display: flex; align-items: center;">
                  <span style="margin-right: 10px;">📅</span> Seu Agendamento
                </h3>
                
                <div style="display: grid; gap: 15px;">
                  <div style="display: flex; align-items: center; padding: 12px; background-color: rgba(255,255,255,0.7); border-radius: 8px;">
                    <span style="margin-right: 12px; font-size: 20px;">💼</span>
                    <div>
                      <strong style="color: #f57c00;">Serviço:</strong><br>
                      <span style="color: #495057;">${
        appointment.service?.name || "N/A"
      }</span>
                    </div>
                  </div>
                  
                  <div style="display: flex; align-items: center; padding: 12px; background-color: rgba(255,255,255,0.7); border-radius: 8px;">
                    <span style="margin-right: 12px; font-size: 20px;">✂️</span>
                    <div>
                      <strong style="color: #f57c00;">Barbeiro:</strong><br>
                      <span style="color: #495057;">${
        appointment.barber?.name || "N/A"
      }</span>
                    </div>
                  </div>
                  
                  <div style="display: flex; align-items: center; padding: 12px; background-color: rgba(255,255,255,0.7); border-radius: 8px;">
                    <span style="margin-right: 12px; font-size: 20px;">📅</span>
                    <div>
                      <strong style="color: #f57c00;">Data:</strong><br>
                      <span style="color: #495057;">${formattedDate}</span>
                    </div>
                  </div>
                  
                  <div style="display: flex; align-items: center; padding: 12px; background-color: rgba(255,255,255,0.7); border-radius: 8px;">
                    <span style="margin-right: 12px; font-size: 20px;">⏰</span>
                    <div>
                      <strong style="color: #f57c00;">Horário:</strong><br>
                      <span style="color: #495057; font-size: 18px; font-weight: 600;">${formattedTime}</span>
                    </div>
                  </div>
                  
                  <div style="display: flex; align-items: center; padding: 12px; background-color: rgba(255,255,255,0.7); border-radius: 8px;">
                    <span style="margin-right: 12px; font-size: 20px;">💰</span>
                    <div>
                      <strong style="color: #f57c00;">Valor:</strong><br>
                      <span style="color: #495057; font-size: 18px; font-weight: 600;">${formattedPrice}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Dicas para o agendamento -->
              <div style="background-color: #e3f2fd; border-radius: 12px; padding: 20px; margin: 25px 0; border-left: 4px solid #1976d2;">
                <h4 style="color: #1976d2; margin: 0 0 15px 0; display: flex; align-items: center;">
                  <span style="margin-right: 10px;">💡</span> Dicas Importantes
                </h4>
                <ul style="color: #495057; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;">Chegue com 10 minutos de antecedência</li>
                  <li style="margin-bottom: 8px;">Se não puder comparecer, cancele com antecedência</li>
                </ul>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #dee2e6;">
              <p style="color: #1976d2; font-size: 16px; font-weight: 600; margin: 0 0 10px;">Aguardamos você no horário marcado!</p>
              <p style="color: #6c757d; font-size: 12px; margin: 0;">
                Este é um email automático do Sistema de Barbearia.<br>
                Para cancelar ou reagendar, acesse nosso sistema ou entre em contato.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  }
}
