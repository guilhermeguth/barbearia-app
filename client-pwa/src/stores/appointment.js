import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const useAppointmentStore = defineStore('appointment', {
  state: () => ({
    barbers: [],
    services: [],
    availableSlots: [],
    myAppointments: [],
    selectedBarber: null,
    selectedService: null,
    selectedDate: null,
    selectedTime: null,
    isLoading: false
  }),

  getters: {
    appointments: (state) => state.myAppointments,
    
    canCreateAppointment: (state) => 
      state.selectedBarber && 
      state.selectedService && 
      state.selectedDate && 
      state.selectedTime,
      
    upcomingAppointments: (state) => 
      state.myAppointments.filter(apt => 
        new Date(apt.scheduledDateTime) > new Date() && 
        apt.status === 'SCHEDULED'
      ),
      
    pastAppointments: (state) => 
      state.myAppointments.filter(apt => 
        new Date(apt.scheduledDateTime) <= new Date() || 
        apt.status !== 'SCHEDULED'
      )
  },

  actions: {
    // Buscar barbeiros disponíveis
    async fetchBarbers() {
      try {
        this.isLoading = true
        const response = await api.get('/client/barbers')
        this.barbers = response.data
        return { success: true }
      } catch (error) {
        console.error('Erro ao buscar barbeiros:', error)
        return { 
          success: false, 
          message: error.response?.data?.message || 'Erro ao carregar barbeiros'
        }
      } finally {
        this.isLoading = false
      }
    },

    // Buscar serviços disponíveis
    async fetchServices() {
      try {
        this.isLoading = true
        const response = await api.get('/client/services')
        this.services = response.data
        return { success: true }
      } catch (error) {
        console.error('Erro ao buscar serviços:', error)
        return { 
          success: false, 
          message: error.response?.data?.message || 'Erro ao carregar serviços'
        }
      } finally {
        this.isLoading = false
      }
    },

    // Buscar horários disponíveis
    async fetchAvailableSlots(barberId, date, serviceId) {
      try {
        this.isLoading = true
        // Buscar duração do serviço
        const service = this.services.find(s => s.id === serviceId)
        const serviceDuration = service?.duration || 60
        
        // Garantir que a data esteja no formato correto (YYYY-MM-DD)
        const formattedDate = date.includes('/') ? date.replace(/\//g, '-') : date
        
        // Usar a rota do admin que sabemos que funciona
        const response = await api.get(`/appointments/available-slots/${barberId}/${formattedDate}/${serviceDuration}?serviceId=${serviceId}`)
        this.availableSlots = response.data.availableSlots || []
        return { success: true, data: response.data }
      } catch (error) {
        console.error('Erro ao buscar horários:', error)
        this.availableSlots = []
        return { 
          success: false, 
          message: error.response?.data?.message || 'Erro ao carregar horários'
        }
      } finally {
        this.isLoading = false
      }
    },

    // Criar agendamento
    async createAppointment(notes = '') {
      try {
        this.isLoading = true
        
        const appointmentData = {
          barberId: this.selectedBarber.id,
          serviceId: this.selectedService.id,
          appointmentDate: this.selectedDate,
          startTime: this.selectedTime,
          notes
        }

        // Log dos dados que serão enviados
        console.log('=== DADOS ENVIADOS PARA AGENDAMENTO ===');
        console.log('appointmentData:', JSON.stringify(appointmentData, null, 2));
        console.log('selectedBarber:', this.selectedBarber);
        console.log('selectedService:', this.selectedService);
        console.log('selectedDate:', this.selectedDate);
        console.log('selectedTime:', this.selectedTime);

        const response = await api.post('/client/appointments', appointmentData)
        
        // Limpar seleção após sucesso
        this.clearSelection()
        
        // Recarregar meus agendamentos
        await this.fetchMyAppointments()
        
        return { 
          success: true, 
          appointment: response.data.appointment,
          message: response.data.message
        }
      } catch (error) {
        console.error('Erro ao criar agendamento:', error)
        return { 
          success: false, 
          message: error.response?.data?.message || 'Erro ao criar agendamento'
        }
      } finally {
        this.isLoading = false
      }
    },

    // Buscar meus agendamentos
    async fetchMyAppointments() {
      try {
        this.isLoading = true
        const response = await api.get('/client/appointments')
        this.myAppointments = response.data
        return { success: true }
      } catch (error) {
        console.error('Erro ao buscar agendamentos:', error)
        return { 
          success: false, 
          message: error.response?.data?.message || 'Erro ao carregar agendamentos'
        }
      } finally {
        this.isLoading = false
      }
    },

    // Cancelar agendamento
    async cancelAppointment(appointmentId) {
      try {
        this.isLoading = true
        const response = await api.put(`/client/appointments/${appointmentId}/cancel`)
        
        // Atualizar o agendamento na lista local
        const index = this.myAppointments.findIndex(apt => apt.id === appointmentId)
        if (index !== -1) {
          this.myAppointments[index].status = 'CANCELLED'
        }
        
        return { 
          success: true, 
          message: response.data.message
        }
      } catch (error) {
        console.error('Erro ao cancelar agendamento:', error)
        return { 
          success: false, 
          message: error.response?.data?.message || 'Erro ao cancelar agendamento'
        }
      } finally {
        this.isLoading = false
      }
    },

    // Selecionar barbeiro
    selectBarber(barber) {
      this.selectedBarber = barber
      // Limpar slots quando mudou barbeiro
      this.availableSlots = []
      this.selectedTime = null
    },

    // Selecionar serviço
    selectService(service) {
      this.selectedService = service
      // Limpar slots quando mudou serviço
      this.availableSlots = []
      this.selectedTime = null
    },

    // Selecionar data
    selectDate(date) {
      this.selectedDate = date
      // Limpar slots quando mudou data
      this.availableSlots = []
      this.selectedTime = null
    },

    // Selecionar horário
    selectTime(time) {
      this.selectedTime = time
    },

    // Limpar seleção
    clearSelection() {
      this.selectedBarber = null
      this.selectedService = null
      this.selectedDate = null
      this.selectedTime = null
      this.availableSlots = []
    }
  }
})
