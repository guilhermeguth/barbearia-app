<template>
  <q-item
    v-if="isInternalLink"
    :to="to"
    clickable
    v-ripple
    :class="{ 'bg-primary text-white': isActive }"
    exact
  >
    <q-item-section avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption v-if="caption">
        {{ caption }}
      </q-item-label>
    </q-item-section>
  </q-item>

  <q-item
    v-else
    clickable
    v-ripple
    :href="link"
    target="_blank"
    rel="noopener noreferrer"
  >
    <q-item-section avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption v-if="caption">
        {{ caption }}
      </q-item-label>
    </q-item-section>

    <q-item-section side>
      <q-icon name="open_in_new" size="xs" />
    </q-item-section>
  </q-item>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  caption: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'star'
  },
  to: {
    type: String,
    default: ''
  },
  link: {
    type: String,
    default: ''
  }
})

const route = useRoute()

const isInternalLink = computed(() => {
  return Boolean(props.to && !props.link)
})

const isActive = computed(() => {
  if (!isInternalLink.value) return false
  
  // Para a rota home (/), só marca como ativo se for exatamente a rota
  if (props.to === '/') {
    return route.path === '/'
  }
  
  // Para outras rotas, verifica se é exatamente a rota atual
  return route.path === props.to
})
</script>
