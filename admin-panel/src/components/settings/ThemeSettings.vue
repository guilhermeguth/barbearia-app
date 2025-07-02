<template>
  <div class="theme-settings">
    <q-form @submit="onSubmit" class="q-gutter-md">
      <div class="row q-mb-lg">
        <div class="col">
          <h5 class="text-h5 q-my-none">Configurações de Tema</h5>
          <p class="text-subtitle2 text-grey-7">
            Personalize as cores, fontes e aparência geral do sistema
          </p>
        </div>
        <div class="col-auto">
          <q-btn 
            flat 
            round 
            icon="refresh" 
            color="grey-7"
            @click="$emit('reset')"
            :disable="loading"
          >
            <q-tooltip>Resetar para valores padrão</q-tooltip>
          </q-btn>
        </div>
      </div>

      <!-- Preview das cores -->
      <q-card class="q-mb-lg">
        <q-card-section>
          <div class="text-h6 q-mb-md">Preview</div>
          <div class="row q-gutter-md">
            <div class="col-auto">
              <div 
                class="color-preview"
                :style="{ backgroundColor: form.primaryColor }"
              >
                <span class="text-white">Primária</span>
              </div>
            </div>
            <div class="col-auto">
              <div 
                class="color-preview"
                :style="{ backgroundColor: form.secondaryColor }"
              >
                <span class="text-white">Secundária</span>
              </div>
            </div>
            <div class="col-auto">
              <div 
                class="color-preview"
                :style="{ backgroundColor: form.accentColor }"
              >
                <span class="text-white">Destaque</span>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Cores Principais -->
      <q-expansion-item
        icon="palette"
        label="Cores Principais"
        default-opened
        header-class="text-primary"
      >
        <q-card>
          <q-card-section>
            <div class="row q-gutter-md">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.primaryColor"
                  label="Cor Primária"
                  :rules="[val => !!val || 'Campo obrigatório']"
                >
                  <template v-slot:append>
                    <q-icon name="colorize" class="cursor-pointer">
                      <q-popup-proxy>
                        <q-color 
                          v-model="form.primaryColor" 
                          format-model="hex"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              
              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.primaryDarkColor"
                  label="Cor Primária Escura"
                >
                  <template v-slot:append>
                    <q-icon name="colorize" class="cursor-pointer">
                      <q-popup-proxy>
                        <q-color 
                          v-model="form.primaryDarkColor" 
                          format-model="hex"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              
              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.primaryLightColor"
                  label="Cor Primária Clara"
                >
                  <template v-slot:append>
                    <q-icon name="colorize" class="cursor-pointer">
                      <q-popup-proxy>
                        <q-color 
                          v-model="form.primaryLightColor" 
                          format-model="hex"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>

            <div class="row q-gutter-md q-mt-md">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.secondaryColor"
                  label="Cor Secundária"
                >
                  <template v-slot:append>
                    <q-icon name="colorize" class="cursor-pointer">
                      <q-popup-proxy>
                        <q-color 
                          v-model="form.secondaryColor" 
                          format-model="hex"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              
              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.accentColor"
                  label="Cor de Destaque"
                >
                  <template v-slot:append>
                    <q-icon name="colorize" class="cursor-pointer">
                      <q-popup-proxy>
                        <q-color 
                          v-model="form.accentColor" 
                          format-model="hex"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <!-- Cores de Status -->
      <q-expansion-item
        icon="traffic"
        label="Cores de Status"
        header-class="text-primary"
      >
        <q-card>
          <q-card-section>
            <div class="row q-gutter-md">
              <div class="col-12 col-md-3">
                <q-input
                  v-model="form.positiveColor"
                  label="Sucesso"
                >
                  <template v-slot:append>
                    <q-icon name="colorize" class="cursor-pointer">
                      <q-popup-proxy>
                        <q-color 
                          v-model="form.positiveColor" 
                          format-model="hex"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              
              <div class="col-12 col-md-3">
                <q-input
                  v-model="form.negativeColor"
                  label="Erro"
                >
                  <template v-slot:append>
                    <q-icon name="colorize" class="cursor-pointer">
                      <q-popup-proxy>
                        <q-color 
                          v-model="form.negativeColor" 
                          format-model="hex"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              
              <div class="col-12 col-md-3">
                <q-input
                  v-model="form.warningColor"
                  label="Aviso"
                >
                  <template v-slot:append>
                    <q-icon name="colorize" class="cursor-pointer">
                      <q-popup-proxy>
                        <q-color 
                          v-model="form.warningColor" 
                          format-model="hex"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              
              <div class="col-12 col-md-3">
                <q-input
                  v-model="form.infoColor"
                  label="Informação"
                >
                  <template v-slot:append>
                    <q-icon name="colorize" class="cursor-pointer">
                      <q-popup-proxy>
                        <q-color 
                          v-model="form.infoColor" 
                          format-model="hex"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <!-- Layout e Tipografia -->
      <q-expansion-item
        icon="text_fields"
        label="Tipografia e Layout"
        header-class="text-primary"
      >
        <q-card>
          <q-card-section>
            <div class="row q-gutter-md">
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.fontFamily"
                  label="Família de Fontes"
                  :options="fontOptions"
                  emit-value
                  map-options
                />
              </div>
              
              <div class="col-12 col-md-3">
                <q-input
                  v-model="form.fontSizeBase"
                  label="Tamanho Base"
                  suffix="px"
                />
              </div>
              
              <div class="col-12 col-md-3">
                <q-input
                  v-model="form.lineHeight"
                  label="Altura da Linha"
                />
              </div>
            </div>

            <div class="row q-gutter-md q-mt-md">
              <div class="col-12 col-md-3">
                <q-input
                  v-model="form.borderRadius"
                  label="Bordas Arredondadas"
                  suffix="px"
                />
              </div>
              
              <div class="col-12 col-md-3">
                <q-input
                  v-model="form.buttonRadius"
                  label="Bordas dos Botões"
                  suffix="px"
                />
              </div>
              
              <div class="col-12 col-md-3">
                <q-input
                  v-model="form.spacingMedium"
                  label="Espaçamento Médio"
                  suffix="px"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <!-- Logo e Marca -->
      <q-expansion-item
        icon="image"
        label="Logo e Marca"
        header-class="text-primary"
      >
        <q-card>
          <q-card-section>
            <div class="row q-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.logoUrl"
                  label="URL do Logo"
                  hint="URL da imagem do logo da empresa"
                />
              </div>
              
              <div class="col-12 col-md-3">
                <q-input
                  v-model="form.logoWidth"
                  label="Largura do Logo"
                  suffix="px"
                />
              </div>
              
              <div class="col-12 col-md-3">
                <q-input
                  v-model="form.logoHeight"
                  label="Altura do Logo"
                  hint="Use 'auto' para proporção"
                />
              </div>
            </div>

            <div class="row q-gutter-md q-mt-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.faviconUrl"
                  label="URL do Favicon"
                  hint="Ícone que aparece na aba do navegador"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <!-- Modo Escuro -->
      <q-expansion-item
        icon="dark_mode"
        label="Modo Escuro"
        header-class="text-primary"
      >
        <q-card>
          <q-card-section>
            <div class="row q-gutter-md">
              <div class="col-12">
                <q-toggle
                  v-model="form.darkMode"
                  label="Ativar modo escuro"
                  color="primary"
                />
              </div>
            </div>

            <div v-if="form.darkMode" class="row q-gutter-md q-mt-md">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.darkBackgroundColor"
                  label="Fundo Escuro"
                >
                  <template v-slot:append>
                    <q-icon name="colorize" class="cursor-pointer">
                      <q-popup-proxy>
                        <q-color 
                          v-model="form.darkBackgroundColor" 
                          format-model="hex"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              
              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.darkSurfaceColor"
                  label="Superfície Escura"
                >
                  <template v-slot:append>
                    <q-icon name="colorize" class="cursor-pointer">
                      <q-popup-proxy>
                        <q-color 
                          v-model="form.darkSurfaceColor" 
                          format-model="hex"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              
              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.darkTextColor"
                  label="Texto Escuro"
                >
                  <template v-slot:append>
                    <q-icon name="colorize" class="cursor-pointer">
                      <q-popup-proxy>
                        <q-color 
                          v-model="form.darkTextColor" 
                          format-model="hex"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <!-- Botões de ação -->
      <div class="row q-gutter-md q-mt-lg">
        <div class="col">
          <q-btn
            type="submit"
            label="Salvar Configurações"
            color="primary"
            icon="save"
            :loading="loading"
            class="full-width"
          />
        </div>
      </div>
    </q-form>
  </div>
</template>

<script>
import { defineComponent, ref, watch } from 'vue'

export default defineComponent({
  name: 'ThemeSettings',
  props: {
    config: {
      type: Object,
      default: () => ({})
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update', 'reset'],
  setup(props, { emit }) {
    const form = ref({
      // Cores principais
      primaryColor: '#1976D2',
      primaryDarkColor: '#1565C0',
      primaryLightColor: '#42A5F5',
      secondaryColor: '#424242',
      accentColor: '#FF6B35',
      positiveColor: '#4CAF50',
      negativeColor: '#F44336',
      warningColor: '#FF9800',
      infoColor: '#2196F3',
      
      // Tipografia
      fontFamily: 'Roboto, sans-serif',
      fontSizeBase: '14px',
      lineHeight: '1.5',
      
      // Layout
      borderRadius: '4px',
      buttonRadius: '4px',
      spacingMedium: '16px',
      
      // Logo
      logoUrl: '',
      logoWidth: '120px',
      logoHeight: 'auto',
      faviconUrl: '',
      
      // Modo escuro
      darkMode: false,
      darkBackgroundColor: '#121212',
      darkSurfaceColor: '#1E1E1E',
      darkTextColor: '#FFFFFF'
    })

    const fontOptions = [
      { label: 'Roboto', value: 'Roboto, sans-serif' },
      { label: 'Inter', value: 'Inter, sans-serif' },
      { label: 'Open Sans', value: 'Open Sans, sans-serif' },
      { label: 'Lato', value: 'Lato, sans-serif' },
      { label: 'Montserrat', value: 'Montserrat, sans-serif' },
      { label: 'Poppins', value: 'Poppins, sans-serif' },
      { label: 'Source Sans Pro', value: 'Source Sans Pro, sans-serif' }
    ]

    // Watch para atualizar form quando config mudar
    watch(() => props.config, (newConfig) => {
      if (newConfig && Object.keys(newConfig).length > 0) {
        Object.assign(form.value, newConfig)
      }
    }, { immediate: true, deep: true })

    const onSubmit = () => {
      emit('update', { ...form.value })
    }

    return {
      form,
      fontOptions,
      onSubmit
    }
  }
})
</script>

<style scoped>
.color-preview {
  width: 80px;
  height: 40px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.theme-settings .q-expansion-item {
  margin-bottom: 16px;
}
</style>
